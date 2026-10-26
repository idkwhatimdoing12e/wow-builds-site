"use client";

import { useSyncExternalStore } from "react";

// A remembered on/off switch (like the addon's ForeverDungeonJournalDB flags),
// shared by every component that reads the same key.
const EVENT = "dj-flag-change";
const memory: Record<string, boolean> = {};

function read(key: string): boolean {
  try {
    const v = window.localStorage.getItem(key);
    if (v !== null) return v === "1";
  } catch {
    /* storage blocked: use memory */
  }
  return memory[key] ?? false;
}

export function setStoredFlag(key: string, on: boolean) {
  memory[key] = on;
  try {
    window.localStorage.setItem(key, on ? "1" : "0");
  } catch {
    /* keep the in-memory value */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useStoredFlag(key: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    () => read(key),
    () => false,
  );
}
