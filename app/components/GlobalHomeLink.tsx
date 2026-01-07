"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

export default function GlobalHomeLink() {
  const pathname = usePathname();

  // Avoid any weird first-render mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // Hide on landing page
  if (!mounted) return null;
  if (!pathname || pathname === "/") return null;

  return (
    <div
      aria-label="Home link"
      className="fixed left-1/2 top-[18px] z-[9999] -translate-x-1/2"
      style={{
        position: "fixed",
        top: 18,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        pointerEvents: "auto",
      }}
    >
      <Link
        href="/"
        className="rounded-full border border-white/10 bg-black/40 px-3 py-2 text-[14px] font-bold tracking-[0.04em] text-white/90 backdrop-blur-md transition hover:border-white/20 hover:bg-white/5 hover:text-white"
      >
        Home
      </Link>
    </div>
  );
}