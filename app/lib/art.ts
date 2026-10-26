// Artwork and per-dungeon theme colours, both exported from the addon.
import artManifest from "@/data/art.json";
import raw from "@/data/journal.json";

type Rgba = [number, number, number, number?];
interface Theme {
  frame?: Rgba;
  header?: Rgba;
  content?: Rgba;
  left?: Rgba;
  right?: Rgba;
  row?: Rgba;
  rowSelected?: Rgba;
  lootRow?: Rgba;
  border?: Rgba;
  title?: Rgba;
  text?: Rgba;
  muted?: Rgba;
}

const manifest = artManifest as { cards: Record<string, string>; pages: Record<string, string> };
const themes = (raw as unknown as { THEMES: Record<string, Theme> }).THEMES ?? {};

export function cardArt(dungeonName: string): string | null {
  return manifest.cards[dungeonName] ?? null;
}

function css(c?: Rgba, fallback = "transparent"): string {
  if (!c) return fallback;
  const [r, g, b, a] = c;
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a ?? 1})`;
}

/** CSS custom properties that re-skin the window the way the addon themes each dungeon. */
export function themeVars(dungeonName: string): Record<string, string> {
  const t = themes[dungeonName];
  if (!t) return {};
  const vars: Record<string, string> = {};
  if (t.frame) vars["--wf-frame"] = css(t.frame);
  if (t.header) vars["--wf-header"] = css(t.header);
  if (t.content) vars["--wf-bg"] = css(t.content);
  if (t.left) vars["--wf-panel"] = css(t.left);
  if (t.right) vars["--wf-panel-alt"] = css(t.right);
  if (t.row) vars["--wf-row"] = css(t.row);
  if (t.rowSelected) vars["--wf-row-selected"] = css(t.rowSelected);
  if (t.lootRow) vars["--wf-loot-row"] = css(t.lootRow);
  if (t.border) vars["--wf-border"] = css(t.border);
  if (t.title) vars["--wf-title"] = css(t.title);
  if (t.text) vars["--wf-text"] = css(t.text);
  if (t.muted) vars["--wf-muted"] = css(t.muted);
  return vars;
}

/** Two theme colours for the cards of dungeons whose art lives in the game client, not the addon. */
export function cardGradient(dungeonName: string): string {
  const t = themes[dungeonName];
  const a = css(t?.rowSelected ?? t?.header, "#4a2a12");
  const b = css(t?.frame ?? t?.content, "#120c08");
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}
