"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DungeonMap } from "@/app/lib/journal";
import { PortraitFace } from "./BossPortrait";
import { useT } from "@/app/components/i18n/I18n";

// Boss icon size, like the addon's "Boss icons" control: 0% hides them, 90% by default.
const STEP = 0.1;
const DEFAULT_SCALE = 0.9;

// Map zoom: the mouse wheel zooms on the point under the cursor, a drag pans.
// Capped at 3x: the map art is the game's own 1024 px texture, and past that
// it only gets softer.
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const BUTTON_STEP = 1.25;

interface View {
  z: number;
  x: number;
  y: number;
}
const HOME: View = { z: 1, x: 0, y: 0 };

/** Keep the map covering the frame: no empty edge shows past the art. */
function clamp(v: View, w: number, h: number): View {
  const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.z));
  return {
    z,
    x: Math.min(0, Math.max(w - w * z, v.x)),
    y: Math.min(0, Math.max(h - h * z, v.y)),
  };
}

/** Zoom to `z`, keeping the map point under (px, py) where it is. */
function zoomAt(v: View, z: number, px: number, py: number, w: number, h: number): View {
  const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  const mx = (px - v.x) / v.z;
  const my = (py - v.y) / v.z;
  return clamp({ z: nz, x: px - mx * nz, y: py - my * nz }, w, h);
}

/**
 * The addon's Map tab: the dungeon's map art with boss portraits, the
 * entrance swirl and the ladders between levels. Clicking a boss opens it in
 * the Bosses tab; clicking a ladder or a "Level" button switches level.
 */
/** A quest target's quest, as the page shows it: null hides the pin (not a quest in the list). */
export type QuestPinInfo = { id: number; title: string; done: boolean } | null;

