import type { ApplicationRecord, Profile, Resume } from "@internshipos/types";

export type AutofillAnswer = {
  question: string;
  answer: string;
};

export type AutofillPacket = {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  degree: string;
  major: string;
  graduationYear: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  skills: string;
  headline: string;
  currentTitle: string;
  currentCompany: string;
  coverLetter: string;
  answers: AutofillAnswer[];
};

const blockedAnswer = /salary|compensation|pay expectation|sponsor|visa|authoriz|work auth/i;

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function autofillPacket(
  profile: Profile,
  resume: Resume | null,
  application: ApplicationRecord | null,
): AutofillPacket {
  const { firstName, lastName } = splitName(profile.name);
  const education = resume?.education[0];
  const experience = resume?.experiences[0];
  const answers = (application?.answers ?? []).filter(
    (item) => item.confidence === "high" && item.answer.trim() && !blockedAnswer.test(item.question),
  );
  return {
    fullName: profile.name.trim(),
    firstName,
    lastName,
    email: profile.email.trim(),
    phone: "",
    school: education?.school || profile.school,
    degree: education?.degree ?? "",
    major: education?.major || profile.major,
    graduationYear: String(education?.graduationYear || profile.graduationYear || ""),
    location: profile.location,
    linkedin: "",
    github: "",
    website: "",
    skills: (resume?.skills ?? []).join(", "),
    headline: resume?.summary || profile.headline,
    currentTitle: experience?.title ?? "",
    currentCompany: experience?.company ?? "",
    coverLetter: application?.coverLetter?.text.trim() ?? "",
    answers: answers.map((item) => ({ question: item.question, answer: item.answer })),
  };
}
