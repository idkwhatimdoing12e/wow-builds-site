import type { Metadata } from "next";
import { SITE_URL } from "@/app/lib/site";
import PrivacyBody from "@/app/components/site/PrivacyBody";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Dungeon Journal handles your data: ads, analytics, your character code and your choices.",
  alternates: { canonical: `${SITE_URL}/privacy`, languages: { en: `${SITE_URL}/privacy`, de: `${SITE_URL}/de/privacy` } },
};

export default function PrivacyPage() {
  return <PrivacyBody lang="en" />;
}
