import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { PLATFORMS } from "@/lib/platforms";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { refreshYouTubeAccessToken } from "@/lib/youtube/client";
import { uploadYouTubeVideo } from "@/lib/youtube/upload";

/**
 * POST: Publish a YouTube video
 * Accepts { postId } and publishes server-side
 */
export async function POST(req: NextRequest) {
  let postId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    postId = body?.postId || null;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select(
        "id, user_id, platform, platform_account_id, media_url, title, description, visibility, status, published_once, provider_post_id"
      )
      .eq("id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.platform !== PLATFORMS.YOUTUBE) {
      return NextResponse.json({ error: "Post is not a YouTube post" }, { status: 400 });
    }

    if (post.published_once) {
      return NextResponse.json({ success: true, videoId: post.provider_post_id });
    }

    if (!post.media_url) {
      return NextResponse.json({ error: "Video file is required" }, { status: 400 });
    }

    if (!post.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from("platform_accounts")
      .select("id, refresh_token")
      .eq("user_id", user.id)
      .eq("platform", PLATFORMS.YOUTUBE)
      .eq("platform_account_id", post.platform_account_id)
      .maybeSingle();

    if (accountError || !account?.refresh_token) {
      return NextResponse.json({ error: "YouTube account not connected" }, { status: 400 });
    }

    const { accessToken, expiresIn } = await refreshYouTubeAccessToken(account.refresh_token);
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    await supabaseAdmin
      .from("platform_accounts")
      .update({ access_token: accessToken, token_expires_at: tokenExpiresAt })
      .eq("id", account.id);

    const uploadResult = await uploadYouTubeVideo({
      accessToken,
      title: post.title,
      description: post.description || "",
      visibility: (post.visibility || "private") as "public" | "unlisted" | "private",
      mediaUrl: post.media_url,
    });

    const publishedAt = new Date().toISOString();
    await supabaseAdmin
      .from("posts")
      .update({
        status: "published",
        published_once: true,
        posted_at: publishedAt,
        published_at: publishedAt,
        provider_post_id: uploadResult.videoId,
        platform_post_id: uploadResult.videoId,
        error_message: null,
      })
      .eq("id", post.id);

    return NextResponse.json({
      success: true,
      videoId: uploadResult.videoId,
    });
  } catch (error: any) {
    console.error("YouTube post error:", error);
    if (postId) {
      await supabaseAdmin
        .from("posts")
        .update({ status: "failed", error_message: error.message || "Failed to post to YouTube" })
        .eq("id", postId);
    }
    return NextResponse.json(
      { error: error.message || "Failed to post to YouTube" },
      { status: 500 }
    );
  }
}
