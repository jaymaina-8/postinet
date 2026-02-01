import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { postToFacebook } from '@/lib/facebook/postToFacebook';

function getAuthorizationHeader(request: Request) {
  const directHeader = request.headers.get('Authorization');
  if (directHeader) {
    return directHeader;
  }
  const fallbackHeader = Array.from(request.headers.entries()).find(
    ([key]) => key.toLowerCase() === 'authorization'
  )?.[1];
  return fallbackHeader || null;
}

function isAuthorized(request: Request) {
  const authHeader = getAuthorizationHeader(request);
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return false;
  }
  return true;
}

async function handleScheduledPublish(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const nowIso = now.toISOString();

  try {
    const { data: scheduledPosts, error } = await supabaseAdmin
      .from('scheduled_posts')
      .select(
        `
        id,
        user_id,
        post_id,
        scheduled_at,
        platform,
        platform_account_id,
        published_once,
        posts (
          id,
          content,
          media_url,
          ai_caption,
          ai_hashtags
        )
      `
      )
      .eq('status', 'scheduled')
      .eq('published_once', false)
      .lte('scheduled_at', nowIso)
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw error;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({ processed: 0 });
    }

    let processed = 0;

    for (const scheduledPost of scheduledPosts) {
      if (scheduledPost.platform !== PLATFORMS.FACEBOOK) {
        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: 'Unsupported platform for scheduled publishing',
            updated_at: nowIso,
          })
          .eq('id', scheduledPost.id);
        continue;
      }

      const post = Array.isArray(scheduledPost.posts)
        ? scheduledPost.posts[0]
        : scheduledPost.posts;

      if (scheduledPost.published_once) {
        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'published',
            error_message: null,
            published_once: true,
            published_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', scheduledPost.id);
        continue;
      }

      const pageId = scheduledPost.platform_account_id;
      if (!pageId) {
        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: 'Missing Facebook Page ID for scheduled post',
            updated_at: nowIso,
          })
          .eq('id', scheduledPost.id);
        continue;
      }

      const { data: connection, error: connectionError } = await supabaseAdmin
        .from('connected_accounts')
        .select('facebook_page_access_token, expires_at')
        .eq('user_id', scheduledPost.user_id)
        .eq('platform', PLATFORMS.FACEBOOK)
        .eq('facebook_page_id', pageId)
        .single();

      if (connectionError || !connection) {
        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: 'Facebook Page connection not found',
            updated_at: nowIso,
          })
          .eq('id', scheduledPost.id);
        continue;
      }

      if (connection.expires_at && connection.expires_at < Date.now()) {
        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: 'Facebook Page access token expired',
            updated_at: nowIso,
          })
          .eq('id', scheduledPost.id);
        continue;
      }

      const { data: claimedPost, error: claimError } = await supabaseAdmin
        .from('scheduled_posts')
        .update({
          status: 'publishing',
          updated_at: nowIso,
        })
        .eq('id', scheduledPost.id)
        .eq('status', 'scheduled')
        .eq('published_once', false)
        .select()
        .single();

      if (claimError) {
        throw claimError;
      }

      if (!claimedPost) {
        continue;
      }

      const messageBase = post?.ai_caption || post?.content || '';
      const hashtags = post?.ai_hashtags ? `\n\n${post.ai_hashtags}` : '';
      const message = `${messageBase}${hashtags}`.trim();
      const imageUrl = post?.media_url || undefined;

      try {
        const postResult = await postToFacebook({
          pageId,
          pageAccessToken: connection.facebook_page_access_token,
          message,
          imageUrl,
        });

        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'published',
            error_message: null,
            published_once: true,
            published_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', scheduledPost.id);

        await supabaseAdmin
          .from('posts')
          .update({
            posted_at: nowIso,
            published_at: nowIso,
            platform_post_id: postResult.id,
            platform: PLATFORMS.FACEBOOK,
            platform_account_id: pageId,
            status: 'published',
            published_once: true,
          })
          .eq('id', scheduledPost.post_id);

        processed += 1;
      } catch (postError: any) {
        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: postError?.message || 'Failed to publish to Facebook',
            updated_at: nowIso,
          })
          .eq('id', scheduledPost.id);

        await supabaseAdmin
          .from('posts')
          .update({ status: 'failed' })
          .eq('id', scheduledPost.post_id);
      }
    }

    return NextResponse.json({ processed });
  } catch (error: any) {
    console.error('Scheduled publish error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish scheduled posts' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleScheduledPublish(request);
}

export async function POST(request: Request) {
  return handleScheduledPublish(request);
}
