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
    const { postId, scheduledAt, platform = PLATFORMS.INSTAGRAM } = body;

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

    // Validate scheduledAt is in the future
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
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

    // Update post with scheduled_at
    await supabaseAdmin
      .from('posts')
      .update({ scheduled_at: scheduledAt })
      .eq('id', postId);

    // Create scheduled post entry
    const { data: scheduledPost, error: scheduleError } = await supabaseAdmin
      .from('scheduled_posts')
      .insert({
        user_id: user.id,
        post_id: postId,
        scheduled_at: scheduledAt,
        status: 'pending',
        platform,
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
        .update({ scheduled_at: null })
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

