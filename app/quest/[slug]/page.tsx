import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getQuestBySlug, getQuestSlugs } from "@/app/lib/journal";
import { themeVars } from "@/app/lib/art";
import { SITE_NAME, SITE_URL } from "@/app/lib/site";
import Window from "@/app/components/journal/Window";
import QuestPanel from "@/app/components/journal/QuestPanel";
import AdSlot from "@/app/components/journal/AdSlot";

export const dynamicParams = false;

export function generateStaticParams() {
  return getQuestSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getQuestBySlug(slug);
  if (!page) return {};
  const { quest } = page;
  const where = page.dungeons.map((d) => d.name).join(" / ");
  const title = `${quest.name} — ${where} quest (level ${quest.level})`;
  const description = `${quest.objective} Pick up: ${quest.pickup}. Turn in: ${quest.turnin}.`.slice(0, 160);
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/quest/${quest.slug}` },
    openGraph: { title: `${title} — ${SITE_NAME}`, description, url: `${SITE_URL}/quest/${quest.slug}` },
  };
}

export default async function QuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getQuestBySlug(slug);
  if (!page) notFound();
  const { quest: q, dungeons } = page;

  return (
    <div className="journal wf-page">
      <Window style={themeVars(dungeons[0].name) as React.CSSProperties}>
        <div className="wf-crumb">
          <Link href="/" className="wf-btn wf-btn-red wf-btn-sm">Dungeons</Link>
          <Link href={`/dungeon/${dungeons[0].slug}#quest-${q.id}`} className="wf-btn wf-btn-red wf-btn-sm">{dungeons[0].name}</Link>
          {dungeons.slice(1).map((d) => (
            <Link key={d.slug} href={`/dungeon/${d.slug}#quest-${q.id}`} className="wf-btn wf-btn-dark wf-btn-sm">also in {d.name}</Link>
          ))}
        </div>
        <div className="wf-pane wf-pane-single wf-pane-parchment">
          <QuestPanel q={q} full />
        </div>
      </Window>
      <AdSlot />
    </div>
  );
}
