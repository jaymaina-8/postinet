import {
  LandingNav,
  Hero,
  HowItWorks,
  Benefits,
  Platforms,
  Reliability,
  CTAStrip,
  LandingFooter,
} from "@/components/landing";

/**
 * Landing page (/) — MVP, high-trust, "magic on first open".
 * Core message: "Upload once. Schedule or post instantly to Facebook + YouTube."
 * No AI sections, no fake testimonials. Links: /pricing, /auth/login, /auth/signup, /dashboard (when logged in).
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <Platforms />
        <Reliability />
        <CTAStrip />
      </main>
      <LandingFooter />
    </div>
  );
}
