"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import supabase from "@/lib/supabaseClient";
import { getSafeNext } from "@/lib/auth-utils";

type Frequency = "weekly_1_2" | "weekly_3_5" | "daily" | "multi_daily";
type Goal = "grow_followers" | "consistency" | "monetize" | "manage_clients";
type CreationStyle = "edited_videos" | "raw_content" | "repurpose" | "manage_clients";

type PlatformChoice = "youtube" | "instagram" | "facebook" | "tiktok" | "testing";

const STEPS_TOTAL = 6;

const PLATFORM_OPTIONS: Array<{ id: PlatformChoice; label: string; sub?: string }> = [
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram", sub: "Coming soon" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok", sub: "Coming soon" },
  { id: "testing", label: "I’m just testing for now" },
];

const FREQUENCY_OPTIONS: Array<{ id: Frequency; label: string }> = [
  { id: "weekly_1_2", label: "1–2 times per week" },
  { id: "weekly_3_5", label: "3–5 times per week" },
  { id: "daily", label: "Daily" },
  { id: "multi_daily", label: "Multiple times per day" },
];

const GOAL_OPTIONS: Array<{ id: Goal; label: string }> = [
  { id: "grow_followers", label: "Grow followers" },
  { id: "consistency", label: "Increase consistency" },
  { id: "monetize", label: "Monetize content" },
  { id: "manage_clients", label: "Manage multiple accounts easier" },
];

const CREATION_STYLE_OPTIONS: Array<{ id: CreationStyle; label: string }> = [
  { id: "edited_videos", label: "I already have edited videos" },
  { id: "raw_content", label: "I record raw content" },
  { id: "repurpose", label: "I repurpose long videos into shorts" },
  { id: "manage_clients", label: "I manage content for clients" },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-200">
      {children}
    </span>
  );
}

