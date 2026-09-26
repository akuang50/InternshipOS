import { LegalPlaceholder } from "@/components/legal-placeholder";

export default function CookiesPage() {
  return (
    <LegalPlaceholder title="Cookies">
      <p className="muted">The app sets an httpOnly session cookie named ios_session. Analytics cookies stay off unless someone opts in and a PostHog key is configured. A cookie notice for the public site still needs review.</p>
    </LegalPlaceholder>
  );
}
