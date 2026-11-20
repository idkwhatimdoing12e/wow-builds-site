"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import type { ItemTip } from "@/app/lib/item-tip";
import ItemTooltipBody from "./ItemTooltipBody";

const OFFSET = 18; // px between the cursor and the tooltip

/**
 * The site's own item tooltip. Any element with data-item="<id>" shows it on
 * hover: the data comes from /tip/item/<id> (a static file per item), fetched
 * once and kept for the visit. Mouse and pen only; on touch a tap opens the
 * item page instead. An item inside an open window (a modal <dialog>, such as
 * the character page's Favourites) gets the tooltip drawn in that window: the
 * page underneath is covered by it.
 */
export default function ItemTooltips() {
  const [tip, setTip] = useState<ItemTip | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const pathname = usePathname();
  const hideRef = useRef<() => void>(() => {});
  const box = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });

  // Keep the box beside the cursor and on screen, flipping at the edges.
  const place = () => {
    const el = box.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    let x = pos.current.x + OFFSET;
    let y = pos.current.y + OFFSET;
    if (x + width > window.innerWidth - 8) x = Math.max(8, pos.current.x - OFFSET - width);
    if (y + height > window.innerHeight - 8) y = Math.max(8, window.innerHeight - 8 - height);
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  };

  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const cache = new Map<string, Promise<ItemTip | null>>();
    let current: string | null = null;
    const hide = () => {
      current = null;
      setTip(null);
    };
    hideRef.current = hide;

    const load = (id: string) => {
      let p = cache.get(id);
      if (!p) {
        p = fetch(`/tip/item/${id}`)
          .then((r) => (r.ok ? (r.json() as Promise<ItemTip>) : null))
          .catch(() => null);
        cache.set(id, p);
      }
      return p;
    };

    const over = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const el = (e.target as Element | null)?.closest?.("[data-item]");
      if (!el) return;
      const id = el.getAttribute("data-item");
      if (!id || id === current) return;
      current = id;
      pos.current = { x: e.clientX, y: e.clientY };
      const dialog = el.closest("dialog[open]") as HTMLElement | null;
      void load(id).then((t) => {
        if (current !== id) return;
        setHost(dialog);
        setTip(t);
      });
    };
    const move = (e: PointerEvent) => {
      if (!current) return;
      // Only while the pointer is on that item: a click that changes the page
      // removes the link without a pointerout, and the tooltip must not stay.
      const el = (e.target as Element | null)?.closest?.("[data-item]");
      if (!el || el.getAttribute("data-item") !== current) {
        hide();
        return;
      }
      pos.current = { x: e.clientX, y: e.clientY };
      place();
    };
    const out = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-item]");
      if (!el) return;
      const to = e.relatedTarget as Node | null;
      if (to && el.contains(to)) return;
      current = null;
      setTip(null);
    };

    document.addEventListener("pointerover", over);
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerout", out);
    document.addEventListener("pointerdown", hide);
    window.addEventListener("scroll", hide, { passive: true });
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("pointerdown", hide);
      window.removeEventListener("scroll", hide);
    };
  }, []);

  // A new page never inherits the last page's tooltip.
  useEffect(() => {
    hideRef.current();
  }, [pathname]);

  // Place it as soon as it has a size.
  useEffect(() => {
    if (tip) place();
  }, [tip]);

  if (!tip) return null;
  const body = (
    <div ref={box} className="itt" role="tooltip">
      <img className="itt-icon" src={tip.icon} alt="" width={40} height={40} />
      <div className="it-tip itt-body">
        <ItemTooltipBody t={tip} />
      </div>
    </div>
  );
  return host && host.isConnected ? createPortal(body, host) : body;
}
