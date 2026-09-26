import type { Education, Experience, Profile, Project, Resume } from "@internshipos/types";
import { DEFAULT_PREFERENCES, DEFAULT_PRIVACY } from "@internshipos/types";

export const SAMPLE_BANNER =
  "Sample background loaded — edit anything that isn't you before you rely on a match.";

export function sampleProfile(userId: string, email: string): Profile {
  return {
    userId,
    name: "Alex Chen",
    email,
    school: "Northeastern University",
    major: "Computer Science",
    headline: "CS student building backend and React projects",
    location: "Boston, MA",
    graduationYear: 2027,
    preferences: {
      ...DEFAULT_PREFERENCES,
      roles: ["software"],
      locations: ["Boston", "New York", "Remote"],
      remote: true,
      industries: ["Fintech", "Developer tools"],
      workAuthorization: "US citizen",
    },
    privacy: { ...DEFAULT_PRIVACY },
    onboardingComplete: true,
  };
}

export function sampleResume(userId: string): Resume {
  const education: Education[] = [
    {
      id: "edu_sample",
      school: "Northeastern University",
      degree: "B.S.",
      major: "Computer Science",
      graduationYear: 2027,
    },
  ];
  const experiences: Experience[] = [
    {
      id: "exp_lab",
      company: "Campus Research Lab",
      title: "Undergraduate researcher",
      start: "2025-01",
      end: "Present",
      bullets: [
        "Built a Python service on AWS that stored experiment metadata in SQL and exposed it to a React dashboard.",
        "Wrote TypeScript endpoints so lab staff could filter runs without asking for a manual export.",
        "Cut a weekly reporting workflow from a spreadsheet to a query the team runs itself.",
      ],
    },
    {
      id: "exp_ta",
      company: "Northeastern University",
      title: "Teaching assistant, Fundamentals of CS",
      start: "2024-09",
      end: "2025-05",
      bullets: [
        "Held office hours for 40 students on Python assignments and debugging.",
        "Wrote short guides that reduced repeat questions about testing.",
      ],
    },
  ];
  const projects: Project[] = [
    {
      id: "proj_queue",
      name: "Shiftboard",
      bullets: [
        "Shipped a React and Node.js app for student club shift scheduling, with SQL for assignments and a simple permissions model.",
      ],
      skills: ["React", "Node.js", "SQL", "TypeScript"],
    },
  ];
  return {
    id: `resume_${userId}`,
    userId,
    name: "Alex Chen — general",
    summary:
      "Computer science student at Northeastern graduating in 2027. Most of my work is Python services, SQL, and React interfaces.",
    experiences,
    education,
    projects,
    skills: ["Python", "TypeScript", "React", "SQL", "AWS", "Node.js"],
    updatedAt: new Date().toISOString(),
  };
}
