"use client";

import { useIOS } from "@/components/provider";
import type { Resume, RoleFamily } from "@internshipos/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ROLES: RoleFamily[] = ["software", "design", "product", "data", "research"];

export default function OnboardingPage() {
  const ios = useIOS();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    school: "",
    major: "",
    graduationYear: "2027",
    location: "",
    workAuthorization: "",
    roles: ["software"] as RoleFamily[],
    locations: "Boston, New York",
    remote: true,
    skills: "",
    summary: "",
    bullet: "",
    company: "",
    title: "",
  });

  useEffect(() => {
    if (!ios.loading && !ios.profile) router.replace("/login");
    if (ios.profile?.onboardingComplete) router.replace("/home");
  }, [ios.loading, ios.profile, router]);

  function patch<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function finish(event: React.FormEvent) {
    event.preventDefault();
    if (!ios.profile) return;
    const skills = form.skills.split(",").map((skill) => skill.trim()).filter(Boolean);
    if (skills.length < 3 && !form.bullet.trim()) {
      setError("Add at least three skills or one resume bullet so matches have something true to use.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const resume: Resume = ios.resume ?? {
        id: `resume_${ios.profile.userId}`,
        userId: ios.profile.userId,
        name: `${ios.profile.name} — general`,
        summary: form.summary,
        skills,
        experiences: form.bullet.trim()
          ? [{ id: crypto.randomUUID(), company: form.company || "Experience", title: form.title || "Project", start: "", end: "", bullets: [form.bullet.trim()] }]
          : [],
        education: form.school
          ? [{ id: crypto.randomUUID(), school: form.school, degree: "", major: form.major, graduationYear: Number(form.graduationYear) }]
          : [],
        projects: [],
        updatedAt: new Date().toISOString(),
      };
      if (!ios.resume) await ios.saveResume({ ...resume, skills: skills.length ? skills : resume.skills, summary: form.summary || resume.summary });
      await ios.saveProfile({
        ...ios.profile,
        school: form.school || ios.profile.school,
        major: form.major || ios.profile.major,
        location: form.location || ios.profile.location,
        graduationYear: Number(form.graduationYear) || ios.profile.graduationYear,
        onboardingComplete: true,
        preferences: {
          ...ios.profile.preferences,
          roles: form.roles,
          locations: form.locations.split(",").map((item) => item.trim()).filter(Boolean),
          remote: form.remote,
          workAuthorization: form.workAuthorization,
        },
      });
      router.push("/home");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save your profile.");
    } finally {
      setPending(false);
    }
  }

  if (ios.loading || !ios.profile) return <div className="auth"><div className="sk-card" style={{ width: 420 }} /></div>;

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={step === 2 ? finish : (event) => { event.preventDefault(); setStep((n) => n + 1); }}>
        <p className="kicker">Step {step + 1} of 3</p>
        <h1>{step === 0 ? "Where you study" : step === 1 ? "What you want" : "What you can prove"}</h1>
        {step === 0 ? (
          <div className="form-grid">
            <label className="field"><span>School</span><input className="input" value={form.school} onChange={(event) => patch("school", event.target.value)} required /></label>
            <label className="field"><span>Major</span><input className="input" value={form.major} onChange={(event) => patch("major", event.target.value)} required /></label>
            <label className="field"><span>Graduation year</span><input className="input" inputMode="numeric" value={form.graduationYear} onChange={(event) => patch("graduationYear", event.target.value)} required /></label>
            <label className="field"><span>Location</span><input className="input" value={form.location} onChange={(event) => patch("location", event.target.value)} placeholder="Boston, MA" required /></label>
          </div>
        ) : null}
        {step === 1 ? (
          <>
            <label className="field"><span>Work authorization</span><input className="input" value={form.workAuthorization} onChange={(event) => patch("workAuthorization", event.target.value)} placeholder="US citizen, F-1 OPT, need sponsorship…" required /></label>
            <fieldset className="field">
              <legend className="label">Roles</legend>
              <div className="chips">
                {ROLES.map((role) => (
                  <label key={role} className="chip">
                    <input
                      type="checkbox"
                      checked={form.roles.includes(role)}
                      onChange={(event) => {
                        patch("roles", event.target.checked ? [...form.roles, role] : form.roles.filter((item) => item !== role));
                      }}
                    /> {role}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="field"><span>Preferred cities</span><input className="input" value={form.locations} onChange={(event) => patch("locations", event.target.value)} /></label>
            <label className="row"><input type="checkbox" checked={form.remote} onChange={(event) => patch("remote", event.target.checked)} /> Open to remote</label>
          </>
        ) : null}
        {step === 2 ? (
          <>
            <p className="muted">Matches only use what you enter here. A sample background is labeled and editable.</p>
            <button
              type="button"
              className="btn"
              onClick={async () => {
                await ios.loadSample();
                router.push("/home");
              }}
            >
              Load sample background
            </button>
            <label className="field"><span>Skills, comma separated</span><input className="input" value={form.skills} onChange={(event) => patch("skills", event.target.value)} placeholder="Python, React, SQL" /></label>
            <label className="field"><span>One sentence summary</span><textarea className="textarea" value={form.summary} onChange={(event) => patch("summary", event.target.value)} /></label>
            <div className="form-grid">
              <label className="field"><span>Company or project</span><input className="input" value={form.company} onChange={(event) => patch("company", event.target.value)} /></label>
              <label className="field"><span>Title</span><input className="input" value={form.title} onChange={(event) => patch("title", event.target.value)} /></label>
            </div>
            <label className="field"><span>A bullet you can defend</span><textarea className="textarea" value={form.bullet} onChange={(event) => patch("bullet", event.target.value)} /></label>
            <label className="field">
              <span>Or upload a .txt resume</span>
              <input
                type="file"
                accept=".txt,.md,text/plain"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    await ios.uploadResume(file);
                    setError(null);
                  } catch (reason) {
                    setError(reason instanceof Error ? reason.message : "Upload failed.");
                  }
                }}
              />
            </label>
          </>
        ) : null}
        {error ? <p className="warn" role="alert">{error}</p> : null}
        <div className="row">
          {step > 0 ? <button type="button" className="btn" onClick={() => setStep((n) => n - 1)}>Back</button> : null}
          <button className="btn btn-primary" disabled={pending} type="submit">{step === 2 ? (pending ? "Saving…" : "See my matches") : "Continue"}</button>
        </div>
      </form>
    </div>
  );
}
