import type {
  Job,
  MatchFactor,
  MatchLabel,
  MatchResult,
  Profile,
  Resume,
} from "@internshipos/types";
import { clampScore, includesTerm, resumeCorpus } from "./text";

function labelFor(score: number): MatchLabel {
  if (score >= 85) return "Strong Match";
  if (score >= 72) return "Good Match";
  if (score >= 55) return "Stretch";
  return "Low priority";
}

function skillScore(resume: Resume | null, job: Job): { score: number; hit: string[]; miss: string[] } {
  const owned = new Set((resume?.skills ?? []).map((skill) => skill.toLowerCase()));
  const hit = job.skills.filter((skill) => owned.has(skill.toLowerCase()));
  const miss = job.skills.filter((skill) => !owned.has(skill.toLowerCase()));
  if (!job.skills.length) return { score: 70, hit, miss };
  return { score: clampScore((hit.length / job.skills.length) * 100), hit, miss };
}

function experienceScore(corpus: string, job: Job): number {
  const needles = [...job.skills, ...job.requirements.flatMap((req) => req.split(/[,.]/))].slice(0, 24);
  if (!corpus.trim()) return 35;
  const hits = needles.filter((needle) => includesTerm(corpus, needle.trim())).length;
  if (!needles.length) return 70;
  return clampScore(35 + 65 * (hits / needles.length));
}

function educationScore(resume: Resume | null, profile: Profile, job: Job): number {
  const major = `${profile.major} ${(resume?.education ?? []).map((item) => `${item.major} ${item.degree}`).join(" ")}`;
  if (!job.degreeHints.length) return major.trim() ? 100 : 70;
  const hit = job.degreeHints.some((hint) => includesTerm(major, hint) || includesTerm(hint, profile.major));
  return hit ? 100 : major.trim() ? 62 : 40;
}

function locationScore(profile: Profile, job: Job): number {
  const places = [profile.location, ...profile.preferences.locations].map((item) => item.toLowerCase());
  const city = job.location.toLowerCase();
  const cityHit = places.some((place) => place && (city.includes(place) || place.includes(city.split(",")[0].trim())));
  if (job.workplace === "remote" && (profile.preferences.remote || cityHit)) return 100;
  if (cityHit) return 100;
  if (job.workplace === "remote") return 88;
  return 48;
}

function graduationScore(profile: Profile, job: Job): number {
  if (!profile.graduationYear || !job.graduationYears.length) return profile.graduationYear ? 90 : 60;
  return job.graduationYears.includes(profile.graduationYear) ? 100 : 42;
}

function workAuthScore(profile: Profile, job: Job): { score: number; gap?: string } {
  const auth = profile.preferences.workAuthorization.trim().toLowerCase();
  if (!auth) return { score: 70, gap: "Work authorization is blank on your profile, so this score stays tentative." };
  if (job.workAuth === "any" || job.workAuth === "sponsorship") return { score: 96 };
  const needsSponsor = /f-1|opt|cpt|sponsor|h-1|visa|international/.test(auth);
  if (needsSponsor && job.workAuth === "no_sponsorship") {
    return {
      score: 38,
      gap: "This listing does not offer sponsorship. Your profile says you may need it.",
    };
  }
  return { score: 95 };
}

function roleScore(profile: Profile, job: Job): number {
  if (!profile.preferences.roles.length) return 80;
  return profile.preferences.roles.includes(job.roleFamily) ? 100 : 46;
}

function requirementMet(corpus: string, requirement: string, skills: string[]): boolean {
  const skillHit = skills.some((skill) => includesTerm(requirement, skill) && includesTerm(corpus, skill));
  if (skillHit) return true;
  const words = requirement
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((word) => word.length > 4);
  if (!words.length) return false;
  const hits = words.filter((word) => corpus.toLowerCase().includes(word)).length;
  return hits >= Math.min(2, words.length);
}

