/** "3 hours ago", in the page's language. */
export function ago(iso: string, lang: string): string {
  const seconds = (Date.parse(iso) - Date.now()) / 1000;
  if (!Number.isFinite(seconds)) return "";
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
    ["month", 2629800],
    ["year", 31557600],
  ];
  let unit: Intl.RelativeTimeFormatUnit = "second";
  let size = 1;
  for (const [u, s] of steps) {
    if (Math.abs(seconds) >= s) {
      unit = u;
      size = s;
    }
  }
  // Under a minute: "now", not "12 seconds ago".
  if (unit === "second") return rtf.format(0, "second");
  return rtf.format(Math.round(seconds / size), unit);
}
