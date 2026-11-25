import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/app/lib/i18n";
import { pvpSlugs } from "@/app/lib/pvp";
import { PvpPageBody, pvpPageMetadata } from "@/app/components/pages/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return pvpSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  return isLang(lang) ? pvpPageMetadata(slug, lang) : {};
}

export default async function Page({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLang(lang) || lang === "en") notFound();
  return <PvpPageBody slug={slug} lang={lang as Lang} />;
}
