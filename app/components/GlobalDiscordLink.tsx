"use client";

import Link from "next/link";

const DISCORD_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#fff" d="M20.317 4.369A19.791 19.791 0 0016.558 3c-.204.364-.432.852-.593 1.242a18.27 18.27 0 00-5.93 0c-.16-.39-.397-.878-.602-1.242a19.736 19.736 0 00-3.757 1.369C2.24 9.073 1.98 13.673 2.12 18.22a19.9 19.9 0 006.102 3.098c.494-.673.933-1.387 1.316-2.135a12.59 12.59 0 01-2.074-.995c.174-.13.343-.266.507-.405 4.004 1.87 8.344 1.87 12.305 0 .165.139.334.275.507.405-.66.39-1.35.73-2.074.995.383.748.822 1.462 1.316 2.135a19.88 19.88 0 006.102-3.098c.167-4.987-.286-9.553-3.624-13.85zM8.02 15.331c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.174 1.094 2.156 2.418 0 1.334-.955 2.419-2.156 2.419zm7.974 0c-1.183 0-2.156-1.085-2.156-2.419 0-1.333.955-2.418 2.156-2.418 1.21 0 2.174 1.094 2.156 2.418 0 1.334-.946 2.419-2.156 2.419z"/>
</svg>
`);

export default function GlobalDiscordLink() {
  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        left: 18,
        zIndex: 9999,
        transform: "translateZ(0)", // helps Safari render cleanly
      }}
    >
      <Link
        href="https://discord.gg/YOUR_INVITE_HERE"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join Discord"
        style={{
          width: 52, // bigger button
          height: 52,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.78)", // no blur => no Safari artifacts
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 10px 26px rgba(0,0,0,0.55)",
        }}
      >
        <img
          src={`data:image/svg+xml,${DISCORD_SVG}`}
          alt=""
          width={30}   // bigger icon
          height={30}
          style={{
            display: "block",
            transform: "translateZ(0)",
          }}
        />
      </Link>
    </div>
  );
}