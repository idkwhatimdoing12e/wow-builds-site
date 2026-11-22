"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { questIsFor } from "@/app/lib/journal-shared";
import type { Dungeon } from "@/app/lib/journal";
import QuestPanel, { PrereqPanel, QuestTick } from "./QuestPanel";
import { BossPanel, TrashPanel } from "./BossPanel";
import { BossPortrait } from "./BossPortrait";
import MapPane from "./MapPane";
import { setFaction, useFaction } from "./useFaction";
import { useHref, useT } from "@/app/components/i18n/I18n";

type Tab = "map" | "quests" | "bosses";

/**
 * The dungeon window inside an opened card on the character page: the same
 * tabs, with the character's own quests (the addon's list for it) and the ones
 * it handed in framed in green and ticked. No breadcrumb or pager, and the
 * address's fragment (the character code there) is left alone.
 */
export interface CharacterView {
  /** The character's quests here, in the addon's order. */
  quests: { id: number; done: boolean }[];
  faction: "Alliance" | "Horde" | "Unknown";
  /** RPG Mode: bosses not found yet ("???", no portrait or loot) and quests not found yet (hidden). */
  lockedBosses?: Set<string>;
  lockedQuests?: Set<number>;
}

/** RPG Mode's stand-in for a boss not found yet, as the addon draws it. */
function hiddenBoss(b: Dungeon["bosses"][number], hint: string): Dungeon["bosses"][number] {
  return { name: "???", rare: false, loot: [], recipes: [], shared: [], description: hint, rpgHidden: true, npcID: b.npcID };
}

