"use client";

import { NPC_RENDER_URL } from "@/app/lib/site";
import { LevelBadge } from "./Window";

function initials(name: string) {
  const parts = name.replace(/[^A-Za-z' ]/g, "").split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
}

// A render that fails (offline, blocked) hides itself so the initials show.
// The ref check covers an error that fired before hydration attached onError.
function hideIfBroken(img: HTMLImageElement | null) {
  if (img && img.complete && img.naturalWidth === 0) img.hidden = true;
}

/**
 * Round boss portrait like the addon's list (SetPortraitTextureFromCreatureDisplayID):
 * Wowhead's model render, zoomed onto the head with a precomputed crop.
 */
export function BossPortrait({
  name,
  displayId,
  crop,
  level,
}: {
  name: string;
  displayId?: number;
  crop?: [number, number, number];
  level?: string;
}) {
  const [side, left, top] = crop ?? [300, 0, 0];
  const scale = 100 / side; // % of the portrait per render pixel
  return (
    <span className="wf-portrait" aria-hidden>
      <span className="wf-portrait-clip">
        <span className="wf-portrait-initials">{initials(name)}</span>
        {displayId && (
        <img
          className="wf-portrait-img"
          src={NPC_RENDER_URL(displayId)}
          alt=""
          loading="lazy"
          ref={hideIfBroken}
          onError={(e) => { e.currentTarget.hidden = true; }}
          style={{ width: `${300 * scale}%`, left: `${-left * scale}%`, top: `${-top * scale}%` }}
        />
        )}
      </span>
      <LevelBadge level={level} size={22} />
    </span>
  );
}

/** Full model render shown beside the boss name in the detail pane. */
export function BossModel({ name, displayId }: { name: string; displayId?: number }) {
  if (!displayId) return null;
  return (
    <img
      className="wb-model"
      src={NPC_RENDER_URL(displayId)}
      alt={name}
      width={150}
      height={150}
      loading="lazy"
      ref={hideIfBroken}
      onError={(e) => { e.currentTarget.hidden = true; }}
    />
  );
}
