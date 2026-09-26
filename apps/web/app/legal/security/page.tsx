import { LegalPlaceholder } from "@/components/legal-placeholder";

export default function SecurityPage() {
  return (
    <LegalPlaceholder title="Security">
      <p className="muted">The production database plan is Supabase with row-level security, server-only secrets, and separate dev, staging, and production projects. A public security page should be reviewed before launch, including how to report a vulnerability.</p>
    </LegalPlaceholder>
  );
}
