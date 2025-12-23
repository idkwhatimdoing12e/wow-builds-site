import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-white/60 hover:text-white">
          ← Back
        </Link>

        <h1 className="mt-6 text-5xl font-semibold tracking-tight">Privacy Policy</h1>

        <p className="mt-6 text-white/70 leading-relaxed">
          This website may display advertisements and use cookies or similar technologies
          to deliver and measure ads. Third-party vendors (including Google) may use cookies
          to serve ads based on a user’s prior visits to this website or other websites.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          Users may opt out of personalized advertising by visiting the relevant ad settings
          provided by the vendor. This website does not knowingly collect sensitive personal
          information.
        </p>

        <p className="mt-4 text-white/70 leading-relaxed">
          If you have questions about this policy, you can add a contact method here later.
        </p>
      </div>
    </main>
  );
}
