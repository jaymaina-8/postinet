import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';

/**
 * Cron job endpoint to process scheduled posts
 * This should be called every 5 minutes by GitHub Actions or a cron service
 * 
 * GET /api/cron/run
 */
export async function GET(req: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date().toISOString();
    console.log(`[CRON] Starting scheduled posts check at ${now}`);

    // Find all pending scheduled posts that are due
    const { data: scheduledPosts, error: fetchError } = await supabaseAdmin
      .from('scheduled_posts')
      .select(`
        id,
        post_id,
        scheduled_at,
        platform,
        user_id,
        posts (
          id,
          content,
          ai_caption,
          ai_hashtags,
          media_url
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(50); // Process up to 50 posts per run

    if (fetchError) {
      console.error('[CRON] Error fetching scheduled posts:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('[CRON] No scheduled posts due for publishing');
      return NextResponse.json({
        success: true,
        message: 'No posts to publish',
        processed: 0,
      });
    }

    console.log(`[CRON] Found ${scheduledPosts.length} posts to publish`);

    const results = {
      total: scheduledPosts.length,
      successful: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process each scheduled post
    for (const scheduledPost of scheduledPosts) {
      try {
        console.log(`[CRON] Processing scheduled post ${scheduledPost.id} for platform ${scheduledPost.platform}`);

        // Get the connected account for this user and platform
        const { data: account, error: accountError } = await supabaseAdmin
          .from('connected_accounts')
          .select('access_token, facebook_page_id, facebook_page_access_token')
          .eq('user_id', scheduledPost.user_id)
          .eq('platform', scheduledPost.platform)
          .single();

        if (accountError || !account) {
          throw new Error(`No connected account found for platform ${scheduledPost.platform}`);
        }

        // Prepare the post content
        const post = scheduledPost.posts as any;
        const content = post.ai_caption || post.content || '';
        const hashtags = post.ai_hashtags || '';
        const fullContent = hashtags ? `${content}\n\n${hashtags}` : content;

        // Publish to the appropriate platform
        let platformPostId = null;

        if (scheduledPost.platform === PLATFORMS.FACEBOOK) {
          // Use Facebook Page token if available
          const accessToken = account.facebook_page_access_token || account.access_token;
          const pageId = account.facebook_page_id;

          if (!pageId) {
            throw new Error('Facebook Page ID not found');
          }

          // Publish to Facebook
          const fbResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}/feed`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: fullContent,
                access_token: accessToken,
              }),
            }
          );

          const fbData = await fbResponse.json();

          if (!fbResponse.ok || fbData.error) {
            throw new Error(fbData.error?.message || 'Facebook API error');
          }

          platformPostId = fbData.id;
        } else if (scheduledPost.platform === PLATFORMS.YOUTUBE) {
          // YouTube posting would go here
          // For now, mark as failed with a message
          throw new Error('YouTube posting not yet implemented');
        }

        // Update the scheduled post status to posted
        const { error: updateScheduledError } = await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'posted',
            updated_at: new Date().toISOString(),
          })
          .eq('id', scheduledPost.id);

        if (updateScheduledError) {
          console.error(`[CRON] Error updating scheduled post ${scheduledPost.id}:`, updateScheduledError);
        }

        // Update the post record
        const { error: updatePostError } = await supabaseAdmin
          .from('posts')
          .update({
            posted_at: new Date().toISOString(),
            platform_post_id: platformPostId,
          })
          .eq('id', scheduledPost.post_id);

        if (updatePostError) {
          console.error(`[CRON] Error updating post ${scheduledPost.post_id}:`, updatePostError);
        }

        results.successful++;
        console.log(`[CRON] Successfully published post ${scheduledPost.id}`);
      } catch (error: any) {
        console.error(`[CRON] Error processing scheduled post ${scheduledPost.id}:`, error);

        // Update the scheduled post status to failed
        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', scheduledPost.id);

        results.failed++;
        results.errors.push({
          scheduledPostId: scheduledPost.id,
          error: error.message,
        });
      }
    }

    console.log(`[CRON] Completed: ${results.successful} successful, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: 'Cron job completed',
      ...results,
    });
  } catch (error: any) {
    console.error('[CRON] Fatal error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Also support POST method for compatibility
export async function POST(req: NextRequest) {
  return GET(req);
}

