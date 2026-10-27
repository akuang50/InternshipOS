import { NextResponse } from "next/server";
import { normalize } from "@internshipos/ai";
import { withDb } from "@/lib/db";
import { fail, requireUser } from "@/lib/http";
import { autofillPacket } from "@/lib/autofill";
import { presentApplication, presentJob } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const title = url.searchParams.get("title") ?? "";
  const company = url.searchParams.get("company") ?? "";
  const pageUrl = url.searchParams.get("url") ?? "";
  const result = await withDb((db) => {
    const profile = db.profiles.find((item) => item.userId === auth.session.userId);
    if (!profile) return { error: "Sign in to InternshipOS first." };
    const resume = db.resumes.find((item) => item.userId === auth.session.userId) ?? null;
    const storedApp = (jobId: string) =>
      db.applications.find((item) => item.userId === auth.session.userId && item.jobId === jobId) ?? null;
    const byUrl = db.jobs.find((job) => job.sourceUrls.some((source) => pageUrl && (source === pageUrl || pageUrl.startsWith(source))));
    const companyNorm = normalize(company);
    const titleNorm = normalize(title);
    const byText = db.jobs.find((job) => {
      const sameCompany = companyNorm && normalize(job.company).includes(companyNorm);
      const sameTitle = titleNorm && (titleNorm.includes(normalize(job.title)) || normalize(job.title).includes(titleNorm));
      return Boolean(sameCompany && sameTitle);
    });
    const job = byUrl ?? byText;
    if (!job) {
      return {
        matched: false,
        message: "This posting isn't in your feed. Fill still uses your profile. Salary, work authorization, and the submit button stay blank.",
        autofill: autofillPacket(profile, resume, null),
      };
    }
    const presented = presentJob(job, profile, resume);
    const app = storedApp(job.id);
    return {
      matched: true,
      job: presented,
      application: app ? presentApplication(app, job, profile, resume) : null,
      autofill: autofillPacket(profile, resume, app),
    };
  });
  if ("error" in result && result.error) return fail(result.error, 401);
  return NextResponse.json(result);
}
