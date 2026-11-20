import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuestSlugs } from "@/app/lib/journal";
import { isLang, type Lang } from "@/app/lib/i18n";
import { QuestBody, questMetadata } from "@/app/components/pages/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return getQuestSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  return isLang(lang) ? questMetadata(slug, lang) : {};
}

export default async function LangQuest({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLang(lang) || lang === "en") notFound();
  return <QuestBody slug={slug} lang={lang as Lang} />;
}
