"use client";

import bakedIds from "@/data/baked-portraits.json";
import { LevelBadge } from "./Window";

// Display IDs the addon ships a portrait for (scripts/convert-portraits.py):
// the same picture the addon shows, photographed in game.
const BAKED = new Set<number>(bakedIds as number[]);

function initials(name: string) {
  if (/^\?+$/.test(name)) return "?"; // RPG Mode's boss not found yet
  const parts = name.replace(/[^A-Za-z' ]/g, "").split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
}

// The copy stored on the site (already cropped, so it fills the frame); if it
// is missing, hide it so the initials show. Nothing is loaded from Wowhead.
function hideBroken(img: HTMLImageElement) {
  img.hidden = true;
}
// Covers an error that fired before hydration attached onError.
function checkLoaded(img: HTMLImageElement | null) {
  if (img && img.complete && img.naturalWidth === 0) hideBroken(img);
}

/**
 * The round portrait. The addon's own baked picture when it has one (all the
 * journal's bosses today); otherwise the cropped copy stored on the site.
 * Fills its parent.
 */
export function PortraitFace({
  name,
  displayId,
  custom,
}: {
  name: string;
  displayId?: number;
  /** Only used by Wowhead's render, which the site no longer loads. */
  crop?: [number, number, number];
  custom?: string;
}) {
  return (
    <span className="wf-portrait-clip">
      <span className="wf-portrait-initials">{initials(name)}</span>
      {custom ? (
        <img className="wf-portrait-img wf-portrait-custom" src={custom} alt="" width={96} height={96} />
      ) : displayId && BAKED.has(displayId) ? (
        <img
          className="wf-portrait-img wf-portrait-baked"
          src={`/journal/portraits/baked/${displayId}.webp`}
          alt=""
          width={128}
          height={128}
          loading="lazy"
        />
      ) : displayId ? (
        <img
          className="wf-portrait-img"
          src={`/journal/portraits/${displayId}.webp`}
          alt=""
          width={128}
          height={128}
          loading="lazy"
          ref={checkLoaded}
          onError={(e) => hideBroken(e.currentTarget)}
        />
      ) : null}
    </span>
  );
}

/** Round boss portrait with its level badge, as in the addon's boss list and boss pane. */
export function BossPortrait({
  name,
  displayId,
  crop,
  custom,
  level,
  large = false,
}: {
  name: string;
  displayId?: number;
  crop?: [number, number, number];
  custom?: string;
  level?: string;
  large?: boolean;
}) {
  return (
    <span className={`wf-portrait ${large ? "wf-portrait-lg" : ""}`} aria-hidden>
      <PortraitFace name={name} displayId={displayId} crop={crop} custom={custom} />
      <LevelBadge level={level} size={large ? 28 : 22} />
    </span>
  );
}
