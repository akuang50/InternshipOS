"use client";

import { MatchMeter, matchBadgeClass } from "@/components/match";
import { OutreachCard } from "@/components/outreach";
import { useIOS } from "@/components/provider";
import { EmptyState } from "@/components/states";
import { deadlineLabel, greeting, priorityLabel } from "@/lib/format";
import { priorityScore } from "@internshipos/ai";
import Link from "next/link";

export default function HomePage() {
  const ios = useIOS();
  const profile = ios.profile;
  if (!profile) return null;
  const closed = new Set(
    ios.applications.filter((app) => ["applied", "rejected", "withdrawn", "offer"].includes(app.status)).map((app) => app.jobId),
  );
  const ranked = ios.jobs
    .filter((job) => !closed.has(job.id))
    .map((job) => {
      const app = ios.applications.find((item) => item.jobId === job.id);
      return { job, stalled: Boolean(app?.stalled), score: priorityScore(job.match, job, Boolean(app?.stalled)) };
    })
    .sort((a, b) => b.score - a.score);
  const priorities = ranked.slice(0, 5);
  const freshAll = ranked.filter((item) => item.job.freshness.isNew && item.job.match.overall >= 80);
  const fresh = freshAll.slice(0, 8);
  const priorityIds = new Set(priorities.map((item) => item.job.id));
  const suggestions = ranked.filter((item) => !priorityIds.has(item.job.id)).slice(0, 8);
  const ready = ios.applications.filter((app) => app.status === "ready");
  const followUps = ios.applications.filter((app) => {
    if (app.status === "interviewing") return true;
    if (app.status !== "applied" || !app.appliedAt) return false;
    return Date.now() - new Date(app.appliedAt).getTime() > 5 * 86400000;
  });
  const queued = ios.applications.filter((app) => ["queued", "preparing", "ready"].includes(app.status));

  return (
    <div className="page">
      <header className="page-head">
        <h1>{greeting(profile.name)}</h1>
        <p className="lead">Your internship search at a glance.</p>
      </header>
      {!profile.privacy.personalizeFromProfile ? (
        <p className="banner">Personalization is off. Matches use your stated skills and preferences only.</p>
      ) : null}
      <section className="stats">
        <div className="stat"><b className="num">{freshAll.length}</b><span>new strong matches</span></div>
        <div className="stat"><b className="num">{ready.length}</b><span>ready to apply</span></div>
        <div className="stat"><b className="num">{followUps.length}</b><span>follow-ups</span></div>
      </section>
      <section className="card">
        <h2>Today&apos;s priorities</h2>
        {priorities.length === 0 ? (
          <EmptyState title="No roles to rank yet" body="Once listings are ingested, the highest-fit fresh roles show up here." />
        ) : (
          <div className="priority">
            {priorities.map(({ job, stalled }) => (
              <div className="priority-row" key={job.id}>
                <div>
                  <strong>{job.company}</strong> — {job.title}
                  <div className="tiny">
                    {job.freshness.bucket === "brand_new" ? "🔥 " : ""}
                    {job.freshness.label} · {job.match.overall}% fit · {deadlineLabel(job.deadline)}
                    {stalled ? " · stalled over 48h" : ""}
                  </div>
                  <MatchMeter score={job.match.overall} />
                  <OutreachCard compact job={job} profile={profile} resume={ios.resume} match={job.match} />
                </div>
                <Link className="btn btn-primary btn-small" href={`/opportunities?job=${job.id}`}>
                  {queued.some((app) => app.jobId === job.id) ? "Continue" : "Prepare application"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="split">
        <article className="card">
          <h2>New for you</h2>
          {fresh.length === 0 ? <p className="muted">No brand-new strong matches right now. The full feed is still worth a pass.</p> : fresh.map(({ job }) => (
            <div key={job.id} className="spread">
              <span>{job.company} · {job.match.overall}%</span>
              <span className="tiny">{job.freshness.label.replace("Opened ", "")}</span>
            </div>
          ))}
          <Link href="/opportunities">View all</Link>
        </article>
        <article className="card">
          <h2>Application queue</h2>
          <p className="num" style={{ fontSize: 24 }}>{queued.length} in progress</p>
          <p className="muted">{ready.length} ready for you to review and submit yourself.</p>
          <Link className="btn btn-primary" href="/queue">Open queue</Link>
        </article>
        <article className="card">
          <h2>Who to email</h2>
          <p className="muted">Each role says whether a founder note or a campus-recruiter note is worth sending, with a draft you open in your own mail. InternshipOS does not send it.</p>
          <Link href="/networking">Review the notes</Link>
        </article>
      </section>
      <section className="card">
        <div className="spread">
          <h2>More suggestions</h2>
          <Link href="/opportunities">View all {ranked.length}</Link>
        </div>
        {suggestions.length === 0 ? (
          <p className="muted">Every open role is already in today&apos;s priorities.</p>
        ) : (
          <div className="priority">
            {suggestions.map(({ job }) => (
              <div className="priority-row" key={job.id}>
                <div>
                  <strong>{job.company}</strong> — {job.title}
                  <div className="tiny">
                    {job.location} · {job.freshness.bucket === "brand_new" ? "🔥 " : ""}
                    {job.freshness.label} · <span className={matchBadgeClass(job.match.label)}>{job.match.overall}%</span>
                  </div>
                  <OutreachCard compact job={job} profile={profile} resume={ios.resume} match={job.match} />
                </div>
                <Link className="btn btn-small" href={`/opportunities?job=${job.id}`}>View role</Link>
              </div>
            ))}
          </div>
        )}
      </section>
      <p className="tiny">Priority order: fit, freshness, deadline, then a boost if a saved role has sat for more than 48 hours. {priorityLabel("apply_now")} is reserved for strong, recent matches.</p>
    </div>
  );
}
