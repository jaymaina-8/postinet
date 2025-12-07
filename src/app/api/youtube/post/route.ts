import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { PLATFORMS } from "@/lib/platforms";

async function resolveUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1]?.trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }
  return data.user;
}

/**
 * POST: Post content to YouTube
 * Accepts { content, videoUrl?, thumbnailUrl? } and validates token presence
 * TODO: Call YouTube Data API to upload
 */
export async function POST(req: NextRequest) {
  try {
    const user = await resolveUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, videoUrl, thumbnailUrl } = body;

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
    }

    // Get YouTube connection
    const { data: connection, error: connError } = await supabaseAdmin
      .from("connected_accounts")
      .select("access_token, refresh_token, platform_user_id, expires_at")
      .eq("user_id", user.id)
      .eq("platform", PLATFORMS.YOUTUBE)
      .single();

    if (connError || !connection) {
      return NextResponse.json(
        { error: "YouTube account not connected" },
        { status: 400 }
      );
    }

    // Validate token presence
    if (!connection.access_token) {
      return NextResponse.json(
        { error: "YouTube access token is missing" },
        { status: 400 }
      );
    }

    // Check if token is expired (if expires_at is set)
    if (connection.expires_at && connection.expires_at < Date.now()) {
      return NextResponse.json(
        { error: "YouTube access token has expired. Please reconnect your account." },
        { status: 401 }
      );
    }

    // TODO: Call YouTube Data API to upload
    // Example implementation would be:
    // const youtubeApiUrl = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart';
    // const formData = new FormData();
    // formData.append('metadata', JSON.stringify({
    //   snippet: {
    //     title: content,
    //     description: content,
    //   },
    //   status: {
    //     privacyStatus: 'public',
    //   },
    // }));
    // if (videoUrl) {
    //   const videoBlob = await fetch(videoUrl).then(r => r.blob());
    //   formData.append('video', videoBlob);
    // }
    // const response = await fetch(youtubeApiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${connection.access_token}`,
    //   },
    //   body: formData,
    // });
    // const result = await response.json();

    // Placeholder response
    return NextResponse.json({
      success: true,
      message: "YouTube posting integration coming soon",
      platform: PLATFORMS.YOUTUBE,
      content,
      videoUrl: videoUrl || null,
      thumbnailUrl: thumbnailUrl || null,
    });
  } catch (error: any) {
    console.error("YouTube post error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post to YouTube" },
      { status: 500 }
    );
  }
}
