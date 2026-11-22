import type { Metadata } from "next";
import { SITE_URL } from "@/app/lib/site";
import PrivacyBody from "@/app/components/site/PrivacyBody";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Wie Dungeon Journal mit deinen Daten umgeht: Werbung, Analyse, dein Charakter-Code und deine Wahl.",
  alternates: { canonical: `${SITE_URL}/de/privacy`, languages: { en: `${SITE_URL}/privacy`, de: `${SITE_URL}/de/privacy` } },
};

export default function DatenschutzPage() {
  return (
    <div lang="de">
      <PrivacyBody lang="de" />
    </div>
  );
}
