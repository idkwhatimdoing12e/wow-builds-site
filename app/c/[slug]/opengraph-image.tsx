import { ImageResponse } from "next/og";
import { getCharacter } from "@/app/lib/character-cache";
import { validSlug } from "@/app/lib/character-snapshot";
import { CLASS_NAMES, CLASS_COLORS } from "@/app/lib/character";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = validSlug(slug) ? await getCharacter(slug) : null;
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg,#281c12,#090b0e)",
        color: "#e7d7b7",
        padding: 75,
        border: "12px solid #6d502f",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 25, letterSpacing: 7 }}>DUNGEON JOURNAL</div>
      <div
        style={{
          fontSize: 85,
          marginTop: 36,
          color: s ? CLASS_COLORS[s.classToken] : "#fff",
        }}
      >
        {s?.name ?? "Character unavailable"}
      </div>
      {s && (
        <>
          <div style={{ fontSize: 34, marginTop: 15 }}>
            Level {s.level} {CLASS_NAMES[s.classToken] ?? s.classToken} ·{" "}
            {s.realm}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 35,
              marginTop: 50,
              color: "#eebf67",
            }}
          >
            {s.dungeons.filter((d) => d.cleared).length} dungeons cleared ·{" "}
            {s.runs.length} Character Logs
          </div>
        </>
      )}
    </div>,
    size,
  );
}
