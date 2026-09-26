import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { requireUser } from "@/lib/http";
import { presentApplication, presentJob } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth && auth.error) return auth.error;
  const { session } = auth;
  const payload = await withDb((db) => {
    const profile = db.profiles.find((item) => item.userId === session.userId);
    if (!profile) return null;
    const resume = db.resumes.find((item) => item.userId === session.userId) ?? null;
    const applications = db.applications
      .filter((item) => item.userId === session.userId)
      .map((item) => {
        const job = db.jobs.find((job) => job.id === item.jobId);
        return job ? presentApplication(item, job, profile, resume) : null;
      })
      .filter((item) => item !== null);
    const prep = db.prepSessions.find((item) => item.userId === session.userId && !item.completedAt) ?? null;
    return {
      profile,
      resume,
      jobs: db.jobs.map((job) => presentJob(job, profile, resume)),
      applications,
      session: prep,
      tasks: db.tasks.filter((item) => item.userId === session.userId).slice(-20),
    };
  });
  if (!payload) return NextResponse.json({ error: "Your profile is missing. Sign in again." }, { status: 401 });
  return NextResponse.json(payload);
}
