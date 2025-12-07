import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';

async function resolveUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1]?.trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }
  return data.user;
}

// GET: Fetch posts for the user
export async function GET(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'draft', 'scheduled', 'posted'

    let query = supabaseAdmin
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by status
    if (status === 'draft') {
      query = query.is('posted_at', null).is('scheduled_at', null);
    } else if (status === 'scheduled') {
      query = query.not('scheduled_at', 'is', null).is('posted_at', null);
    } else if (status === 'posted') {
      query = query.not('posted_at', 'is', null);
    }

    const { data: posts, error } = await query;

    if (error) {
      throw error;
    }

    // Determine status for each post
    const postsWithStatus = posts?.map(post => {
      let postStatus = 'draft';
      if (post.posted_at) {
        postStatus = 'posted';
      } else if (post.scheduled_at) {
        postStatus = 'pending';
      }

      return {
        ...post,
        status: postStatus,
      };
    }) || [];

    return NextResponse.json({ posts: postsWithStatus });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

