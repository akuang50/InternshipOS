"use client";

import { FactorList, MatchMeter, matchBadgeClass } from "@/components/match";
import { useIOS, type FeedJob } from "@/components/provider";
import { EmptyState } from "@/components/states";
import { deadlineLabel, sizeLabel } from "@/lib/format";
import { applyFilters, parseNaturalFilter, type JobFilters } from "@internshipos/api/filters";
import { rankJobs } from "@internshipos/ai";
import type { RoleFamily } from "@internshipos/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Tab = "for-you" | "opened" | "closing" | "companies" | "all";

const BASE: JobFilters = {
  query: "",
  role: "all",
  location: "",
  workplace: "all",
  companySize: "all",
  industry: "",
  skill: "",
  visa: "all",
  graduationYear: "all",
  deadlineWithinDays: "all",
  posted: "all",
  hiddenGems: false,
  maxEmployees: null,
};

export default function OpportunitiesPage() {
  const ios = useIOS();
  const [tab, setTab] = useState<Tab>("for-you");
  const [filters, setFilters] = useState<JobFilters>(BASE);
  const [nl, setNl] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("job");
    if (id) setSelectedId(id);
  }, []);

  const filtered = useMemo(() => {
    const next = applyFilters(ios.jobs, filters).filter((job) => (company ? job.company === company : true));
    if (tab === "opened") return [...next].sort((a, b) => b.freshness.freshnessScore - a.freshness.freshnessScore);
    if (tab === "closing") {
      return [...next].sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }
    if (tab === "all") return [...next].sort((a, b) => a.company.localeCompare(b.company));
    return rankJobs(next.map((job) => ({ job, match: job.match }))).map((item) => item.job);
  }, [ios.jobs, filters, tab, company]);

  const companies = useMemo(() => {
    const map = new Map<string, number>();
    for (const job of applyFilters(ios.jobs, filters)) map.set(job.company, (map.get(job.company) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [ios.jobs, filters]);

  const selected = filtered.find((job) => job.id === selectedId) ?? ios.jobs.find((job) => job.id === selectedId) ?? null;
  const selectedIndex = filtered.findIndex((job) => job.id === selected?.id);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (document.body.dataset.palette === "open" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        const next = filtered[Math.min(filtered.length - 1, Math.max(0, selectedIndex + 1))];
        if (next) setSelectedId(next.id);
      }
      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        const next = filtered[Math.max(0, selectedIndex < 0 ? 0 : selectedIndex - 1)];
        if (next) setSelectedId(next.id);
      }
      if (event.key === "Enter" && filtered[0] && !selected) setSelectedId(filtered[0].id);
      if (event.key === "Escape") setSelectedId(null);
      if (!selected) return;
      if (event.key.toLowerCase() === "s") void ios.trackJob(selected.id, "save");
      if (event.key.toLowerCase() === "a") void ios.trackJob(selected.id, "queue");
      if (event.key.toLowerCase() === "n") ios.setFlash("No contacts are linked yet. Networking ships later, and this screen won't invent people.");
      if (event.key.toLowerCase() === "o") {
        const app = ios.applications.find((item) => item.jobId === selected.id);
        if (app) window.location.href = `/applications/${app.id}`;
      }
      if (event.key.toLowerCase() === "r") {
        void (async () => {
          const existing = ios.applications.find((item) => item.jobId === selected.id);
          const app = existing ?? (await ios.trackJob(selected.id, "queue"));
          if (app) await ios.updateApplication(app.id, { action: "tailor" });
        })();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, selected, selectedIndex, ios]);

  return (
    <div className={selected ? "workspace" : "workspace workspace-single"}>
      <div className="feed">
        <header className="page-head">
          <h1>Opportunities</h1>
          <p className="lead">Same role, one card — even when it showed up on more than one board.</p>
        </header>
        <div className="tabs" role="tablist">
          {(
            [
              ["for-you", "For you"],
              ["opened", "Just opened"],
              ["closing", "Closing soon"],
              ["companies", "Companies"],
              ["all", "All"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} className="tab" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
        <div className="filters">
          <input className="input input-grow" placeholder="Search internships" value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} aria-label="Search internships" />
          <select className="select" aria-label="Role" value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value as RoleFamily | "all" })}>
            <option value="all">Role</option>
            <option value="software">Software</option>
            <option value="design">Design</option>
            <option value="product">Product</option>
            <option value="data">Data</option>
            <option value="research">Research</option>
          </select>
          <select className="select" aria-label="Workplace" value={filters.workplace} onChange={(event) => setFilters({ ...filters, workplace: event.target.value as JobFilters["workplace"] })}>
            <option value="all">Remote</option>
            <option value="remote">Remote only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
          <select className="select" aria-label="Company size" value={filters.companySize} onChange={(event) => setFilters({ ...filters, companySize: event.target.value as JobFilters["companySize"] })}>
            <option value="all">Company size</option>
            <option value="seed">Seed</option>
            <option value="series_a">Series A</option>
            <option value="series_b">Series B</option>
            <option value="growth">Growth</option>
            <option value="public">Public</option>
          </select>
          <select className="select" aria-label="Posted" value={filters.posted} onChange={(event) => setFilters({ ...filters, posted: event.target.value as JobFilters["posted"] })}>
            <option value="all">Posted</option>
            <option value="brand_new">0–24h</option>
            <option value="very_recent">1–3d</option>
            <option value="recent">3–7d</option>
            <option value="older">7d+</option>
          </select>
          <select className="select" aria-label="Visa" value={filters.visa} onChange={(event) => setFilters({ ...filters, visa: event.target.value as JobFilters["visa"] })}>
            <option value="all">Visa</option>
            <option value="sponsorship">Sponsorship mentioned</option>
            <option value="no_sponsorship">No sponsorship</option>
          </select>
          <button className={`btn ${filters.hiddenGems ? "btn-primary" : ""}`} onClick={() => setFilters({ ...filters, hiddenGems: !filters.hiddenGems })}>Hidden gems</button>
        </div>
        <form
          className="row"
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = parseNaturalFilter(nl);
            setNotes(parsed.notes);
            const structured = parsed.notes[0] !== "No structured filters matched — using text search";
            setFilters({ ...filters, ...parsed.filters, query: structured ? "" : nl });
          }}
        >
          <input className="input input-grow" value={nl} onChange={(event) => setNl(event.target.value)} placeholder="Show me 20-person AI startups hiring SWE interns" aria-label="Natural language filter" />
          <button className="btn" type="submit">Apply filter</button>
        </form>
        {notes.length ? <div className="chips">{notes.map((note) => <span className="chip" key={note}>Interpreted as: {note}</span>)}</div> : null}
        {company ? <button className="btn btn-small" onClick={() => setCompany(null)}>Clear {company}</button> : null}
        {tab === "companies" ? (
          <div className="stack">
            {companies.map(([name, count]) => (
              <button key={name} className="job" onClick={() => { setCompany(name); setTab("for-you"); }}>
                <strong>{name}</strong>
                <span className="tiny">{count} role{count === 1 ? "" : "s"}</span>
              </button>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No roles match these filters" body="Clear a filter or try a broader search. The feed itself is still there." action={<button className="btn" onClick={() => { setFilters(BASE); setNotes([]); setCompany(null); }}>Reset filters</button>} />
        ) : (
          <div className="stack">
            {filtered.map((job) => (
              <JobRow key={job.id} job={job} active={job.id === selectedId} onOpen={() => setSelectedId(job.id)} />
            ))}
          </div>
        )}
      </div>
      {selected ? <JobPanel job={selected} onClose={() => setSelectedId(null)} /> : null}
    </div>
  );
}

function JobRow({ job, active, onOpen }: { job: FeedJob; active: boolean; onOpen: () => void }) {
  return (
    <button className="job" data-active={active} onClick={onOpen}>
      <div className="spread">
        <div className="row">
          <span className="logo" aria-hidden="true">{job.company.slice(0, 1)}</span>
          <div>
            <strong>{job.company}</strong>
            <div>{job.title}</div>
            <div className="tiny">{job.location} · {job.workplace} · {sizeLabel(job.companySize)}</div>
          </div>
        </div>
        <span className={matchBadgeClass(job.match.label)}>{job.match.overall}% match</span>
      </div>
      <div className="tiny">{job.freshness.bucket === "brand_new" ? "🔥 " : ""}{job.freshness.label}{job.sources.length > 1 ? ` · ${job.sources.length} sources, one role` : ""}</div>
      <div className="skills">{job.skills.slice(0, 4).map((skill) => <span className="chip" key={skill}>{skill}</span>)}</div>
      <MatchMeter score={job.match.overall} />
      <div className="tiny">{job.match.qualificationsMet}/{job.match.qualificationsTotal} required qualifications supported by your profile</div>
    </button>
  );
}

function JobPanel({ job, onClose }: { job: FeedJob; onClose: () => void }) {
  const ios = useIOS();
  const app = ios.applications.find((item) => item.jobId === job.id);
  return (
    <aside className="panel" aria-label={`${job.company} ${job.title}`}>
      <div className="spread">
        <div>
          <p className="kicker">{job.match.label}</p>
          <h2>{job.company}</h2>
          <p>{job.title}</p>
        </div>
        <button className="icon-btn" aria-label="Close role" onClick={onClose}>×</button>
      </div>
      <p className="tiny">{job.freshness.bucket === "brand_new" ? "🔥 " : ""}{job.freshness.label} · {deadlineLabel(job.deadline)} · {job.employeeCount.toLocaleString()} people</p>
      <FactorList match={job.match} />
      <div>
        <p className="label">Why you&apos;re a match</p>
        <ul>{job.match.why.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      {job.match.gaps.length ? (
        <div>
          <p className="label">Potential gaps</p>
          <ul>{job.match.gaps.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      ) : null}
      <p className="banner">{job.match.recommendation}</p>
      <p className="muted">{job.description}</p>
      <div className="row">
        <button className="btn" onClick={() => ios.trackJob(job.id, "save")}>{app?.saved ? "Saved" : "Save"}</button>
        <button className="btn btn-primary" onClick={() => ios.trackJob(job.id, "queue")}>Add to queue</button>
      </div>
      <div className="row">
        <button
          className="btn"
          onClick={async () => {
            const existing = app ?? (await ios.trackJob(job.id, "queue"));
            if (existing) {
              await ios.updateApplication(existing.id, { action: "tailor" });
              window.location.href = `/applications/${existing.id}`;
            }
          }}
        >
          Tailor resume
        </button>
        <button className="btn" onClick={() => ios.setFlash("No contacts are linked yet. This button will not invent alumni or recruiters.")}>Find people</button>
        {app ? <Link className="btn" href={`/applications/${app.id}`}>Open workspace</Link> : null}
        <a className="btn" href={job.applicationUrl} target="_blank" rel="noreferrer">Company site</a>
      </div>
      <p className="tiny">Sources: {job.sources.map((source) => source.name).join(", ")}. InternshipOS stops before submit.</p>
    </aside>
  );
}
