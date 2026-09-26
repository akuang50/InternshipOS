import { LegalPlaceholder } from "@/components/legal-placeholder";

export default function DataDeletionPage() {
  return (
    <LegalPlaceholder title="Data deletion">
      <p className="muted">Signed-in users can delete a resume or an account from Settings on this machine. A public deletion page has to explain the same process for the hosted database, including what is removed and what is retained. That explanation is not final.</p>
    </LegalPlaceholder>
  );
}
