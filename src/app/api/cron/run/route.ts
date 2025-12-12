import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { postToFacebook } from '@/lib/facebook/postToFacebook';

/**
 * Postinet Cron Job Endpoint
 * 
 * This endpoint is called by GitHub Actions Cron Job every 5 minutes.
 * It processes scheduled posts that are due to be posted.
 * 
 * Endpoint: POST /api/cron/run
 * Production URL: https://www.postinet.pro/api/cron/run
 * 
 * Authentication:
 * - Requires X-CRON-KEY header matching CRON_SECRET environment variable
 * - GitHub Actions workflow passes this via secrets.CRON_SECRET
 * 
 * Workflow file: .github/workflows/cron.yml
 */
export async function POST(req: NextRequest) {
  try {
    // Verify this is called by GitHub Actions (required security check)
    const key = req.headers.get('X-CRON-KEY');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!key || !cronSecret || key !== cronSecret) {
      console.error('Cron job unauthorized: Invalid or missing X-CRON-KEY');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Cron job started at:', new Date().toISOString());
    const now = new Date();
    
    // Find all pending scheduled posts that are due
    const { data: duePosts, error } = await supabaseAdmin
      .from('scheduled_posts')
      .select(`
        *,
        posts (
          id,
          content,
          media_url,
          ai_caption,
          ai_hashtags,
          user_id
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch scheduled posts:', error);
      throw error;
    }

    if (!duePosts || duePosts.length === 0) {
      console.log('No posts due for posting');
      return NextResponse.json({ 
        message: 'No posts due for posting',
        processed: 0 
      });
    }

    console.log(`Found ${duePosts.length} posts due for posting`);
    const results = [];

    for (const scheduledPost of duePosts) {
      try {
        // Get user's platform connection
        // For Facebook, we need Page token; for others, we use access_token
        const selectFields = scheduledPost.platform === PLATFORMS.FACEBOOK
          ? 'facebook_page_id, facebook_page_name, facebook_page_access_token, expires_at'
          : 'access_token, platform_user_id, expires_at';
        
        const { data: connection } = await supabaseAdmin
          .from('connected_accounts')
          .select(selectFields)
          .eq('user_id', scheduledPost.posts.user_id)
          .eq('platform', scheduledPost.platform)
          .single();

        // Add a runtime guard before using connection
        if (!connection || (connection as Record<string, unknown>).error) {
          console.error("Invalid connection object", connection);
          await supabaseAdmin
            .from('scheduled_posts')
            .update({
              status: 'failed',
              error_message: `No ${scheduledPost.platform} connection found`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', scheduledPost.id);

          results.push({
            id: scheduledPost.id,
            status: 'failed',
            reason: `No ${scheduledPost.platform} connection`,
          });
          continue;
        }

        // Platform-specific posting handlers
        const postContent = scheduledPost.posts.ai_caption || scheduledPost.posts.content || '';
        const hashtags = scheduledPost.posts.ai_hashtags || '';
        const fullContent = `${postContent} ${hashtags}`.trim();
        let platformPostId: string | null = null;

        // Route to platform-specific posting logic
        if (scheduledPost.platform === PLATFORMS.FACEBOOK) {
          // Check for Page connection
          const fbConnection = connection as {
            facebook_page_id: string | null;
            facebook_page_name: string | null;
            facebook_page_access_token: string | null;
            expires_at: number | null;
          };
          
          if (!fbConnection.facebook_page_id || !fbConnection.facebook_page_access_token) {
            await supabaseAdmin
              .from('scheduled_posts')
              .update({
                status: 'failed',
                error_message: 'No Facebook Page connected',
                updated_at: new Date().toISOString(),
              })
              .eq('id', scheduledPost.id);

            results.push({
              id: scheduledPost.id,
              status: 'failed',
              reason: 'No Facebook Page connected',
            });
            continue;
          }

          // Check if token is expired
          if (fbConnection.expires_at && fbConnection.expires_at < Date.now()) {
            await supabaseAdmin
              .from('scheduled_posts')
              .update({
                status: 'failed',
                error_message: 'Facebook access token has expired',
                updated_at: new Date().toISOString(),
              })
              .eq('id', scheduledPost.id);

            results.push({
              id: scheduledPost.id,
              status: 'failed',
              reason: 'Facebook access token has expired',
            });
            continue;
          }

          // Post to Facebook using helper function
          try {
            console.log(`Posting to Facebook Page: ${fbConnection.facebook_page_name}`);
            const postResult = await postToFacebook({
              pageId: fbConnection.facebook_page_id,
              pageAccessToken: fbConnection.facebook_page_access_token,
              message: fullContent,
              imageUrl: scheduledPost.posts.media_url || undefined,
            });
            platformPostId = postResult.id;
            console.log(`Successfully posted to Facebook: ${platformPostId}`);
          } catch (postError: unknown) {
            const errorMessage = postError instanceof Error ? postError.message : 'Failed to post to Facebook';
            console.error(`Facebook posting failed:`, postError);
            
            // Posting failed - mark as failed
            await supabaseAdmin
              .from('scheduled_posts')
              .update({
                status: 'failed',
                error_message: errorMessage,
                updated_at: new Date().toISOString(),
              })
              .eq('id', scheduledPost.id);

            results.push({
              id: scheduledPost.id,
              status: 'failed',
              reason: errorMessage,
            });
            continue;
          }
        } else if (scheduledPost.platform === PLATFORMS.YOUTUBE) {
          const conn = connection as {
            access_token: string | null;
            refresh_token: string | null;
            expires_at: number | null;
          };

          // Now safe to check
          if (!conn.access_token) {
            await supabaseAdmin
              .from('scheduled_posts')
              .update({
                status: 'failed',
                error_message: 'Missing YouTube access token',
                updated_at: new Date().toISOString(),
              })
              .eq('id', scheduledPost.id);

            results.push({
              id: scheduledPost.id,
              status: 'failed',
              reason: 'Missing YouTube access token',
            });
            continue;
          }

          // Check if token is expired
          if (conn.expires_at && conn.expires_at < Date.now()) {
            await supabaseAdmin
              .from('scheduled_posts')
              .update({
                status: 'failed',
                error_message: 'YouTube access token has expired',
                updated_at: new Date().toISOString(),
              })
              .eq('id', scheduledPost.id);

            results.push({
              id: scheduledPost.id,
              status: 'failed',
              reason: 'YouTube access token has expired',
            });
            continue;
          }

          // TODO: Implement YouTube upload logic
          // Call YouTube Data API to upload video
          platformPostId = `yt_sim_${Date.now()}_${scheduledPost.id}`;
        } else if (scheduledPost.platform === PLATFORMS.INSTAGRAM) {
          // TODO: Implement Instagram posting
          platformPostId = `ig_sim_${Date.now()}_${scheduledPost.id}`;
        } else {
          // Unknown platform - mark as failed
          await supabaseAdmin
            .from('scheduled_posts')
            .update({
              status: 'failed',
              error_message: `Unsupported platform: ${scheduledPost.platform}`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', scheduledPost.id);

          results.push({
            id: scheduledPost.id,
            status: 'failed',
            reason: `Unsupported platform: ${scheduledPost.platform}`,
          });
          continue;
        }

        // Update scheduled post status
        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'posted',
            updated_at: new Date().toISOString(),
          })
          .eq('id', scheduledPost.id);

        // Update the post record
        await supabaseAdmin
          .from('posts')
          .update({
            posted_at: new Date().toISOString(),
            platform_post_id: platformPostId,
            scheduled_at: null,
          })
          .eq('id', scheduledPost.posts.id);

        results.push({
          id: scheduledPost.id,
          status: 'posted',
          postId: scheduledPost.posts.id,
          platformPostId,
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing scheduled post ${scheduledPost.id}:`, error);
        
        // Mark as failed
        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: errorMessage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', scheduledPost.id);

        results.push({
          id: scheduledPost.id,
          status: 'failed',
          error: errorMessage,
        });
      }
    }

    console.log(`Cron job completed. Processed ${results.length} posts.`);
    
    return NextResponse.json({
      message: `Processed ${duePosts.length} scheduled posts`,
      processed: results.length,
      results,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process scheduled posts';
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET handler - returns info about the cron endpoint
 * This is useful for health checks and documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/cron/run',
    method: 'POST',
    description: 'Postinet scheduled posts processor',
    authentication: 'Requires X-CRON-KEY header',
    scheduler: 'GitHub Actions (.github/workflows/cron.yml)',
    schedule: 'Every 5 minutes (*/5 * * * *)',
    documentation: 'See CRON_SETUP.md for setup instructions',
  });
}

