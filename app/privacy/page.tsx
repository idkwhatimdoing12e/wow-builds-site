import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-white/60 hover:text-white">
          ← Back
        </Link>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight">
          Privacy Policy
        </h1>

        <p className="mt-6 text-white/70 leading-relaxed">
          This website (<strong>wowbuilds.pro</strong>) is a fan project created by an
          individual World of Warcraft player and content creator. 
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          This site uses <strong>Google Analytics</strong> to understand how visitors use
          the website (for example which pages are visited or what device is used). This
          information is collected in an aggregated and anonymized way to help improve the
          site.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          This website may display advertisements in the future using services such as
          <strong> Google AdSense</strong>. Third-party vendors (including Google) may use
          cookies or similar technologies to show ads based on a user’s previous visits to
          this or other websites.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          Users can manage or opt out of personalized advertising by visiting{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-white/30 underline-offset-4 hover:decoration-white/70"
          >
            https://adssettings.google.com
          </a>.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          This website does not knowingly collect sensitive personal information.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          This site contains links to third-party websites (such as Wowhead). Each external
          website has its own privacy policies and practices which are not controlled by
          this site.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          If you have questions about this privacy policy, you can email exehntv@gmail.com
      
        </p>

        <p className="mt-10 text-sm text-white/40">
          Last updated: 2026
        </p>
      </div>
    </main>
  );
}