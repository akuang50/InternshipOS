import { NextResponse } from "next/server";
import type { ApplicationRecord } from "@internshipos/types";
import { newId, withDb } from "@/lib/db";
import { fail, requireUser } from "@/lib/http";
import { presentApplication } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const body = (await request.json().catch(() => null)) as { jobId?: string; mode?: "save" | "queue"; batchName?: string } | null;
  const jobId = body?.jobId ?? "";
  const mode = body?.mode === "queue" ? "queue" : "save";
  if (!jobId) return fail("Choose a role first.");
  const idempotency = request.headers.get("idempotency-key")?.slice(0, 80) ?? "";

  const result = await withDb((db) => {
    const profile = db.profiles.find((item) => item.userId === auth.session.userId);
    const job = db.jobs.find((item) => item.id === jobId);
    if (!profile || !job) return { error: "That role is no longer in the feed." };
    if (idempotency && db.idempotency[idempotency]?.userId === auth.session.userId) {
      const existingId = db.idempotency[idempotency].applicationId;
      const existing = db.applications.find((item) => item.id === existingId);
      if (existing) {
        const resume = db.resumes.find((item) => item.userId === auth.session.userId) ?? null;
        return { application: presentApplication(existing, job, profile, resume), alreadyTracked: true };
      }
    }
    const resume = db.resumes.find((item) => item.userId === auth.session.userId) ?? null;
    let app = db.applications.find((item) => item.userId === auth.session.userId && item.jobId === jobId);
    const now = new Date().toISOString();
    if (app) {
      app.saved = true;
      if (mode === "queue" && (app.status === "saved" || app.status === "withdrawn")) app.status = "queued";
      if (body?.batchName) app.batchName = body.batchName.slice(0, 80);
      app.updatedAt = now;
    } else {
      app = {
        id: newId("app"),
        userId: auth.session.userId,
        jobId,
        status: mode === "queue" ? "queued" : "saved",
        saved: true,
        batchName: body?.batchName?.slice(0, 80) || null,
        tailored: null,
        coverLetter: null,
        answers: [],
        notes: "",
        appliedAt: null,
        createdAt: now,
        updatedAt: now,
      } satisfies ApplicationRecord;
      db.applications.push(app);
    }
    if (idempotency) db.idempotency[idempotency] = { userId: auth.session.userId, applicationId: app.id };
    return { application: presentApplication(app, job, profile, resume), alreadyTracked: false };
  });
  if ("error" in result && result.error) return fail(result.error, 404);
  return NextResponse.json(result);
}
