"use client";

import { useState } from "react";
import type { DungeonMap } from "@/app/lib/journal";
import { PortraitFace } from "./BossPortrait";

// Boss icon size, like the addon's "Boss icons" control: 0% hides them, 90% by default.
const STEP = 0.1;
const DEFAULT_SCALE = 0.9;

/**
 * The addon's Map tab: the dungeon's map art with boss portraits, the
 * entrance swirl and the ladders between levels. Clicking a boss opens it in
 * the Bosses tab; clicking a ladder or a "Level" button switches level.
 */
export default function MapPane({ map, onBoss }: { map: DungeonMap; onBoss: (bossIndex: number) => void }) {
  const [floor, setFloor] = useState(map.startFloor);
  const [scale, setScale] = useState(DEFAULT_SCALE);

  return (
    <div className="wm">
      {map.floors.length > 1 && (
        <div className="wm-floors">
          {map.floorLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              data-floor={i + 1}
              className={`wf-btn wf-btn-sm ${floor === i + 1 ? "wf-tab-active" : "wf-btn-red"}`}
              aria-pressed={floor === i + 1}
              onClick={() => setFloor(i + 1)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {map.floors.map((src, i) => {
        const f = i + 1;
        return (
          <div
            key={src}
            className="wm-stage"
            data-floor-pane={f}
            hidden={floor !== f}
            style={{ "--pin": scale } as React.CSSProperties}
          >
            <img className="wm-art" src={src} alt={map.floorLabels[i]} width={1002} height={668} loading={f === map.startFloor ? "eager" : "lazy"} />

            {map.entrances.filter((e) => e.floor === f).map((e) => (
              <span key={`e${e.x}-${e.y}`} className={`wm-ent wm-ent-${e.side}`} style={{ left: `${e.x * 100}%`, top: `${e.y * 100}%` }}>
                <img src="/journal/ui/map-entrance.png" alt="" width={64} height={64} />
                <span className="wm-ent-label" style={e.color ? { color: e.color } : undefined}>{e.label}</span>
              </span>
            ))}

            {map.transitions.filter((t) => t.floor === f).map((t) => (
              <button
                key={`t${t.x}-${t.y}`}
                type="button"
                className="wm-ladder"
                data-floor={t.to}
                data-tip={t.tip}
                aria-label={t.tip}
                style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%` }}
                onClick={() => t.to && setFloor(t.to)}
              >
                <img src="/journal/ui/map-ladder.png" alt="" width={128} height={128} />
                {t.label && <span className="wm-ladder-label">{t.label}</span>}
              </button>
            ))}

            {scale > 0 &&
              map.bosses.filter((b) => b.floor === f).map((b) => (
                <button
                  key={`b${b.name}`}
                  type="button"
                  className="wm-boss"
                  data-tip={b.name}
                  aria-label={b.name}
                  style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%` }}
                  onClick={() => b.bossIndex !== undefined && onBoss(b.bossIndex)}
                >
                  <PortraitFace name={b.name} displayId={b.displayId} crop={b.portraitCrop} custom={b.customPortrait} />
                  <img className="wm-ring" src="/journal/ui/map-ring.png" alt="" width={28} height={28} />
                </button>
              ))}
          </div>
        );
      })}

      <div className="wm-size">
        <span>Boss icons</span>
        <span className="wm-size-row">
          <button type="button" aria-label="Smaller boss icons" disabled={scale <= 0} onClick={() => setScale((s) => Math.max(0, Math.round((s - STEP) * 10) / 10))}>−</button>
          <span>{Math.round(scale * 100)}%</span>
          <button type="button" aria-label="Bigger boss icons" disabled={scale >= 1} onClick={() => setScale((s) => Math.min(1, Math.round((s + STEP) * 10) / 10))}>+</button>
        </span>
      </div>
    </div>
  );
}
