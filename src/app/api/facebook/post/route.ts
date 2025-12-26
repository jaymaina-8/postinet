import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { PLATFORMS } from "@/lib/platforms";
import { postToFacebook } from "@/lib/facebook/postToFacebook";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST: Post content to Facebook
 * Accepts { content, imageUrl? } and posts to connected Facebook Page
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, imageUrl } = body;

    if (!content && !imageUrl) {
      return NextResponse.json(
        { error: "Either content or imageUrl is required" },
        { status: 400 }
      );
    }

    // Get Facebook connection with Page token
    const { data: connection, error: connError } = await supabaseAdmin
      .from("connected_accounts")
      .select("facebook_page_id, facebook_page_name, facebook_page_access_token, expires_at")
      .eq("user_id", user.id)
      .eq("platform", PLATFORMS.FACEBOOK)
      .single();

    if (connError || !connection) {
      return NextResponse.json(
        { error: "Facebook account not connected" },
        { status: 400 }
      );
    }

    // Check for Page connection
    if (!connection.facebook_page_id || !connection.facebook_page_access_token) {
      return NextResponse.json(
        { error: "No Facebook Page connected. Please reconnect your Facebook account." },
        { status: 400 }
      );
    }

    // Check if token is expired (if expires_at is set)
    if (connection.expires_at && connection.expires_at < Date.now()) {
      return NextResponse.json(
        { error: "Facebook access token has expired. Please reconnect your account." },
        { status: 401 }
      );
    }

    // Post to Facebook using helper function
    const postResult = await postToFacebook({
      pageId: connection.facebook_page_id,
      pageAccessToken: connection.facebook_page_access_token,
      message: content || '',
      imageUrl: imageUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      postId: postResult.id,
      pageId: connection.facebook_page_id,
      pageName: connection.facebook_page_name,
    });
  } catch (error: any) {
    console.error("Facebook post error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to post to Facebook" },
      { status: 500 }
    );
  }
}



