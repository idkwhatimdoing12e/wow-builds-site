import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { slugify } from "@/app/lib/journal";
import { questPageFor, questPageSlugs } from "@/app/lib/pvp";
import { ChainPageBody, pvpQuestsMetadata } from "@/app/components/pages/pages";

// A battleground's quests (Alterac Valley): the addon's quest-chain page.
export const dynamicParams = false;

export function generateStaticParams() {
  return questPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = questPageFor(slug);
  return page ? pvpQuestsMetadata(slug, "en", slugify(page)) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = questPageFor(slug);
  if (!page) notFound();
  return <ChainPageBody slug={slugify(page)} lang="en" back={`/pvp/${slug}`} />;
}
