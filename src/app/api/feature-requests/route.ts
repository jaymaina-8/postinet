import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/feature-requests
 * Returns all feature requests (newest first). Admin only (user_profile.is_admin).
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabaseAdmin
      .from("user_profile")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!(profile as { is_admin?: boolean } | null)?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from("feature_requests")
      .select("id, title, details, category, votes, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[feature-requests] select error:", error);
      return NextResponse.json(
        { error: "Failed to load requests" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        details: row.details,
        category: row.category,
        votes: row.votes ?? 0,
        createdAt: row.created_at,
      }))
    );
  } catch (e) {
    console.error("[feature-requests] GET error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/feature-requests
 * Body: { title: string, details?: string, category?: string }
 * Saves a new feature request. No auth required so anyone can submit.
 * View in Supabase Dashboard → Table Editor → feature_requests, or GET this route.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const details = typeof body.details === "string" ? body.details.trim() : null;
    const category = typeof body.category === "string" ? body.category.trim() : null;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("feature_requests")
      .insert({
        title,
        details: details || null,
        category: category || null,
        votes: 0,
      })
      .select("id, title, details, category, votes, created_at")
      .single();

    if (error) {
      console.error("[feature-requests] insert error:", error);
      return NextResponse.json(
        { error: "Failed to save request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      details: data.details,
      category: data.category,
      votes: data.votes ?? 0,
      createdAt: data.created_at,
    });
  } catch (e) {
    console.error("[feature-requests] error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
