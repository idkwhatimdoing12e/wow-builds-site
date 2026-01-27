import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-white/60 hover:text-white">
          ← Back
        </Link>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight">
          About
        </h1>

        <p className="mt-6 text-white/70 leading-relaxed">
          <strong>wowbuilds.pro</strong> is a fan-made World of Warcraft hub focused on fun low level
          builds from vanilla to wrath (for now).
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          The site started as a personal project to collect and share low-level and niche
          builds that are usually scattered across videos.
          The goal is to keep everything clean, readable, and easy to access.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          This project is created and maintained by a solo World of Warcraft player and
          content creator. It’s built slowly, iteratively, and mainly for players who enjoy
          experimenting with unusual or optimized builds.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          In the future, the site may expand beyond low-level builds to include arena PvP
          setups, class guides, and other theorycrafting content.
        </p>

        <p className="mt-6 text-white/70 leading-relaxed">
          World of Warcraft and all related trademarks are the property of Blizzard
          Entertainment. This website is not affiliated with Blizzard Entertainment or
          Wowhead and is provided as a community fan project.
        </p>
      </div>
    </main>
  );
}