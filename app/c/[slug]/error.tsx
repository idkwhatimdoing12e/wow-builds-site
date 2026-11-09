"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="journal wf-page">
      <h1>Character temporarily unavailable</h1>
      <p>Please try again in a moment.</p>
      <button onClick={reset} className="wf-btn">
        Try again
      </button>
    </div>
  );
}
