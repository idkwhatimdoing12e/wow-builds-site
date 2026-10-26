"use client";

import { useSyncExternalStore } from "react";
import type { Faction } from "@/app/lib/journal";

// The faction picked on the home page (the crests in the toolbar) or in a
// dungeon's quest list. The addon uses the character's faction; the site
// remembers the visitor's last pick and shares it between pages.
const KEY = "dj-faction";
const EVENT = "dj-faction-change";
let memory: Faction = "Alliance"; // used when browser storage is unavailable

function read(): Faction {
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "Alliance" || v === "Horde") return v;
  } catch {
    /* private mode or blocked storage: fall back to memory */
  }
  return memory;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function setFaction(f: Faction) {
  memory = f;
  try {
    window.localStorage.setItem(KEY, f);
  } catch {
    /* keep the in-memory choice */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useFaction(): Faction {
  return useSyncExternalStore(subscribe, read, () => "Alliance");
}
