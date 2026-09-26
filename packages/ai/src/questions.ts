import type { AppAnswer, Job, Profile, Resume } from "@internshipos/types";

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function draftAnswers(profile: Profile, resume: Resume | null, job: Job): AppAnswer[] {
  const overlap = (resume?.skills ?? []).filter((skill) =>
    job.skills.some((wanted) => wanted.toLowerCase() === skill.toLowerCase()),
  );
  const project = resume?.projects[0];
  const auth = profile.preferences.workAuthorization.trim();
  const grad = profile.graduationYear ? String(profile.graduationYear) : "";

  const why = overlap.length
    ? `I am interested in the ${job.title} role at ${job.company} because the listing emphasizes ${overlap.slice(0, 3).join(", ")}, which I already use.`
    : "";

  return [
    {
      id: id("why"),
      question: `Why do you want to work at ${job.company}?`,
      answer: why,
      confidence: why ? "high" : "review",
      reason: why ? undefined : "No overlapping skills to ground a specific answer. Write this yourself.",
    },
    {
      id: id("auth"),
      question: "Are you authorized to work in the United States?",
      answer: auth,
      confidence: auth ? "high" : "review",
      reason: auth ? undefined : "Left blank on purpose. Work authorization is never guessed.",
    },
    {
      id: id("grad"),
      question: "When do you graduate?",
      answer: grad,
      confidence: grad ? "high" : "review",
      reason: grad ? undefined : "Add a graduation year to your profile.",
    },
    {
      id: id("project"),
      question: "Tell us about a project relevant to this role.",
      answer: project
        ? `${project.name}: ${project.bullets[0] ?? ""}`.trim()
        : "",
      confidence: project ? "high" : "review",
      reason: project ? undefined : "No project on your resume yet.",
    },
    {
      id: id("salary"),
      question: "What are your salary expectations?",
      answer: "",
      confidence: "review",
      reason: "Left blank on purpose. Compensation is never guessed.",
    },
  ];
}
