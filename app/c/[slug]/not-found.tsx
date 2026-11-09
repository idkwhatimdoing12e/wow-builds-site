import Link from "next/link";
export default function Missing() {
  return (
    <div className="journal wf-page">
      <h1>Character not found</h1>
      <p>
        This link has not been published, or its export expired after 12 months
        without an update.
      </p>
      <Link className="wf-btn" href="/character">
        Import a character
      </Link>
    </div>
  );
}
