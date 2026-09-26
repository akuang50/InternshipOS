"use client";

import { matchBadgeClass } from "@/components/match";
import { useIOS } from "@/components/provider";
import { EmptyState } from "@/components/states";
import Link from "next/link";

export default function SavedPage() {
  const ios = useIOS();
  const saved = ios.applications.filter((app) => app.saved);
  return (
    <div className="page">
      <header className="page-head"><h1>Saved</h1><p className="lead">Roles you want to come back to.</p></header>
      {saved.length === 0 ? (
        <EmptyState title="Nothing saved" body="Save a role from Opportunities and it will stay here, even before it is in the queue." action={<Link className="btn btn-primary" href="/opportunities">Browse roles</Link>} />
      ) : (
        <div className="stack">
          {saved.map((app) => (
            <article key={app.id} className="card">
              <div className="spread">
                <div><strong>{app.job.company}</strong><div>{app.job.title}</div></div>
                <span className={matchBadgeClass(app.match.label)}>{app.match.overall}%</span>
              </div>
              <div className="row">
                <Link className="btn" href={`/opportunities?job=${app.jobId}`}>View role</Link>
                <button className="btn" onClick={() => ios.trackJob(app.jobId, "queue")}>Add to queue</button>
                <button className="btn btn-ghost" onClick={() => ios.updateApplication(app.id, app.status === "saved" ? { remove: true } : { saved: false })}>Unsave</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
