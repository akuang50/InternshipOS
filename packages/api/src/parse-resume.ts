import type { Resume } from "@internshipos/types";

export function parseResumeText(userId: string, filename: string, text: string, now = new Date().toISOString()): Resume {
  const lines = text.replace(/\r/g, "").split("\n").map((line) => line.trim()).filter(Boolean);
  const skillsLine = lines.find((line) => /^skills\s*:/i.test(line));
  const skills = skillsLine
    ? skillsLine.replace(/^skills\s*:/i, "").split(/[,|]/).map((skill) => skill.trim()).filter(Boolean)
    : [];
  const bullets = lines
    .filter((line) => /^[-•*]/.test(line))
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
  const summary = lines.find((line) => !/^skills\s*:/i.test(line) && !/^[-•*]/.test(line)) ?? "";

  return {
    id: `resume_${userId}`,
    userId,
    name: filename.replace(/\.[^.]+$/, "") || "Imported resume",
    summary: summary.slice(0, 600),
    experiences: bullets.length
      ? [
          {
            id: `exp_${Math.random().toString(36).slice(2, 8)}`,
            company: "Imported",
            title: "Experience from file",
            start: "",
            end: "",
            bullets: bullets.slice(0, 12),
          },
        ]
      : [],
    education: [],
    projects: [],
    skills: skills.slice(0, 30),
    updatedAt: now,
  };
}
