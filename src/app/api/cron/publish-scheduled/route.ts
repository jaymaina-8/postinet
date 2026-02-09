import { NextResponse } from 'next/server';
import crypto from 'crypto';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS } from '@/lib/platforms';
import { postToFacebook } from '@/lib/facebook/postToFacebook';
import { fetchYouTubeVideoStatus, refreshYouTubeAccessToken } from '@/lib/youtube/client';
import { uploadYouTubeVideo } from '@/lib/youtube/upload';

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

  const runId = crypto.randomUUID();
  const startIso = new Date().toISOString();
  console.log(`[CRON] run_id=${runId} now_utc=${startIso} start`);

  try {
    const nowIso = new Date().toISOString();
    const safetyUpperIso = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    const graceLowerIso = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: scheduledPosts, error } = await supabaseAdmin
      .from('posts')
      .select(
        `
        id,
        user_id,
        scheduled_at,
        platform,
        platform_account_id,
        published_once,
        content,
        media_url,
        title,
        description,
        visibility,
        status
      `
      )
      .eq('status', 'scheduled')
      .eq('published_once', false)
      .in('platform', [PLATFORMS.FACEBOOK, PLATFORMS.YOUTUBE])
      .lte('scheduled_at', safetyUpperIso)
      .gte('scheduled_at', graceLowerIso)
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw error;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log(
        `[CRON] run_id=${runId} now_utc=${new Date().toISOString()} selected_count=0 claimed_count=0 youtube_published_count=0 youtube_failed_count=0 fb_published_count=0 fb_failed_count=0`
      );
      return NextResponse.json({
        ok: true,
        processed: 0,
        published: 0,
        failed: 0,
        run_id: runId,
      });
    }

    const eligibleCount = scheduledPosts.length;
    let claimedCount = 0;
    let youtubePublishedCount = 0;
    let youtubeFailedCount = 0;
    let fbPublishedCount = 0;
    let fbFailedCount = 0;

    for (const scheduledPost of scheduledPosts) {
      const processedAt = new Date().toISOString();
      const { data: claimedPost, error: claimError } = await supabaseAdmin
        .from('posts')
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
      const mediaKind = getMediaKind(scheduledPost?.media_url);
      console.log(
        `[CRON] run_id=${runId} now_utc=${processedAt} post_id=${scheduledPost.id} media=${mediaKind} platform=${scheduledPost.platform}`
      );

      if (scheduledPost.published_once) {
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            status: 'published',
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (updateError) {
          throw updateError;
        }
        continue;
      }

      if (scheduledPost.platform === PLATFORMS.FACEBOOK) {
        const pageId = scheduledPost.platform_account_id;
        if (!pageId) {
          const { error: updateError } = await supabaseAdmin
            .from('posts')
            .update({
              status: 'failed',
              error_message: 'Missing Facebook Page ID for scheduled post',
              updated_at: processedAt,
            })
            .eq('id', scheduledPost.id);
          if (updateError) {
            throw updateError;
          }
          fbFailedCount += 1;
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
            .from('posts')
            .update({
              status: 'failed',
              error_message: 'Facebook Page connection not found',
              updated_at: processedAt,
            })
            .eq('id', scheduledPost.id);
          if (updateError) {
            throw updateError;
          }
          fbFailedCount += 1;
          continue;
        }

        if (connection.expires_at && connection.expires_at < Date.now()) {
          const { error: updateError } = await supabaseAdmin
            .from('posts')
            .update({
              status: 'failed',
              error_message: 'Facebook Page access token expired',
              updated_at: processedAt,
            })
            .eq('id', scheduledPost.id);
          if (updateError) {
            throw updateError;
          }
          fbFailedCount += 1;
          continue;
        }

        const message = (scheduledPost.content || '').trim();
        const imageUrl = scheduledPost.media_url || undefined;

        try {
          const postResult = await postToFacebook({
            pageId,
            pageAccessToken: connection.facebook_page_access_token,
            message,
            imageUrl,
          });

          const { error: postUpdateError } = await supabaseAdmin
            .from('posts')
            .update({
              status: 'published',
              error_message: null,
              published_once: true,
              posted_at: processedAt,
              published_at: processedAt,
              provider_post_id: postResult.id,
              platform_post_id: postResult.id,
              updated_at: processedAt,
            })
            .eq('id', scheduledPost.id);
          if (postUpdateError) {
            throw postUpdateError;
          }

          fbPublishedCount += 1;
        } catch (postError: any) {
          console.error(
            `[CRON] run_id=${runId} now_utc=${processedAt} publish_failed post_id=${scheduledPost.id} error=${postError?.message || 'unknown'}`
          );
          const { error: postUpdateError } = await supabaseAdmin
            .from('posts')
            .update({
              status: 'failed',
              error_message: postError?.message || 'Failed to publish to Facebook',
              updated_at: processedAt,
            })
            .eq('id', scheduledPost.id);
          if (postUpdateError) {
            throw postUpdateError;
          }
          fbFailedCount += 1;
        }
        continue;
      }

      if (scheduledPost.platform !== PLATFORMS.YOUTUBE) {
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            status: 'failed',
            error_message: 'Unsupported platform for scheduled publishing',
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (updateError) {
          throw updateError;
        }
        youtubeFailedCount += 1;
        continue;
      }

      if (!scheduledPost.platform_account_id) {
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            status: 'failed',
            error_message: 'Missing YouTube channel ID for scheduled post',
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (updateError) {
          throw updateError;
        }
        youtubeFailedCount += 1;
        continue;
      }

      const { data: account, error: accountError } = await supabaseAdmin
        .from('platform_accounts')
        .select('id, refresh_token')
        .eq('user_id', scheduledPost.user_id)
        .eq('platform', PLATFORMS.YOUTUBE)
        .eq('platform_account_id', scheduledPost.platform_account_id)
        .single();

      if (accountError || !account?.refresh_token) {
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            status: 'failed',
            error_message: 'YouTube channel connection not found',
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (updateError) {
          throw updateError;
        }
        youtubeFailedCount += 1;
        continue;
      }

      try {
        const { accessToken, expiresIn } = await refreshYouTubeAccessToken(account.refresh_token);
        const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

        await supabaseAdmin
          .from('platform_accounts')
          .update({ access_token: accessToken, token_expires_at: tokenExpiresAt })
          .eq('id', account.id);

        if (!scheduledPost.media_url) {
          throw new Error('Missing video for YouTube publish');
        }

        if (!scheduledPost.title) {
          throw new Error('Missing title for YouTube publish');
        }

        const uploadResult = await uploadYouTubeVideo({
          accessToken,
          title: scheduledPost.title,
          description: scheduledPost.description || '',
          visibility: (scheduledPost.visibility || 'private') as 'public' | 'unlisted' | 'private',
          mediaUrl: scheduledPost.media_url,
        });

        const videoStatus = await fetchYouTubeVideoStatus(accessToken, uploadResult.videoId);
        const failureReason =
          videoStatus.processingFailureReason || videoStatus.rejectionReason || null;
        const isProcessingFailed =
          videoStatus.processingStatus === 'failed' ||
          videoStatus.processingStatus === 'terminated' ||
          videoStatus.uploadStatus === 'failed' ||
          videoStatus.uploadStatus === 'rejected';
        const isProcessingSucceeded =
          videoStatus.processingStatus === 'succeeded' &&
          videoStatus.uploadStatus !== 'rejected' &&
          videoStatus.uploadStatus !== 'failed';

        const nextStatus = isProcessingFailed
          ? 'failed'
          : isProcessingSucceeded
          ? 'published'
          : 'publishing';

        const { error: postUpdateError } = await supabaseAdmin
          .from('posts')
          .update({
            status: nextStatus,
            error_message: isProcessingFailed ? failureReason || 'YouTube processing failed' : null,
            published_once: true,
            posted_at: isProcessingSucceeded ? processedAt : null,
            published_at: isProcessingSucceeded ? processedAt : null,
            provider_post_id: uploadResult.videoId,
            platform_post_id: uploadResult.videoId,
            youtube_video_id: uploadResult.videoId,
            yt_upload_status: videoStatus.uploadStatus,
            yt_processing_status: videoStatus.processingStatus,
            yt_failure_reason: failureReason,
            yt_last_checked_at: processedAt,
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (postUpdateError) {
          throw postUpdateError;
        }

        if (isProcessingFailed) {
          youtubeFailedCount += 1;
        } else {
          youtubePublishedCount += 1;
        }
      } catch (postError: any) {
        console.error(
          `[CRON] run_id=${runId} now_utc=${processedAt} publish_failed post_id=${scheduledPost.id} error=${postError?.message || 'unknown'}`
        );
        const { error: postUpdateError } = await supabaseAdmin
          .from('posts')
          .update({
            status: 'failed',
            error_message: postError?.message || 'Failed to publish to YouTube',
            updated_at: processedAt,
          })
          .eq('id', scheduledPost.id);
        if (postUpdateError) {
          throw postUpdateError;
        }

        youtubeFailedCount += 1;
      }
    }

    const processingWindowIso = new Date(Date.now() - 60 * 1000).toISOString();
    const pollingCandidates = await supabaseAdmin
      .from('posts')
      .select(
        'id, user_id, platform_account_id, provider_post_id, yt_last_checked_at, yt_processing_status, yt_upload_status, status, created_at, posted_at, published_at'
      )
      .eq('platform', PLATFORMS.YOUTUBE)
      .not('provider_post_id', 'is', null)
      .lt('created_at', processingWindowIso)
      .or('yt_processing_status.is.null,yt_processing_status.in.(processing,uploaded)')
      .order('created_at', { ascending: true })
      .limit(25);

    if (pollingCandidates.error) {
      throw pollingCandidates.error;
    }

    for (const post of pollingCandidates.data || []) {
      const lastCheckedAt = post.yt_last_checked_at
        ? new Date(post.yt_last_checked_at).getTime()
        : 0;
      if (lastCheckedAt && Date.now() - lastCheckedAt < 2 * 60 * 1000) {
        continue;
      }

      if (!post.platform_account_id || !post.provider_post_id) {
        continue;
      }

      const { data: account, error: accountError } = await supabaseAdmin
        .from('platform_accounts')
        .select('id, refresh_token')
        .eq('user_id', post.user_id)
        .eq('platform', PLATFORMS.YOUTUBE)
        .eq('platform_account_id', post.platform_account_id)
        .single();

      if (accountError || !account?.refresh_token) {
        continue;
      }

      const { accessToken } = await refreshYouTubeAccessToken(account.refresh_token);
      const statusInfo = await fetchYouTubeVideoStatus(accessToken, post.provider_post_id);
      const failureReason =
        statusInfo.processingFailureReason || statusInfo.rejectionReason || null;
      const isProcessingFailed =
        statusInfo.processingStatus === 'failed' ||
        statusInfo.processingStatus === 'terminated' ||
        statusInfo.uploadStatus === 'failed' ||
        statusInfo.uploadStatus === 'rejected';
      const isProcessingSucceeded =
        statusInfo.processingStatus === 'succeeded' &&
        statusInfo.uploadStatus !== 'rejected' &&
        statusInfo.uploadStatus !== 'failed';

      const nowIso = new Date().toISOString();
      const nextStatus = isProcessingFailed
        ? 'failed'
        : isProcessingSucceeded
        ? 'published'
        : post.status;

      await supabaseAdmin
        .from('posts')
        .update({
          status: nextStatus,
          error_message: isProcessingFailed ? failureReason || 'YouTube processing failed' : null,
          posted_at: isProcessingSucceeded ? nowIso : post.posted_at || null,
          published_at: isProcessingSucceeded ? nowIso : post.published_at || null,
          yt_upload_status: statusInfo.uploadStatus,
          yt_processing_status: statusInfo.processingStatus,
          yt_failure_reason: failureReason,
          yt_last_checked_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', post.id);
    }

    console.log(
      `[CRON] run_id=${runId} now_utc=${new Date().toISOString()} selected_count=${eligibleCount} claimed_count=${claimedCount} youtube_published_count=${youtubePublishedCount} youtube_failed_count=${youtubeFailedCount} fb_published_count=${fbPublishedCount} fb_failed_count=${fbFailedCount}`
    );

    return NextResponse.json({
      ok: true,
      processed: claimedCount,
      published: youtubePublishedCount + fbPublishedCount,
      failed: youtubeFailedCount + fbFailedCount,
      run_id: runId,
      youtube_published_count: youtubePublishedCount,
      youtube_failed_count: youtubeFailedCount,
      fb_published_count: fbPublishedCount,
      fb_failed_count: fbFailedCount,
    });
  } catch (error: any) {
    console.error('[CRON] Scheduled publish error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to publish scheduled posts' },
      { status: 500 }
    );
  }
}
