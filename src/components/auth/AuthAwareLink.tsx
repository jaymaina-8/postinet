"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";

type AuthAwareLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
  prefetch?: boolean;
};

/**
 * Auth-aware link:
 * - Signed in: goes straight to `href`
 * - Signed out: goes to `/auth/signup?next=<href>`
 */
export function AuthAwareLink({ href, children, className, onClick, title, prefetch }: AuthAwareLinkProps) {
  const [signedIn, setSignedIn] = useState<boolean>(false);

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

  const resolvedHref = useMemo(() => {
    return signedIn ? href : `/auth/signup?next=${encodeURIComponent(href)}`;
  }, [signedIn, href]);

  return (
    <Link href={resolvedHref} className={className} onClick={onClick} title={title} prefetch={prefetch}>
      {children}
    </Link>
  );
}

