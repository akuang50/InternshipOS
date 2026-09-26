import type { CompanySize, RoleFamily, WorkAuth, Workplace } from "@internshipos/types";

export type ListingMeta = {
  workplace: Workplace;
  requirements: string[];
  skills: string[];
  industry: string;
  companySize: CompanySize;
  employeeCount: number;
  companySummary: string | null;
  openedHoursAgo: number;
  deadlineDaysFromNow: number | null;
  workAuth: WorkAuth;
  graduationYears: number[];
  roleFamily: RoleFamily;
  degreeHints: string[];
};

export type GreenhousePayload = {
  source: "greenhouse";
  id: number;
  company_name: string;
  title: string;
  location: { name: string };
  absolute_url: string;
  content: string;
  updated_at_offset_hours: number;
  metadata: ListingMeta;
};

export type LeverPayload = {
  source: "lever";
  id: string;
  categories: { team: string; location: string; commitment: string };
  text: string;
  descriptionPlain: string;
  hostedUrl: string;
  createdAtOffsetHours: number;
  metadata: ListingMeta;
};

export type AshbyPayload = {
  source: "ashby";
  id: string;
  organization: string;
  title: string;
  locationName: string;
  jobUrl: string;
  descriptionHtml: string;
  publishedAtOffsetHours: number;
  metadata: ListingMeta;
};

export type WorkdayPayload = {
  source: "workday";
  id: string;
  company: string;
  title: string;
  locationsText: string;
  externalUrl: string;
  jobDescription: string;
  postedOffsetHours: number;
  metadata: ListingMeta;
};

const sweReqs = (extra: string[]): string[] => [
  "Currently pursuing a degree in computer science or a related technical field",
  "Experience building with Python or TypeScript",
  "Comfort writing SQL against a relational database",
  ...extra,
];

