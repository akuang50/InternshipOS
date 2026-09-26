"use client";

import { useIOS } from "@/components/provider";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const ios = useIOS();
  const [name, setName] = useState("");
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
            await ios.signup({ name, email, password });
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Could not create your account.");
            setPending(false);
          }
        }}
      >
        <div className="brand"><span className="mark">IO</span> InternshipOS</div>
        <h1>Create your account</h1>
        <p className="muted">Your profile stays on this machine until a database is connected. Passwords are hashed.</p>
        <label className="field"><span>Name</span><input className="input" value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label className="field"><span>Email</span><input className="input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="field"><span>Password</span><input className="input" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label>
        {error ? <p className="warn" role="alert">{error}</p> : null}
        <button className="btn btn-primary" disabled={pending} type="submit">{pending ? "Creating…" : "Continue"}</button>
        <p className="muted">Already have an account? <Link href="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
