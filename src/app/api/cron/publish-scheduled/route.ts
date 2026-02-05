import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { postToFacebook } from '@/lib/facebook/postToFacebook';

/**
 * Cron is stateless; scheduling is database-driven.
 * Exactly-once is enforced via atomic claim + terminal states.
 * This endpoint is safe to run repeatedly.
 */
function isAuthorized(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && authHeader === `Bearer ${secret}`);
}

function getMediaKind(mediaUrl?: string | null) {
  if (!mediaUrl) {
    return 'none';
  }
  const lower = mediaUrl.toLowerCase();
  if (lower.match(/\.(mp4|mov|webm|mkv|avi|m4v)(\?|#|$)/)) {
    return 'video';
  }
  if (lower.match(/\.(jpg|jpeg|png|gif|webp)(\?|#|$)/)) {
    return 'image';
  }
  return 'unknown';
}

export async function POST(request: Request) {
  if (!process.env.CRON_SECRET) {
    console.error('[CRON] Missing CRON_SECRET configuration');
    return NextResponse.json(
      { ok: false, error: 'Invalid environment configuration' },
      { status: 500 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startIso = new Date().toISOString();
  console.log(`[CRON] ${startIso} — start`);

  try {
    const nowIso = new Date().toISOString();
    const safetyWindowIso = new Date(Date.now() - 2 * 60 * 1000).toISOString();
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
      .gte('scheduled_at', safetyWindowIso)
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw error;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log(
        `[CRON] ${new Date().toISOString()} — eligible=0 claimed=0 published=0 failed=0`
      );
      return NextResponse.json({
        ok: true,
        processed: 0,
        published: 0,
        failed: 0,
      });
    }

    const eligibleCount = scheduledPosts.length;
    let claimedCount = 0;
    let publishedCount = 0;
    let failedCount = 0;

    for (const scheduledPost of scheduledPosts) {
      const processedAt = new Date().toISOString();
      const { data: claimedPost, error: claimError } = await supabaseAdmin
        .from('scheduled_posts')
        .update({ status: 'publishing', updated_at: processedAt })
        .eq('id', scheduledPost.id)
        .eq('status', 'scheduled')
        .eq('published_once', false)
        .select('id')
        .maybeSingle();

      if (claimError) {
        throw claimError;
      }

      if (!claimedPost) {
        continue;
      }

      claimedCount += 1;
      const post = Array.isArray(scheduledPost.posts)
        ? scheduledPost.posts[0]
        : scheduledPost.posts;
      const mediaKind = getMediaKind(post?.media_url);
      console.log(
        `[CRON] ${processedAt} — post_id=${scheduledPost.post_id} scheduled_id=${scheduledPost.id} media=${mediaKind} platform=${scheduledPost.platform}`
      );

      if (scheduledPost.platform !== PLATFORMS.FACEBOOK) {
        const { error: updateError } = await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: 'Unsupported platform for scheduled publishing',
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (updateError) {
          throw updateError;
        }
        failedCount += 1;
        continue;
      }

      const pageId = scheduledPost.platform_account_id;
      if (!pageId) {
        const { error: updateError } = await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: 'Missing Facebook Page ID for scheduled post',
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (updateError) {
          throw updateError;
        }
        failedCount += 1;
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
        const { error: updateError } = await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: 'Facebook Page connection not found',
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (updateError) {
          throw updateError;
        }
        failedCount += 1;
        continue;
      }

      if (connection.expires_at && connection.expires_at < Date.now()) {
        const { error: updateError } = await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: 'Facebook Page access token expired',
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (updateError) {
          throw updateError;
        }
        failedCount += 1;
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

        const { error: scheduledUpdateError } = await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'published',
            error_message: null,
            published_once: true,
            published_at: processedAt,
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (scheduledUpdateError) {
          throw scheduledUpdateError;
        }

        const { error: postUpdateError } = await supabaseAdmin
          .from('posts')
          .update({
            posted_at: processedAt,
            published_at: processedAt,
            platform_post_id: postResult.id,
            platform: PLATFORMS.FACEBOOK,
            platform_account_id: pageId,
            status: 'published',
            published_once: true,
          })
          .eq('id', scheduledPost.post_id);
        if (postUpdateError) {
          throw postUpdateError;
        }

        publishedCount += 1;
      } catch (postError: any) {
        console.error(
          `[CRON] ${processedAt} — publish_failed post_id=${scheduledPost.post_id} scheduled_id=${scheduledPost.id} error=${postError?.message || 'unknown'}`
        );
        const { error: scheduledUpdateError } = await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: postError?.message || 'Failed to publish to Facebook',
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (scheduledUpdateError) {
          throw scheduledUpdateError;
        }

        const { error: postUpdateError } = await supabaseAdmin
          .from('posts')
          .update({ status: 'failed' })
          .eq('id', scheduledPost.post_id);
        if (postUpdateError) {
          throw postUpdateError;
        }

        failedCount += 1;
      }
    }

    console.log(
      `[CRON] ${new Date().toISOString()} — eligible=${eligibleCount} claimed=${claimedCount} published=${publishedCount} failed=${failedCount}`
    );

    return NextResponse.json({
      ok: true,
      processed: claimedCount,
      published: publishedCount,
      failed: failedCount,
    });
  } catch (error: any) {
    console.error('[CRON] Scheduled publish error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to publish scheduled posts' },
      { status: 500 }
    );
  }
}
