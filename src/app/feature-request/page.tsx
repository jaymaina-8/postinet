import type { Metadata } from "next";
import { LandingNav, LandingFooter } from "@/components/landing";
import { FeatureRequestView } from "./FeatureRequestView";

export const metadata: Metadata = {
  title: "Feature requests | Postinet AI",
  description: "Suggest and vote on product ideas. Help shape what we build next.",
};

export default function FeatureRequestPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <LandingNav />
      <FeatureRequestView />
      <LandingFooter />
    </div>
  );
}
