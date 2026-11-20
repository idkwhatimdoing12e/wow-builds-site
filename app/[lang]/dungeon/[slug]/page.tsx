import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDungeonSlugs } from "@/app/lib/journal";
import { isLang, type Lang } from "@/app/lib/i18n";
import { DungeonBody, dungeonMetadata } from "@/app/components/pages/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDungeonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  return isLang(lang) ? dungeonMetadata(slug, lang) : {};
}

export default async function LangDungeon({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLang(lang) || lang === "en") notFound();
  return <DungeonBody slug={slug} lang={lang as Lang} />;
}
