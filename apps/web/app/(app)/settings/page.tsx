"use client";

import { useIOS } from "@/components/provider";
import type { PrivacySettings } from "@internshipos/types";
import { useState } from "react";

export default function SettingsPage() {
  const ios = useIOS();
  const profile = ios.profile;
  const [email, setEmail] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!profile) return null;

  async function savePrivacy(privacy: PrivacySettings) {
    await ios.saveProfile({ ...profile, privacy });
    ios.setFlash("Privacy settings saved.");
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>Settings</h1>
        <p className="lead">Signed in as {profile.email}.</p>
      </header>
      <section className="card">
        <h2>Your data</h2>
        <ul className="checklist">
          <li>Resume {ios.resume ? "saved" : "not added"}</li>
          <li>Applications {ios.applications.length}</li>
          <li>Networking not connected</li>
          <li>Interview history not connected</li>
          <li>AI conversation history not stored — interview chat does not exist yet</li>
        </ul>
        <div className="row">
          <button
            className="btn"
            onClick={async () => {
              const response = await fetch("/api/privacy");
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "internshipos-data.json";
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download my data
          </button>
          <button
            className="btn"
            onClick={async () => {
              const response = await fetch("/api/privacy");
              const data = await response.json();
              const blob = new Blob([JSON.stringify(data.applications ?? [], null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "internshipos-applications.json";
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export applications
          </button>
          <button className="btn btn-danger" onClick={async () => {
            await fetch("/api/privacy?target=resume", { method: "DELETE" });
            await ios.refresh();
            ios.setFlash("Resume deleted. Applications no longer have tailored drafts.");
          }}>Delete my resume</button>
        </div>
      </section>
      <section className="card">
        <h2>AI privacy</h2>
        <Toggle
          checked={profile.privacy.personalizeFromProfile}
          label="Personalize from my profile"
          help="On: matches and drafts can quote your resume bullets. Off: matches use only the skills and preferences you stated."
          onChange={(value) => savePrivacy({ ...profile.privacy, personalizeFromProfile: value })}
        />
        <Toggle
          checked={profile.privacy.saveAiHistory}
          label="Save AI conversation history"
          help="There are no interview transcripts yet. When that module exists, this switch controls those transcripts. Application drafts you edit stay saved because they are your documents."
          onChange={(value) => savePrivacy({ ...profile.privacy, saveAiHistory: value })}
        />
        <Toggle
          checked={profile.privacy.shareAnonymizedProductData}
          label="Share anonymized product data"
          help="On: we store event names like cover_letter_generated with role family and timing. Resume text, answers, and messages are never included."
          onChange={(value) => savePrivacy({ ...profile.privacy, shareAnonymizedProductData: value })}
        />
      </section>
      <section className="card">
        <h2>Delete account</h2>
        <p className="muted">This removes your profile, resume, applications, uploads, sessions, and draft history from this machine. Job listings stay in the shared catalog. This cannot be undone here.</p>
        {confirming ? (
          <>
            <label className="field"><span>Type {profile.email} to confirm</span><input className="input" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
            {error ? <p className="warn" role="alert">{error}</p> : null}
            <button
              className="btn btn-danger"
              onClick={async () => {
                const response = await fetch("/api/privacy?target=account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                  setError(data.error || "Could not delete the account.");
                  return;
                }
                window.location.href = "/";
              }}
            >
              Delete account permanently
            </button>
          </>
        ) : (
          <button className="btn btn-danger" onClick={() => setConfirming(true)}>Delete account</button>
        )}
      </section>
      <section className="card">
        <h2>Sign out</h2>
        <button className="btn" onClick={() => ios.logout()}>Sign out</button>
      </section>
      <p className="tiny"><a href="/legal">Privacy, terms, and deletion</a> are placeholders until they are reviewed.</p>
    </div>
  );
}

function Toggle({ checked, label, help, onChange }: { checked: boolean; label: string; help: string; onChange: (value: boolean) => void }) {
  return (
    <label className="spread">
      <span><strong>{label}</strong><span className="tiny" style={{ display: "block" }}>{help}</span></span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
