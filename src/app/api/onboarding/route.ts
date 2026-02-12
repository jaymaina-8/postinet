import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_PLATFORMS = ["youtube", "instagram", "facebook", "tiktok"] as const;
const TESTING_VALUE = "testing" as const;

const ALLOWED_FREQUENCY = ["weekly_1_2", "weekly_3_5", "daily", "multi_daily"] as const;
const ALLOWED_GOAL = ["grow_followers", "consistency", "monetize", "manage_clients"] as const;
const ALLOWED_CREATION_STYLE = ["edited_videos", "raw_content", "repurpose", "manage_clients"] as const;

type OnboardingRow = {
  onboarding_complete: boolean;
  onboarding_platforms: string[];
  onboarding_frequency: string | null;
  onboarding_goal: string | null;
  onboarding_creation_style: string | null;
  onboarding_testing: boolean;
  onboarding_completed_at: string | null;
};

function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every((v) => typeof v === "string");
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_profile")
    .select(
      "onboarding_complete,onboarding_platforms,onboarding_frequency,onboarding_goal,onboarding_creation_style,onboarding_testing,onboarding_completed_at,onboarded"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = (data ?? {}) as Partial<OnboardingRow> & { onboarded?: boolean | null };
  const onboarding_complete = row.onboarding_complete ?? row.onboarded ?? false;

  return NextResponse.json({
    onboarding_complete,
    onboarding_platforms: row.onboarding_platforms ?? [],
    onboarding_frequency: row.onboarding_frequency ?? null,
    onboarding_goal: row.onboarding_goal ?? null,
    onboarding_creation_style: row.onboarding_creation_style ?? null,
    onboarding_testing: row.onboarding_testing ?? false,
    onboarding_completed_at: row.onboarding_completed_at ?? null,
  });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const payload = body as {
    platforms?: unknown;
    frequency?: unknown;
    goal?: unknown;
    creation_style?: unknown;
  };

  if (!isStringArray(payload.platforms)) {
    return NextResponse.json({ error: "platforms must be an array of strings" }, { status: 400 });
  }

  const frequency = payload.frequency;
  const goal = payload.goal;
  const creationStyle = payload.creation_style;

  if (typeof frequency !== "string" || !ALLOWED_FREQUENCY.includes(frequency as any)) {
    return NextResponse.json({ error: "invalid frequency" }, { status: 400 });
  }
  if (typeof goal !== "string" || !ALLOWED_GOAL.includes(goal as any)) {
    return NextResponse.json({ error: "invalid goal" }, { status: 400 });
  }
  if (
    typeof creationStyle !== "string" ||
    !ALLOWED_CREATION_STYLE.includes(creationStyle as any)
  ) {
    return NextResponse.json({ error: "invalid creation_style" }, { status: 400 });
  }

  const rawPlatforms = uniq(payload.platforms.map((p) => p.trim()).filter(Boolean));
  const onboarding_testing = rawPlatforms.includes(TESTING_VALUE);

  const onboarding_platforms = uniq(
    rawPlatforms
      .filter((p) => p !== TESTING_VALUE)
      .filter((p) => (ALLOWED_PLATFORMS as readonly string[]).includes(p))
  );

  // Strict rule:
  // - If platforms includes "testing" => allow empty platform list
  // - Else platforms must be non-empty
  if (!onboarding_testing && onboarding_platforms.length === 0) {
    return NextResponse.json(
      { error: 'platforms must be non-empty unless "testing" is selected' },
      { status: 400 }
    );
  }

  const write = {
    id: user.id,
    onboarding_complete: true,
    onboarding_platforms,
    onboarding_frequency: frequency,
    onboarding_goal: goal,
    onboarding_creation_style: creationStyle,
    onboarding_testing,
    onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Back-compat for existing gating
    onboarded: true,
  };

  // Required: print once when saved (server log)
  console.log("onboarding payload saved", {
    user_id: user.id,
    ...write,
  });

  const { error } = await supabase.from("user_profile").upsert(write);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

