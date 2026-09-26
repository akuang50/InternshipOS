"use client";

import { useIOS } from "@/components/provider";
import type { Resume } from "@internshipos/types";
import { useEffect, useState } from "react";

export default function ResumePage() {
  const ios = useIOS();
  const [draft, setDraft] = useState<Resume | null>(ios.resume);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setDraft(ios.resume), [ios.resume]);
  if (!ios.profile) return null;
  const resume = draft ?? {
    id: `resume_${ios.profile.userId}`,
    userId: ios.profile.userId,
    name: "General",
    summary: "",
    skills: [],
    experiences: [],
    education: [],
    projects: [],
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="page">
      <header className="page-head">
        <h1>Resume</h1>
        <p className="lead">This is the source of truth for matching. Tailoring for a job never writes back over it with invented bullets.</p>
      </header>
      <form
        className="card"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await ios.saveResume(resume);
            ios.setFlash("Resume saved. Match scores will use this version.");
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Could not save your resume.");
          }
        }}
      >
        <label className="field"><span>Name</span><input className="input" value={resume.name} onChange={(event) => setDraft({ ...resume, name: event.target.value })} /></label>
        <label className="field"><span>Summary</span><textarea className="textarea" value={resume.summary} onChange={(event) => setDraft({ ...resume, summary: event.target.value })} /></label>
        <label className="field"><span>Skills, comma separated</span><input className="input" value={resume.skills.join(", ")} onChange={(event) => setDraft({ ...resume, skills: event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean) })} /></label>
        {resume.experiences.map((exp, index) => (
          <fieldset key={exp.id} className="field">
            <legend>{exp.title || "Experience"} at {exp.company || "…"}</legend>
            <div className="form-grid">
              <input className="input" value={exp.company} aria-label="Company" onChange={(event) => updateExp(index, { company: event.target.value })} />
              <input className="input" value={exp.title} aria-label="Title" onChange={(event) => updateExp(index, { title: event.target.value })} />
            </div>
            <textarea className="textarea" aria-label="Bullets" value={exp.bullets.join("\n")} onChange={(event) => updateExp(index, { bullets: event.target.value.split("\n").filter(Boolean) })} />
          </fieldset>
        ))}
        <div className="row">
          <button
            type="button"
            className="btn"
            onClick={() => setDraft({ ...resume, experiences: [...resume.experiences, { id: crypto.randomUUID(), company: "", title: "", start: "", end: "", bullets: [""] }] })}
          >
            Add experience
          </button>
          <label className="btn">
            Upload .txt
            <input
              type="file"
              accept=".txt,.md,text/plain"
              hidden
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try { await ios.uploadResume(file); } catch (reason) { setError(reason instanceof Error ? reason.message : "Upload failed."); }
              }}
            />
          </label>
          <button className="btn btn-primary" type="submit">Save resume</button>
        </div>
        {error ? <p className="warn" role="alert">{error}</p> : null}
      </form>
    </div>
  );

  function updateExp(index: number, patch: Partial<Resume["experiences"][number]>) {
    setDraft({
      ...resume,
      experiences: resume.experiences.map((exp, expIndex) => (expIndex === index ? { ...exp, ...patch } : exp)),
    });
  }
}
