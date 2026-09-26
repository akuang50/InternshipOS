import "server-only";
import { checklistFor, isStalled, matchJob, priorityFor } from "@internshipos/ai";
import { withFreshness } from "@internshipos/api";
import type { ApplicationRecord, ApplicationView, Job, Profile, Resume } from "@internshipos/types";

export function presentJob(job: Job, profile: Profile, resume: Resume | null) {
  const fresh = withFreshness(job);
  return { ...fresh, match: matchJob(profile, resume, fresh) };
}

export function presentApplication(
  app: ApplicationRecord,
  job: Job,
  profile: Profile,
  resume: Resume | null,
): ApplicationView {
  const fresh = withFreshness(job);
  const match = matchJob(profile, app.tailored?.resume ?? resume, fresh);
  return {
    ...app,
    job: fresh,
    match,
    priority: priorityFor(match, fresh),
    stalled: isStalled(app.status, app.updatedAt),
    checklist: checklistFor(app),
  };
}
