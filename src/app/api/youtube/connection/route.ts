import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { PLATFORMS } from "@/lib/platforms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * DELETE: Disconnect YouTube account
 * Removes the YouTube connection from connected_accounts
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
    .match({ user_id: user.id, platform: PLATFORMS.YOUTUBE });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}





























