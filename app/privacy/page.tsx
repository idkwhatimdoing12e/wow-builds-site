import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LINKS, SITE_URL } from "@/app/lib/site";
import { MONETIZATION_LIVE, SHOW_MONETIZATION } from "@/app/lib/release";
import Window from "@/app/components/journal/Window";
import ConsentSettingsButton from "@/app/components/site/ConsentSettingsButton";

// ---- Fill these in before the page goes live --------------------------------
// The address is the one from the Impressum address service, not a home address.
const CONTROLLER = {
  name: "[Your full name]",
  address: "[Street and number], [Postcode] [City], Germany",
  email: "exehntv@gmail.com",
};
// Google Analytics > Admin > Data collection and modification > Data retention.
// "2 months" is Google's default; change both lines if it is set to 14 months.
const GA_RETENTION = { en: "2 months", de: "2 Monate" };
const UPDATED = { en: "21 November 2026", de: "21. November 2026" };
// ------------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Dungeon Journal handles your data: ads, analytics, your character code and your choices.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  // Not in search results until monetisation is switched on (app/lib/release.ts).
  ...(MONETIZATION_LIVE ? {} : { robots: { index: false, follow: false } }),
};

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="wp-link">
      {children}
    </a>
  );
}

function Mail() {
  return (
    <a href={`mailto:${CONTROLLER.email}`} className="wp-link">
      {CONTROLLER.email}
    </a>
  );
}