export default function MapPane({
  map,
  onBoss,
  questFor,
  onQuest,
}: {
  map: DungeonMap;
  onBoss: (bossIndex: number) => void;
  /** Which of a quest target's quests the list shows, if any. */
  questFor?: (ids: number[]) => QuestPinInfo;
  onQuest?: (id: number) => void;
}) {
  const t = useT();
  const [floor, setFloor] = useState(map.startFloor);
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [view, setView] = useState<View>(HOME);
  const [dragging, setDragging] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  // The wheel and drag handlers read the latest view without re-binding.
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  const drag = useRef<{ id: number; sx: number; sy: number; vx: number; vy: number } | null>(null);

  const stageOf = (el: EventTarget | null) => (el as Element | null)?.closest?.(".wm-stage") as HTMLElement | null;

  // The wheel needs a listener that may cancel the page scroll (React's is passive).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const stage = stageOf(e.target);
      if (!stage) return;
      const v = viewRef.current;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      // Fully zoomed out and scrolling down: let the page scroll on.
      if (dy > 0 && v.z <= MIN_ZOOM) return;
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      const z = v.z * Math.exp(-dy * 0.0015);
      const next = zoomAt(v, z, e.clientX - r.left, e.clientY - r.top, r.width, r.height);
      viewRef.current = next; // a fast wheel fires again before the next render
      setView(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // A new level opens whole.
  const pickFloor = useCallback((f: number) => {
    setFloor(f);
    setView(HOME);
  }, []);

  const zoomBy = (factor: number) => {
    const stage = root.current?.querySelector<HTMLElement>(".wm-stage:not([hidden])");
    if (!stage) return;
    const { width: w, height: h } = stage.getBoundingClientRect();
    setView((v) => zoomAt(v, v.z * factor, w / 2, h / 2, w, h));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || viewRef.current.z <= MIN_ZOOM) return;
    if ((e.target as Element).closest("button")) return; // bosses and ladders stay clickable
    const v = viewRef.current;
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, vx: v.x, vy: v.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const { width: w, height: h } = e.currentTarget.getBoundingClientRect();
    const v = viewRef.current;
    const next = clamp({ z: v.z, x: d.vx + e.clientX - d.sx, y: d.vy + e.clientY - d.sy }, w, h);
    viewRef.current = next;
    setView(next);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
  };

  const zoomed = view.z > MIN_ZOOM + 0.001;

  return (
    <div className="wm" ref={root}>
      {map.floors.length > 1 && (
        <div className="wm-floors">
          {map.floorLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              data-floor={i + 1}
              className={`wf-btn wf-btn-sm ${floor === i + 1 ? "wf-tab-active" : "wf-btn-red"}`}
              aria-pressed={floor === i + 1}
              onClick={() => pickFloor(i + 1)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {map.floors.map((src, i) => {
        const f = i + 1;
        const live = floor === f;
        return (
          <div
            key={src}
            className={`wm-stage ${zoomed ? "wm-zoomed" : ""} ${dragging ? "wm-dragging" : ""}`}
            data-floor-pane={f}
            hidden={!live}
            style={{ "--pin": scale } as React.CSSProperties}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={(e) => {
              if (!(e.target as Element).closest("button")) setView(HOME);
            }}
          >
            <div
              className="wm-layer"
              style={
                {
                  transform: live ? `translate(${view.x}px, ${view.y}px) scale(${view.z})` : undefined,
                  "--unzoom": live ? 1 / view.z : 1,
                } as React.CSSProperties
              }
            >
              <img className="wm-art" src={src} alt={map.floorLabels[i]} width={1002} height={668} loading={f === map.startFloor ? "eager" : "lazy"} draggable={false} />

              {map.entrances.filter((e) => e.floor === f).map((e) => (
                <span key={`e${e.x}-${e.y}`} className={`wm-ent wm-ent-${e.side}`} style={{ left: `${e.x * 100}%`, top: `${e.y * 100}%` }}>
                  <img src="/journal/ui/map-entrance.png" alt="" width={64} height={64} draggable={false} />
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
                  onClick={() => t.to && pickFloor(t.to)}
                >
                  <img src="/journal/ui/map-ladder.png" alt="" width={128} height={128} draggable={false} />
                  {t.label && <span className="wm-ladder-label">{t.label}</span>}
                </button>
              ))}

              {scale > 0 &&
                map.bosses.filter((b) => b.floor === f).map((b) => {
                  // A quest's target: shown only for a quest in the list, as the addon does.
                  const quest = b.quests ? (questFor ? questFor(b.quests) : null) : undefined;
                  if (quest === null) return null;
                  return (
                    <button
                      key={`b${b.name}`}
                      type="button"
                      className={`wm-boss ${quest ? "wm-questmob" : ""}`}
                      data-tip={b.name}
                      {...(quest ? { "data-tip2": `${quest.title}\n${t.or("MAP_QUEST_TARGET", "Quest target")}` } : {})}
                      aria-label={quest ? `${b.name}: ${quest.title}` : b.name}
                      style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%` }}
                      onClick={() => {
                        if (quest) onQuest?.(quest.id);
                        else if (b.bossIndex !== undefined) onBoss(b.bossIndex);
                      }}
                    >
                      <PortraitFace name={b.name} displayId={b.displayId} crop={b.portraitCrop} custom={b.customPortrait} />
                      <img className="wm-ring" src="/journal/ui/map-ring.png" alt="" width={128} height={128} draggable={false} />
                      {quest && (
                        <img
                          className={`wm-qbadge ${quest.done ? "done" : ""}`}
                          src="/journal/ui/quest-available.png"
                          alt=""
                          width={24}
                          height={24}
                          draggable={false}
                        />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        );
      })}

      <div className="wm-size">
        <span>{t("s_boss_icons")}</span>
        <span className="wm-size-row">
          <button type="button" aria-label="Smaller boss icons" disabled={scale <= 0} onClick={() => setScale((s) => Math.max(0, Math.round((s - STEP) * 10) / 10))}>−</button>
          <span>{Math.round(scale * 100)}%</span>
          <button type="button" aria-label="Bigger boss icons" disabled={scale >= 1} onClick={() => setScale((s) => Math.min(1, Math.round((s + STEP) * 10) / 10))}>+</button>
        </span>
        <span>{t("s_zoom")}</span>
        <span className="wm-size-row">
          <button type="button" aria-label={t("s_zoom_out")} disabled={!zoomed} onClick={() => zoomBy(1 / BUTTON_STEP)}>−</button>
          <button type="button" className="wm-zoom-pct" aria-label={t("s_zoom_reset")} title={t("s_zoom_reset")} disabled={!zoomed} onClick={() => setView(HOME)}>
            {Math.round(view.z * 100)}%
          </button>
          <button type="button" aria-label={t("s_zoom_in")} disabled={view.z >= MAX_ZOOM} onClick={() => zoomBy(BUTTON_STEP)}>+</button>
        </span>
      </div>
    </div>
  );
}
