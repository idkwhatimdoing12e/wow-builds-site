"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const DISCORD_INVITE = "https://discord.gg/YOURINVITE"; // <-- change this

function DiscordIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 127.14 96.36"
      aria-hidden="true"
      className="block"
    >
      <path
        fill="currentColor"
        d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14C130.99,52.84,124.56,29.11,107.7,8.07ZM42.45,65.69c-6.18,0-11.22-5.62-11.22-12.52S36.17,40.64,42.45,40.64c6.29,0,11.33,5.65,11.22,12.53C53.67,60.07,48.63,65.69,42.45,65.69Zm42.24,0c-6.18,0-11.22-5.62-11.22-12.52s5-12.53,11.22-12.53c6.29,0,11.33,5.65,11.22,12.53C95.91,60.07,91,65.69,84.69,65.69Z"
      />
    </svg>
  );
}

export default function GlobalNav() {
  const pathname = usePathname();
  const showHome = pathname !== "/";

  return (
    <>
      {/* TOP RIGHT – Discord */}
      <a
        href={DISCORD_INVITE}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Discord"
        className="globalDiscord"
      >
        <DiscordIcon size={26} />
      </a>

      {/* TOP CENTER – Home (not on landing) */}
      {showHome && (
        <div className="globalHomeWrap">
          <Link href="/" className="globalHome">
            Home
          </Link>
        </div>
      )}

      {/* Global styles */}
      <style jsx global>{`
        /* ===== DISCORD (top-right, fixed) ===== */
        .globalDiscord {
          position: fixed;
          top: calc(14px + env(safe-area-inset-top));
          right: calc(14px + env(safe-area-inset-right));
          z-index: 9999;

          width: 48px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;

          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);

          color: rgba(255, 255, 255, 0.95);
          text-decoration: none;
        }

        .globalDiscord:hover {
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.08);
        }

        /* ===== HOME (top-center, fixed) ===== */
        .globalHomeWrap {
          position: fixed;
          top: calc(14px + env(safe-area-inset-top));
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          pointer-events: none;
        }

        .globalHome {
          pointer-events: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;

          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.04em;

          padding: 8px 14px;
          border-radius: 999px;

          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);

          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          opacity: 0.85;
        }

        .globalHome:hover {
          opacity: 1;
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </>
  );
}