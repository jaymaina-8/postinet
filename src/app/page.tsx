import {
  LandingNav,
  Hero,
  SocialProof,
  HowItWorks,
  Benefits,
  Platforms,
  Reliability,
  CTAStrip,
  FAQ,
  LandingFooter,
} from "@/components/landing";

/**
 * Landing page (/) — Opus-inspired, peace-of-mind story.
 * Nav: Features, Solutions, Resources, Pricing + Sign in / Sign up - It's FREE.
 * Hero: "Post with peace of mind." Sections: How it works, Why Postinet, Platforms, Trust, FAQ, CTA.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />
      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <Benefits />
        <Platforms />
        <Reliability />
        <FAQ />
        <CTAStrip />
      </main>
      <LandingFooter />
    </div>
  );
}
