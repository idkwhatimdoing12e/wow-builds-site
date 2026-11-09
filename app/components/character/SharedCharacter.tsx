"use client";
import { useState } from "react";
import Link from "next/link";
import type { PublicSnapshot } from "@/app/lib/character-snapshot";
import { CLASS_COLORS, CLASS_NAMES, raceName } from "@/app/lib/character";
import { PortraitFace } from "../journal/BossPortrait";
export type CharacterArt = Record<
  string,
  {
    card: string | null;
    bosses: Record<
      string,
      { displayId?: number; crop?: [number, number, number]; custom?: string }
    >;
  }
>;
export type ItemArt = Record<number, { icon: string; url: string }>;
const duration = (n?: number) =>
  n === undefined
    ? "—"
    : `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
const date = (n: number) =>
  new Date(n * 1000).toISOString().slice(0, 16).replace("T", " ") + " UTC";
function Gold({ value }: { value: number }) {
  const g = Math.floor(value / 10000),
    s = Math.floor((value % 10000) / 100),
    c = Math.floor(value % 100);
  return (
    <span className="sc-gold">
      {g > 0 ? (
        <>
          {g}
          <img src="/journal/ui/coin-gold.png" alt="gold" /> {s}
          <img src="/journal/ui/coin-silver.png" alt="silver" />
        </>
      ) : s > 0 ? (
        <>
          {s}
          <img src="/journal/ui/coin-silver.png" alt="silver" /> {c}
          <img src="/journal/ui/coin-copper.png" alt="copper" />
        </>
      ) : (
        <>
          {c}
          <img src="/journal/ui/coin-copper.png" alt="copper" />
        </>
      )}
    </span>
  );
}
export default function SharedCharacter({
  snapshot: s,
  art,
  items,
}: {
  snapshot: PublicSnapshot;
  art: CharacterArt;
  items: ItemArt;
}) {
  const [tab, setTab] = useState<"progress" | "logs">("progress");
  const [selected, setSelected] = useState(0);
  const [copy, setCopy] = useState("Copy link");
  const r = s.runs[selected];
  const cleared = s.dungeons.filter((d) => d.cleared).length;
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        window.location.origin + window.location.pathname,
      );
      setCopy("Link copied");
    } catch {
      setCopy("Copy the address bar");
    }
  }
  return (
    <div className="sc">
      <header className="sc-header">
        <div>
          <p className="sc-eyebrow">DUNGEON JOURNAL · CHARACTER SNAPSHOT</p>
          <h1 style={{ color: CLASS_COLORS[s.classToken] }}>
            {s.name}
            <span>{s.realm}</span>
          </h1>
          <p>
            Level {s.level} {raceName(s.raceToken)}{" "}
            {CLASS_NAMES[s.classToken] ?? s.classToken} · {s.faction}
          </p>
          <p className="sc-muted">
            Exported {date(s.exportedAt)} · Addon {s.version}
          </p>
        </div>
        <div className="sc-header-actions">
          <button className="wf-btn wf-btn-red" onClick={copyLink}>
            {copy}
          </button>
          <Link className="wf-btn" href="/character">
            Import a new export
          </Link>
        </div>
      </header>
      <div className="sc-summary">
        <span>
          <strong>{cleared}</strong> dungeons cleared
        </span>
        <span>
          <strong>
            {s.dungeons.reduce((n, d) => n + d.done, 0)} /{" "}
            {s.dungeons.reduce((n, d) => n + d.total, 0)}
          </strong>{" "}
          dungeon quests
        </span>
        <span>
          RPG Mode <strong>{s.rpg ? "ON" : "OFF"}</strong>
        </span>
        <span>
          <strong>{s.runs.length}</strong> saved runs
        </span>
      </div>
      <nav className="sc-tabs" aria-label="Character views">
        <button
          aria-pressed={tab === "progress"}
          onClick={() => setTab("progress")}
        >
          Dungeon progress
        </button>
        <button aria-pressed={tab === "logs"} onClick={() => setTab("logs")}>
          Character Logs
        </button>
      </nav>
      {tab === "progress" ? (
        <div className="sc-dungeons">
          {s.dungeons.map((d) => (
            <details key={d.slug} className="sc-dungeon">
              <summary
                style={{
                  backgroundImage: art[d.name]?.card
                    ? `linear-gradient(90deg,rgba(8,6,4,.75),rgba(8,6,4,.25)),url("${art[d.name].card}")`
                    : undefined,
                }}
              >
                <span className="sc-dungeon-name">
                  {d.done === d.total && d.total > 0 && (
                    <b className="sc-done">✓ </b>
                  )}
                  {d.label}
                </span>
                <span>
                  {d.locked
                    ? "🔒 Locked"
                    : d.cleared
                      ? "✓ Cleared"
                      : "Unlocked"}{" "}
                  · LV {d.level}
                </span>
                <span>
                  {d.done} / {d.total} quests
                  {d.previewOnly ? " · Coming soon" : ""}
                </span>
              </summary>
              <div className="sc-quest-list">
                {d.quests.map((q) => (
                  <div
                    key={q.id}
                    className={q.lost ? "sc-muted" : q.done ? "sc-done" : ""}
                  >
                    <span>
                      {q.locked ? "🔒" : q.done ? "✓" : q.inLog ? "!" : "○"}{" "}
                      {q.name}
                    </span>
                    <small>
                      {q.lost
                        ? "Lost"
                        : q.done
                          ? "Completed"
                          : q.inLog
                            ? "In quest log"
                            : q.locked
                              ? "Locked"
                              : "Not completed"}
                    </small>
                  </div>
                ))}
                <h3>Boss discoveries</h3>
                {d.bosses.map((b, i) => (
                  <div key={i}>
                    <span>
                      {b.locked ? "🔒" : "✓"} {b.label}
                      {b.rare ? " · Rare" : ""}
                    </span>
                    <small>{b.locked ? "Locked" : "Unlocked"}</small>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="sc-logs">
          <aside aria-label="Saved runs">
            {s.runs.length === 0 && <p>No runs yet.</p>}
            {s.runs.map((run, i) => (
              <button
                key={i}
                aria-pressed={i === selected}
                onClick={() => setSelected(i)}
              >
                <strong>
                  {s.dungeons.find((d) => d.name === run.dungeon)?.label ??
                    run.dungeon}
                </strong>
                <small>{date(run.created)}</small>
                <span className={run.completed ? "sc-done" : ""}>
                  {duration(run.duration)} ·{" "}
                  {run.completed
                    ? "Completed"
                    : run.closed
                      ? "Not finished"
                      : "In progress"}
                </span>
              </button>
            ))}
          </aside>
          {r ? (
            <article
              className="sc-run"
              style={{
                backgroundImage: art[r.dungeon]?.card
                  ? `linear-gradient(rgba(12,10,8,.89),rgba(12,10,8,.96)),url("${art[r.dungeon].card}")`
                  : undefined,
              }}
            >
              <h2>
                {s.dungeons.find((d) => d.name === r.dungeon)?.label ??
                  r.dungeon}
              </h2>
              <p className="sc-muted">
                {date(r.created)} ·{" "}
                {r.completed
                  ? "Completed"
                  : r.closed
                    ? "Not finished"
                    : "In progress at export"}
              </p>
              <div className="sc-stats">
                <div>
                  <small>Time</small>
                  <strong className={r.completed ? "sc-done" : ""}>
                    {duration(r.duration)}
                  </strong>
                </div>
                <div>
                  <small>{r.capped ? "Gold" : "Mobs XP"}</small>
                  <strong>
                    {r.capped ? (
                      <Gold value={r.money} />
                    ) : (
                      r.xp.toLocaleString("en-US")
                    )}
                  </strong>
                </div>
                <div>
                  <small>Deaths</small>
                  <strong>{r.deaths}</strong>
                </div>
                <div>
                  <small>Trash killed</small>
                  <strong>
                    {r.trashTotal > 0
                      ? `${Math.min(100, Math.round((r.trashKilled / r.trashTotal) * 100))}%`
                      : "—"}
                  </strong>
                  <small>
                    {r.trashKilled} of {r.trashTotal}
                  </small>
                </div>
              </div>
              <p className="sc-muted">
                {r.capped ? `Mobs XP: ${r.xp.toLocaleString("en-US")} · ` : ""}
                Money earned: <Gold value={r.money} />
              </p>
              {r.deathTimes.length > 0 && (
                <p className="sc-muted">
                  Died at{" "}
                  {r.deathTimes
                    .map(
                      (t) =>
                        "+" + duration(Math.max(0, t - (r.start ?? r.created))),
                    )
                    .join(", ")}
                </p>
              )}
              <h3>Bosses</h3>
              {[
                ...r.bosses.filter((b) => !b.rare),
                ...r.bosses.filter((b) => b.rare),
              ].map((b, i) => (
                <div
                  className={`sc-boss ${b.state === "not found" ? "sc-unseen" : ""}`}
                  key={i}
                >
                  <span
                    className={`sc-portrait ${b.state === "killed" ? "sc-killed" : ""} ${b.rare ? "sc-rare" : ""}`}
                  >
                    <PortraitFace
                      name={b.name}
                      {...art[r.dungeon]?.bosses[b.name]}
                    />
                    {b.state === "killed" && <b aria-label="Killed">✕</b>}
                  </span>
                  <span>
                    {b.label}
                    {b.rare && <small className="sc-rare-label">Rare</small>}
                  </span>
                  <span>
                    {b.at !== undefined
                      ? "+" +
                        duration(Math.max(0, b.at - (r.start ?? r.created)))
                      : b.state}
                  </span>
                  <span>{b.xp !== undefined ? `${b.xp} XP` : ""}</span>
                </div>
              ))}
              <h3>Trash</h3>
              {r.trash.length === 0 ? (
                <p className="sc-muted">No trash killed.</p>
              ) : (
                r.trash.map((t, i) => (
                  <div className="sc-line" key={i}>
                    <span>{t.name}</span>
                    <span>×{t.count}</span>
                    <span>{t.xp > 0 ? `${t.xp} XP` : "—"}</span>
                  </div>
                ))
              )}
              <h3>Need rolls</h3>
              {r.needs.length === 0 ? (
                <p className="sc-muted">
                  You didn&apos;t &quot;Need&quot; on anything this run.
                </p>
              ) : (
                <div className="sc-items">
                  {r.needs.map((n, i) => (
                    <a
                      key={i}
                      className="sc-item"
                      href={
                        items[n.id]?.url ??
                        `https://www.wowhead.com/forever/item=${n.id}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={
                          items[n.id]?.icon ??
                          "/journal/icons/inv_misc_questionmark.webp"
                        }
                        alt=""
                      />
                      <span
                        style={{
                          color: [
                            "#9d9d9d",
                            "#fff",
                            "#1eff00",
                            "#0070dd",
                            "#a335ee",
                            "#ff8000",
                          ][n.quality ?? 1],
                        }}
                      >
                        {n.name ?? `Item ${n.id}`}
                        <small
                          className={
                            n.result === "won"
                              ? "sc-done"
                              : n.result === "lost"
                                ? "sc-lost"
                                : ""
                          }
                        >
                          {n.result === "rolling"
                            ? "Rolling…"
                            : n.result === "won"
                              ? "Won"
                              : "Lost"}{" "}
                          <span aria-label="Need roll">⚄ {n.roll ?? ""}</span>
                        </small>
                      </span>
                    </a>
                  ))}
                </div>
              )}
              {r.exits.length > 0 && (
                <>
                  <h3>Time outside</h3>
                  {r.exits.map((e, i) => (
                    <div className="sc-exit" key={i}>
                      {e.why === "released" && (
                        <span className="sc-portrait">
                          <PortraitFace name="Spirit Healer" displayId={5233} />
                        </span>
                      )}
                      <span>
                        {e.why === "released" ? "Death Walk" : "Stepped out"}
                        {e.open ? " · still outside at export" : ""}
                      </span>
                      <span>
                        {e.at < (r.start ?? r.created) ? "-" : "+"}
                        {duration(Math.abs(e.at - (r.start ?? r.created)))}
                      </span>
                      <strong>{duration(e.duration)}</strong>
                    </div>
                  ))}
                </>
              )}
            </article>
          ) : (
            <article className="sc-run">
              <h2>Character Logs</h2>
              <p>No saved runs in this export.</p>
            </article>
          )}
        </div>
      )}
      <p className="sc-foot">
        A snapshot from the addon, frozen at export. Import a newer code to
        update this same link.
      </p>
    </div>
  );
}
