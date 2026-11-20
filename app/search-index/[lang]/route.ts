// /search-index/<lang>: the header search's index (app/lib/search-index.ts),
// written out as a static file per language at build time.
import { LANGS, isLang } from "@/app/lib/i18n";
import { buildSearchIndex } from "@/app/lib/search-index";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((l) => ({ lang: l.code }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) return new Response("Not found", { status: 404 });
  return Response.json(buildSearchIndex(lang));
}
