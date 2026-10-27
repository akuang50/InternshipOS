export type Workplace = "remote" | "hybrid" | "onsite";

export type CompanySize = "seed" | "series_a" | "series_b" | "growth" | "public";

export type RoleFamily = "software" | "design" | "product" | "data" | "research";

export type WorkAuth = "sponsorship" | "no_sponsorship" | "any";

export type FreshnessBucket = "brand_new" | "very_recent" | "recent" | "older";

export type JobFreshness = {
  firstSeenAt: string;
  sourcePostedAt: string;
  lastSeenAt: string;
  freshnessScore: number;
  isNew: boolean;
  isRecentlyOpened: boolean;
  label: string;
  bucket: FreshnessBucket;
};

export type JobSource = {
  name: "greenhouse" | "lever" | "ashby" | "workday";
  url: string;
};

export type HiringContact = {
  name: string;
  role: "founder" | "recruiter";
  title: string;
  email: string;
};

export type Job = {
  id: string;
  company: string;
  title: string;
  location: string;
  workplace: Workplace;
  description: string;
  requirements: string[];
  skills: string[];
  applicationUrl: string;
  sourceUrls: string[];
  sources: JobSource[];
  industry: string;
  companySize: CompanySize;
  employeeCount: number;
  companySummary: string | null;
  deadline: string | null;
  workAuth: WorkAuth;
  graduationYears: number[];
  roleFamily: RoleFamily;
  degreeHints: string[];
  descriptionHash: string;
  freshness: JobFreshness;
  contact: HiringContact;
};

export type Experience = {
  id: string;
  company: string;
  title: string;
  start: string;
  end: string;
  bullets: string[];
};

export type Education = {
  id: string;
  school: string;
  degree: string;
  major: string;
  graduationYear: number;
};

export type Project = {
  id: string;
  name: string;
  bullets: string[];
  skills: string[];
};

export type Resume = {
  id: string;
  userId: string;
  name: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  updatedAt: string;
};

export type PrivacySettings = {
  personalizeFromProfile: boolean;
  saveAiHistory: boolean;
  shareAnonymizedProductData: boolean;
};

export type Preferences = {
  roles: RoleFamily[];
  locations: string[];
  remote: boolean;
  industries: string[];
  workAuthorization: string;
};

export type Profile = {
  userId: string;
  name: string;
  email: string;
  school: string;
  major: string;
  headline: string;
  location: string;
  graduationYear: number | null;
  preferences: Preferences;
  privacy: PrivacySettings;
  onboardingComplete: boolean;
};

export type MatchFactor = {
  key: string;
  label: string;
  score: number;
};

export type MatchLabel = "Strong Match" | "Good Match" | "Stretch" | "Low priority";

export type MatchResult = {
  overall: number;
  label: MatchLabel;
  factors: MatchFactor[];
  why: string[];
  gaps: string[];
  recommendation: string;
  qualificationsMet: number;
  qualificationsTotal: number;
};

export type ApplicationStatus =
  | "saved"
  | "queued"
  | "preparing"
  | "ready"
  | "applied"
  | "interviewing"
  | "offer"
  | "rejected"
  | "withdrawn";

export type Priority = "apply_now" | "apply_soon" | "stretch" | "low";

export type DraftSource = "rules" | "model";

export type ResumeChange = {
  section: string;
  before: string;
  after: string;
  reason: string;
};

export type AtsScore = {
  score: number;
  present: string[];
  missing: string[];
};

export type TailoredResume = {
  resume: Resume;
  changes: ResumeChange[];
  ats: AtsScore;
  source: DraftSource;
  model?: string;
  note?: string;
  updatedAt: string;
};

export type CoverTone = "concise" | "detailed" | "enthusiastic";

export type CoverLetter = {
  text: string;
  tone: CoverTone;
  source: DraftSource;
  model?: string;
  note?: string;
  updatedAt: string;
};

export type AnswerConfidence = "high" | "review";

export type AppAnswer = {
  id: string;
  question: string;
  answer: string;
  confidence: AnswerConfidence;
  reason?: string;
};

export type Checklist = {
  resumeTailored: boolean;
  coverLetter: boolean;
  questionsAnswered: number;
  questionsTotal: number;
  questionsNeedReview: number;
  networkingContacts: number;
  autofillReady: boolean;
};

export type ApplicationRecord = {
  id: string;
  userId: string;
  jobId: string;
  status: ApplicationStatus;
  saved: boolean;
  batchName: string | null;
  tailored: TailoredResume | null;
  coverLetter: CoverLetter | null;
  answers: AppAnswer[];
  notes: string;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationView = ApplicationRecord & {
  match: MatchResult;
  priority: Priority;
  stalled: boolean;
  checklist: Checklist;
  job: Job;
};

export type PrepSession = {
  id: string;
  userId: string;
  applicationIds: string[];
  index: number;
  startedAt: string;
  completedAt: string | null;
};

export type TaskStatus = "queued" | "running" | "succeeded" | "failed";

export type PrepTask = {
  id: string;
  userId: string;
  type: "prepare_application";
  applicationId: string;
  status: TaskStatus;
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export type AiEvent = {
  id: string;
  userId: string;
  feature: string;
  model: string;
  latencyMs: number;
  success: boolean;
  accepted: boolean | null;
  createdAt: string;
};

export type AnalyticsEvent = {
  id: string;
  userId: string | null;
  name: string;
  props: Record<string, string | number | boolean>;
  createdAt: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
};

export const DEFAULT_PRIVACY: PrivacySettings = {
  personalizeFromProfile: true,
  saveAiHistory: true,
  shareAnonymizedProductData: false,
};

export const DEFAULT_PREFERENCES: Preferences = {
  roles: ["software"],
  locations: [],
  remote: true,
  industries: [],
  workAuthorization: "",
};
