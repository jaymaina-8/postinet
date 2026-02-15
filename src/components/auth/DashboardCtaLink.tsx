"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";

type DashboardCtaLinkProps = {
  /** Where to send signed-out users (usually /auth/signup?next=...) */
  signedOutHref: string;
  signedOutText: string;
  className?: string;
  title?: string;
  prefetch?: boolean;
  onClick?: () => void;
  /** Override dashboard destination if needed */
  signedInHref?: string;
  signedInText?: string;
};

/**
 * CTA link that becomes "My Dashboard" when signed in.
 *
 * - Signed in: goes to `/dashboard` (or `signedInHref`) and shows `My Dashboard`.
 * - Signed out: goes to `signedOutHref` and shows `signedOutText`.
 */
export function DashboardCtaLink({
  signedOutHref,
  signedOutText,
  className,
  title,
  prefetch,
  onClick,
  signedInHref = "/dashboard",
  signedInText = "My Dashboard",
}: DashboardCtaLinkProps) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSignedIn(!!data.session);
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSignedIn(!!session);
    });

    init();
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const resolved = useMemo(() => {
    return signedIn
      ? { href: signedInHref, text: signedInText }
      : { href: signedOutHref, text: signedOutText };
  }, [signedIn, signedInHref, signedInText, signedOutHref, signedOutText]);

  return (
    <Link href={resolved.href} className={className} title={title} prefetch={prefetch} onClick={onClick}>
      {resolved.text}
    </Link>
  );
}

