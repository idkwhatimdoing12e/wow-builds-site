"use client";

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
 * The round face itself: the boss's head portrait (public/journal/portraits,
 * cut from Wowhead's model renders) over its initials. Fills its parent.
 */
export function PortraitFace({ name, displayId }: { name: string; displayId?: number }) {
  return (
    <span className="wf-portrait-clip">
      <span className="wf-portrait-initials">{initials(name)}</span>
      {displayId && (
        <img
          className="wf-portrait-img"
          src={`/journal/portraits/${displayId}.webp`}
          alt=""
          width={96}
          height={96}
          loading="lazy"
          ref={hideIfBroken}
          onError={(e) => { e.currentTarget.hidden = true; }}
        />
      )}
    </span>
  );
}

/** Round boss portrait like the addon's list (SetPortraitTextureFromCreatureDisplayID). */
export function BossPortrait({ name, displayId, level }: { name: string; displayId?: number; level?: string }) {
  return (
    <span className="wf-portrait" aria-hidden>
      <PortraitFace name={name} displayId={displayId} />
      <LevelBadge level={level} size={22} />
    </span>
  );
}