export const greenhouseListings: GreenhousePayload[] = [
  {
    source: "greenhouse",
    id: 41021,
    company_name: "Stripe",
    title: "Software Engineering Intern",
    location: { name: "New York, NY" },
    absolute_url: "https://stripe.com/jobs/listing/swe-intern-ny",
    content:
      "Stripe builds economic infrastructure for the internet. This internship is on a product engineering team shipping APIs used by businesses. You will write TypeScript and Python services, review SQL-backed changes, and work with React surfaces used by developers.",
    updated_at_offset_hours: 6,
    metadata: {
      workplace: "hybrid",
      requirements: sweReqs(["Familiarity with AWS or another cloud provider", "Able to explain a backend project you shipped"]),
      skills: ["Python", "TypeScript", "React", "SQL", "AWS"],
      industry: "Fintech",
      companySize: "public",
      employeeCount: 8000,
      companySummary: "Stripe builds payments and financial infrastructure for internet businesses.",
      openedHoursAgo: 6,
      deadlineDaysFromNow: 6,
      workAuth: "sponsorship",
      graduationYears: [2026, 2027, 2028],
      roleFamily: "software",
      degreeHints: ["computer science", "related technical"],
    },
  },
  {
    source: "greenhouse",
    id: 41088,
    company_name: "Datadog",
    title: "Software Engineering Intern",
    location: { name: "New York, NY" },
    absolute_url: "https://careers.datadoghq.com/jobs/swe-intern",
    content:
      "Datadog is a monitoring and security platform. Interns join a product team working on ingestion pipelines, TypeScript services, and React dashboards. You should be comfortable with SQL and debugging production-shaped systems.",
    updated_at_offset_hours: 26,
    metadata: {
      workplace: "hybrid",
      requirements: sweReqs(["Interest in observability, APIs, or distributed systems"]),
      skills: ["TypeScript", "Python", "React", "SQL", "Go"],
      industry: "Developer tools",
      companySize: "public",
      employeeCount: 6000,
      companySummary: "Datadog builds monitoring and security products for engineering teams.",
      openedHoursAgo: 26,
      deadlineDaysFromNow: 9,
      workAuth: "sponsorship",
      graduationYears: [2026, 2027, 2028],
      roleFamily: "software",
      degreeHints: ["computer science"],
    },
  },
  {
    source: "greenhouse",
    id: 41102,
    company_name: "Ramp",
    title: "Software Engineering Intern",
    location: { name: "New York, NY" },
    absolute_url: "https://jobs.greenhouse.io/ramp/jobs/swe-intern",
    content:
      "Ramp builds finance automation for companies. The internship sits with a product team shipping TypeScript backends and React workflows around cards, bills, and accounting data stored in SQL.",
    updated_at_offset_hours: 30,
    metadata: {
      workplace: "onsite",
      requirements: sweReqs(["You have shipped a web product, even a class project"]),
      skills: ["TypeScript", "React", "SQL", "Node.js"],
      industry: "Fintech",
      companySize: "growth",
      employeeCount: 1200,
      companySummary: "Ramp builds corporate cards and finance automation software.",
      openedHoursAgo: 30,
      deadlineDaysFromNow: 12,
      workAuth: "no_sponsorship",
      graduationYears: [2026, 2027],
      roleFamily: "software",
      degreeHints: ["computer science", "related technical"],
    },
  },
  {
    source: "greenhouse",
    id: 41220,
    company_name: "Notion",
    title: "Product Engineering Intern",
    location: { name: "San Francisco, CA" },
    absolute_url: "https://jobs.ashbyhq.com/notion/product-eng-intern",
    content:
      "Notion's product engineering interns work across a TypeScript and React codebase used by millions of people. Projects tend to be user-facing and include performance, editor behavior, and API design.",
    updated_at_offset_hours: 5,
    metadata: {
      workplace: "hybrid",
      requirements: sweReqs(["A portfolio or project you can demo"]),
      skills: ["TypeScript", "React", "Node.js"],
      industry: "Productivity",
      companySize: "growth",
      employeeCount: 800,
      companySummary: "Notion builds a workspace for notes, docs, and lightweight databases.",
      openedHoursAgo: 5,
      deadlineDaysFromNow: 14,
      workAuth: "sponsorship",
      graduationYears: [2026, 2027, 2028],
      roleFamily: "software",
      degreeHints: ["computer science"],
    },
  },
  {
    source: "greenhouse",
    id: 41330,
    company_name: "Figma",
    title: "Product Design Intern",
    location: { name: "New York, NY" },
    absolute_url: "https://www.figma.com/careers/design-intern",
    content:
      "Figma's design internship is for people who ship interface work. You will partner with product design on prototyping, visual design, and research readouts. A portfolio is required. This is not a software engineering seat.",
    updated_at_offset_hours: 18,
    metadata: {
      workplace: "hybrid",
      requirements: [
        "Portfolio of interface design work",
        "Experience with Figma",
        "Ability to present design decisions",
      ],
      skills: ["Figma", "Prototyping", "Visual design", "User research"],
      industry: "Design tools",
      companySize: "public",
      employeeCount: 2000,
      companySummary: "Figma builds a collaborative interface design platform.",
      openedHoursAgo: 18,
      deadlineDaysFromNow: 8,
      workAuth: "sponsorship",
      graduationYears: [2026, 2027, 2028],
      roleFamily: "design",
      degreeHints: ["design", "hci"],
    },
  },
];

