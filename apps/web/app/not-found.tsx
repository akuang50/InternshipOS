import Link from "next/link";

export default function NotFound() {
  return (
    <div className="auth">
      <div className="auth-card">
        <h1>That page isn&apos;t here.</h1>
        <p className="muted">The link may be old. Your applications are still on Home.</p>
        <Link className="btn btn-primary" href="/home">Back to Home</Link>
      </div>
    </div>
  );
}
