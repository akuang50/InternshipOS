import "server-only";
import { completeText, draftCoverLetter, tailorResume } from "@internshipos/ai";
import type { CoverLetter, CoverTone, Job, Profile, Resume, TailoredResume } from "@internshipos/types";
import type { Database } from "./db";
import { newId } from "./db";

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function modelCallsThisMonth(db: Database, userId: string, now = new Date()): number {
  const key = monthKey(now.toISOString());
  return db.aiEvents.filter((event) => event.userId === userId && event.success && event.model !== "rules" && monthKey(event.createdAt) === key).length;
}

function config() {
  const apiKey = process.env.AI_API_KEY?.trim() || "";
  return {
    apiKey,
    baseUrl: process.env.AI_BASE_URL?.trim() || "https://api.openai.com/v1",
    fast: process.env.AI_MODEL_FAST?.trim() || "gpt-4o-mini",
    strong: process.env.AI_MODEL_STRONG?.trim() || "gpt-4o",
    cap: Number(process.env.AI_MONTHLY_CAP || 40),
  };
}

function record(
  db: Database,
  userId: string,
  feature: string,
  model: string,
  latencyMs: number,
  success: boolean,
) {
  db.aiEvents.push({
    id: newId("ai"),
    userId,
    feature,
    model,
    latencyMs,
    success,
    accepted: null,
    createdAt: new Date().toISOString(),
  });
}

function resumeHasSkill(resume: Resume, skill: string): boolean {
  const blob = `${resume.summary} ${resume.skills.join(" ")} ${resume.experiences.flatMap((item) => item.bullets).join(" ")} ${resume.projects.flatMap((item) => item.bullets).join(" ")}`.toLowerCase();
  return blob.includes(skill.toLowerCase());
}

export async function buildCoverLetter(
  db: Database,
  profile: Profile,
  resume: Resume | null,
  job: Job,
  tone: CoverTone,
): Promise<CoverLetter> {
  const rules = draftCoverLetter({ profile, resume, job, tone });
  const cfg = config();
  if (!cfg.apiKey || !resume) return rules;
  if (modelCallsThisMonth(db, profile.userId) >= cfg.cap) {
    return { ...rules, note: "Monthly model cap reached, so this draft was assembled from your profile." };
  }
  const started = Date.now();
  try {
    const text = await completeText({
      apiKey: cfg.apiKey,
      baseUrl: cfg.baseUrl,
      model: cfg.strong,
      timeoutMs: 20000,
      system:
        "Write a short internship cover letter using ONLY facts in the payload. Never invent employers, metrics, skills, or a company mission. If companySummary is null, do not describe the company. Return plain paragraphs only.",
      user: JSON.stringify({
        tone,
        name: profile.name,
        school: profile.school,
        major: profile.major,
        graduationYear: profile.graduationYear,
        workAuthorization: profile.preferences.workAuthorization,
        company: job.company,
        title: job.title,
        companySummary: job.companySummary,
        skillsOnResume: resume.skills,
        bullets: resume.experiences.flatMap((item) => item.bullets).slice(0, 8),
        projects: resume.projects.map((item) => item.name),
      }),
    });
    const invented = job.skills.filter((skill) => !resumeHasSkill(resume, skill) && text.toLowerCase().includes(skill.toLowerCase()));
    if (invented.length) {
      record(db, profile.userId, "cover_letter", cfg.strong, Date.now() - started, false);
      return { ...rules, note: "The model draft claimed a skill you don't have, so it was discarded." };
    }
    record(db, profile.userId, "cover_letter", cfg.strong, Date.now() - started, true);
    return { text, tone, source: "model", model: cfg.strong, updatedAt: new Date().toISOString() };
  } catch {
    record(db, profile.userId, "cover_letter", cfg.strong, Date.now() - started, false);
    return { ...rules, note: "The model request failed, so this draft was assembled from your profile." };
  }
}

export async function buildTailoredResume(db: Database, profile: Profile, resume: Resume, job: Job): Promise<TailoredResume> {
  const rules = tailorResume(resume, job);
  const cfg = config();
  if (!cfg.apiKey) return rules;
  if (modelCallsThisMonth(db, profile.userId) >= cfg.cap) {
    return { ...rules, note: "Monthly model cap reached. Bullets were reordered locally and nothing new was added." };
  }
  const started = Date.now();
  try {
    const raw = await completeText({
      apiKey: cfg.apiKey,
      baseUrl: cfg.baseUrl,
      model: cfg.fast,
      timeoutMs: 20000,
      system:
        "Reorder existing resume bullets for a job. Return JSON only: {\"orders\": number[][]}. Each inner array is a permutation of bullet indexes for that experience. Never write new text.",
      user: JSON.stringify({
        skills: job.skills,
        requirements: job.requirements,
        experiences: resume.experiences.map((exp) => exp.bullets),
      }),
    });
    const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, "")) as { orders?: number[][] };
    const orders = parsed.orders ?? [];
    const next = structuredClone(resume);
    let valid = orders.length === resume.experiences.length;
    if (valid) {
      resume.experiences.forEach((exp, index) => {
        const order = orders[index] ?? [];
        const unique = new Set(order);
        if (order.length !== exp.bullets.length || unique.size !== exp.bullets.length || order.some((n) => n < 0 || n >= exp.bullets.length)) {
          valid = false;
          return;
        }
        next.experiences[index] = { ...exp, bullets: order.map((n) => exp.bullets[n]) };
      });
    }
    record(db, profile.userId, "tailor_resume", cfg.fast, Date.now() - started, valid);
    if (!valid) return { ...rules, note: "The model reorder was invalid, so your existing bullets were arranged locally." };
    const local = tailorResume(next, job);
    return { ...local, source: "model", model: cfg.fast, note: "A model chose the order. Every bullet is still one you wrote." };
  } catch {
    record(db, profile.userId, "tailor_resume", cfg.fast, Date.now() - started, false);
    return { ...rules, note: "The model request failed. Bullets were reordered locally and nothing new was added." };
  }
}
