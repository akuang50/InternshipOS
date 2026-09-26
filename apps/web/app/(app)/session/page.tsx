"use client";

import { useIOS } from "@/components/provider";
import { EmptyState } from "@/components/states";
import { minutesBetween } from "@/lib/format";
import Link from "next/link";
import { useState } from "react";

export default function SessionPage() {
  const ios = useIOS();
  const session = ios.session;
  const [summary, setSummary] = useState<string | null>(null);
  if (!session) {
    const ready = ios.applications.filter((app) => app.status === "ready" || app.status === "queued");
    return (
      <div className="page">
        {summary ? <p className="banner">{summary}</p> : null}
        <EmptyState
          title="No application session running"
          body="A session is a focused pass through roles you already prepared. You still submit each one yourself."
          action={ready.length ? <button className="btn btn-primary" onClick={() => ios.startSession(ready.map((app) => app.id))}>Start with {ready.length} roles</button> : <Link className="btn btn-primary" href="/queue">Go to queue</Link>}
        />
      </div>
    );
  }
  const app = ios.applications.find((item) => item.id === session.applicationIds[session.index]);
  const total = session.applicationIds.length;
  if (!app) return <EmptyState title="This session lost its place" body="The application may have been removed." action={<button className="btn" onClick={() => ios.completeSession()}>End session</button>} />;
  const width = `${((session.index + 1) / total) * 100}%`;

  return (
    <div className="session-screen">
      <p className="kicker">Application session · <span className="num">{session.index + 1} / {total}</span></p>
      <h1>{app.job.company}</h1>
      <p className="lead">{app.job.title}</p>
      <div className="progress" aria-label="Session progress"><span style={{ width }} /></div>
      <ul className="checklist card">
        <li><span>Resume</span><span className={app.checklist.resumeTailored ? "ok" : "warn"}>{app.checklist.resumeTailored ? "Ready" : "Missing"}</span></li>
        <li><span>Cover letter</span><span className={app.checklist.coverLetter ? "ok" : "warn"}>{app.checklist.coverLetter ? "Ready" : "Missing"}</span></li>
        <li><span>Answers</span><span>{app.checklist.questionsAnswered}/{app.checklist.questionsTotal}</span></li>
        <li><span>Autofill</span><span className={app.checklist.autofillReady ? "ok" : "warn"}>{app.checklist.autofillReady ? "Ready" : "Needs review"}</span></li>
      </ul>
      <p className="banner">Application ready — review before submitting. InternshipOS never sends the application.</p>
      <div className="row">
        <a className="btn btn-primary" href={app.job.applicationUrl} target="_blank" rel="noreferrer">Open application</a>
        <Link className="btn" href={`/applications/${app.id}`}>Review in workspace</Link>
        <button className="btn" onClick={() => ios.updateApplication(app.id, { status: "applied" })}>I submitted this</button>
      </div>
      <div className="spread">
        <span className="tiny">Next: {ios.applications.find((item) => item.id === session.applicationIds[session.index + 1])?.job.company ?? "Finish"}</span>
        <span className="tiny num">{minutesBetween(session.startedAt)} min in this session</span>
      </div>
      <div className="row">
        <button className="btn" disabled={session.index === 0} onClick={() => ios.moveSession(session.index - 1)}>Previous</button>
        {session.index < total - 1 ? (
          <button className="btn btn-primary" onClick={() => ios.moveSession(session.index + 1)}>Next</button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={async () => {
              const done = await ios.completeSession();
              if (done) setSummary(`You moved through ${done.applicationIds.length} applications in ${minutesBetween(done.startedAt)} minutes. Submit any you have not reviewed yet — that step stays yours.`);
            }}
          >
            Finish session
          </button>
        )}
      </div>
    </div>
  );
}
