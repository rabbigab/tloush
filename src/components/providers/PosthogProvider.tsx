"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (window.__ph_initialized) {
      posthog.capture("$pageview", { path: pathname });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PosthogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";
    if (key && typeof window !== "undefined") {
      posthog.init(key, {
        api_host: host,
        person_profiles: "identified_only",
        capture_pageview: false,
        loaded: () => {
          window.__ph_initialized = true;
        },
      });
    }
  }, []);

  return (
    <>
      {children}
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>
    </>
  );
}
