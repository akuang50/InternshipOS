import { NextResponse } from "next/server";
import type { Resume } from "@internshipos/types";
import { withDb } from "@/lib/db";
import { fail, requireUser } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const body = (await request.json().catch(() => null)) as Resume | null;
  if (!body) return fail("That resume update was empty.");
  const resume = await withDb((db) => {
    const next: Resume = {
      ...body,
      userId: auth.session.userId,
      id: body.id || `resume_${auth.session.userId}`,
      skills: (body.skills ?? []).map((skill) => skill.trim()).filter(Boolean).slice(0, 40),
      summary: (body.summary ?? "").slice(0, 1200),
      experiences: (body.experiences ?? []).slice(0, 12).map((exp) => ({
        ...exp,
        bullets: (exp.bullets ?? []).map((bullet) => bullet.slice(0, 400)).slice(0, 8),
      })),
      projects: (body.projects ?? []).slice(0, 12),
      education: (body.education ?? []).slice(0, 6),
      updatedAt: new Date().toISOString(),
    };
    const index = db.resumes.findIndex((item) => item.userId === auth.session.userId);
    if (index >= 0) db.resumes[index] = next;
    else db.resumes.push(next);
    return next;
  });
  return NextResponse.json({ resume });
}
