"use client";

import { useEffect } from "react";
import { ADSENSE_CLIENT } from "@/app/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * One AdSense display unit. Renders nothing until a slot id exists, so the
 * layout is identical with and without ads. Create the unit in AdSense
 * ("Display ads", responsive) and put its id in NEXT_PUBLIC_ADSENSE_SLOT_CONTENT.
 */
export default function AdSlot({ slot, className = "" }: { slot?: string; className?: string }) {
  const slotId = slot ?? process.env.NEXT_PUBLIC_ADSENSE_SLOT_CONTENT;

  useEffect(() => {
    if (!slotId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense not loaded (blocked, or consent not given) — fine */
    }
  }, [slotId]);

  if (!slotId) return null;

  return (
    <div className={`my-10 ${className}`} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
