import type { ApplicationView, Job, MatchResult, Priority } from "@internshipos/types";

export function priorityFor(match: MatchResult, job: Job): Priority {
  const fresh = job.freshness.bucket === "brand_new" || job.freshness.bucket === "very_recent";
  if (match.overall >= 85 && fresh) return "apply_now";
  if (match.overall >= 85) return "apply_soon";
  if (match.overall >= 60) return "stretch";
  return "low";
}

function deadlineUrgency(job: Job, now: Date): number {
  if (!job.deadline) return 30;
  const days = (new Date(job.deadline).getTime() - now.getTime()) / 86400000;
  if (days < 0) return 20;
  if (days <= 3) return 100;
  if (days <= 7) return 80;
  if (days <= 14) return 60;
  return 40;
}

export function priorityScore(match: MatchResult, job: Job, stalled: boolean, now = new Date()): number {
  return (
    match.overall * 0.5 +
    job.freshness.freshnessScore * 0.25 +
    deadlineUrgency(job, now) * 0.15 +
    (stalled ? 100 : 0) * 0.1
  );
}

export function rankJobs<T extends { match: MatchResult; job: Job }>(items: T[], now = new Date()): T[] {
  return [...items].sort(
    (a, b) => priorityScore(b.match, b.job, false, now) - priorityScore(a.match, a.job, false, now),
  );
}

export function isStalled(status: ApplicationView["status"], updatedAt: string, now = new Date()): boolean {
  if (status !== "queued" && status !== "preparing" && status !== "saved") return false;
  return now.getTime() - new Date(updatedAt).getTime() > 48 * 3600 * 1000;
}

export function checklistFor(app: {
  tailored: ApplicationView["tailored"];
  coverLetter: ApplicationView["coverLetter"];
  answers: ApplicationView["answers"];
}): ApplicationView["checklist"] {
  const answered = app.answers.filter((item) => item.answer.trim()).length;
  const review = app.answers.filter((item) => item.confidence === "review" || !item.answer.trim()).length;
  return {
    resumeTailored: Boolean(app.tailored),
    coverLetter: Boolean(app.coverLetter?.text.trim()),
    questionsAnswered: answered,
    questionsTotal: app.answers.length,
    questionsNeedReview: app.answers.filter((item) => item.confidence === "review").length,
    networkingContacts: 0,
    autofillReady:
      Boolean(app.tailored) &&
      Boolean(app.coverLetter?.text.trim()) &&
      app.answers.length > 0 &&
      review === 0,
  };
}
