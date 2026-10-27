import type { HiringContact, Job, MatchResult, Profile, Resume } from "@internshipos/types";

export type OutreachAction = "send" | "optional" | "skip";

export type OutreachPlan = {
  action: OutreachAction;
  headline: string;
  reason: string;
  subject: string;
  body: string;
  contact: HiringContact;
};

function smallCompany(job: Job): boolean {
  return job.companySize === "seed" || job.companySize === "series_a" || job.employeeCount <= 120;
}

function greetingName(contact: HiringContact): string {
  if (contact.role !== "founder") return "";
  if (/team/i.test(contact.name)) return "";
  return contact.name.split(" ")[0] ?? "";
}

export function planOutreach(input: {
  job: Job;
  profile: Profile;
  resume: Resume | null;
  match: MatchResult;
}): OutreachPlan {
  const { job, profile, resume, match } = input;
  const contact = job.contact;
  const who = contact.role === "founder" ? "the founder" : "campus recruiting";
  let action: OutreachAction = "skip";
  let headline = "Apply, and skip the email";
  let reason = `${job.company} is large enough that a cold note will not boost this application. Put the time into the application itself.`;

  if (match.overall < 60) {
    headline = "Don't email yet";
    reason = "The match is weak. Emailing a recruiter or founder will not repair that, and it reads like a mass note.";
  } else if (contact.role === "founder" && smallCompany(job) && match.overall >= 75) {
    action = "send";
    headline = `Email ${contact.name}`;
    reason = `${job.company} has about ${job.employeeCount.toLocaleString()} people. A short note to the founder is the outreach most likely to get a human to look. It does not guarantee anything.`;
  } else if (contact.role === "founder" && smallCompany(job)) {
    action = "optional";
    headline = `Optional: email ${contact.name}`;
    reason = "A founder at a company this size may read mail, but your match has real gaps. Send only if you can talk about those gaps honestly.";
  } else if (match.overall >= 85) {
    action = "optional";
    headline = `Optional: email ${contact.name}`;
    reason = contact.role === "founder"
      ? `You are a strong match, and ${job.company} is past the size where a founder note moves an application. Use the recruiting inbox, not a personal guess.`
      : `A short note to ${who} can help a strong application get read. Emailing a founder will not boost this one.`;
  }

  const first = greetingName(contact);
  const bullet = profile.privacy.personalizeFromProfile
    ? resume?.experiences.flatMap((item) => item.bullets).find(Boolean)
    : undefined;
  const skill = (resume?.skills ?? []).find((item) =>
    job.skills.some((wanted) => wanted.toLowerCase() === item.toLowerCase()),
  );
  const school = profile.school ? ` at ${profile.school}` : "";
  const year = profile.graduationYear ? `, graduating in ${profile.graduationYear}` : "";
  const major = profile.major || "a";
  const lines = [
    first ? `Hello ${first},` : "Hello,",
    "",
    `I'm ${profile.name}, a ${major} student${school}${year}. I'm applying for the ${job.title} role at ${job.company}.`,
  ];
  if (bullet) lines.push("", bullet.endsWith(".") ? bullet : `${bullet}.`);
  if (skill) lines.push("", `The listing asks for ${skill}, which is already on my resume.`);
  if (job.companySummary) lines.push("", `I'm writing because of this: ${job.companySummary.replace(/\.$/, "")}.`);
  lines.push(
    "",
    "If you are the right person for this application, I would be glad for it to be looked at. If you are not, I won't send a second note.",
    "",
    profile.name,
  );

  return {
    action,
    headline,
    reason,
    subject: `${profile.name} — ${job.title}`,
    body: lines.join("\n"),
    contact,
  };
}
