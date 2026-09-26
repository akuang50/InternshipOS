import { matchJob, rankJobs } from "@internshipos/ai";
import { ingestListings, sampleProfile, sampleResume } from "@internshipos/api";
import { deadlineLabel } from "@/lib/format";
import { MatchMeter, matchBadgeClass } from "@/components/match";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  const profile = sampleProfile("example", "example@students.invalid");
  const resume = sampleResume("example");
  const ranked = rankJobs(
    ingestListings().map((job) => ({ job, match: matchJob(profile, resume, job) })),
  ).slice(0, 3);

  return (
    <div className="landing">
      <header className="spread">
        <div className="brand"><span className="mark">IO</span> InternshipOS</div>
        <div className="row">
          <Link href="/login">Sign in</Link>
          <Link className="btn btn-primary" href="/signup">Start your search</Link>
        </div>
      </header>
      <section className="hero">
        <div>
          <p className="kicker">Internship search, as a command center</p>
          <h1>Know what to do next.</h1>
          <p className="lead">
            Fresh roles you actually fit, applications you prepare yourself, and a tracker that tells you the next move.
            InternshipOS never submits an application for you.
          </p>
          <div className="row" style={{ marginTop: 16 }}>
            <Link className="btn btn-primary" href="/signup">Create an account</Link>
            <Link className="btn" href="/login">I already have one</Link>
          </div>
        </div>
        <div className="preview">
          <p className="tiny">Example student, not your data — Alex Chen, CS, Northeastern, class of 2027. Scores come from the same matcher you will use.</p>
          {ranked.map(({ job, match }) => (
            <div key={job.id} className="priority-row">
              <div>
                <strong>{job.company}</strong> — {job.title}
                <div className="tiny">{job.freshness.label} · {deadlineLabel(job.deadline)}</div>
                <MatchMeter score={match.overall} />
              </div>
              <span className={matchBadgeClass(match.label)}>{match.overall}%</span>
            </div>
          ))}
        </div>
      </section>
      <section className="split">
        <article className="card">
          <h2>1. See fresh matches</h2>
          <p className="muted">Roles are deduped across Greenhouse, Lever, Ashby, and Workday-style listings, then ranked by fit, freshness, and deadline.</p>
        </article>
        <article className="card">
          <h2>2. Prepare, then review</h2>
          <p className="muted">Tailoring reorders bullets you already wrote. Cover letters quote your resume. Empty answers stay blank instead of being guessed.</p>
        </article>
        <article className="card">
          <h2>3. Track the next step</h2>
          <p className="muted">Queue, session, and tracker stay in sync. Submission stays on the company site, after you look.</p>
        </article>
      </section>
      <footer className="row">
        <Link href="/legal">Legal</Link>
        <span className="tiny">Public launch uses a free vercel.app address. A custom domain can wait.</span>
      </footer>
    </div>
  );
}
