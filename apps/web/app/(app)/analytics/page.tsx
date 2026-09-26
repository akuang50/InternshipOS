"use client";

import { useIOS } from "@/components/provider";

export default function AnalyticsPage() {
  const ios = useIOS();
  const apps = ios.applications;
  const applied = apps.filter((app) => ["applied", "interviewing", "offer", "rejected"].includes(app.status));
  const replies = apps.filter((app) => ["interviewing", "offer"].includes(app.status));
  const tailored = apps.filter((app) => app.tailored);
  const bands = {
    strong: apps.filter((app) => app.match.overall >= 85).length,
    other: apps.filter((app) => app.match.overall < 85).length,
  };

  return (
    <div className="page">
      <header className="page-head">
        <h1>Analytics</h1>
        <p className="lead">Counts from your own tracker. No claim is shown until there is enough of your data.</p>
      </header>
      <section className="stats">
        <div className="stat"><b className="num">{apps.length}</b><span>tracked roles</span></div>
        <div className="stat"><b className="num">{applied.length}</b><span>you marked submitted</span></div>
        <div className="stat"><b className="num">{tailored.length}</b><span>with a tailored resume</span></div>
      </section>
      <section className="card">
        <h2>Reply rate</h2>
        {applied.length < 5 ? (
          <p className="muted">Not enough of your own outcomes yet to say whether tailored resumes get more replies. Mark interviews as they happen; this page will not invent a trend.</p>
        ) : (
          <p>Of the {applied.length} roles you marked submitted, {replies.length} are in interviewing or offer. That is {Math.round((replies.length / applied.length) * 100)}% of your submitted set — only your statuses, not a market benchmark.</p>
        )}
        <p className="tiny">Strong matches in your tracker: {bands.strong}. Everyone else: {bands.other}.</p>
      </section>
    </div>
  );
}
