"use client";

import { useState } from "react";

type GoogleFC = { callbackQueue?: unknown[]; showRevocationMessage?: () => void };

/**
 * Reopens Google's consent window (AdSense "Privacy & messaging") so a visitor
 * can change or withdraw their choice. Google's own call for this is
 * googlefc.callbackQueue.push(googlefc.showRevocationMessage).
 * If the consent script never loaded (a blocker, or a visitor outside the
 * EU/EEA, UK and Switzerland), say so instead of doing nothing.
 */
export default function ConsentSettingsButton({ label, unavailable }: { label: string; unavailable: string }) {
  const [note, setNote] = useState("");

  function open() {
    const fc = (window as unknown as { googlefc?: GoogleFC }).googlefc;
    if (fc && typeof fc.showRevocationMessage === "function") {
      fc.callbackQueue = fc.callbackQueue || [];
      fc.callbackQueue.push(fc.showRevocationMessage);
      setNote("");
    } else {
      setNote(unavailable);
    }
  }

  return (
    <span className="pv-consent">
      <button type="button" className="wf-btn wf-btn-red wf-btn-sm" onClick={open}>
        {label}
      </button>
      {note && <span className="pv-consent-note">{note}</span>}
    </span>
  );
}
