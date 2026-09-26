import { LegalPlaceholder } from "@/components/legal-placeholder";
import Link from "next/link";

export default function LegalIndexPage() {
  return (
    <LegalPlaceholder title="Before public signups">
      <p className="muted">These routes exist so the launch checklist has a place to publish real documents. They are placeholders, not policies copied from another product.</p>
      <ul>
        <li><Link href="/legal/privacy">Privacy</Link></li>
        <li><Link href="/legal/terms">Terms</Link></li>
        <li><Link href="/legal/security">Security</Link></li>
        <li><Link href="/legal/data-deletion">Data deletion</Link></li>
        <li><Link href="/legal/cookies">Cookies</Link></li>
      </ul>
    </LegalPlaceholder>
  );
}
