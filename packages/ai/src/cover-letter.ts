import type { CoverLetter, CoverTone, Job, Profile, Resume } from "@internshipos/types";
import { includesTerm } from "./text";

function relevantBullets(resume: Resume, job: Job): string[] {
  const scored = resume.experiences.flatMap((exp) =>
    exp.bullets.map((bullet) => ({
      bullet: `As ${exp.title} at ${exp.company}, ${bullet.replace(/\.$/, "")}`,
      score: job.skills.filter((skill) => includesTerm(bullet, skill)).length,
    })),
  );
  scored.sort((a, b) => b.score - a.score);
  const picked = scored.filter((item) => item.score > 0).slice(0, 3);
  if (picked.length) return picked.map((item) => item.bullet);
  return scored.slice(0, 2).map((item) => item.bullet);
}

export function draftCoverLetter(input: {
  profile: Profile;
  resume: Resume | null;
  job: Job;
  tone: CoverTone;
  now?: string;
}): CoverLetter {
  const { profile, resume, job, tone } = input;
  const year = profile.graduationYear ? `, graduating in ${profile.graduationYear}` : "";
  const school = profile.school ? ` at ${profile.school}` : "";
  const major = profile.major ? `${profile.major} student` : "student";
  const personalize = profile.privacy.personalizeFromProfile && resume;
  const bullets = personalize && resume ? relevantBullets(resume, job) : [];
  const overlap = (resume?.skills ?? []).filter((skill) =>
    job.skills.some((wanted) => wanted.toLowerCase() === skill.toLowerCase()),
  );

  const opener = `I am applying for the ${job.title} role at ${job.company}. I am a ${major}${school}${year}.`;
  const mission = job.companySummary
    ? `From the listing: ${job.companySummary}`
    : `The listing does not include a company summary, so this draft does not invent one.`;

  const evidence = bullets.length
    ? bullets.map((bullet) => bullet.endsWith(".") ? bullet : `${bullet}.`).join(" ")
    : personalize
      ? "I kept this draft to facts already on my resume, and there is not a strong project overlap to quote."
      : "Personalization is off, so this draft does not quote resume bullets.";

  const skills = overlap.length
    ? `The role asks for ${overlap.slice(0, 4).join(", ")}, which are already on my resume.`
    : "I am not claiming skills from the posting that are absent from my resume.";

  const close =
    tone === "enthusiastic"
      ? `I would be glad to talk about how that work maps to this internship.`
      : tone === "detailed"
        ? `I can walk through the scope, constraints, and results of the work above in an interview.`
        : `Happy to discuss the overlap.`;

  const paragraphs =
    tone === "concise"
      ? [opener, skills, close]
      : [opener, mission, evidence, skills, close];

  return {
    text: paragraphs.join("\n\n"),
    tone,
    source: "rules",
    updatedAt: input.now ?? new Date().toISOString(),
  };
}