export default function DungeonView({
  d,
  prev = null,
  next = null,
  character,
  intro,
}: {
  d: Dungeon;
  prev?: { name: string; slug: string } | null;
  next?: { name: string; slug: string } | null;
  character?: CharacterView;
  /** The dungeon page's written overview, shown under the name and level. */
  intro?: React.ReactNode;
}) {
  const t = useT();
  const h = useHref();
  const factionName = (f: "Alliance" | "Horde") => t(f === "Horde" ? "s_horde" : "s_alliance");
  const hasQuests = character ? character.quests.length > 0 : d.quests.length > 0;
  const [tab, setTab] = useState<Tab>(hasQuests ? "quests" : "bosses");
  // Like the addon, the quest list always shows one faction: the one picked on
  // the home page (or here), remembered between visits; a character's, its own.
  const picked = useFaction();
  const faction = character && character.faction !== "Unknown" ? character.faction : picked;
  const done = new Set(character ? character.quests.filter((q) => q.done).map((q) => q.id) : []);
  const [questId, setQuestId] = useState<number | null>(null);
  // A selected step of a quest's prerequisite chain (the addon's selectedPrereqStep).
  const [step, setStep] = useState<{ parent: number; index: number } | null>(null);
  // Quests whose chain is unfolded under their row (the addon's expandedQuestChains).
  const [expanded, setExpanded] = useState<number[]>([]);
  const [bossIdx, setBossIdx] = useState(0); // index into bosses; bosses.length = trash
  const detailRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);

  // Where the reader is (tab, boss, quest) lives in the address on a dungeon
  // page (#map, #bosses, #boss-<n>, #trash, #quests, #quest-<id>), and in this
  // tab's session storage inside a character card (the address there is the
  // character code). So Back from an item page returns to the same boss or
  // quest, not the default tab. Item pages link to #boss-<n> and #trash too.
  const viewKey = `dj.view.${d.slug}`;
  const restored = useRef(false);
  useEffect(() => {
    const apply = (initial: boolean) => {
      let h = "";
      if (character) {
        try {
          h = window.sessionStorage.getItem(viewKey) ?? "";
        } catch {
          h = "";
        }
      } else {
        h = window.location.hash.replace("#", "");
      }
      let detail: "quests" | "bosses" | null = null;
      if (h === "bosses") setTab("bosses");
      if (h === "quests") setTab("quests");
      if (h.startsWith("boss-")) {
        const i = parseInt(h.slice(5), 10);
        if (i >= 0 && i < d.bosses.length) {
          setTab("bosses");
          setBossIdx(i);
          detail = "bosses";
        }
      }
      if (h === "trash" && d.trash.length > 0) {
        setTab("bosses");
        setBossIdx(d.bosses.length);
        detail = "bosses";
      }
      if (h === "map" && d.map) setTab("map");
      if (h.startsWith("quest-")) {
        const id = parseInt(h.slice(6), 10);
        const target = d.quests.find((q) => q.id === id) ?? d.hiddenQuests.find((q) => q.id === id);
        if (target) {
          setTab("quests");
          setQuestId(id);
          setStep(null);
          if (!character && target.faction !== "Both") setFaction(target.faction);
          detail = "quests";
        }
      }
      restored.current = true;
      // Back: bring the boss or quest back into view. On a phone it sits under
      // the list; in a character card the page was rebuilt from the code, so the
      // browser's own scroll position is gone.
      const phone = !window.matchMedia("(min-width: 860px)").matches;
      if (initial && detail && (phone || character)) {
        const pane = detail;
        requestAnimationFrame(() => {
          const target = phone ? root.current?.querySelector(`[data-pane="${pane}"] .wf-pane-detail`) : root.current;
          target?.scrollIntoView({ block: "start" });
        });
      }
    };
    const raf = requestAnimationFrame(() => apply(true));
    const onHash = () => apply(false);
    if (!character) window.addEventListener("hashchange", onHash);
    return () => {
      cancelAnimationFrame(raf);
      if (!character) window.removeEventListener("hashchange", onHash);
    };
  }, [d.quests, d.hiddenQuests, d.map, d.bosses.length, d.trash.length, character, viewKey]);

  // Keep it there as the reader moves (replacing the entry: no extra Back steps).
  useEffect(() => {
    if (!restored.current) return;
    const h =
      tab === "map"
        ? "map"
        : tab === "bosses"
          ? bossIdx < d.bosses.length
            ? `boss-${bossIdx}`
            : "trash"
          : questId !== null
            ? `quest-${questId}`
            : "quests";
    if (character) {
      try {
        window.sessionStorage.setItem(viewKey, h);
      } catch {
        // storage blocked: Back just shows the default tab
      }
    } else if (window.location.hash !== `#${h}`) {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#${h}`);
    }
  }, [tab, bossIdx, questId, d.bosses.length, character, viewKey]);

  // On a phone the detail sits under the list: bring it into view after a pick.
  const revealDetail = (pane: "quests" | "bosses") => {
    requestAnimationFrame(() => {
      if (!window.matchMedia("(min-width: 860px)").matches) {
        document.querySelector(`[data-pane="${pane}"] .wf-pane-detail`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  // Like the addon's SelectQuest / SelectQuestByID: show the quest on the right,
  // never leave the page. Hidden quests (reached through "Starts with" / "Leads to")
  // can be shown too.
  const selectQuest = (id: number) => {
    const target = d.quests.find((q) => q.id === id) ?? d.hiddenQuests.find((q) => q.id === id);
    if (!target) return;
    if (!character && target.faction !== "Both" && target.faction !== faction) setFaction(target.faction);
    setQuestId(id);
    setStep(null);
    revealDetail("quests");
  };
  const selectStep = (parent: number, index: number) => {
    setQuestId(parent);
    setStep({ parent, index });
    revealDetail("quests");
  };
  const toggleChain = (id: number) =>
    setExpanded((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  // "Show Quest Chain": open the chain under the quest and show its first step.
  const showChain = (id: number) => {
    setExpanded((list) => (list.includes(id) ? list : [...list, id]));
    selectStep(id, 0);
  };
  const inDungeon = new Set([...d.quests, ...d.hiddenQuests].map((q) => q.id));

  // A boss portrait on the map opens that boss in the Bosses tab, like the addon.
  const openBoss = (i: number) => {
    setTab("bosses");
    setBossIdx(i);
    requestAnimationFrame(() => {
      if (!window.matchMedia("(min-width: 860px)").matches) {
        document.querySelector('[data-pane="bosses"] .wf-pane-detail')?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  const byId = new Map([...d.quests, ...d.hiddenQuests].map((q) => [q.id, q]));
  const quests = character
    ? character.quests
        .filter((c) => !character.lockedQuests?.has(c.id)) // RPG Mode: not found yet
        .map((c) => byId.get(c.id))
        .filter((q): q is NonNullable<typeof q> => !!q)
    : d.quests.filter((q) => questIsFor(q.faction, faction));
  const selectedQuest =
    quests.find((q) => q.id === questId) ?? d.hiddenQuests.find((q) => q.id === questId) ?? quests[0];
  const stepParent = step ? d.quests.find((q) => q.id === step.parent) : undefined;
  const selectedStep = step && stepParent ? stepParent.chain[step.index] : undefined;
  // RPG Mode: a boss not found yet is "???", with how to reveal it.
  const locked = character?.lockedBosses;
  const hint = t.or("RPG_BOSS_HIDDEN", "Defeat this boss to reveal it.");
  const bossItems = locked?.size ? d.bosses.map((b) => (locked.has(b.name) ? hiddenBoss(b, hint) : b)) : d.bosses;
  const map =
    d.map && locked?.size
      ? {
          ...d.map,
          bosses: d.map.bosses.map((p) =>
            p.bossIndex !== undefined && locked.has(d.bosses[p.bossIndex]?.name)
              ? { ...p, name: "???", displayId: undefined, portraitCrop: undefined, customPortrait: undefined }
              : p,
          ),
        }
      : d.map;
  const showTrash = d.trash.length > 0;

  const pickBoss = (i: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setBossIdx(i);
    revealDetail("bosses");
  };
  const onKey = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div ref={root} className="wf-dview">
      {!character && (
        <div className="wf-crumb">
          {/* The addon's arrows either side of "Dungeons": the previous and next dungeon. */}
          {prev ? (
            <Link href={h(`/dungeon/${prev.slug}`)} className="wp-page wp-page-prev wf-crumb-arrow" aria-label={prev.name} title={prev.name} />
          ) : (
            <span className="wp-page wp-page-prev wf-crumb-arrow is-off" aria-hidden="true" />
          )}
          <Link href={h("/")} className="wf-btn wf-btn-red wf-btn-sm">{t("DUNGEONS")}</Link>
          {next ? (
            <Link href={h(`/dungeon/${next.slug}`)} className="wp-page wp-page-next wf-crumb-arrow" aria-label={next.name} title={next.name} />
          ) : (
            <span className="wp-page wp-page-next wf-crumb-arrow is-off" aria-hidden="true" />
          )}
        </div>
      )}

      <div className="wf-dheader">
        <div>
          <h1 className="wf-dname">{d.name}</h1>
          <div className="wf-dlevel">LV {d.level}</div>
        </div>
        {!d.previewOnly && (
          <div className="wf-dtabs">
            {d.map && (
              <button type="button" data-tab="map" className={`wf-btn wf-tab ${tab === "map" ? "wf-tab-active" : "wf-btn-red"}`} onClick={() => setTab("map")}>
                <img className="wf-tab-ico wf-tab-ico-map" src="/journal/ui/map-tab.png" alt="" width={22} height={22} /> {t("MAP")}
              </button>
            )}
            <button type="button" data-tab="bosses" className={`wf-btn wf-tab ${tab === "bosses" ? "wf-tab-active" : "wf-btn-red"}`} onClick={() => setTab("bosses")}>
              <img className="wf-tab-ico" src="/journal/ui/skull.png" alt="" width={24} height={24} /> {t("BOSSES")}
            </button>
            <button type="button" data-tab="quests" className={`wf-btn wf-tab ${tab === "quests" ? "wf-tab-active" : "wf-btn-red"}`} onClick={() => setTab("quests")}>
              <img className="wf-tab-ico wf-tab-ico-q" src="/journal/ui/quest-available.png" alt="" width={24} height={24} /> {t("QUESTS")}
            </button>
          </div>
        )}
      </div>
      {intro}

      {d.previewOnly ? (
        <div className="wf-pane wf-pane-single">
          <p className="wf-ptext">{d.description}</p>
          <p className="wf-note">{t("s_preview")}</p>
        </div>
      ) : (
        <>
        {d.map && (
          <div className="wf-panes wf-panes-one" data-pane="map" hidden={tab !== "map"}>
            <div className="wf-pane wm-pane">
              <MapPane
                map={map ?? d.map}
                onBoss={openBoss}
                questFor={(ids) => {
                  const q = quests.find((x) => ids.includes(x.id));
                  return q ? { id: q.id, title: q.name, done: done.has(q.id) } : null;
                }}
                onQuest={(id) => {
                  setTab("quests");
                  selectQuest(id);
                }}
              />
            </div>
          </div>
        )}
        <div className="wf-panes" data-pane="quests" hidden={tab !== "quests"}>
          <div className="wf-pane wf-pane-list wq-list">
            <div className="wf-pane-head">
              <span>{t("QUESTS")} <span className="wf-sep">|</span> {quests.length}</span>
              {character ? (
                // the character's list: its faction lit, nothing to switch
                <span className="wf-faction-toggle" aria-label={factionName(faction)}>
                  {(["Alliance", "Horde"] as const).map((f) => (
                    <span key={f} className={`ch-q-crest ${faction === f ? "on" : ""}`}>
                      <img src={f === "Horde" ? "/journal/horde.png" : "/journal/alliance.png"} alt="" width={24} height={24} />
                    </span>
                  ))}
                </span>
              ) : (
              <span className="wf-faction-toggle">
                {(["Alliance", "Horde"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={faction === f ? "on" : ""}
                    aria-pressed={faction === f}
                    title={t("s_count_for", factionName(f))}
                    onClick={() => { setFaction(f); setQuestId(null); setStep(null); }}
                  >
                    <img src={f === "Horde" ? "/journal/horde.png" : "/journal/alliance.png"} alt={factionName(f)} width={24} height={24} />
                  </button>
                ))}
              </span>
              )}
            </div>
            <ul className="wf-rows">
              {quests.map((q) => {
                const open = q.chain.length > 0 && expanded.includes(q.id);
                return (
                  <li key={q.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      className={`wf-row ${done.has(q.id) ? "wq-done" : ""} ${!step && selectedQuest?.id === q.id ? "wf-row-selected" : ""} ${step?.parent === q.id ? "wf-row-parent" : ""}`}
                      onClick={() => selectQuest(q.id)}
                      onKeyDown={onKey(() => selectQuest(q.id))}
                    >
                      <img className="wf-q-ico" src="/journal/ui/quest-available.png" alt="" width={26} height={26} />
                      <span className="wf-row-text">
                        <span className="wf-row-name">{q.name}</span>
                        <span className="wf-row-sub">
                          {t("AVAILABLE_FROM_LEVEL", q.requires)}
                          {q.chain.length > 0 && (
                            <button
                              type="button"
                              className={`wf-chain-toggle ${open ? "on" : ""}`}
                              aria-expanded={open}
                              aria-label={`${t("REQUIRED_QUESTS")}: ${t("SHOW_WHOLE_CHAIN")}`}
                              data-tip={t("REQUIRED_QUESTS")}
                              data-tip2={t("SHOW_WHOLE_CHAIN")}
                              onClick={(e) => { e.stopPropagation(); toggleChain(q.id); }}
                              onKeyDown={(e) => e.stopPropagation()}
                            >
                              <img src="/journal/questchain.png" alt="" width={16} height={16} />
                            </button>
                          )}
                          {q.classOnly && <span className="wf-class"> · {q.classOnly.map((c) => t.or(`CLASS_${c}`, c.charAt(0) + c.slice(1).toLowerCase())).join(" / ")}</span>}
                        </span>
                      </span>
                      {/* As the addon's list (2.1.1): no faction crests, the list is
                          one faction's; the round ! of a quest still to pick up. */}
                      {done.has(q.id) ? (
                        <QuestTick className="wq-row-tick" label={t.or("s_done", "Done")} />
                      ) : (
                        <img className="wf-q-ring" src="/journal/ui/pickup-mark.webp" alt="" width={34} height={34} />
                      )}
                    </div>
                    {open && (
                      <div className="wf-chainpanel">
                        {q.chain.map((s, i) => (
                          <button
                            key={`${s.id}-${i}`}
                            type="button"
                            className={`wf-chainstep ${step?.parent === q.id && step.index === i ? "on" : ""}`}
                            onClick={() => selectStep(q.id, i)}
                          >
                            {i + 1}. {s.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="wf-pane wf-pane-detail" ref={detailRef}>
            {selectedStep && stepParent && step ? (
              <PrereqPanel
                s={selectedStep}
                index={step.index}
                total={stepParent.chain.length}
                onStep={(i) => selectStep(stepParent.id, i)}
              />
            ) : selectedQuest ? (
              <QuestPanel
                q={selectedQuest}
                done={done.has(selectedQuest.id)}
                onSelectQuest={selectQuest}
                canSelect={(id) => inDungeon.has(id)}
                onShowChain={() => showChain(selectedQuest.id)}
              />
            ) : (
              <p className="wf-note">{t("NO_FACTION_QUESTS", factionName(faction))}</p>
            )}
          </div>
        </div>
        <div className="wf-panes" data-pane="bosses" hidden={tab !== "bosses"}>
          <div className="wf-pane wf-pane-list">
            <div className="wf-pane-head"><span>{t("BOSSES")}</span></div>
            <ul className="wf-rows">
              {bossItems.map((b, i) => (
                <li key={b.name}>
                  <a href={`#boss-${i}`} className={`wf-row ${bossIdx === i ? "wf-row-selected" : ""}`} onClick={pickBoss(i)}>
                    <BossPortrait name={b.name} displayId={b.displayId} crop={b.portraitCrop} custom={b.customPortrait} level={b.level} />
                    <span className="wf-row-text">
                      <span className="wf-row-name">{b.name}</span>
                      {(b.rare || b.factionOnly) && (
                        <span className="wf-row-sub">{b.rare ? t("s_rare") : ""}{b.rare && b.factionOnly ? " · " : ""}{b.factionOnly ? t("s_only", factionName(b.factionOnly)) : ""}</span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
              {showTrash && (
                <li>
                  <a href="#trash" className={`wf-row ${bossIdx === bossItems.length ? "wf-row-selected" : ""}`} onClick={pickBoss(bossItems.length)}>
                    <span className="wf-portrait wf-portrait-trash" aria-hidden>
                      <img src="/journal/lootbags.png" alt="" width={34} height={34} />
                    </span>
                    <span className="wf-row-text"><span className="wf-row-name">{t("s_trash")}</span></span>
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div className="wf-pane wf-pane-detail">
            {bossIdx < bossItems.length ? <BossPanel boss={bossItems[bossIdx]} /> : <TrashPanel trash={d.trash} />}
          </div>
        </div>
        </>
      )}

      {d.fullItemsTBD && !d.previewOnly && (
        <p className="wf-tbd">{t("s_items_tbd")}</p>
      )}

      {!character && (
        <div className="wf-pager">
          {prev ? <Link href={h(`/dungeon/${prev.slug}`)} className="wf-btn wf-btn-dark wf-btn-sm">← {prev.name}</Link> : <span />}
          {next ? <Link href={h(`/dungeon/${next.slug}`)} className="wf-btn wf-btn-dark wf-btn-sm">{next.name} →</Link> : <span />}
        </div>
      )}
    </div>
  );
}
