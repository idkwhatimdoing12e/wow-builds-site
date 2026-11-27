import Link from "next/link";
import { CONTACT_EMAIL, LINKS } from "@/app/lib/site";
import { SHOW_COMMENTS, SHOW_MONETIZATION } from "@/app/lib/release";
import Window from "@/app/components/journal/Window";
import ConsentSettingsButton from "@/app/components/site/ConsentSettingsButton";

// The privacy page's text, in English (/privacy) and German (/de/privacy).
// ------------------------------------------------------------------------------
const CONTROLLER = { email: CONTACT_EMAIL };
// Google Analytics > Admin > Data collection and modification > Data retention.
// "2 months" is Google's default; change both lines if it is set to 14 months.
const GA_RETENTION = { en: "2 months", de: "2 Monate" };
const UPDATED = { en: "27 November 2026", de: "27. November 2026" };
// ------------------------------------------------------------------------------

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
          <li>
            Your character code stays in your browser.{" "}
            {SHOW_COMMENTS
              ? "Only if you sign in to comment are your character’s name and details sent, and shown with your comments."
              : "It is never sent to this site’s server."}
          </li>
          <li>
            {SHOW_MONETIZATION
              ? "If you visit from the EU, the UK or Switzerland, no ad or analytics cookies are set until you say yes. Saying no still gets you the whole journal."
              : "Ads are not switched on yet. When they are, visitors from the EU, the UK and Switzerland will be asked first, and no ad or analytics cookies will be set until they say yes. Saying no will still get you the whole journal."}
          </li>
          {SHOW_MONETIZATION && <li>You can change your choice at any time:</li>}
        </ul>
        {SHOW_MONETIZATION && (
          <ConsentSettingsButton
            label="Change my cookie choices"
            unavailable="The consent window could not be opened. Usually a blocker stops it from loading, or you are outside the EU, UK and Switzerland, where it is not shown. While it is blocked, no ad or analytics cookies are set through it."
          />
        )}
      </div>

      <h2 className="wp-sub pv-h">1. Who runs this site</h2>
      <p className="wp-text">
        Email: <Mail />. I run this site on my own and am responsible for the data processing described here (the
        “controller” under the GDPR).
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
        This site is hosted by Cloudflare, Inc. (USA). To deliver a page, Cloudflare’s servers process your IP address, the page
        you asked for, the time and your browser’s identification, and keep short-lived logs to run the service and keep
        it secure. The site’s fonts and pictures are served from this site too, so no other company is contacted for
        them. Legal basis: Art. 6(1)(f) GDPR (my legitimate interest in a working, secure website). See{" "}
        <Ext href="https://www.cloudflare.com/privacypolicy/">Cloudflare’s privacy policy</Ext>.
      </p>

      <h2 className="wp-sub pv-h">4. Your character (My Character)</h2>
      <p className="wp-text">
        When you paste the code from <strong>/dj export</strong>, it is read in your browser. The code lives in the part
        of the address after the # and in your browser’s local storage. Browsers never send the part after the # to a
        server, so your character’s name, realm and progress never reach this site’s server
        {SHOW_COMMENTS ? ", unless you sign in to comment, which shows the character with your comments (section 5)" : ""}. The <strong>Forget</strong>{" "}
        button on the character page deletes the saved code from your browser.
      </p>
      <p className="wp-text">
        A share link contains the code itself: anyone you give it to can see that character. If you agree to analytics,
        the site counts that a character was loaded or a share link was copied, with coarse details only (where it came
        from, class, faction, level), never the name, realm or code.
      </p>

      <h2 className="wp-sub pv-h">5. {SHOW_COMMENTS ? "Blue posts and comments (Discord sign-in)" : "Blue posts"}</h2>
      <p className="wp-text">
        The Blue Posts pages show posts by Blizzard staff from the official World of Warcraft forums. This site fetches
        them from Blizzard’s forum itself and shows the forum’s pictures and avatars through this site, so your browser
        does not contact Blizzard{SHOW_COMMENTS ? " or Discord" : ""} while you read.
      </p>
{SHOW_COMMENTS && (
        <>
      <p className="wp-text">
        To comment, you sign in with Discord. Discord tells this site your Discord user ID, display name and avatar
        (the “identify” permission only: never your email address or your servers). I store those, your comments and
        when you wrote them, the comments you report, and the characters you add (commenting needs one, and you can keep
        up to 10): their name, realm, class, race, sex, level and faction, read from your /dj export code in your
        browser. Other readers see your comments with the character you wrote them as, and nothing else:{" "}
        <strong>your Discord name, avatar and ID are never shown to them</strong>. Only I, as the site’s operator, can
        see which Discord account wrote a comment, for moderation. A character’s name and realm can belong to one
        account only, so no one else can comment as it. A cookie (dj_sid) keeps you signed in for 30
        days; it is strictly necessary for signing in (§ 25(2) no. 2 TDDDG). The data is kept in a Cloudflare D1
        database in Western Europe.
      </p>
      <p className="wp-text">
        Legal basis: Art. 6(1)(b) GDPR (the comment feature you sign up for) and, for moderation (posting limits,
        reports, bans), Art. 6(1)(f) GDPR (my legitimate interest in keeping comments free of spam and abuse). Your
        comments stay until you delete them or I remove them for breaking the rules. <strong>Delete my account</strong>{" "}
        under the comments deletes your account, comments and reports at once; for a banned account only the Discord
        ID is kept, so the ban holds. See <Ext href="https://discord.com/privacy">Discord’s privacy policy</Ext>.
      </p>

        </>
      )}

      <h2 className="wp-sub pv-h">6. Things saved in your browser</h2>
      <p className="wp-text">
        The site saves a few things in your browser’s local and session storage so its features work: your faction
        choice, display options, your character code (see above) and the pages you came from, so the Back button works.
        None of it is sent anywhere. Because this storage is strictly necessary for features you use, it needs no
        consent (§ 25(2) no. 2 TDDDG). You can delete it at any time in your browser settings.
      </p>

      <h2 className="wp-sub pv-h">7. The consent window</h2>
      <p className="wp-text">
        {!SHOW_MONETIZATION && "Ads are not switched on yet, so this window does not appear yet. Once they are: "}
        If you visit from the EU/EEA, the UK or Switzerland, Google’s consent tool shows a consent window. Google
        certifies this tool for the IAB Transparency &amp; Consent Framework. The window lists the ad partners and what
        they want to do, and saves your choice in a cookie so you are not asked on every page. You can change or withdraw
        your choice at any time with {SHOW_MONETIZATION ? "the button at the top of this page or " : ""}the “Privacy and
        cookie settings” link Google adds to the site. Legal basis for saving your choice: Art. 6(1)(c) GDPR with Art. 7(1) GDPR, and § 25(2) no. 2
        TDDDG.
      </p>

      <h2 className="wp-sub pv-h">8. Ads (Google AdSense)</h2>
      <p className="wp-text">
        {!SHOW_MONETIZATION && "Ads are not switched on yet; this is how they will work. "}
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

      <h2 className="wp-sub pv-h">9. Google Analytics</h2>
      <p className="wp-text">
        To see which pages are used and to fix what doesn’t work, the site uses Google Analytics 4 (Google Ireland
        Limited). {SHOW_MONETIZATION ? "With your consent it records" : "It records"} the pages you view, the site you came from, your device and browser,
        your approximate location (country and city, worked out from your IP address) and the anonymous character
        counts from section 4. The part of the address after the # is never sent.{" "}
        {SHOW_MONETIZATION
          ? "If you visit from the EU/EEA, the UK or Switzerland, Analytics sets no cookies until you agree in the consent window (Google Consent Mode). Until then, Google only receives cookieless signals without identifiers, which it uses for estimated, combined visit counts."
          : "For now, Analytics sets cookies to tell visits apart. Once ads are switched on, visitors from the EU/EEA, the UK and Switzerland will be asked first, and Analytics will set no cookies until they agree (Google Consent Mode); until then Google will only receive cookieless signals without identifiers."} The data is kept for {GA_RETENTION.en}. Legal basis: Art. 6(1)(a) GDPR and § 25(1) TDDDG; for the
        cookieless signals, Art. 6(1)(f) GDPR (my legitimate interest in basic visit statistics).
      </p>

      <h2 className="wp-sub pv-h">10. Visitor counts (Cloudflare)</h2>
      <p className="wp-text">
        Cloudflare counts requests, pages, countries and device types from the records its servers keep anyway (section
        3). It uses no cookies and stores nothing on your device, and I only see the combined totals. Legal basis: Art.
        6(1)(f) GDPR (my legitimate interest in knowing how much the site is used).
      </p>

      <h2 className="wp-sub pv-h">11. Links to other sites</h2>
      <p className="wp-text">
        Links to <Ext href={LINKS.curseforge}>CurseForge</Ext>, <Ext href={LINKS.wago}>Wago</Ext>,{" "}
        <Ext href={LINKS.discord}>Discord</Ext>, <Ext href={LINKS.youtube}>YouTube</Ext>,{" "}
        <Ext href={LINKS.patreon}>Patreon</Ext> and <Ext href={LINKS.donate}>Buy Me a Coffee</Ext> are plain links.
        Nothing is loaded from those sites until you click. After that, their privacy policies apply.
      </p>

      <h2 className="wp-sub pv-h">12. Data sent outside the EU</h2>
      <p className="wp-text">
        Cloudflare{SHOW_COMMENTS ? ", Google and, when you sign in with it, Discord" : " and Google"} may process data in the USA. For US companies certified under the EU-US
        Data Privacy Framework, the European Commission has decided that the level of protection is adequate (Art. 45
        GDPR). Otherwise the providers rely on the EU standard contractual clauses (Art. 46(2)(c) GDPR).
      </p>

      <h2 className="wp-sub pv-h">13. Your rights</h2>
      <p className="wp-text">
        You have the right to access your data (Art. 15 GDPR), to have it corrected (Art. 16), deleted (Art. 17) or
        restricted (Art. 18), and to receive it in a portable format (Art. 20). You can withdraw your consent at any time
        with effect for the future (Art. 7(3)). <strong>Where I rely on legitimate interest, you can object at any time
        for reasons arising from your situation (Art. 21 GDPR).</strong> Just email <Mail />.{" "}
        {SHOW_COMMENTS ? "Apart from comment accounts (section 5), I don’t know who you are" : "I have no accounts and don’t know who you are"}, so for ad and analytics data Google’s own tools are often the
        quickest route.
      </p>
      <p className="wp-text">
        You can also complain to a data protection authority, for example the one in the country where you live.
      </p>

      <h2 className="wp-sub pv-h">14. Children</h2>
      <p className="wp-text">
        Everyone is welcome to use the journal. Saying yes to ad and analytics cookies is a choice the law leaves to
        people aged 16 and over, so if you are younger, please ask a parent before you agree in the consent window.
        {SHOW_COMMENTS && " Commenting needs a Discord account, which Discord only allows from age 13 (older in some countries)."}
      </p>

      <h2 className="wp-sub pv-h">15. Dungeon Journal Companion</h2>
      <p className="wp-text">
        If you use the optional Dungeon Journal Companion app, it sends what its addon records inside dungeons and raids
        to foreverjournal.pro: the items in corpses and chests you loot, the creatures you kill and the level and rank
        they show, and the dungeon and raid quests you accept, progress and hand in, with their rewards. Each record also
        includes your game’s language and your character’s level. No character names, realm names, account names, chat,
        or anything from outside dungeons and raids is sent.
      </p>
      <p className="wp-text">
        The app has a random ID so the same kill sent by several group members counts once and a bad source can be
        blocked. That ID isn’t linked to your Discord account or anything else, and the site doesn’t store your IP address
        with these uploads. The data is used to check and improve the Dungeon Journal’s loot, boss levels and quests. You
        can pause the app, see what it sent last, or uninstall it from its own page at any time.
      </p>

      <h2 className="wp-sub pv-h">16. Changes</h2>
      <p className="wp-text">
        I update this page when the site changes. The date at the top shows the current version.
      </p>
    </section>
  );
}