export const leverListings: LeverPayload[] = [
  {
    source: "lever",
    id: "dd-swe-intern-lever",
    categories: { team: "Datadog", location: "New York, NY", commitment: "Intern" },
    text: "Software Engineering Intern",
    descriptionPlain:
      "Datadog is a monitoring and security platform. Interns join a product team working on ingestion pipelines, TypeScript services, and React dashboards. You should be comfortable with SQL and debugging production-shaped systems.",
    hostedUrl: "https://jobs.lever.co/datadog/swe-intern-ny",
    createdAtOffsetHours: 20,
    metadata: greenhouseListings[1].metadata,
  },
  {
    source: "lever",
    id: "vercel-swe",
    categories: { team: "Vercel", location: "Remote — United States", commitment: "Intern" },
    text: "Software Engineering Intern",
    descriptionPlain:
      "Vercel builds the framework and platform teams use to ship web apps. Interns work on Next.js-adjacent product surfaces, TypeScript services, and React UI. Remote within the United States.",
    hostedUrl: "https://vercel.com/careers/swe-intern",
    createdAtOffsetHours: 50,
    metadata: {
      workplace: "remote",
      requirements: sweReqs(["You have built and deployed a React app"]),
      skills: ["TypeScript", "React", "Next.js", "Node.js"],
      industry: "Developer tools",
      companySize: "growth",
      employeeCount: 600,
      companySummary: "Vercel builds frontend cloud infrastructure and the Next.js framework.",
      openedHoursAgo: 50,
      deadlineDaysFromNow: 18,
      workAuth: "no_sponsorship",
      graduationYears: [2026, 2027, 2028],
      roleFamily: "software",
      degreeHints: ["computer science"],
    },
  },
  {
    source: "lever",
    id: "duolingo-swe",
    categories: { team: "Duolingo", location: "Pittsburgh, PA", commitment: "Intern" },
    text: "Software Engineering Intern",
    descriptionPlain:
      "Duolingo's engineering interns ship product features in Python and React used by language learners. You will write tested code, query SQL, and present your work at the end of the summer.",
    hostedUrl: "https://careers.duolingo.com/swe-intern",
    createdAtOffsetHours: 10,
    metadata: {
      workplace: "hybrid",
      requirements: sweReqs(["Interest in education products or consumer apps"]),
      skills: ["Python", "React", "SQL"],
      industry: "Education",
      companySize: "public",
      employeeCount: 700,
      companySummary: "Duolingo builds a language-learning product used by students worldwide.",
      openedHoursAgo: 10,
      deadlineDaysFromNow: 11,
      workAuth: "sponsorship",
      graduationYears: [2026, 2027, 2028],
      roleFamily: "software",
      degreeHints: ["computer science", "related technical"],
    },
  },
];

export const ashbyListings: AshbyPayload[] = [
  {
    source: "ashby",
    id: "linear-intern",
    organization: "Linear",
    title: "Product Engineer Intern",
    locationName: "Remote — United States",
    jobUrl: "https://linear.app/careers/product-engineer-intern",
    descriptionHtml:
      "Linear builds project tracking for software teams. This internship is for a product engineer who writes TypeScript, cares about interface quality, and has shipped a React app. The team is small and the codebase is TypeScript end to end.",
    publishedAtOffsetHours: 8,
    metadata: {
      workplace: "remote",
      requirements: sweReqs(["Taste for product detail and a project you can walk through"]),
      skills: ["TypeScript", "React", "Node.js"],
      industry: "Developer tools",
      companySize: "series_b",
      employeeCount: 80,
      companySummary: "Linear builds issue tracking and project planning software for product teams.",
      openedHoursAgo: 8,
      deadlineDaysFromNow: 20,
      workAuth: "no_sponsorship",
      graduationYears: [2026, 2027, 2028],
      roleFamily: "software",
      degreeHints: ["computer science"],
    },
  },
  {
    source: "ashby",
    id: "northwind-intern",
    organization: "Northwind AI",
    title: "Software Engineering Intern",
    locationName: "Remote — United States",
    jobUrl: "https://jobs.ashbyhq.com/northwind-ai/swe-intern",
    descriptionHtml:
      "Northwind AI is a 20-person startup building internal tools that draft support replies. Interns ship Python services and a React console. You will work directly with the founding engineer. Seed stage, YC-style pace, no dedicated recruiting team.",
    publishedAtOffsetHours: 3,
    metadata: {
      workplace: "remote",
      requirements: sweReqs(["Comfort in a small team with ambiguous tasks"]),
      skills: ["Python", "React", "TypeScript", "SQL"],
      industry: "AI",
      companySize: "seed",
      employeeCount: 20,
      companySummary: "Northwind AI builds support-drafting tools for small software companies.",
      openedHoursAgo: 3,
      deadlineDaysFromNow: 15,
      workAuth: "any",
      graduationYears: [2026, 2027, 2028, 2029],
      roleFamily: "software",
      degreeHints: ["computer science", "related technical"],
    },
  },
  {
    source: "ashby",
    id: "harbor-intern",
    organization: "Harbor",
    title: "Software Engineering Intern",
    locationName: "Boston, MA",
    jobUrl: "https://jobs.ashbyhq.com/harbor/swe-intern",
    descriptionHtml:
      "Harbor is a Series A fintech company in Boston working on treasury workflows for startups. Interns write TypeScript, SQL, and React. The team is about 40 people.",
    publishedAtOffsetHours: 15,
    metadata: {
      workplace: "hybrid",
      requirements: sweReqs(["Interest in financial products"]),
      skills: ["TypeScript", "React", "SQL"],
      industry: "Fintech",
      companySize: "series_a",
      employeeCount: 40,
      companySummary: "Harbor builds treasury software for startup finance teams.",
      openedHoursAgo: 15,
      deadlineDaysFromNow: 10,
      workAuth: "sponsorship",
      graduationYears: [2026, 2027, 2028],
      roleFamily: "software",
      degreeHints: ["computer science"],
    },
  },
  {
    source: "ashby",
    id: "lumen-intern",
    organization: "Lumen Health",
    title: "Software Engineering Intern",
    locationName: "Boston, MA",
    jobUrl: "https://jobs.ashbyhq.com/lumen-health/swe-intern",
    descriptionHtml:
      "Lumen Health is a Series A company building scheduling tools for clinics. The internship is hybrid in Boston. You will work on a Python API and a React scheduling UI backed by SQL.",
    publishedAtOffsetHours: 40,
    metadata: {
      workplace: "hybrid",
      requirements: sweReqs(["Care about readable code in a regulated environment"]),
      skills: ["Python", "React", "SQL"],
      industry: "Healthcare",
      companySize: "series_a",
      employeeCount: 55,
      companySummary: "Lumen Health builds scheduling software for outpatient clinics.",
      openedHoursAgo: 40,
      deadlineDaysFromNow: 16,
      workAuth: "any",
      graduationYears: [2026, 2027, 2028],
      roleFamily: "software",
      degreeHints: ["computer science", "related technical"],
    },
  },
];