function English() {
  return (
    <section id="en" lang="en" className="pv-lang">
      <h1 className="wp-title pv-title">Privacy</h1>
      <p className="wp-note">Last updated: {UPDATED.en}</p>

      <div className="pv-short">
        <h2 className="wp-sub">The short version</h2>
        <ul className="pv-list">
          <li>Dungeon Journal is free and made by one player. Ads pay for this site and keep the addon updated.</li>
          <li>Your character code stays in your browser. It is never sent to this site’s server.</li>
          <li>
            If you visit from the EU, the UK or Switzerland, no ad or analytics cookies are set until you say yes.
            Saying no still gets you the whole journal.
          </li>
          <li>You can change your choice at any time:</li>
        </ul>
        <ConsentSettingsButton
          label="Change my cookie choices"
          unavailable="The consent window could not be opened. Usually a blocker stops it from loading, or you are outside the EU, UK and Switzerland, where it is not shown. While it is blocked, no ad or analytics cookies are set through it."
        />
      </div>

      <h2 className="wp-sub pv-h">1. Who runs this site</h2>
      <p className="wp-text">
        {CONTROLLER.name}, {CONTROLLER.address}. Email: <Mail />. I am responsible for the data processing described
        here (the “controller” under the GDPR).
      </p>

      <h2 className="wp-sub pv-h">2. Why ads, and why I ask for your OK</h2>
      <p className="wp-text">
        The journal, this website and the addon are free, and I work on them every day. Ads pay for that. Ads that match
        your interests (personalised ads) pay considerably more than general ones, so a yes in the consent window helps
        the most. A no is fine too: you get the same site, with ads that are not based on your interests. You can change
        your mind whenever you like.
      </p>

      <h2 className="wp-sub pv-h">3. When you open a page (hosting)</h2>
      <p className="wp-text">
        This site is hosted by Vercel Inc. (USA). To deliver a page, Vercel’s servers process your IP address, the page
        you asked for, the time and your browser’s identification, and keep short-lived logs to run the service and keep
        it secure. The site’s fonts and pictures are served from this site too, so no other company is contacted for
        them. Legal basis: Art. 6(1)(f) GDPR (my legitimate interest in a working, secure website). See{" "}
        <Ext href="https://vercel.com/legal/privacy-policy">Vercel’s privacy policy</Ext>.
      </p>

      <h2 className="wp-sub pv-h">4. Your character (My Character)</h2>
      <p className="wp-text">
        When you paste the code from <strong>/dj export</strong>, it is read in your browser. The code lives in the part
        of the address after the # and in your browser’s local storage. Browsers never send the part after the # to a
        server, so your character’s name, realm and progress never reach this site’s server. The <strong>Forget</strong>{" "}
        button on the character page deletes the saved code from your browser.
      </p>
      <p className="wp-text">
        A share link contains the code itself: anyone you give it to can see that character. If you agree to analytics,
        the site counts that a character was loaded or a share link was copied, with coarse details only (where it came
        from, class, faction, level), never the name, realm or code.
      </p>

      <h2 className="wp-sub pv-h">5. Things saved in your browser</h2>
      <p className="wp-text">
        The site saves a few things in your browser’s local and session storage so its features work: your faction
        choice, display options, your character code (see above) and the pages you came from, so the Back button works.
        None of it is sent anywhere. Because this storage is strictly necessary for features you use, it needs no
        consent (§ 25(2) no. 2 TDDDG). You can delete it at any time in your browser settings.
      </p>

      <h2 className="wp-sub pv-h">6. The consent window</h2>
      <p className="wp-text">
        If you visit from the EU/EEA, the UK or Switzerland, Google’s consent tool shows a consent window. Google
        certifies this tool for the IAB Transparency &amp; Consent Framework. The window lists the ad partners and what
        they want to do, and saves your choice in a cookie so you are not asked on every page. You can change or withdraw
        your choice at any time with the button at the top of this page or the “Privacy and cookie settings” link Google
        adds to the site. Legal basis for saving your choice: Art. 6(1)(c) GDPR with Art. 7(1) GDPR, and § 25(2) no. 2
        TDDDG.
      </p>

      <h2 className="wp-sub pv-h">7. Ads (Google AdSense)</h2>
      <p className="wp-text">
        Ads are served by Google AdSense, run by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland.
      </p>
      <ul className="pv-list">
        <li>
          <strong>If you agree:</strong> Google and its partners (third-party vendors) use cookies and similar technology
          to show ads based on your earlier visits to this and other websites, to measure ads and to prevent fraud.
          Google’s advertising cookies let Google and its partners serve these ads.
        </li>
        <li>
          <strong>If you don’t:</strong> you get ads that are not based on your interests. Google may still process some
          data, such as your IP address, to deliver the ad and fight fraud.
        </li>
        <li>
          The full list of partners is in the consent window. You can turn off personalised ads from Google in{" "}
          <Ext href="https://myadcenter.google.com/">My Ad Center</Ext> and from many other companies at{" "}
          <Ext href="https://www.youronlinechoices.eu/">youronlinechoices.eu</Ext> or{" "}
          <Ext href="https://optout.aboutads.info/">aboutads.info</Ext>.
        </li>
        <li>
          How Google uses this data:{" "}
          <Ext href="https://policies.google.com/technologies/partner-sites">
            How Google uses information from sites that use its services
          </Ext>
          .
        </li>
      </ul>
      <p className="wp-text">Legal basis: your consent, Art. 6(1)(a) GDPR and § 25(1) TDDDG.</p>

      <h2 className="wp-sub pv-h">8. Google Analytics</h2>
      <p className="wp-text">
        To see which pages are used and to fix what doesn’t work, the site uses Google Analytics 4 (Google Ireland
        Limited). With your consent it records the pages you view, the site you came from, your device and browser,
        your approximate location (country and city, worked out from your IP address) and the anonymous character
        counts from section 4. The part of the address after the # is never sent. If you visit from the EU/EEA, the UK
        or Switzerland, Analytics sets no cookies until you agree in the consent window (Google Consent Mode). Until
        then, Google only receives cookieless signals without identifiers, which it uses for estimated, combined visit
        counts. The data is kept for {GA_RETENTION.en}. Legal basis: Art. 6(1)(a) GDPR and § 25(1) TDDDG; for the
        cookieless signals, Art. 6(1)(f) GDPR (my legitimate interest in basic visit statistics).
      </p>

      <h2 className="wp-sub pv-h">9. Visitor counts (Vercel Web Analytics)</h2>
      <p className="wp-text">
        Vercel Web Analytics counts visits, pages, referring sites, countries and device types. It uses no cookies and
        stores nothing on your device. The address is sent without the part after the #. Legal basis: Art. 6(1)(f) GDPR
        (my legitimate interest in knowing how much the site is used).
      </p>

      <h2 className="wp-sub pv-h">10. Links to other sites</h2>
      <p className="wp-text">
        Links to <Ext href={LINKS.curseforge}>CurseForge</Ext>, <Ext href={LINKS.wago}>Wago</Ext>,{" "}
        <Ext href={LINKS.discord}>Discord</Ext>, <Ext href={LINKS.youtube}>YouTube</Ext>,{" "}
        <Ext href={LINKS.patreon}>Patreon</Ext> and <Ext href={LINKS.donate}>Buy Me a Coffee</Ext> are plain links.
        Nothing is loaded from those sites until you click. After that, their privacy policies apply.
      </p>

      <h2 className="wp-sub pv-h">11. Data sent outside the EU</h2>
      <p className="wp-text">
        Vercel and Google may process data in the USA. For US companies certified under the EU-US
        Data Privacy Framework, the European Commission has decided that the level of protection is adequate (Art. 45
        GDPR). Otherwise the providers rely on the EU standard contractual clauses (Art. 46(2)(c) GDPR).
      </p>

      <h2 className="wp-sub pv-h">12. Your rights</h2>
      <p className="wp-text">
        You have the right to access your data (Art. 15 GDPR), to have it corrected (Art. 16), deleted (Art. 17) or
        restricted (Art. 18), and to receive it in a portable format (Art. 20). You can withdraw your consent at any time
        with effect for the future (Art. 7(3)). <strong>Where I rely on legitimate interest, you can object at any time
        for reasons arising from your situation (Art. 21 GDPR).</strong> Just email <Mail />. I have no accounts and
        don’t know who you are, so for ad and analytics data Google’s own tools are often the quickest route.
      </p>
      <p className="wp-text">
        You can also complain to a data protection authority, for example the one where you live, or the one responsible
        for this site: the Bayerisches Landesamt für Datenschutzaufsicht (
        <Ext href="https://www.lda.bayern.de/">lda.bayern.de</Ext>).
      </p>

      <h2 className="wp-sub pv-h">13. Children</h2>
      <p className="wp-text">
        This site is not aimed at children under 16. If you are under 16, please ask a parent before you agree in the
        consent window.
      </p>

      <h2 className="wp-sub pv-h">14. Changes</h2>
      <p className="wp-text">
        I update this page when the site changes. The date at the top shows the current version.
      </p>
    </section>
  );
}

