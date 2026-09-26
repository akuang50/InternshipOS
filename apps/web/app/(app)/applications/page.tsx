"use client";

import { matchBadgeClass } from "@/components/match";
import { useIOS } from "@/components/provider";
import { EmptyState } from "@/components/states";
import type { ApplicationStatus } from "@internshipos/types";
import Link from "next/link";
import { useState } from "react";

const FILTERS: Array<ApplicationStatus | "all" | "no_response"> = [
  "all",
  "queued",
  "ready",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "no_response",
];

export default function ApplicationsPage() {
  const ios = useIOS();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const rows = ios.applications.filter((app) => {
    if (filter === "all") return app.status !== "saved";
    if (filter === "no_response") {
      return app.status === "applied" && app.appliedAt && Date.now() - new Date(app.appliedAt).getTime() > 21 * 86400000;
    }
    return app.status === filter;
  });

  return (
    <div className="page">
      <header className="page-head">
        <h1>Applications</h1>
        <p className="lead">Statuses change when you say they do. Nothing here is marked submitted on its own.</p>
      </header>
      <div className="chips">
        {FILTERS.map((item) => (
          <button key={item} className={`chip ${filter === item ? "badge-good" : ""}`} onClick={() => setFilter(item)}>
            {item === "no_response" ? "No response (21d+)" : item}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No applications yet"
          body="Add your first job from Opportunities. Saved roles you have not queued stay on the Saved page."
          action={<Link className="btn btn-primary" href="/opportunities">Browse opportunities</Link>}
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Role</th><th>Match</th><th>Status</th><th>Updated</th><th>Next</th></tr>
            </thead>
            <tbody>
              {rows.map((app) => (
                <tr key={app.id}>
                  <td><strong>{app.job.company}</strong><div className="tiny">{app.job.title}</div></td>
                  <td><span className={matchBadgeClass(app.match.label)}>{app.match.overall}%</span></td>
                  <td>{app.status}{app.stalled ? " · stalled" : ""}</td>
                  <td className="tiny">{new Date(app.updatedAt).toLocaleDateString()}</td>
                  <td><Link href={`/applications/${app.id}`}>{app.status === "ready" ? "Review" : "Open"}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
