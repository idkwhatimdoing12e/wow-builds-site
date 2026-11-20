import type { Metadata } from "next";
import { getQuestSlugs } from "@/app/lib/journal";
import { QuestBody, questMetadata } from "@/app/components/pages/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return getQuestSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return questMetadata(slug, "en");
}

export default async function QuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <QuestBody slug={slug} lang="en" />;
}
