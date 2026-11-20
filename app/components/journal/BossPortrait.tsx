"use client";

import bakedIds from "@/data/baked-portraits.json";
import { NPC_RENDER_URL } from "@/app/lib/site";
import { LevelBadge } from "./Window";

// Display IDs the addon ships a portrait for (scripts/convert-portraits.py):
// the same picture the addon shows, photographed in game.
const BAKED = new Set<number>(bakedIds as number[]);

function initials(name: string) {
  const parts = name.replace(/[^A-Za-z' ]/g, "").split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
}

// Wowhead's image first; if it can't load (blocked, offline) switch to the copy
// stored on the site (already cropped, so it fills the frame), and if that fails
// too, hide it so the initials show.
function switchToFallback(img: HTMLImageElement) {
  const fb = img.dataset.fallback;
  if (fb && !img.dataset.usedFallback) {
    img.dataset.usedFallback = "1";
    img.removeAttribute("style");
    img.src = fb;
  } else {
    img.hidden = true;
  }
}
// Covers an error that fired before hydration attached onError.
function checkLoaded(img: HTMLImageElement | null) {
  if (img && img.complete && img.naturalWidth === 0) switchToFallback(img);
}

/**
 * The round portrait. The addon's own baked picture when it has one (all the
 * journal's bosses today); otherwise Wowhead's model preview zoomed onto the
 * head, as before. Fills its parent.
 */
export function PortraitFace({
  name,
  displayId,
  crop,
  custom,
}: {
  name: string;
  displayId?: number;
  crop?: [number, number, number];
  custom?: string;
}) {
  const [side, left, top] = crop ?? [300, 0, 0];
  const k = 100 / side; // % of the portrait per render pixel
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
          className="wf-portrait-img wf-portrait-render"
          src={NPC_RENDER_URL(displayId)}
          data-fallback={`/journal/portraits/${displayId}.webp`}
          alt=""
          loading="lazy"
          ref={checkLoaded}
          onError={(e) => switchToFallback(e.currentTarget)}
          style={{ width: `${300 * k}%`, height: "auto", left: `${-left * k}%`, top: `${-top * k}%` }}
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
