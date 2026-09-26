import { NextResponse } from "next/server";
import { SAMPLE_BANNER, sampleProfile, sampleResume } from "@internshipos/api";
import { withDb } from "@/lib/db";
import { fail, requireUser } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const saved = await withDb((db) => {
    const existing = db.profiles.find((item) => item.userId === auth.session.userId);
    if (!existing) return null;
    const sample = sampleProfile(auth.session.userId, existing.email);
    sample.name = existing.name || sample.name;
    Object.assign(existing, sample, { email: existing.email, userId: existing.userId });
    const resume = sampleResume(auth.session.userId);
    const index = db.resumes.findIndex((item) => item.userId === auth.session.userId);
    if (index >= 0) db.resumes[index] = resume;
    else db.resumes.push(resume);
    const user = db.users.find((item) => item.id === existing.userId);
    if (user) user.name = existing.name;
    return { profile: existing, resume, banner: SAMPLE_BANNER };
  });
  if (!saved) return fail("Your profile is missing. Sign in again.", 401);
  return NextResponse.json(saved);
}
