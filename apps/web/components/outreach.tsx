"use client";

import { planOutreach } from "@internshipos/ai";
import type { Job, MatchResult, Profile, Resume } from "@internshipos/types";
import { useState } from "react";

export function OutreachCard({
  job,
  profile,
  resume,
  match,
  compact = false,
}: {
  job: Job;
  profile: Profile;
  resume: Resume | null;
  match: MatchResult;
  compact?: boolean;
}) {
  const plan = planOutreach({ job, profile, resume, match });
  const [copied, setCopied] = useState(false);
  const mailto = `mailto:${plan.contact.email}?subject=${encodeURIComponent(plan.subject)}&body=${encodeURIComponent(plan.body)}`;
  const tone = plan.action === "send" ? "badge-strong" : plan.action === "optional" ? "badge-stretch" : "badge-low";

  if (compact) {
    return (
      <p className="tiny">
        <span className={`badge ${tone}`}>{plan.action === "skip" ? "Skip email" : plan.action === "send" ? "Email" : "Optional email"}</span>{" "}
        {plan.headline}
      </p>
    );
  }

  return (
    <section className="card" id="outreach">
      <div className="spread">
        <div>
          <p className="kicker">Should you email someone?</p>
          <h2>{plan.headline}</h2>
        </div>
        <span className={`badge ${tone}`}>{plan.action === "send" ? "Worth sending" : plan.action === "optional" ? "Optional" : "Skip"}</span>
      </div>
      <p className="muted">{plan.reason}</p>
      <p>
        <strong>{plan.contact.name}</strong>
        <span className="tiny"> · {plan.contact.title}</span>
      </p>
      <p><a href={mailto}>{plan.contact.email}</a></p>
      <p className="tiny">This is the hiring inbox attached to the listing, not a personal address of a real employee we looked up. Confirm it on the company site before you send. A wrong inbox does not help the application.</p>
      <label className="field">
        <span>Draft</span>
        <input className="input" readOnly value={plan.subject} aria-label="Email subject" />
        <textarea className="textarea" readOnly value={plan.body} aria-label="Email draft" />
      </label>
      <div className="row">
        <button
          className="btn"
          onClick={async () => {
            await navigator.clipboard.writeText(`To: ${plan.contact.email}\nSubject: ${plan.subject}\n\n${plan.body}`);
            setCopied(true);
          }}
        >
          {copied ? "Copied" : "Copy draft"}
        </button>
        {plan.action === "skip" ? null : <a className="btn btn-primary" href={mailto}>Open in your email</a>}
      </div>
      <p className="banner">Email is not connected. InternshipOS does not send this. Opening it in your mail app is the send step, and connecting an inbox can come later.</p>
    </section>
  );
}
