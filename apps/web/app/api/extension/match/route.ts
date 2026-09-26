import { NextResponse } from "next/server";
import { normalize } from "@internshipos/ai";
import { withDb } from "@/lib/db";
import { fail, requireUser } from "@/lib/http";
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
        message: "This posting isn't in your InternshipOS feed yet. The extension only matches roles the ingestion pipeline has already normalized.",
      };
    }
    const presented = presentJob(job, profile, resume);
    const app = db.applications.find((item) => item.userId === auth.session.userId && item.jobId === job.id);
    return {
      matched: true,
      job: presented,
      application: app ? presentApplication(app, job, profile, resume) : null,
    };
  });
  if ("error" in result && result.error) return fail(result.error, 401);
  return NextResponse.json(result);
}
