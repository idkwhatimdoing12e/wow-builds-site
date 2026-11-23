import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLang, type Lang } from "@/app/lib/i18n";
import { TierSetsBody, tierSetsMetadata } from "@/app/components/pages/pages";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return isLang(lang) ? tierSetsMetadata(lang) : {};
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang === "en") notFound();
  return <TierSetsBody lang={lang as Lang} />;
}
