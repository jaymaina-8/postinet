import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS, isValidPlatform } from '@/lib/platforms';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Fetch scheduled posts for the user
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: scheduledPosts, error } = await supabaseAdmin
      .from('posts')
      .select(
        'id, content, title, description, media_url, platform, platform_account_id, scheduled_at, status, error_message, visibility, youtube_video_id, yt_processing_status, yt_upload_status, yt_failure_reason'
      )
      .eq('user_id', user.id)
      .not('scheduled_at', 'is', null)
      .order('scheduled_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ scheduledPosts });
  } catch (error: any) {
    console.error('Error fetching scheduled posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch scheduled posts' },
      { status: 500 }
    );
  }
}

// POST: Schedule a new post
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const scheduledAtInput = body.scheduled_at ?? body.scheduledAt;
    const { postId, platform = PLATFORMS.FACEBOOK } = body;

    if (!postId || !scheduledAtInput) {
      return NextResponse.json(
        { error: 'postId and scheduled_at are required' },
        { status: 400 }
      );
    }

    // Validate platform
    if (!isValidPlatform(platform)) {
      return NextResponse.json(
        { error: `Invalid platform: ${platform}` },
        { status: 400 }
      );
    }

    // Validate scheduledAt is valid and in the future
    const scheduledDate = new Date(scheduledAtInput);
    if (Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: 'scheduled_at must be a valid timestamp' },
        { status: 400 }
      );
    }

    const scheduledAtUtc = scheduledDate.toISOString();
    const minScheduleTime = Date.now() + 2 * 60 * 1000;
    if (scheduledDate.getTime() < minScheduleTime) {
      return NextResponse.json(
        { error: 'Scheduled time must be at least 2 minutes in the future' },
        { status: 400 }
      );
    }

    // Verify the post belongs to the user
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id, user_id, platform, platform_account_id')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found or access denied' },
        { status: 404 }
      );
    }

    let platformAccountId = post.platform_account_id;

    if (platform === PLATFORMS.FACEBOOK) {
      const { data: connection, error: connectionError } = await supabaseAdmin
        .from('connected_accounts')
        .select('facebook_page_id, facebook_page_access_token, expires_at')
        .eq('user_id', user.id)
        .eq('platform', PLATFORMS.FACEBOOK)
        .single();

      if (connectionError || !connection) {
        return NextResponse.json(
          { error: 'Facebook Page connection required to schedule posts' },
          { status: 400 }
        );
      }

      if (!connection.facebook_page_id || !connection.facebook_page_access_token) {
        return NextResponse.json(
          { error: 'Facebook Page token missing. Please reconnect your account.' },
          { status: 400 }
        );
      }

      if (connection.expires_at && connection.expires_at < Date.now()) {
        return NextResponse.json(
          { error: 'Facebook access token expired. Please reconnect your account.' },
          { status: 400 }
        );
      }

      platformAccountId = connection.facebook_page_id;
    } else if (platform === PLATFORMS.YOUTUBE) {
      const { data: account, error: accountError } = await supabaseAdmin
        .from('platform_accounts')
        .select('platform_account_id, refresh_token')
        .eq('user_id', user.id)
        .eq('platform', PLATFORMS.YOUTUBE)
        .single();

      if (accountError || !account?.refresh_token) {
        return NextResponse.json(
          { error: 'YouTube channel connection required to schedule posts' },
          { status: 400 }
        );
      }

      platformAccountId = account.platform_account_id;
    }

    const nowIso = new Date().toISOString();

    const { data: scheduledPost, error: scheduleError } = await supabaseAdmin
      .from('posts')
      .update({
        scheduled_at: scheduledAtUtc,
        platform,
        platform_account_id: platformAccountId,
        status: 'scheduled',
        published_once: false,
        published_at: null,
        error_message: null,
        updated_at: nowIso,
      })
      .eq('id', postId)
      .select()
      .single();

    if (scheduleError) {
      return NextResponse.json(
        { error: scheduleError.message || 'Failed to schedule post' },
        { status: 400 }
      );
    }

    return NextResponse.json({ scheduledPost });
  } catch (error: any) {
    console.error('Error scheduling post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to schedule post' },
      { status: 500 }
    );
  }
}

// DELETE: Cancel a scheduled post
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scheduledPostId = searchParams.get('id');

    if (!scheduledPostId) {
      return NextResponse.json(
        { error: 'Scheduled post ID is required' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    // Update status to cancelled
    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({ status: 'cancelled', updated_at: nowIso })
      .eq('id', scheduledPostId)
      .eq('user_id', user.id)
      .eq('status', 'scheduled')
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Scheduled post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error cancelling scheduled post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel scheduled post' },
      { status: 500 }
    );
  }
}

