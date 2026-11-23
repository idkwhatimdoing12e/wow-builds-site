"use client";

import { useState } from "react";
import { useT } from "@/app/components/i18n/I18n";

/**
 * The dungeon page's written overview. On a phone it is folded to its first
 * lines with "Read more", so the tabs, bosses and quests sit near the top; on
 * wider screens it is always open (the button is hidden there by CSS). The
 * whole text is in the page either way, for search engines.
 */
export default function Overview({ paragraphs, lang }: { paragraphs: string[]; lang: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <section className={`wf-overview ${open ? "is-open" : ""}`} lang={lang}>
      <div className="wf-overview-text" id="wf-overview-text">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <button
        type="button"
        className="wf-overview-more"
        aria-expanded={open}
        aria-controls="wf-overview-text"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? t.or("s_show_less", "Show less") : t.or("s_read_more", "Read more")}
      </button>
    </section>
  );
}
