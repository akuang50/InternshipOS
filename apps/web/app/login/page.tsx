"use client";

import { useIOS } from "@/components/provider";
import { safeNext } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const ios = useIOS();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="auth">
      <form
        className="auth-card"
        onSubmit={async (event) => {
          event.preventDefault();
          setPending(true);
          setError(null);
          try {
            const dest = await ios.login({ email, password });
            const next = dest === "onboarding" ? "/onboarding" : safeNext(new URLSearchParams(window.location.search).get("next"));
            router.push(dest === "onboarding" ? "/onboarding" : next);
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Could not sign you in.");
          } finally {
            setPending(false);
          }
        }}
      >
        <div className="brand"><span className="mark">IO</span> InternshipOS</div>
        <h1>Sign in</h1>
        <label className="field"><span>Email</span><input className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="field"><span>Password</span><input className="input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error ? <p className="warn" role="alert">{error}</p> : null}
        <button className="btn btn-primary" disabled={pending} type="submit">{pending ? "Signing in…" : "Sign in"}</button>
        <p className="muted">New here? <Link href="/signup">Create an account</Link></p>
      </form>
    </div>
  );
}
