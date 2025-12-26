import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { PLATFORMS } from "@/lib/platforms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET: Check Facebook connection status
 * Returns the Facebook connection details if connected
 */
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("connected_accounts")
    .select("id, platform, platform_username, facebook_page_name, facebook_page_id, created_at, expires_at")
    .eq("user_id", user.id)
    .eq("platform", PLATFORMS.FACEBOOK)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    page_name: data.facebook_page_name,
    page_id: data.facebook_page_id,
    username: data.platform_username,
    created_at: data.created_at,
    expires_at: data.expires_at,
  });
}

/**
 * DELETE: Disconnect Facebook account
 * Removes the Facebook connection from connected_accounts
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from("connected_accounts")
    .delete()
    .match({ user_id: user.id, platform: PLATFORMS.FACEBOOK });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

