function Deutsch() {
  return (
    <section id="de" lang="de" className="pv-lang">
      <h2 className="wp-title pv-title">Datenschutzerklärung</h2>
      <p className="wp-note">Stand: {UPDATED.de}</p>

      <div className="pv-short">
        <h2 className="wp-sub">Kurz gesagt</h2>
        <ul className="pv-list">
          <li>Dungeon Journal ist kostenlos und von einem Spieler gemacht. Werbung bezahlt diese Seite und hält das Addon aktuell.</li>
          <li>Dein Charakter-Code bleibt in deinem Browser. Er wird nie an den Server dieser Seite geschickt.</li>
          <li>
            Wenn du aus der EU, dem Vereinigten Königreich oder der Schweiz kommst, werden Werbe- und Analyse-Cookies
            erst gesetzt, nachdem du zugestimmt hast. Auch ohne Zustimmung bekommst du das ganze Journal.
          </li>
          <li>Deine Auswahl kannst du jederzeit ändern:</li>
        </ul>
        <ConsentSettingsButton
          label="Cookie-Einstellungen ändern"
          unavailable="Das Einwilligungsfenster ließ sich nicht öffnen. Meist verhindert ein Blocker, dass es lädt, oder du bist außerhalb der EU, des Vereinigten Königreichs und der Schweiz, wo es nicht angezeigt wird. Solange es blockiert ist, werden darüber keine Werbe- oder Analyse-Cookies gesetzt."
        />
      </div>

      <h2 className="wp-sub pv-h">1. Verantwortlicher</h2>
      <p className="wp-text">
        {CONTROLLER.name}, {CONTROLLER.address}. E-Mail: <Mail />. Ich bin für die hier beschriebene Datenverarbeitung
        verantwortlich (Verantwortlicher im Sinne der DSGVO).
      </p>

      <h2 className="wp-sub pv-h">2. Warum Werbung, und warum ich um deine Zustimmung bitte</h2>
      <p className="wp-text">
        Das Journal, diese Website und das Addon sind kostenlos, und ich arbeite jeden Tag daran. Werbung bezahlt das.
        Werbung, die zu deinen Interessen passt (personalisierte Werbung), bringt deutlich mehr als allgemeine Werbung.
        Ein Ja im Einwilligungsfenster hilft deshalb am meisten. Ein Nein ist auch in Ordnung: Du bekommst dieselbe Seite,
        mit Werbung, die nicht auf deinen Interessen beruht. Du kannst deine Meinung jederzeit ändern.
      </p>

      <h2 className="wp-sub pv-h">3. Beim Aufruf einer Seite (Hosting)</h2>
      <p className="wp-text">
        Diese Seite wird von Vercel Inc. (USA) gehostet. Um eine Seite auszuliefern, verarbeiten die Server von Vercel
        deine IP-Adresse, die aufgerufene Seite, die Uhrzeit und die Kennung deines Browsers und speichern kurzlebige
        Protokolle für Betrieb und Sicherheit. Schriftarten und Bilder kommen ebenfalls von dieser Seite, dafür wird also
        keine andere Firma kontaktiert. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (mein berechtigtes Interesse an
        einer funktionierenden, sicheren Website). Siehe die{" "}
        <Ext href="https://vercel.com/legal/privacy-policy">Datenschutzerklärung von Vercel</Ext>.
      </p>

      <h2 className="wp-sub pv-h">4. Dein Charakter (Mein Charakter)</h2>
      <p className="wp-text">
        Wenn du den Code aus <strong>/dj export</strong> einfügst, wird er in deinem Browser gelesen. Der Code steht im Teil
        der Adresse nach dem # und im lokalen Speicher deines Browsers. Browser schicken den Teil nach dem # nie an einen
        Server, deshalb erreichen Name, Realm und Fortschritt deines Charakters nie den Server dieser Seite. Der Button{" "}
        <strong>Forget</strong> auf der Charakterseite löscht den gespeicherten Code aus deinem Browser.
      </p>
      <p className="wp-text">
        Ein Teilen-Link enthält den Code selbst: Jeder, dem du ihn gibst, kann diesen Charakter sehen. Wenn du der Analyse
        zustimmst, zählt die Seite, dass ein Charakter geladen oder ein Teilen-Link kopiert wurde, nur mit groben Angaben
        (Herkunft, Klasse, Fraktion, Stufe), nie mit Name, Realm oder Code.
      </p>

      <h2 className="wp-sub pv-h">5. Was in deinem Browser gespeichert wird</h2>
      <p className="wp-text">
        Die Seite speichert ein paar Dinge im lokalen Speicher und Sitzungsspeicher deines Browsers, damit ihre Funktionen
        laufen: deine Fraktionswahl, Anzeigeoptionen, deinen Charakter-Code (siehe oben) und die zuvor besuchten Seiten,
        damit der Zurück-Button funktioniert. Nichts davon wird irgendwohin geschickt. Weil diese Speicherung für
        Funktionen, die du nutzt, unbedingt erforderlich ist, braucht sie keine Einwilligung (§ 25 Abs. 2 Nr. 2 TDDDG).
        Du kannst sie jederzeit in den Einstellungen deines Browsers löschen.
      </p>

      <h2 className="wp-sub pv-h">6. Das Einwilligungsfenster</h2>
      <p className="wp-text">
        Wenn du aus der EU/dem EWR, dem Vereinigten Königreich oder der Schweiz kommst, zeigt das Einwilligungs-Tool von
        Google ein Einwilligungsfenster. Google zertifiziert dieses Tool für das IAB Transparency &amp; Consent Framework.
        Das Fenster listet die Werbepartner und ihre Zwecke auf und speichert deine Auswahl in einem Cookie, damit du nicht
        auf jeder Seite gefragt wirst. Du kannst deine Auswahl jederzeit ändern oder widerrufen, mit dem Button oben auf
        dieser Seite oder über den Link „Privacy and cookie settings“, den Google auf der Seite einblendet. Rechtsgrundlage
        für das Speichern deiner Auswahl: Art. 6 Abs. 1 lit. c DSGVO i. V. m. Art. 7 Abs. 1 DSGVO sowie § 25 Abs. 2 Nr. 2
        TDDDG.
      </p>

      <h2 className="wp-sub pv-h">7. Werbung (Google AdSense)</h2>
      <p className="wp-text">
        Die Werbung kommt von Google AdSense, betrieben von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
        Irland.
      </p>
      <ul className="pv-list">
        <li>
          <strong>Mit deiner Zustimmung:</strong> Google und seine Partner (Drittanbieter) nutzen Cookies und ähnliche
          Technik, um Werbung auf Grundlage deiner früheren Besuche auf dieser und anderen Websites anzuzeigen, Werbung zu
          messen und Betrug zu verhindern. Die Werbe-Cookies von Google ermöglichen es Google und seinen Partnern, diese
          Anzeigen auszuliefern.
        </li>
        <li>
          <strong>Ohne Zustimmung:</strong> Du bekommst Werbung, die nicht auf deinen Interessen beruht. Google kann
          trotzdem einige Daten verarbeiten, etwa deine IP-Adresse, um die Anzeige auszuliefern und Betrug zu bekämpfen.
        </li>
        <li>
          Die vollständige Liste der Partner steht im Einwilligungsfenster. Personalisierte Werbung von Google kannst du im{" "}
          <Ext href="https://myadcenter.google.com/">Mein Werbe-Center</Ext> abschalten, die vieler anderer Firmen unter{" "}
          <Ext href="https://www.youronlinechoices.eu/">youronlinechoices.eu</Ext>.
        </li>
        <li>
          Wie Google diese Daten nutzt:{" "}
          <Ext href="https://policies.google.com/technologies/partner-sites?hl=de">
            Wie Google Daten von Websites verwendet, die Google-Dienste nutzen
          </Ext>
          .
        </li>
      </ul>
      <p className="wp-text">Rechtsgrundlage: deine Einwilligung, Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG.</p>

      <h2 className="wp-sub pv-h">8. Google Analytics</h2>
      <p className="wp-text">
        Um zu sehen, welche Seiten genutzt werden, und um Fehler zu beheben, nutzt die Seite Google Analytics 4 (Google
        Ireland Limited). Mit deiner Einwilligung erfasst es die aufgerufenen Seiten, die Seite, von der du kommst, dein
        Gerät und Browser, deinen ungefähren Standort (Land und Stadt, aus deiner IP-Adresse ermittelt) und die anonymen
        Charakter-Zählungen aus Abschnitt 4. Der Teil der Adresse nach dem # wird nie übertragen. Wenn du aus der EU/dem
        EWR, dem Vereinigten Königreich oder der Schweiz kommst, setzt Analytics keine Cookies, bis du im
        Einwilligungsfenster zustimmst (Google Consent Mode). Bis dahin erhält Google nur cookielose Signale ohne
        Kennungen, die es für geschätzte, zusammengefasste Besuchszahlen nutzt. Die Daten werden {GA_RETENTION.de}{" "}
        gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG; für die cookielosen Signale Art.
        6 Abs. 1 lit. f DSGVO (mein berechtigtes Interesse an einfachen Besucherzahlen).
      </p>

      <h2 className="wp-sub pv-h">9. Besucherzählung (Vercel Web Analytics)</h2>
      <p className="wp-text">
        Vercel Web Analytics zählt Besuche, Seiten, verweisende Websites, Länder und Gerätetypen. Es nutzt keine Cookies
        und speichert nichts auf deinem Gerät. Die Adresse wird ohne den Teil nach dem # übertragen. Rechtsgrundlage: Art.
        6 Abs. 1 lit. f DSGVO (mein berechtigtes Interesse daran, zu wissen, wie viel die Seite genutzt wird).
      </p>

      <h2 className="wp-sub pv-h">10. Links zu anderen Seiten</h2>
      <p className="wp-text">
        Links zu <Ext href={LINKS.curseforge}>CurseForge</Ext>, <Ext href={LINKS.wago}>Wago</Ext>,{" "}
        <Ext href={LINKS.discord}>Discord</Ext>, <Ext href={LINKS.youtube}>YouTube</Ext>,{" "}
        <Ext href={LINKS.patreon}>Patreon</Ext> und <Ext href={LINKS.donate}>Buy Me a Coffee</Ext> sind einfache Links.
        Von diesen Seiten wird nichts geladen, bis du klickst. Danach gelten deren Datenschutzerklärungen.
      </p>

      <h2 className="wp-sub pv-h">11. Übermittlung außerhalb der EU</h2>
      <p className="wp-text">
        Vercel und Google können Daten in den USA verarbeiten. Für US-Unternehmen, die unter dem
        EU-US Data Privacy Framework zertifiziert sind, hat die Europäische Kommission ein angemessenes Schutzniveau
        festgestellt (Art. 45 DSGVO). Andernfalls stützen sich die Anbieter auf die EU-Standardvertragsklauseln (Art. 46
        Abs. 2 lit. c DSGVO).
      </p>

      <h2 className="wp-sub pv-h">12. Deine Rechte</h2>
      <p className="wp-text">
        Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
        Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Eine Einwilligung kannst du jederzeit mit Wirkung für
        die Zukunft widerrufen (Art. 7 Abs. 3). <strong>Soweit ich mich auf ein berechtigtes Interesse stütze, kannst du
        aus Gründen, die sich aus deiner besonderen Situation ergeben, jederzeit widersprechen (Art. 21 DSGVO).</strong>{" "}
        Schreib einfach an <Mail />. Ich habe keine Nutzerkonten und weiß nicht, wer du bist, daher sind für Werbe- und
        Analysedaten oft die Tools von Google der schnellste Weg.
      </p>
      <p className="wp-text">
        Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel an deinem Wohnort oder bei
        der für diese Seite zuständigen Behörde: dem Bayerischen Landesamt für Datenschutzaufsicht (
        <Ext href="https://www.lda.bayern.de/">lda.bayern.de</Ext>).
      </p>

      <h2 className="wp-sub pv-h">13. Kinder</h2>
      <p className="wp-text">
        Diese Seite richtet sich nicht an Kinder unter 16 Jahren. Wenn du jünger als 16 bist, frag bitte deine Eltern,
        bevor du im Einwilligungsfenster zustimmst.
      </p>

      <h2 className="wp-sub pv-h">14. Änderungen</h2>
      <p className="wp-text">
        Ich passe diese Seite an, wenn sich die Website ändert. Das Datum oben zeigt die aktuelle Fassung.
      </p>
    </section>
  );
}

export default function PrivacyPage() {
  // Hidden on the live site until monetisation starts (app/lib/release.ts).
  if (!SHOW_MONETIZATION) notFound();
  return (
    <div className="journal wf-page">
      <Window>
        <div className="wf-crumb">
          <Link href="/" className="wf-btn wf-btn-red wf-btn-sm">Dungeons</Link>
          <a href="#en" className="wf-btn wf-btn-dark wf-btn-sm">English</a>
          <a href="#de" className="wf-btn wf-btn-dark wf-btn-sm">Deutsch</a>
        </div>
        <div className="wf-pane wf-pane-single wf-pane-parchment">
          <div className="wp pv">
            <English />
            <hr className="pv-rule" />
            <Deutsch />
          </div>
        </div>
      </Window>
    </div>
  );
}
