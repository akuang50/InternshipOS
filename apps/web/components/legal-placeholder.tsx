import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPlaceholder({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="auth">
      <article className="auth-card">
        <Link href="/">InternshipOS</Link>
        <h1>{title}</h1>
        <p className="banner-warn banner">
          This is not a legal document. Leave public signups closed until a lawyer writes and reviews the real page. Resume and account data need that review first.
        </p>
        {children}
        <p className="tiny">
          <Link href="/legal">All launch documents</Link>
        </p>
      </article>
    </div>
  );
}
