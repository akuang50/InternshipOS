"use client";

import { FactorList, matchBadgeClass } from "@/components/match";
import { OutreachCard } from "@/components/outreach";
import { useIOS } from "@/components/provider";
import { ErrorState } from "@/components/states";
import type { ApplicationView, CoverTone } from "@internshipos/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const TABS = ["Overview", "Resume", "Cover letter", "Questions", "Network", "Prep"] as const;

export default function WorkspacePage() {
  const params = useParams<{ id: string }>();
  const ios = useIOS();
  const app = ios.applications.find((item) => item.id === params.id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  if (ios.loading) return null;
  if (!app) return <ErrorState title="This application isn't on your account" body="It may have been removed. Your other applications are still in the tracker." />;
  return (
    <div className="page">
      <header className="spread">
        <div>
          <Link href="/applications" className="tiny">Applications</Link>
          <h1>{app.job.company} — {app.job.title}</h1>
          <p className="lead">{app.job.freshness.label}</p>
        </div>
        <span className={matchBadgeClass(app.match.label)}>{app.match.overall}% match</span>
      </header>
      <div className="tabs" role="tablist">
        {TABS.map((item) => (
          <button key={item} className="tab" role="tab" aria-selected={tab === item} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {tab === "Overview" ? <Overview app={app} /> : null}
      {tab === "Resume" ? <ResumeTab app={app} /> : null}
      {tab === "Cover letter" ? <CoverTab app={app} /> : null}
      {tab === "Questions" ? <QuestionsTab app={app} /> : null}
      {tab === "Network" && ios.profile ? <OutreachCard job={app.job} profile={ios.profile} resume={ios.resume} match={app.match} /> : null}
      {tab === "Prep" ? <Later title="Interview prep comes later" body="Technical problems will be original or licensed — not copied from LeetCode or Glassdoor. This tab will hold company-specific practice once that module exists." /> : null}
    </div>
  );
}

function Overview({ app }: { app: ApplicationView }) {
  const ios = useIOS();
  const check = app.checklist;
  return (
    <div className="split">
      <section className="card">
        <p className="kicker">Application copilot</p>
        <p>{app.match.why[0]}</p>
        <ul>{app.match.why.slice(1).map((item) => <li key={item}>{item}</li>)}</ul>
        {app.match.gaps.length ? <p className="warn">Gaps: {app.match.gaps[0]}</p> : null}
        <p>{app.match.recommendation}</p>
        <FactorList match={app.match} />
        <button className="btn btn-primary" onClick={() => ios.updateApplication(app.id, { action: "tailor" })}>Tailor resume</button>
      </section>
      <section className="card">
        <h2>Checklist</h2>
        <ul className="checklist">
          <li><span>Resume tailored</span><span className={check.resumeTailored ? "ok" : "warn"}>{check.resumeTailored ? "Yes" : "Not yet"}</span></li>
          <li><span>Cover letter</span><span className={check.coverLetter ? "ok" : "warn"}>{check.coverLetter ? "Yes" : "Not yet"}</span></li>
          <li><span>Questions</span><span>{check.questionsAnswered}/{check.questionsTotal || 0}</span></li>
          <li><span>Need review</span><span className={check.questionsNeedReview ? "warn" : "ok"}>{check.questionsNeedReview}</span></li>
          <li><span>Hiring contact</span><span className={check.networkingContacts ? "ok" : "warn"}>{check.networkingContacts ? app.job.contact.email : "None on this listing"}</span></li>
          <li><span>Autofill ready</span><span className={check.autofillReady ? "ok" : "warn"}>{check.autofillReady ? "Yes" : "No"}</span></li>
        </ul>
        <label className="field">
          <span>Status</span>
          <select className="select" value={app.status} onChange={(event) => ios.updateApplication(app.id, { status: event.target.value })}>
            {["saved", "queued", "preparing", "ready", "applied", "interviewing", "offer", "rejected", "withdrawn"].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <button className="btn" onClick={() => ios.updateApplication(app.id, { status: "applied" })}>I submitted this</button>
        <p className="banner">Application ready means ready for you to review. InternshipOS never clicks submit.</p>
        <a className="btn" href={app.job.applicationUrl} target="_blank" rel="noreferrer">Open application</a>
        <label className="field"><span>Notes</span><textarea className="textarea" defaultValue={app.notes} onBlur={(event) => ios.updateApplication(app.id, { notes: event.target.value })} /></label>
      </section>
    </div>
  );
}

function ResumeTab({ app }: { app: ApplicationView }) {
  const ios = useIOS();
  const tailored = app.tailored;
  return (
    <section className="card">
      <div className="spread">
        <h2>Resume</h2>
        <span className="badge">{tailored?.source === "model" ? `Generated · ${tailored.model}` : "Arranged from your resume"}</span>
      </div>
      <p className="muted">Bullets are reordered toward this job. New experience is never added.</p>
      {tailored?.note ? <p className="banner-warn banner">{tailored.note}</p> : null}
      <button className="btn btn-primary" onClick={() => ios.updateApplication(app.id, { action: "tailor" })}>Tailor resume</button>
      {tailored ? (
        <>
          <p>ATS overlap <b className="num">{tailored.ats.score}%</b>. Missing keywords you can choose to add only if they are true: {tailored.ats.missing.join(", ") || "none"}.</p>
          {tailored.changes.map((change) => (
            <div key={change.section}>
              <strong>{change.section}</strong>
              <p className="tiny">{change.reason}</p>
              <div className="diff">
                <div><span className="tiny">Before</span><p>{change.before}</p></div>
                <div><span className="tiny">After</span><p>{change.after}</p></div>
              </div>
            </div>
          ))}
        </>
      ) : <p className="muted">No tailored version yet.</p>}
    </section>
  );
}

function CoverTab({ app }: { app: ApplicationView }) {
  const ios = useIOS();
  const [tone, setTone] = useState<CoverTone>(app.coverLetter?.tone ?? "concise");
  const [text, setText] = useState(app.coverLetter?.text ?? "");
  useEffect(() => setText(app.coverLetter?.text ?? ""), [app.coverLetter?.updatedAt, app.coverLetter?.text]);
  return (
    <section className="card">
      <div className="spread">
        <h2>Cover letter</h2>
        <span className="badge">{app.coverLetter?.source === "model" ? `Generated · ${app.coverLetter.model}` : "Drafted from your profile"}</span>
      </div>
      <p className="muted">Uses the listing&apos;s company summary when one exists, plus bullets already on your resume. It does not invent a mission.</p>
      {app.coverLetter?.note ? <p className="banner">{app.coverLetter.note}</p> : null}
      <div className="tabs">
        {(["concise", "detailed", "enthusiastic"] as const).map((item) => (
          <button key={item} className="tab" aria-selected={tone === item} onClick={() => setTone(item)}>{item}</button>
        ))}
      </div>
      <button className="btn btn-primary" onClick={async () => {
        await ios.updateApplication(app.id, { action: "cover", tone });
      }}>Regenerate</button>
      <textarea className="textarea" value={text || app.coverLetter?.text || ""} onChange={(event) => setText(event.target.value)} />
      <button className="btn" onClick={() => ios.updateApplication(app.id, { coverText: text })}>Save edits</button>
    </section>
  );
}

function QuestionsTab({ app }: { app: ApplicationView }) {
  const ios = useIOS();
  const [answers, setAnswers] = useState(app.answers);
  return (
    <section className="card">
      <div className="spread">
        <h2>Questions</h2>
        <button className="btn" onClick={() => ios.updateApplication(app.id, { action: "answers" })}>Draft from profile</button>
      </div>
      <p className="muted">Work authorization and salary stay blank until you fill them. Those are marked for review on purpose.</p>
      {(answers.length ? answers : app.answers).map((answer, index) => (
        <label className="field" key={answer.id}>
          <span>{answer.question} · {answer.confidence === "review" ? "Needs review" : "Ready"}</span>
          {answer.reason ? <span className="warn">{answer.reason}</span> : null}
          <textarea
            className="textarea"
            value={answer.answer}
            onChange={(event) => {
              const next = (answers.length ? answers : app.answers).map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item);
              setAnswers(next);
            }}
          />
        </label>
      ))}
      {app.answers.length === 0 ? <p className="muted">No drafts yet.</p> : null}
      <button className="btn btn-primary" onClick={() => ios.updateApplication(app.id, { answers: answers.length ? answers : app.answers })}>Save answers</button>
    </section>
  );
}

function Later({ title, body }: { title: string; body: string }) {
  return (
    <section className="empty card">
      <h2>{title}</h2>
      <p className="muted">{body}</p>
    </section>
  );
}
