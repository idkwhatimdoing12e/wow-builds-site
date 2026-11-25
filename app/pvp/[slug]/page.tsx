import type { Metadata } from "next";
import { pvpSlugs } from "@/app/lib/pvp";
import { PvpPageBody, pvpPageMetadata } from "@/app/components/pages/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return pvpSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return pvpPageMetadata(slug, "en");
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PvpPageBody slug={slug} lang="en" />;
}
