"use client";

import { useEffect, useState } from "react";
import { useHref, useLang, useT } from "@/app/components/i18n/I18n";
import { ago } from "@/app/lib/ago";
import { SHOW_COMMENTS } from "@/app/lib/release";

interface BluePost {
  id: number;
  topicId: number;
  slug: string;
  comments: number;
  title: string;
  url: string;
  author: string;
  authorTitle: string;
  avatar: string;
  date: string;
  excerpt: string;
}

/** The forum's WoW: Forever section, for "All on the forum". */
const FOREVER_FORUM = "https://us.forums.blizzard.com/en/wow/c/wow-forever/346";
const SHOWN = 3;

/**
 * The newest WoW Forever blue posts, from the Worker's /api/blue-posts (which
 * reads Blizzard's forum every 15 minutes). Each opens the post's own page
 * (/blue/<topic>), with its comments and the forum as the source. Nothing
 * shows until they arrive, or if none do. Plain links, not next/link: those
 * pages are served by the Worker, not built.
 */
export default function BluePosts() {
  const t = useT();
  const lang = useLang();
  const h = useHref();
  const [posts, setPosts] = useState<BluePost[] | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/blue-posts")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { posts?: BluePost[] } | null) => {
        if (live) setPosts(d?.posts ?? []);
      })
      .catch(() => {
        if (live) setPosts([]);
      });
    return () => {
      live = false;
    };
  }, []);

  if (!posts?.length) return null;
  const title = t.or("s_blue_title", "Blue Posts");

  return (
    <section className="bp" aria-label={title}>
      <div className="bp-head">
        <h2 className="bp-title">{title}</h2>
        <a href={FOREVER_FORUM} target="_blank" rel="noreferrer noopener" className="bp-more">
          {t.or("s_blue_more", "All on the forum")}
        </a>
      </div>
      <ul className="bp-list">
        {posts.slice(0, SHOWN).map((p) => (
          <li key={p.id}>
            <a href={h(`/blue/${p.topicId}${p.slug ? `-${p.slug}` : ""}`)} className="bp-card">
              <span className="bp-who">
                {p.avatar && <img src={p.avatar} alt="" width={28} height={28} loading="lazy" className="bp-avatar" />}
                <span className="bp-author">{p.author}</span>
                {p.authorTitle && <span className="bp-role">{p.authorTitle}</span>}
                <time className="bp-when" dateTime={p.date} title={new Date(p.date).toLocaleString(lang)}>
                  {ago(p.date, lang)}
                </time>
              </span>
              <span className="bp-post-title">{p.title}</span>
              {p.excerpt && <span className="bp-excerpt">{p.excerpt}</span>}
              {SHOW_COMMENTS && p.comments > 0 && (
                <span className="bp-comments">
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
                  </svg>
                  {p.comments}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