function Deutsch() {
  return (
    <section id="de" lang="de" className="pv-lang">
      <h1 className="wp-title pv-title">Datenschutzerklärung</h1>
      <p className="wp-note">Stand: {UPDATED.de}</p>

      <div className="pv-short">
        <h2 className="wp-sub">Kurz gesagt</h2>
        <ul className="pv-list">
          <li>Dungeon Journal ist kostenlos und von einem Spieler gemacht. Werbung bezahlt diese Seite und hält das Addon aktuell.</li>
          <li>
            Dein Charakter-Code bleibt in deinem Browser.{" "}
            {SHOW_COMMENTS
              ? "Nur wenn du dich zum Kommentieren anmeldest, werden Name und Angaben deines Charakters geschickt und bei deinen Kommentaren angezeigt."
              : "Er wird nie an den Server dieser Seite geschickt."}
          </li>
          <li>
            {SHOW_MONETIZATION
              ? "Wenn du aus der EU, dem Vereinigten Königreich oder der Schweiz kommst, werden Werbe- und Analyse-Cookies erst gesetzt, nachdem du zugestimmt hast. Auch ohne Zustimmung bekommst du das ganze Journal."
              : "Werbung ist noch nicht eingeschaltet. Sobald sie es ist, werden Besucher aus der EU, dem Vereinigten Königreich und der Schweiz zuerst gefragt, und Werbe- und Analyse-Cookies werden erst nach ihrer Zustimmung gesetzt. Auch ohne Zustimmung bekommst du dann das ganze Journal."}
          </li>
          {SHOW_MONETIZATION && <li>Deine Auswahl kannst du jederzeit ändern:</li>}
        </ul>
        {SHOW_MONETIZATION && (
          <ConsentSettingsButton
            label="Cookie-Einstellungen ändern"
            unavailable="Das Einwilligungsfenster ließ sich nicht öffnen. Meist verhindert ein Blocker, dass es lädt, oder du bist außerhalb der EU, des Vereinigten Königreichs und der Schweiz, wo es nicht angezeigt wird. Solange es blockiert ist, werden darüber keine Werbe- oder Analyse-Cookies gesetzt."
          />
        )}
      </div>

      <h2 className="wp-sub pv-h">1. Verantwortlicher</h2>
      <p className="wp-text">
        E-Mail: <Mail />. Ich betreibe diese Seite allein und bin für die hier beschriebene Datenverarbeitung
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
        Diese Seite wird von Cloudflare, Inc. (USA) gehostet. Um eine Seite auszuliefern, verarbeiten die Server von Cloudflare
        deine IP-Adresse, die aufgerufene Seite, die Uhrzeit und die Kennung deines Browsers und speichern kurzlebige
        Protokolle für Betrieb und Sicherheit. Schriftarten und Bilder kommen ebenfalls von dieser Seite, dafür wird also
        keine andere Firma kontaktiert. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (mein berechtigtes Interesse an
        einer funktionierenden, sicheren Website). Siehe die{" "}
        <Ext href="https://www.cloudflare.com/privacypolicy/">Datenschutzerklärung von Cloudflare</Ext>.
      </p>

      <h2 className="wp-sub pv-h">4. Dein Charakter (Mein Charakter)</h2>
      <p className="wp-text">
        Wenn du den Code aus <strong>/dj export</strong> einfügst, wird er in deinem Browser gelesen. Der Code steht im Teil
        der Adresse nach dem # und im lokalen Speicher deines Browsers. Browser schicken den Teil nach dem # nie an einen
        Server, deshalb erreichen Name, Realm und Fortschritt deines Charakters nie den Server dieser Seite
        {SHOW_COMMENTS ? ", außer du meldest dich zum Kommentieren an, dann steht der Charakter bei deinen Kommentaren (Abschnitt 5)" : ""}. Der Button{" "}
        <strong>Forget</strong> auf der Charakterseite löscht den gespeicherten Code aus deinem Browser.
      </p>
      <p className="wp-text">
        Ein Teilen-Link enthält den Code selbst: Jeder, dem du ihn gibst, kann diesen Charakter sehen. Wenn du der Analyse
        zustimmst, zählt die Seite, dass ein Charakter geladen oder ein Teilen-Link kopiert wurde, nur mit groben Angaben
        (Herkunft, Klasse, Fraktion, Stufe), nie mit Name, Realm oder Code.
      </p>

      <h2 className="wp-sub pv-h">5. {SHOW_COMMENTS ? "Blue Posts und Kommentare (Anmeldung mit Discord)" : "Blue Posts"}</h2>
      <p className="wp-text">
        Die Blue-Posts-Seiten zeigen Beiträge von Blizzard-Mitarbeitern aus den offiziellen World-of-Warcraft-Foren.
        Diese Seite holt sie selbst aus dem Blizzard-Forum und zeigt die Bilder und Avatare des Forums über diese Seite
        an, sodass dein Browser beim Lesen {SHOW_COMMENTS ? "weder Blizzard noch Discord" : "Blizzard nicht"} kontaktiert.
      </p>
{SHOW_COMMENTS && (
        <>
      <p className="wp-text">
        Zum Kommentieren meldest du dich mit Discord an. Discord teilt dieser Seite deine Discord-Nutzer-ID, deinen
        Anzeigenamen und deinen Avatar mit (nur die Berechtigung „identify“: nie deine E-Mail-Adresse oder deine
        Server). Ich speichere diese Angaben, deine Kommentare mit Zeitpunkt, die Kommentare, die du meldest, und die
        Charaktere, die du hinzufügst (zum Kommentieren ist einer nötig, bis zu 10 sind möglich): Name, Realm, Klasse,
        Volk, Geschlecht, Stufe und Fraktion, in deinem Browser aus deinem /dj export-Code gelesen. Andere Leser sehen
        deine Kommentare nur mit dem Charakter, mit dem du sie geschrieben hast:{" "}
        <strong>dein Discord-Name, dein Avatar und deine ID werden ihnen nie gezeigt</strong>. Nur ich als Betreiber
        der Seite kann zur Moderation sehen, welches Discord-Konto einen Kommentar geschrieben hat. Name und Realm eines
        Charakters können nur zu einem Konto gehören, damit niemand sonst als dieser Charakter kommentieren kann. Ein
        Cookie (dj_sid) hält dich 30 Tage angemeldet; es
        ist für die Anmeldung unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Die Daten liegen in einer
        Cloudflare-D1-Datenbank in Westeuropa.
      </p>
      <p className="wp-text">
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (die Kommentarfunktion, für die du dich anmeldest) und für die
        Moderation (Beitragslimits, Meldungen, Sperren) Art. 6 Abs. 1 lit. f DSGVO (mein berechtigtes Interesse an
        Kommentaren ohne Spam und Missbrauch). Deine Kommentare bleiben, bis du sie löschst oder ich sie wegen eines
        Regelverstoßes entferne. <strong>Mein Konto löschen</strong> unter den Kommentaren löscht dein Konto, deine
        Kommentare und deine Meldungen auf einmal; bei einem gesperrten Konto bleibt nur die Discord-ID gespeichert,
        damit die Sperre bestehen bleibt. Siehe die{" "}
        <Ext href="https://discord.com/privacy">Datenschutzerklärung von Discord</Ext>.
      </p>

        </>
      )}

      <h2 className="wp-sub pv-h">6. Was in deinem Browser gespeichert wird</h2>
      <p className="wp-text">
        Die Seite speichert ein paar Dinge im lokalen Speicher und Sitzungsspeicher deines Browsers, damit ihre Funktionen
        laufen: deine Fraktionswahl, Anzeigeoptionen, deinen Charakter-Code (siehe oben) und die zuvor besuchten Seiten,
        damit der Zurück-Button funktioniert. Nichts davon wird irgendwohin geschickt. Weil diese Speicherung für
        Funktionen, die du nutzt, unbedingt erforderlich ist, braucht sie keine Einwilligung (§ 25 Abs. 2 Nr. 2 TDDDG).
        Du kannst sie jederzeit in den Einstellungen deines Browsers löschen.
      </p>

      <h2 className="wp-sub pv-h">7. Das Einwilligungsfenster</h2>
      <p className="wp-text">
        {!SHOW_MONETIZATION && "Werbung ist noch nicht eingeschaltet, daher erscheint dieses Fenster noch nicht. Sobald sie es ist: "}
        Wenn du aus der EU/dem EWR, dem Vereinigten Königreich oder der Schweiz kommst, zeigt das Einwilligungs-Tool von
        Google ein Einwilligungsfenster. Google zertifiziert dieses Tool für das IAB Transparency &amp; Consent Framework.
        Das Fenster listet die Werbepartner und ihre Zwecke auf und speichert deine Auswahl in einem Cookie, damit du nicht
        auf jeder Seite gefragt wirst. Du kannst deine Auswahl jederzeit ändern oder widerrufen,{" "}
        {SHOW_MONETIZATION ? "mit dem Button oben auf dieser Seite oder " : ""}über den Link „Privacy and cookie settings“,
        den Google auf der Seite einblendet. Rechtsgrundlage
        für das Speichern deiner Auswahl: Art. 6 Abs. 1 lit. c DSGVO i. V. m. Art. 7 Abs. 1 DSGVO sowie § 25 Abs. 2 Nr. 2
        TDDDG.
      </p>

      <h2 className="wp-sub pv-h">8. Werbung (Google AdSense)</h2>
      <p className="wp-text">
        {!SHOW_MONETIZATION && "Werbung ist noch nicht eingeschaltet; so wird sie funktionieren. "}
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

      <h2 className="wp-sub pv-h">9. Google Analytics</h2>
      <p className="wp-text">
        Um zu sehen, welche Seiten genutzt werden, und um Fehler zu beheben, nutzt die Seite Google Analytics 4 (Google
        Ireland Limited). {SHOW_MONETIZATION ? "Mit deiner Einwilligung erfasst es" : "Es erfasst"} die aufgerufenen Seiten, die Seite, von der du kommst, dein
        Gerät und Browser, deinen ungefähren Standort (Land und Stadt, aus deiner IP-Adresse ermittelt) und die anonymen
        Charakter-Zählungen aus Abschnitt 4. Der Teil der Adresse nach dem # wird nie übertragen.{" "}
        {SHOW_MONETIZATION
          ? "Wenn du aus der EU/dem EWR, dem Vereinigten Königreich oder der Schweiz kommst, setzt Analytics keine Cookies, bis du im Einwilligungsfenster zustimmst (Google Consent Mode). Bis dahin erhält Google nur cookielose Signale ohne Kennungen, die es für geschätzte, zusammengefasste Besuchszahlen nutzt."
          : "Derzeit setzt Analytics Cookies, um Besuche zu unterscheiden. Sobald Werbung eingeschaltet ist, werden Besucher aus der EU/dem EWR, dem Vereinigten Königreich und der Schweiz zuerst gefragt, und Analytics setzt keine Cookies, bis sie zustimmen (Google Consent Mode); bis dahin erhält Google nur cookielose Signale ohne Kennungen."} Die Daten werden {GA_RETENTION.de}{" "}
        gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG; für die cookielosen Signale Art.
        6 Abs. 1 lit. f DSGVO (mein berechtigtes Interesse an einfachen Besucherzahlen).
      </p>

      <h2 className="wp-sub pv-h">10. Besucherzählung (Cloudflare)</h2>
      <p className="wp-text">
        Cloudflare zählt Aufrufe, Seiten, Länder und Gerätetypen aus den Protokollen, die seine Server ohnehin führen
        (Abschnitt 3). Es nutzt keine Cookies und speichert nichts auf deinem Gerät, und ich sehe nur die
        zusammengefassten Zahlen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (mein berechtigtes Interesse daran, zu
        wissen, wie viel die Seite genutzt wird).
      </p>

      <h2 className="wp-sub pv-h">11. Links zu anderen Seiten</h2>
      <p className="wp-text">
        Links zu <Ext href={LINKS.curseforge}>CurseForge</Ext>, <Ext href={LINKS.wago}>Wago</Ext>,{" "}
        <Ext href={LINKS.discord}>Discord</Ext>, <Ext href={LINKS.youtube}>YouTube</Ext>,{" "}
        <Ext href={LINKS.patreon}>Patreon</Ext> und <Ext href={LINKS.donate}>Buy Me a Coffee</Ext> sind einfache Links.
        Von diesen Seiten wird nichts geladen, bis du klickst. Danach gelten deren Datenschutzerklärungen.
      </p>

      <h2 className="wp-sub pv-h">12. Übermittlung außerhalb der EU</h2>
      <p className="wp-text">
        {SHOW_COMMENTS ? "Cloudflare, Google und, wenn du dich damit anmeldest, Discord können" : "Cloudflare und Google können"} Daten in den USA verarbeiten. Für US-Unternehmen, die unter dem
        EU-US Data Privacy Framework zertifiziert sind, hat die Europäische Kommission ein angemessenes Schutzniveau
        festgestellt (Art. 45 DSGVO). Andernfalls stützen sich die Anbieter auf die EU-Standardvertragsklauseln (Art. 46
        Abs. 2 lit. c DSGVO).
      </p>

      <h2 className="wp-sub pv-h">13. Deine Rechte</h2>
      <p className="wp-text">
        Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
        Verarbeitung (Art. 18) und Datenübertragbarkeit (Art. 20). Eine Einwilligung kannst du jederzeit mit Wirkung für
        die Zukunft widerrufen (Art. 7 Abs. 3). <strong>Soweit ich mich auf ein berechtigtes Interesse stütze, kannst du
        aus Gründen, die sich aus deiner besonderen Situation ergeben, jederzeit widersprechen (Art. 21 DSGVO).</strong>{" "}
        Schreib einfach an <Mail />.{" "}
        {SHOW_COMMENTS ? "Abgesehen von Kommentar-Konten (Abschnitt 5) weiß ich nicht, wer du bist" : "Ich habe keine Nutzerkonten und weiß nicht, wer du bist"}, daher sind
        für Werbe- und Analysedaten oft die Tools von Google der schnellste Weg.
      </p>
      <p className="wp-text">
        Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der in deinem Land.
      </p>

      <h2 className="wp-sub pv-h">14. Kinder</h2>
      <p className="wp-text">
        Jeder kann das Journal nutzen. Die Zustimmung zu Werbe- und Analyse-Cookies überlässt das Gesetz Menschen ab 16
        Jahren. Wenn du jünger bist, frag deshalb bitte deine Eltern, bevor du im Einwilligungsfenster zustimmst.
        {SHOW_COMMENTS &&
          " Zum Kommentieren brauchst du ein Discord-Konto, das Discord erst ab 13 Jahren erlaubt (in manchen Ländern ab einem höheren Alter)."}
      </p>

      <h2 className="wp-sub pv-h">15. Dungeon Journal Companion</h2>
      <p className="wp-text">
        Wenn du die optionale App Dungeon Journal Companion nutzt, schickt sie an foreverjournal.pro, was ihr Addon in
        Dungeons und Schlachtzügen aufzeichnet: die Gegenstände in Leichen und Truhen, die du plünderst, die Kreaturen,
        die du tötest, mit der Stufe und dem Rang, die sie anzeigen, und die Dungeon- und Schlachtzugsquests, die du
        annimmst, voranbringst und abgibst, mit ihren Belohnungen. Jeder Eintrag enthält außerdem die Sprache deines
        Spiels und die Stufe deines Charakters. Charakternamen, Realmnamen, Kontonamen, Chat oder irgendetwas von
        außerhalb von Dungeons und Schlachtzügen werden nicht geschickt.
      </p>
      <p className="wp-text">
        Die App hat eine zufällige ID, damit derselbe Kill, den mehrere Gruppenmitglieder schicken, nur einmal zählt und
        eine fehlerhafte Quelle gesperrt werden kann. Diese ID ist nicht mit deinem Discord-Konto oder irgendetwas anderem
        verknüpft, und die Seite speichert deine IP-Adresse nicht zusammen mit diesen Uploads. Die Daten dienen dazu,
        Beute, Bossstufen und Quests im Dungeon Journal zu prüfen und zu verbessern. Du kannst die App jederzeit auf ihrer
        eigenen Seite pausieren, sehen, was sie zuletzt geschickt hat, oder sie deinstallieren.
      </p>

      <h2 className="wp-sub pv-h">16. Änderungen</h2>
      <p className="wp-text">
        Ich passe diese Seite an, wenn sich die Website ändert. Das Datum oben zeigt die aktuelle Fassung.
      </p>
    </section>
  );
}

/** The privacy page in one language, with a link to the other. */
export default function PrivacyBody({ lang }: { lang: "en" | "de" }) {
  return (
    <div className="journal wf-page">
      <Window>
        <div className="wf-crumb">
          <Link href={lang === "de" ? "/de" : "/"} className="wf-btn wf-btn-red wf-btn-sm">Dungeons</Link>
          {lang === "de" ? (
            <Link href="/privacy" className="wf-btn wf-btn-dark wf-btn-sm" hrefLang="en">English</Link>
          ) : (
            <Link href="/de/privacy" className="wf-btn wf-btn-dark wf-btn-sm" hrefLang="de">Deutsch</Link>
          )}
        </div>
        <div className="wf-pane wf-pane-single wf-pane-parchment">
          <div className="wp pv">{lang === "de" ? <Deutsch /> : <English />}</div>
        </div>
      </Window>
    </div>
  );
}
