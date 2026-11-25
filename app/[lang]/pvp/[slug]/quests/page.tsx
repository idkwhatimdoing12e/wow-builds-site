import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/app/lib/i18n";
import { slugify } from "@/app/lib/journal";
import { questPageFor, questPageSlugs } from "@/app/lib/pvp";
import { ChainPageBody, pvpQuestsMetadata } from "@/app/components/pages/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return questPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const page = questPageFor(slug);
  return isLang(lang) && page ? pvpQuestsMetadata(slug, lang, slugify(page)) : {};
}

export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const page = questPageFor(slug);
  if (!isLang(lang) || lang === "en" || !page) notFound();
  return <ChainPageBody slug={slugify(page)} lang={lang as Lang} back={`/pvp/${slug}`} />;
}
