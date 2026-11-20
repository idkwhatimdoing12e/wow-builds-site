import { PREFIXED } from "@/app/lib/i18n";

// /de, /fr, ... : the translated home, dungeon and quest pages. Any other
// first segment is not a language and 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED.map((lang) => ({ lang }));
}

export default function LangLayout({ children }: { children: React.ReactNode }) {
  return children;
}
