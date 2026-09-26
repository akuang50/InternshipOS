import { draftAnswers } from "@internshipos/ai";
import { NextResponse } from "next/server";
import type { AppAnswer, ApplicationStatus, CoverTone } from "@internshipos/types";
import { withDb } from "@/lib/db";
import { fail, requireUser } from "@/lib/http";
import { buildCoverLetter, buildTailoredResume } from "@/lib/drafts";
import { presentApplication } from "@/lib/view";

export const dynamic = "force-dynamic";

const STATUSES: ApplicationStatus[] = [
  "saved",
  "queued",
  "preparing",
  "ready",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
];

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    status?: ApplicationStatus;
    saved?: boolean;
    notes?: string;
    batchName?: string | null;
    answers?: AppAnswer[];
    action?: "tailor" | "cover" | "answers";
    tone?: CoverTone;
    coverText?: string;
    remove?: boolean;
  } | null;
  if (!body) return fail("Nothing to update.");

  const result = await withDb(async (db) => {
    const index = db.applications.findIndex((item) => item.id === id && item.userId === auth.session.userId);
    if (index < 0) return { error: "That application isn't in your account." };
    if (body.remove) {
      const [removed] = db.applications.splice(index, 1);
      db.prepSessions.forEach((session) => {
        session.applicationIds = session.applicationIds.filter((appId) => appId !== removed.id);
      });
      return { removed: true };
    }
    const app = db.applications[index];
    const profile = db.profiles.find((item) => item.userId === auth.session.userId);
    const job = db.jobs.find((item) => item.id === app.jobId);
    const resume = db.resumes.find((item) => item.userId === auth.session.userId) ?? null;
    if (!profile || !job) return { error: "That role is no longer available." };
    const now = new Date().toISOString();

    if (body.action === "tailor") {
      if (!resume) return { error: "Add a resume before tailoring." };
      app.tailored = await buildTailoredResume(db, profile, resume, job);
      if (app.status === "saved" || app.status === "queued") app.status = "preparing";
    }
    if (body.action === "cover") {
      app.coverLetter = await buildCoverLetter(db, profile, resume, job, body.tone ?? app.coverLetter?.tone ?? "concise");
    }
    if (body.action === "answers") {
      app.answers = draftAnswers(profile, resume, job);
    }
    if (body.status && STATUSES.includes(body.status)) {
      app.status = body.status;
      if (body.status === "applied" && !app.appliedAt) app.appliedAt = now;
    }
    if (typeof body.saved === "boolean") app.saved = body.saved;
    if (typeof body.notes === "string") app.notes = body.notes.slice(0, 4000);
    if (body.batchName !== undefined) app.batchName = body.batchName ? body.batchName.slice(0, 80) : null;
    if (body.answers) {
      app.answers = body.answers.map((answer) => ({
        ...answer,
        answer: answer.answer.slice(0, 4000),
        confidence: answer.answer.trim() ? "high" : "review",
        reason: answer.answer.trim() ? undefined : answer.reason,
      }));
      const original = app.coverLetter;
      if (original) original.updatedAt = original.updatedAt;
    }
    if (typeof body.coverText === "string" && app.coverLetter) {
      const edited = body.coverText !== app.coverLetter.text;
      app.coverLetter = { ...app.coverLetter, text: body.coverText.slice(0, 8000) };
      const event = [...db.aiEvents].reverse().find((item) => item.userId === auth.session.userId && item.feature === "cover_letter");
      if (event) event.accepted = !edited;
    }
    app.updatedAt = now;
    const event = db.aiEvents.filter((item) => item.userId === auth.session.userId).at(-1);
    if (event && body.answers) event.accepted = true;
    return { application: presentApplication(app, job, profile, resume) };
  });

  if ("error" in result && result.error) return fail(result.error, 400);
  return NextResponse.json(result);
}
