"use client";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="error-box card" role="alert">
      <h2>This page hit an error.</h2>
      <p className="muted">Your saved applications are still stored. Try loading the page again.</p>
      <button className="btn btn-primary" onClick={reset}>Try again</button>
    </div>
  );
}
