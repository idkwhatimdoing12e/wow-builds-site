"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const KEY = "dj.nav.pages";

/**
 * Counts the pages this tab has shown on the site (mounted once in the
 * layout), so BackLink knows whether "back" stays on the site.
 */
export function NavTracker() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      window.sessionStorage.setItem(KEY, String(Number(window.sessionStorage.getItem(KEY) ?? "0") + 1));
    } catch {
      // storage blocked: BackLink falls back to its link
    }
  }, [pathname]);
  return null;
}

/**
 * "← Back": to the page the reader came from on the site (the same boss or
 * quest, which those pages keep), or, for a page opened from outside (a
 * search engine, a shared link), to `fallback`.
 */
export default function BackLink({ fallback, label = "Back" }: { fallback: string; label?: string }) {
  const router = useRouter();
  return (
    <a
      href={fallback}
      className="wf-back"
      onClick={(e) => {
        let pages = 0;
        try {
          pages = Number(window.sessionStorage.getItem(KEY) ?? "0");
        } catch {
          pages = 0;
        }
        if (pages > 1 && window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 3 5 8l5 5" />
      </svg>
      {label}
    </a>
  );
}
