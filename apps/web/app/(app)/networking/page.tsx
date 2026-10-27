"use client";

import { OutreachCard } from "@/components/outreach";
import { useIOS } from "@/components/provider";
import { EmptyState } from "@/components/states";
import { priorityScore } from "@internshipos/ai";
import Link from "next/link";

export default function NetworkingPage() {
  const ios = useIOS();
  const profile = ios.profile;
  if (!profile) return null;
  const ranked = [...ios.jobs]
    .sort((a, b) => priorityScore(b.match, b, false) - priorityScore(a.match, a, false))
    .slice(0, 12);

  return (
    <div className="page">
      <header className="page-head">
        <h1>Who to email</h1>
        <p className="lead">
          For each role, this says whether a note to the founder or to campus recruiting is worth sending, and drafts it from your resume. InternshipOS does not send mail. Connecting an inbox can come later.
        </p>
      </header>
      <p className="banner">
        Addresses are the hiring inboxes attached to these listings. They are not personal emails of real employees. Confirm each one on the company site before you send.
      </p>
      {ranked.length === 0 ? (
        <EmptyState title="No roles to write about yet" body="Once listings are in, each one gets a send, optional, or skip recommendation." action={<Link className="btn btn-primary" href="/opportunities">Open opportunities</Link>} />
      ) : (
        ranked.map((job) => (
          <OutreachCard key={job.id} job={job} profile={profile} resume={ios.resume} match={job.match} />
        ))
      )}
    </div>
  );
}
