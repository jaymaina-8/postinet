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
      .from('scheduled_posts')
      .select(`
        *,
        posts (
          id,
          content,
          media_url,
          ai_caption,
          ai_hashtags
        )
      `)
      .eq('user_id', user.id)
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
    const { postId, scheduledAt, platform = PLATFORMS.FACEBOOK } = body;

    if (!postId || !scheduledAt) {
      return NextResponse.json(
        { error: 'postId and scheduledAt are required' },
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
    const scheduledDate = new Date(scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: 'scheduledAt must be a valid timestamp' },
        { status: 400 }
      );
    }

    const scheduledAtUtc = scheduledDate.toISOString();
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      );
    }

    if (platform !== PLATFORMS.FACEBOOK) {
      return NextResponse.json(
        { error: 'Only Facebook scheduling is supported at this time' },
        { status: 400 }
      );
    }

    // Verify the post belongs to the user
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id, user_id')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found or access denied' },
        { status: 404 }
      );
    }

    // Ensure Facebook Page is connected and capture Page ID
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

    // Update post with scheduled_at and platform details
    await supabaseAdmin
      .from('posts')
      .update({
        scheduled_at: scheduledAtUtc,
        platform: PLATFORMS.FACEBOOK,
        platform_account_id: connection.facebook_page_id,
        status: 'scheduled',
      })
      .eq('id', postId);

    // Create scheduled post entry
    const { data: scheduledPost, error: scheduleError } = await supabaseAdmin
      .from('scheduled_posts')
      .insert({
        user_id: user.id,
        post_id: postId,
        scheduled_at: scheduledAtUtc,
        status: 'scheduled',
        platform: PLATFORMS.FACEBOOK,
        platform_account_id: connection.facebook_page_id,
      })
      .select()
      .single();

    if (scheduleError) {
      throw scheduleError;
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

    // Update status to cancelled
    const { data, error } = await supabaseAdmin
      .from('scheduled_posts')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', scheduledPostId)
      .eq('user_id', user.id)
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

    // Also clear scheduled_at from the post
    if (data.post_id) {
      await supabaseAdmin
        .from('posts')
        .update({ scheduled_at: null, status: 'draft' })
        .eq('id', data.post_id);
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