export const workdayListings: WorkdayPayload[] = [
  {
    source: "workday",
    id: "spotify-2026-intern",
    company: "Spotify",
    title: "Backend Engineering Intern",
    locationsText: "New York, NY",
    externalUrl: "https://www.lifeatspotify.com/students/backend-intern",
    jobDescription:
      "Spotify backend interns work on Java and Python services that power personalization. You will write tested service code, use SQL, and learn how a large consumer platform ships. This posting has been open for more than a week.",
    postedOffsetHours: 24 * 9,
    metadata: {
      workplace: "hybrid",
      requirements: [
        "Pursuing a computer science degree",
        "Experience with Python or Java",
        "Understanding of SQL",
        "A service or backend project you can explain",
      ],
      skills: ["Python", "Java", "SQL"],
      industry: "Consumer",
      companySize: "public",
      employeeCount: 9000,
      companySummary: "Spotify builds a music and podcast streaming service.",
      openedHoursAgo: 24 * 9,
      deadlineDaysFromNow: 4,
      workAuth: "sponsorship",
      graduationYears: [2026, 2027],
      roleFamily: "software",
      degreeHints: ["computer science"],
    },
  },
  {
    source: "workday",
    id: "anthropic-re-intern",
    company: "Anthropic",
    title: "Research Engineering Intern",
    locationsText: "San Francisco, CA",
    externalUrl: "https://www.anthropic.com/careers/research-engineering-intern",
    jobDescription:
      "Research engineering interns work with applied research teams on evaluation tooling. The listing expects Python, prior machine learning coursework or research, and comfort reading papers. Product internships without ML experience are a poor fit.",
    postedOffsetHours: 12,
    metadata: {
      workplace: "onsite",
      requirements: [
        "Python proficiency",
        "Machine learning coursework or research experience",
        "Ability to read an ML paper and reproduce a small experiment",
      ],
      skills: ["Python", "Machine learning", "PyTorch", "Research"],
      industry: "AI",
      companySize: "growth",
      employeeCount: 1500,
      companySummary: "Anthropic builds AI systems and research around model safety.",
      openedHoursAgo: 12,
      deadlineDaysFromNow: 4,
      workAuth: "no_sponsorship",
      graduationYears: [2026, 2027, 2028],
      roleFamily: "research",
      degreeHints: ["computer science", "machine learning"],
    },
  },
];
