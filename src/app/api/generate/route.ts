import { NextRequest, NextResponse } from 'next/server';
import { generateContent, type UserProfile } from '@/lib/aiClient';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { PLATFORMS, isValidPlatform } from '@/lib/platforms';

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

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile for context
    const { data: profile } = await supabaseAdmin
      .from('user_profile')
      .select('niche, content_goals, tone, frequency, audience, competitors')
      .eq('id', user.id)
      .single();

    const userProfile: UserProfile | undefined = profile
      ? {
          niche: profile.niche || undefined,
          content_goals: profile.content_goals || undefined,
          tone: profile.tone || undefined,
          frequency: profile.frequency || undefined,
          audience: profile.audience || undefined,
          competitors: profile.competitors || undefined,
        }
      : undefined;

    const body = await req.json();
    const text = body.text as string;
    const platform = (body.platform as string) || PLATFORMS.INSTAGRAM;
    const media_url = body.media_url as string | null;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    // Validate platform
    if (!isValidPlatform(platform)) {
      return NextResponse.json(
        { error: `Invalid platform: ${platform}` },
        { status: 400 }
      );
    }

    // Determine media type from URL
    let mediaType: 'text' | 'image' | 'video' = 'text';
    if (media_url) {
      const urlLower = media_url.toLowerCase();
      if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('.png') || 
          urlLower.includes('.gif') || urlLower.includes('.webp')) {
        mediaType = 'image';
      } else if (urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('.mov')) {
        mediaType = 'video';
      }
    }

    // Generate content using OpenAI
    const generated = await generateContent({
      input: text,
      mediaType,
      userProfile,
    });

    // Save as draft in posts table
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: user.id,
        content: text,
        media_url: media_url || null,
        ai_caption: generated.caption,
        ai_hashtags: generated.hashtags.join(', '),
        scheduled_at: null,
        posted_at: null,
      })
      .select()
      .single();

    if (postError) {
      console.error('Error saving post:', postError);
      return NextResponse.json(
        { error: 'Failed to save post to database', details: postError.message },
        { status: 500 }
      );
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Failed to save post: no post data returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      input: text,
      platform: platform,
      result: {
        title: generated.title,
        description: generated.caption,
        hashtags: generated.hashtags,
        optimalTime: generated.optimalTime,
        variants: generated.variants || [],
      },
      postId: post.id,
    });
  } catch (error: any) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
