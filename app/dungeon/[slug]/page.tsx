import type { Metadata } from "next";
import { getDungeonSlugs } from "@/app/lib/journal";
import { DungeonBody, dungeonMetadata } from "@/app/components/pages/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDungeonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return dungeonMetadata(slug, "en");
}

export default async function DungeonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DungeonBody slug={slug} lang="en" />;
}