export function matchJob(profile: Profile, resume: Resume | null, job: Job): MatchResult {
  const personalize = profile.privacy.personalizeFromProfile;
  const corpus = resumeCorpus({
    summary: resume?.summary,
    skills: resume?.skills ?? [],
    experiences: resume?.experiences,
    projects: resume?.projects,
    education: resume?.education,
    personalize,
  });
  const skills = skillScore(resume, job);
  const experience = personalize ? experienceScore(corpus, job) : Math.min(skills.score, 74);
  const education = educationScore(resume, profile, job);
  const location = locationScore(profile, job);
  const graduation = graduationScore(profile, job);
  const auth = workAuthScore(profile, job);
  const role = roleScore(profile, job);

  const factors: MatchFactor[] = [
    { key: "skills", label: "Technical skills", score: skills.score },
    { key: "experience", label: "Experience", score: experience },
    { key: "education", label: "Education", score: education },
    { key: "location", label: "Location", score: location },
    { key: "graduation", label: "Graduation", score: graduation },
    { key: "workAuth", label: "Work auth", score: auth.score },
    { key: "role", label: "Role preference", score: role },
  ];

  const overall = clampScore(
    skills.score * 0.3 +
      experience * 0.18 +
      education * 0.1 +
      location * 0.12 +
      graduation * 0.1 +
      auth.score * 0.1 +
      role * 0.1,
  );

  const metFlags = job.requirements.map((requirement) =>
    requirementMet(corpus, requirement, resume?.skills ?? []),
  );
  const qualificationsMet = metFlags.filter(Boolean).length;

  const why: string[] = [];
  if (skills.hit.length) why.push(`Your skills include ${skills.hit.slice(0, 4).join(", ")}.`);
  if (role >= 90) why.push(`This is a ${job.roleFamily} role, which matches what you said you want.`);
  if (location >= 90) why.push(`${job.location} · ${job.workplace} fits your location preferences.`);
  if (graduation >= 90 && profile.graduationYear) {
    why.push(`Your class of ${profile.graduationYear} is inside the listing's graduation window.`);
  }
  if (personalize) {
    const exp = resume?.experiences[0];
    if (exp && experience >= 70) {
      why.push(`Experience on your resume as ${exp.title} at ${exp.company} overlaps this description.`);
    }
  } else {
    why.push("Personalization is off, so this match uses your stated skills and preferences only.");
  }
  if (!why.length) why.push("Little on your profile overlaps this listing yet.");

  const gaps: string[] = [];
  if (skills.miss.length) gaps.push(`Missing listed skills: ${skills.miss.slice(0, 4).join(", ")}.`);
  if (auth.gap) gaps.push(auth.gap);
  if (location < 70) gaps.push(`${job.location} is outside the locations on your profile.`);
  if (role < 70) gaps.push(`You have not marked ${job.roleFamily} as a target role.`);
  if (graduation < 70 && profile.graduationYear) {
    gaps.push(`Listing targets ${job.graduationYears.join(", ")}; you graduate in ${profile.graduationYear}.`);
  }
  job.requirements.forEach((requirement, index) => {
    if (!metFlags[index] && gaps.length < 4) gaps.push(`Not clearly supported: ${requirement}`);
  });

  let recommendation = "Open the listing and decide if the gaps are real for you.";
  if (overall >= 85) {
    recommendation = skills.miss.length
      ? `Strong match. Tailor your resume toward ${skills.hit.slice(0, 2).join(" and ") || "the overlapping skills"}.`
      : "Strong match. Tailor your resume around the experience that overlaps this description.";
  } else if (overall >= 72) {
    recommendation = "Good match. Read the gaps before you spend time on a tailored draft.";
  } else if (overall >= 55) {
    recommendation = "Stretch role. Apply only if you can speak to the gaps honestly.";
  } else {
    recommendation = "Weak overlap with your profile. Your time is probably better on a stronger match.";
  }

  return {
    overall,
    label: labelFor(overall),
    factors,
    why: why.slice(0, 4),
    gaps: gaps.slice(0, 4),
    recommendation,
    qualificationsMet,
    qualificationsTotal: job.requirements.length,
  };
}
