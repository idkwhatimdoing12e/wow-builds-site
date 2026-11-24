import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/app/lib/site";
import { getDungeon } from "@/app/lib/journal";
import { NEWS, type NewsPost } from "@/app/lib/news";
import Window from "@/app/components/journal/Window";
import { BossPortrait } from "@/app/components/journal/BossPortrait";

export const metadata: Metadata = {
  title: "Latest Drama",
  description: "What changes on WoW Forever, and what it means for your dungeons, bosses and loot.",
  alternates: { canonical: `${SITE_URL}/news` },
};

function longDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function Post({ post }: { post: NewsPost }) {
  const d = post.boss ? getDungeon(post.boss.dungeon) : null;
  const idx = d ? d.bosses.findIndex((b) => b.name === post.boss!.name) : -1;
  const boss = d && idx >= 0 ? d.bosses[idx] : null;
  return (
    <article id={post.id} className="nw-post">
      {boss && (
        <Link href={`/dungeon/${d!.slug}#boss-${idx}`} className="nw-portrait" aria-label={`${boss.name} in the journal`}>
          <BossPortrait name={boss.name} displayId={boss.displayId} crop={boss.portraitCrop} level={boss.level} large />
        </Link>
      )}
      <div className="nw-body">
        <p className="wp-note">
          <time dateTime={post.date}>{longDate(post.date)}</time>
          {d && <> · {d.name}</>}
        </p>
        <h2 className="wp-title nw-title">{post.title}</h2>
        {post.paragraphs.map((p, i) => (
          <p key={i} className="wp-text">
            {p}
          </p>
        ))}
        {boss && (
          <p className="nw-actions">
            <Link href={`/dungeon/${d!.slug}#boss-${idx}`} className="wf-btn wf-btn-dark wf-btn-sm">
              {boss.name} in the journal
            </Link>
          </p>
        )}
      </div>
    </article>
  );
}

export default function NewsPage() {
  return (
    <div className="journal wf-page">
      <Window>
        <div className="wf-crumb">
          <Link href="/" className="wf-btn wf-btn-red wf-btn-sm">Dungeons</Link>
        </div>
        <div className="wf-pane wf-pane-single wf-pane-parchment">
          <div className="wp nw">
            <h1 className="wp-title nw-head">Latest Drama</h1>
            <p className="wp-note">What Blizzard changed on WoW Forever this time, and what it means for your dungeons.</p>
            {NEWS.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </div>
        </div>
      </Window>
    </div>
  );
}
