import type { AtsScore, Job, Resume, ResumeChange, TailoredResume } from "@internshipos/types";
import { includesTerm } from "./text";

function bulletScore(bullet: string, job: Job): number {
  const corpus = `${job.title} ${job.skills.join(" ")} ${job.requirements.join(" ")} ${job.description}`;
  let score = 0;
  for (const skill of job.skills) {
    if (includesTerm(bullet, skill) && includesTerm(corpus, skill)) score += 3;
  }
  const words = bullet.toLowerCase().split(/[^a-z0-9+#]+/).filter((word) => word.length > 4);
  for (const word of words) {
    if (corpus.toLowerCase().includes(word)) score += 1;
  }
  return score;
}

function reorder<T>(items: T[], score: (item: T) => number): T[] {
  return items
    .map((item, index) => ({ item, index, score: score(item) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}

export function atsOverlap(resume: Resume, job: Job): AtsScore {
  const corpus = [
    resume.summary,
    ...resume.skills,
    ...resume.experiences.flatMap((exp) => [exp.title, ...exp.bullets]),
    ...resume.projects.flatMap((project) => [project.name, ...project.bullets, ...project.skills]),
  ]
    .join(" ")
    .toLowerCase();

  const keywords = Array.from(new Set([...job.skills, ...job.degreeHints])).filter(Boolean);
  const present = keywords.filter((keyword) => corpus.includes(keyword.toLowerCase()));
  const missing = keywords.filter((keyword) => !corpus.includes(keyword.toLowerCase()));
  const score = keywords.length ? Math.round((present.length / keywords.length) * 100) : 0;
  return { score, present, missing };
}

export function tailorResume(resume: Resume, job: Job, now = new Date().toISOString()): TailoredResume {
  const changes: ResumeChange[] = [];
  const experiences = resume.experiences.map((exp) => {
    const bullets = reorder(exp.bullets, (bullet) => bulletScore(bullet, job));
    const before = exp.bullets.join(" · ");
    const after = bullets.join(" · ");
    if (before !== after) {
      changes.push({
        section: `${exp.title} at ${exp.company}`,
        before,
        after,
        reason: "Bullets you already wrote were reordered by overlap with this job. No new experience was added.",
      });
    }
    return { ...exp, bullets };
  });

  const projects = resume.projects.map((project) => {
    const bullets = reorder(project.bullets, (bullet) => bulletScore(bullet, job));
    if (bullets.join(" · ") !== project.bullets.join(" · ")) {
      changes.push({
        section: project.name,
        before: project.bullets.join(" · "),
        after: bullets.join(" · "),
        reason: "Project bullets were reordered toward the job description.",
      });
    }
    return { ...project, bullets };
  });

  const owned = new Set(resume.skills.map((skill) => skill.toLowerCase()));
  const leading = job.skills.filter((skill) => owned.has(skill.toLowerCase()));
  const rest = resume.skills.filter((skill) => !leading.some((item) => item.toLowerCase() === skill.toLowerCase()));
  const skills = [...leading, ...rest];
  if (skills.join("|") !== resume.skills.join("|")) {
    changes.push({
      section: "Skills",
      before: resume.skills.join(", "),
      after: skills.join(", "),
      reason: "Skills already on your resume were moved forward when this job asks for them.",
    });
  }

  const next: Resume = {
    ...resume,
    experiences,
    projects,
    skills,
    name: `${job.company} — ${resume.name}`,
    updatedAt: now,
  };

  if (!changes.length) {
    changes.push({
      section: "Resume",
      before: "Current order",
      after: "Current order",
      reason: "Your resume already leads with the bullets that overlap this job. Nothing was invented or reordered.",
    });
  }

  return {
    resume: next,
    changes,
    ats: atsOverlap(next, job),
    source: "rules",
    updatedAt: now,
  };
}
