import type { CompanySize, Job, RoleFamily, Workplace } from "@internshipos/types";

export type JobFilters = {
  query: string;
  role: RoleFamily | "all";
  location: string;
  workplace: Workplace | "all";
  companySize: CompanySize | "all";
  industry: string;
  skill: string;
  visa: "all" | "sponsorship" | "no_sponsorship";
  graduationYear: number | "all";
  deadlineWithinDays: number | "all";
  posted: "all" | "brand_new" | "very_recent" | "recent" | "older";
  hiddenGems: boolean;
  maxEmployees: number | null;
};

export const EMPTY_FILTERS: JobFilters = {
  query: "",
  role: "all",
  location: "",
  workplace: "all",
  companySize: "all",
  industry: "",
  skill: "",
  visa: "all",
  graduationYear: "all",
  deadlineWithinDays: "all",
  posted: "all",
  hiddenGems: false,
  maxEmployees: null,
};

export function parseNaturalFilter(text: string): { filters: Partial<JobFilters>; notes: string[] } {
  const notes: string[] = [];
  const filters: Partial<JobFilters> = {};
  const q = text.toLowerCase();
  if (!q.trim()) return { filters, notes };

  const people = q.match(/(\d+)\s*-?\s*person/);
  if (people) {
    filters.maxEmployees = Number(people[1]) + 15;
    filters.hiddenGems = true;
    notes.push(`about ${people[1]} people`);
  }
  if (/startup|seed|yc\b|y combinator/.test(q)) {
    filters.hiddenGems = true;
    notes.push("early-stage companies");
  }
  if (/series a/.test(q)) notes.push("Series A");
  if (/remote/.test(q)) {
    filters.workplace = "remote";
    notes.push("remote");
  }
  if (/\bai\b|artificial intelligence|machine learning/.test(q)) {
    filters.industry = "AI";
    notes.push("AI");
  }
  if (/fintech|finance/.test(q)) {
    filters.industry = "Fintech";
    notes.push("fintech");
  }
  if (/health/.test(q)) {
    filters.industry = "Healthcare";
    notes.push("healthcare");
  }
  if (/\bswe\b|software engineer/.test(q)) {
    filters.role = "software";
    notes.push("software roles");
  }
  if (/design/.test(q)) {
    filters.role = "design";
    notes.push("design roles");
  }
  if (/boston/.test(q)) {
    filters.location = "Boston";
    notes.push("Boston");
  } else if (/new york|\bnyc\b/.test(q)) {
    filters.location = "New York";
    notes.push("New York");
  } else if (/san francisco|\bsf\b/.test(q)) {
    filters.location = "San Francisco";
    notes.push("San Francisco");
  }
  if (!notes.length) notes.push("No structured filters matched — using text search");
  return { filters, notes };
}

export function applyFilters<T extends Job>(jobs: T[], filters: JobFilters): T[] {
  return jobs.filter((job) => {
    if (filters.role !== "all" && job.roleFamily !== filters.role) return false;
    if (filters.workplace !== "all" && job.workplace !== filters.workplace) return false;
    if (filters.companySize !== "all" && job.companySize !== filters.companySize) return false;
    if (filters.industry && !job.industry.toLowerCase().includes(filters.industry.toLowerCase())) return false;
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.skill && !job.skills.some((skill) => skill.toLowerCase().includes(filters.skill.toLowerCase()))) {
      return false;
    }
    if (filters.visa === "sponsorship" && job.workAuth === "no_sponsorship") return false;
    if (filters.visa === "no_sponsorship" && job.workAuth === "sponsorship") return false;
    if (filters.graduationYear !== "all" && !job.graduationYears.includes(filters.graduationYear)) return false;
    if (filters.posted !== "all" && job.freshness.bucket !== filters.posted) return false;
    if (filters.hiddenGems && !["seed", "series_a", "series_b"].includes(job.companySize)) return false;
    if (filters.maxEmployees != null && job.employeeCount > filters.maxEmployees) return false;
    if (filters.deadlineWithinDays !== "all") {
      if (!job.deadline) return false;
      const days = (new Date(job.deadline).getTime() - Date.now()) / 86400000;
      if (days > filters.deadlineWithinDays || days < 0) return false;
    }
    if (filters.query.trim()) {
      const blob = `${job.company} ${job.title} ${job.location} ${job.skills.join(" ")} ${job.description}`.toLowerCase();
      const terms = filters.query.toLowerCase().split(/\s+/).filter((term) => term.length > 2);
      if (terms.length && !terms.every((term) => blob.includes(term))) return false;
    }
    return true;
  });
}
