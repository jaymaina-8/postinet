import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { postToFacebook } from '@/lib/facebook/postToFacebook';

// This endpoint is called by GitHub Actions Cron Job
// It processes scheduled posts that are due to be posted
export async function POST(req: NextRequest) {
  try {
    // Verify this is called by GitHub Actions (required security check)
    const key = req.headers.get('X-CRON-KEY');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!key || !cronSecret || key !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      throw error;
    }

    if (!duePosts || duePosts.length === 0) {
      return NextResponse.json({ 
        message: 'No posts due for posting',
        processed: 0 
      });
    }

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
        if (!connection || (connection as any).error) {
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
          const fbConnection = connection as any;
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
            const postResult = await postToFacebook({
              pageId: fbConnection.facebook_page_id,
              pageAccessToken: fbConnection.facebook_page_access_token,
              message: fullContent,
              imageUrl: scheduledPost.posts.media_url || undefined,
            });
            platformPostId = postResult.id;
          } catch (postError: any) {
            // Posting failed - mark as failed
            await supabaseAdmin
              .from('scheduled_posts')
              .update({
                status: 'failed',
                error_message: postError.message || 'Failed to post to Facebook',
                updated_at: new Date().toISOString(),
              })
              .eq('id', scheduledPost.id);

            results.push({
              id: scheduledPost.id,
              status: 'failed',
              reason: postError.message || 'Failed to post to Facebook',
            });
            continue;
          }
        } else if (scheduledPost.platform === PLATFORMS.YOUTUBE) {
          const conn = connection as unknown as {
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
          // const youtubeApiUrl = 'https://www.googleapis.com/upload/youtube/v3/videos';
          // const response = await fetch(youtubeApiUrl, {
          //   method: 'POST',
          //   headers: {
          //     'Authorization': `Bearer ${conn.access_token}`,
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify({
          //     snippet: {
          //       title: postContent,
          //       description: fullContent,
          //     },
          //     status: {
          //       privacyStatus: 'public',
          //     },
          //   }),
          // });
          // const result = await response.json();
          // platformPostId = result.id;
          platformPostId = `yt_sim_${Date.now()}_${scheduledPost.id}`;
        } else if (scheduledPost.platform === PLATFORMS.INSTAGRAM) {
          // TODO: Implement Instagram posting
          // const instagramResponse = await postToInstagram({
          //   accessToken: connection.access_token,
          //   caption: fullContent,
          //   mediaUrl: scheduledPost.posts.media_url,
          // });
          // platformPostId = instagramResponse.mediaId;
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
        });
      } catch (error: any) {
        console.error(`Error processing scheduled post ${scheduledPost.id}:`, error);
        
        // Mark as failed
        await supabaseAdmin
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: error.message || 'Unknown error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', scheduledPost.id);

        results.push({
          id: scheduledPost.id,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${duePosts.length} scheduled posts`,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Scheduler error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process scheduled posts' },
      { status: 500 }
    );
  }
}

