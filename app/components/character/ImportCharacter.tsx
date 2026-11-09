"use client";
import { useEffect, useState } from "react";
import CharacterPanel from "./CharacterPanel";
import type { IndexDungeon } from "@/app/lib/character";
export default function ImportCharacter({ index }: { index: IndexDungeon[] }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [legacy, setLegacy] = useState(false);
  const [oldCode, setOldCode] = useState("");
  useEffect(() => {
    try {
      if (window.location.hash || window.localStorage.getItem("dj.character.code")) setLegacy(true);
    } catch { /* Legacy imports still work without browser storage. */ }
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (!code.trim().startsWith("FDJ3.")) {
      setOldCode(code.trim());
      setLegacy(true);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/character", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: code.trim(),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Import failed.");
      if (typeof result.url !== "string" || !result.url.startsWith("/c/"))
        throw new Error("Unexpected response.");
      window.location.assign(result.url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to connect. Please try again.",
      );
      setBusy(false);
    }
  }
  return (
    <div className="wp">
      <h1 className="wp-title">Your character, one link.</h1>
      <p className="wp-text">
        In game, type <code className="ch-cmd">/dj export</code>. Press Ctrl+A,
        then Ctrl+C, and paste the code below.
      </p>
      <p className="wp-text">
        Publish your dungeon progress and Character Logs. A newer export updates
        the same character link.
      </p>
      <form onSubmit={submit}>
        <textarea
          className="ch-input"
          rows={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-label="Character export code"
          placeholder="FDJ3.…"
          spellCheck={false}
          required
          disabled={busy}
        />
        <p className="wp-note">
          Your export code includes your update key. Paste it here; share only
          the character link with friends. Published progress and logs are
          public.
        </p>
        {error && (
          <p className="ch-error" role="alert">
            {error}
          </p>
        )}
        <button className="wf-btn wf-btn-red" disabled={busy}>
          {busy ? "Publishing…" : "Publish character"}
        </button>
      </form>
      <details
        open={legacy}
        onToggle={(e) => setLegacy(e.currentTarget.open)}
        className="sc-legacy"
      >
        <summary>Open an older FDJ1 / FDJ2 export</summary>
        <p>
          Older codes remain browser-only because they have no update key. Use
          the updated addon for a permanent link.
        </p>
        <CharacterPanel index={index} initialCode={oldCode} />
      </details>
    </div>
  );
}
