"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    whTooltips?: any;
    $WowheadPower?: { refreshLinks?: () => void };
  }
}

export default function WowheadInit() {
  const pathname = usePathname();

  useEffect(() => {
    // wowhead tooltip config
    window.whTooltips = {
      colorLinks: false,
      iconizeLinks: false,
      renameLinks: false,
      tooltipOffsetX: 6,
      tooltipOffsetY: 6,
    };

    // ensure power.js exists once
    const SCRIPT_ID = "wowhead-powerjs";
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!existing) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = "https://wow.zamimg.com/widgets/power.js";
      s.async = true;
      s.onload = () => window.$WowheadPower?.refreshLinks?.();
      document.body.appendChild(s);
    } else {
      // on client navigations, just refresh
      window.$WowheadPower?.refreshLinks?.();
    }
  }, [pathname]);

  return null;
}