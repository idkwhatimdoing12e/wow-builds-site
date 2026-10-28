"use client";

import { useState } from "react";
import type { ZonePin } from "@/app/lib/journal";

/**
 * "Show on map" under a quest's Starts at line: opens the zone picture with the
 * quest giver pinned, the way the addon pins the world map (FDJ's questMapButton).
 * The pictures come from scripts/convert-zone-maps.py.
 */
export default function ZoneMap({ pin }: { pin: ZonePin }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="wp-zone">
      <button
        type="button"
        className="wf-btn wf-btn-dark wf-btn-sm wp-zone-btn"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <img src="/journal/ui/map-tab.png" alt="" width={16} height={16} aria-hidden />
        {open ? "Hide map" : "Show on map"}
      </button>

      {open && (
        <figure className="wp-zone-map">
          <div className="wp-zone-frame">
            <img src={pin.src} alt={pin.label} width={1002} height={668} />
            <span
              className="wp-zone-pin"
              style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
            >
              <span className="wp-zone-dot" />
              <span className="wp-zone-ring" />
            </span>
          </div>
          <figcaption className="wp-zone-cap">{pin.label}</figcaption>
        </figure>
      )}
    </div>
  );
}
