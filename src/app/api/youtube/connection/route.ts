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
 * DELETE: Disconnect YouTube account
 * Removes the YouTube connection from connected_accounts
 */
export async function DELETE(req: NextRequest) {
  const user = await resolveUser(req);
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