function SelectCard({
  title,
  subtitle,
  selected,
  onClick,
}: {
  title: string;
  subtitle?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group relative w-full text-left rounded-2xl border p-5 transition-colors",
        "bg-zinc-950/40 hover:bg-zinc-900/60 active:bg-zinc-900/80",
        selected ? "border-emerald-500/70" : "border-zinc-800"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-white">{title}</div>
          {subtitle ? <div className="text-sm text-zinc-500 mt-1">{subtitle}</div> : null}
        </div>
        <div
          className={cx(
            "mt-0.5 h-6 w-6 shrink-0 rounded-full border flex items-center justify-center",
            selected ? "border-emerald-400 bg-emerald-500/20" : "border-zinc-700 bg-zinc-950"
          )}
          aria-hidden="true"
        >
          {selected ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-300" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = getSafeNext(searchParams.get("next"), "");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [platforms, setPlatforms] = useState<PlatformChoice[]>([]);
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [creationStyle, setCreationStyle] = useState<CreationStyle | null>(null);

  const progressPct = useMemo(() => Math.round((step / STEPS_TOTAL) * 100), [step]);

  const onboardingTesting = platforms.includes("testing");
  const selectedPlatforms = platforms.filter((p) => p !== "testing");

  const canNext = useMemo(() => {
    if (step === 1) return true;
    if (step === 2) return onboardingTesting || selectedPlatforms.length > 0;
    if (step === 3) return !!frequency;
    if (step === 4) return !!goal;
    if (step === 5) return !!creationStyle;
    if (step === 6) return true;
    return false;
  }, [step, onboardingTesting, selectedPlatforms.length, frequency, goal, creationStyle]);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (!user || authError) {
        router.push(next ? `/auth/login?next=${encodeURIComponent(next)}` : "/auth/login");
        return;
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router, next]);

  useEffect(() => {
    async function loadExisting() {
      try {
        setError(null);
        const res = await fetch("/api/onboarding", { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();

        const existingPlatforms: PlatformChoice[] = Array.isArray(data.onboarding_platforms)
          ? (data.onboarding_platforms as string[])
              .filter((p) => ["youtube", "instagram", "facebook", "tiktok"].includes(p))
              .map((p) => p as PlatformChoice)
          : [];
        const existingTesting = data.onboarding_testing ? (["testing"] as PlatformChoice[]) : [];
        setPlatforms([...existingPlatforms, ...existingTesting]);

        if (typeof data.onboarding_frequency === "string") setFrequency(data.onboarding_frequency);
        if (typeof data.onboarding_goal === "string") setGoal(data.onboarding_goal);
        if (typeof data.onboarding_creation_style === "string") setCreationStyle(data.onboarding_creation_style);
      } catch {
        // keep silent; onboarding is still usable
      }
    }
    if (!checkingAuth) loadExisting();
  }, [checkingAuth]);

  async function countConnectedForSelectedPlatforms(): Promise<number> {
    // Enforce only for platforms that are connectable today.
    const enforceable = selectedPlatforms.filter((p) => p === "facebook" || p === "youtube");
    if (enforceable.length === 0) return 0;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return 0;

    const userId = session.user.id;

    const checks = await Promise.all(
      enforceable.map(async (p) => {
        if (p === "facebook") {
          const res = await supabase
            .from("connected_accounts")
            .select("id, facebook_page_access_token")
            .eq("user_id", userId)
            .eq("platform", "facebook");
          const ok = (res.data || []).some((row: any) => row.facebook_page_access_token != null);
          return ok ? 1 : 0;
        }
        if (p === "youtube") {
          const res = await supabase
            .from("platform_accounts")
            .select("id")
            .eq("user_id", userId)
            .eq("platform", "youtube");
          const ok = (res.data?.length || 0) > 0;
          return ok ? 1 : 0;
        }
        return 0;
      })
    );

    return checks.reduce((a, b) => a + b, 0);
  }

  async function handleFinish() {
    if (!frequency || !goal || !creationStyle) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: platforms,
          frequency,
          goal,
          creation_style: creationStyle,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to save onboarding.");
      }

      let destination = "/dashboard/create";
      let needsConnect = false;

      if (onboardingTesting) {
        destination = "/dashboard";
      } else {
        const connectedCount = await countConnectedForSelectedPlatforms();
        needsConnect = connectedCount === 0 && selectedPlatforms.some((p) => p === "facebook" || p === "youtube");
        destination = needsConnect ? "/dashboard/accounts?onboarding=1" : "/dashboard/create";
      }

      // Required: print once (client log)
      console.log("post-onboarding routing decision", {
        testing: onboardingTesting,
        needsConnect,
        destination,
      });

      router.push(next || destination);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSkipTesting() {
    // Allowed skip only for "testing" selection; still marks onboarding complete.
    if (!onboardingTesting) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platforms: ["testing"],
          frequency: frequency ?? "weekly_1_2",
          goal: goal ?? "consistency",
          creation_style: creationStyle ?? "raw_content",
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to save onboarding.");

      console.log("post-onboarding routing decision", {
        testing: true,
        needsConnect: false,
        destination: "/dashboard",
        skipped: true,
      });

      router.push(next || "/dashboard");
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-zinc-500 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-28 sm:pb-10 sm:pt-10">
        {/* App name + logo (HeyGen-style branding at top) */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <span className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Postinet AI
          </span>
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="shrink-0"
            priority
            aria-hidden
          />
        </div>

        {/* Top progress (HeyGen-inspired: thin bar + compact steps) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-zinc-400">
              Step {step} of {STEPS_TOTAL}
            </div>
            {onboardingTesting ? (
              <button
                type="button"
                onClick={handleSkipTesting}
                disabled={loading}
                className={cx(
                  "text-xs font-semibold",
                  loading ? "text-zinc-600" : "text-zinc-500 hover:text-zinc-300"
                )}
                aria-label="Skip setup (testing)"
              >
                Skip setup
              </button>
            ) : (
              <div className="text-xs text-zinc-600"> </div>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
          {step === 1 ? (
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">Let’s set you up fast.</h1>
              <p className="text-zinc-400">
                Tap a few options. No typing. You’ll be ready in under a minute.
              </p>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-white">Which platforms matter right now?</h2>
                <p className="text-sm text-zinc-400 mt-1">Pick all that apply.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLATFORM_OPTIONS.map((opt) => {
                  const selected = platforms.includes(opt.id);
                  return (
                    <SelectCard
                      key={opt.id}
                      title={opt.label}
                      subtitle={opt.sub}
                      selected={selected}
                      onClick={() => {
                        setPlatforms((prev) => {
                          const has = prev.includes(opt.id);
                          const next = has ? prev.filter((p) => p !== opt.id) : [...prev, opt.id];

                          // If "testing" selected, keep other selections (still allowed).
                          return next;
                        });
                      }}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-zinc-500">
                If you pick “testing”, you can explore without connecting accounts.
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-white">How often do you want to post?</h2>
                <p className="text-sm text-zinc-400 mt-1">Choose one.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.id}
                    title={opt.label}
                    selected={frequency === opt.id}
                    onClick={() => setFrequency(opt.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-white">What’s your main goal?</h2>
                <p className="text-sm text-zinc-400 mt-1">Choose one.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOAL_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.id}
                    title={opt.label}
                    selected={goal === opt.id}
                    onClick={() => setGoal(opt.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-white">What best describes you?</h2>
                <p className="text-sm text-zinc-400 mt-1">Choose one.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CREATION_STYLE_OPTIONS.map((opt) => (
                  <SelectCard
                    key={opt.id}
                    title={opt.label}
                    selected={creationStyle === opt.id}
                    onClick={() => setCreationStyle(opt.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {step === 6 ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Looks good.</h2>
                <p className="text-sm text-zinc-400 mt-1">Here’s what we’ll optimize for.</p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-zinc-500">Selected platforms</div>
                <div className="flex flex-wrap gap-2">
                  {(onboardingTesting ? ["Just testing"] : [])
                    .concat(
                      selectedPlatforms.length
                        ? selectedPlatforms.map((p) => p[0].toUpperCase() + p.slice(1))
                        : []
                    )
                    .map((t) => (
                      <Chip key={t}>{t}</Chip>
                    ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-zinc-500">Frequency</div>
                <div className="flex flex-wrap gap-2">
                  {frequency ? <Chip>{FREQUENCY_OPTIONS.find((o) => o.id === frequency)?.label}</Chip> : null}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-zinc-500">Goal</div>
                <div className="flex flex-wrap gap-2">
                  {goal ? <Chip>{GOAL_OPTIONS.find((o) => o.id === goal)?.label}</Chip> : null}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-zinc-500">Creation style</div>
                <div className="flex flex-wrap gap-2">
                  {creationStyle ? (
                    <Chip>{CREATION_STYLE_OPTIONS.find((o) => o.id === creationStyle)?.label}</Chip>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      {/* Sticky nav (mobile-first) */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur supports-backdrop-filter:bg-zinc-950/60">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || loading}
            className={cx(
              "h-11 rounded-xl px-4 text-sm font-semibold border transition-colors",
              step === 1 || loading
                ? "border-zinc-800 text-zinc-600"
                : "border-zinc-700 text-zinc-200 hover:border-zinc-500"
            )}
          >
            Back
          </button>

          {step < STEPS_TOTAL ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(STEPS_TOTAL, s + 1))}
              disabled={!canNext || loading}
              className={cx(
                "flex-1 h-11 rounded-xl px-5 text-sm font-semibold transition-colors",
                !canNext || loading
                  ? "bg-zinc-800 text-zinc-500"
                  : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
              )}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading || !frequency || !goal || !creationStyle}
              className={cx(
                "flex-1 h-11 rounded-xl px-5 text-sm font-semibold transition-colors",
                loading || !frequency || !goal || !creationStyle
                  ? "bg-zinc-800 text-zinc-500"
                  : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
              )}
            >
              {loading ? "Saving…" : "Start your first upload"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
          <p>Loading…</p>
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
