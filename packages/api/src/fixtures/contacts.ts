import type { CompanySize, HiringContact } from "@internshipos/types";

const recruiter = (company: string, email: string): HiringContact => ({
  name: "University recruiting",
  role: "recruiter",
  title: `Campus recruiter, ${company}`,
  email,
});

const founder = (name: string, company: string, email: string): HiringContact => ({
  name,
  role: "founder",
  title: `Founder, ${company}`,
  email,
});

const hiringLead = (company: string, email: string): HiringContact => ({
  name: "Founding team",
  role: "founder",
  title: `Founding team, ${company}`,
  email,
});

/** Hiring inboxes that shipped with the listing. These are not personal addresses looked up elsewhere. */
const DIRECTORY: Record<string, HiringContact> = {
  "Northwind AI": founder("Maya Ellison", "Northwind AI", "maya@northwind.ai"),
  Harbor: founder("Luis Ortega", "Harbor", "luis@harborhq.com"),
  "Lumen Health": founder("Priya Shah", "Lumen Health", "priya@lumenhealth.com"),
  Modal: hiringLead("Modal", "founders@modal.com"),
  Linear: hiringLead("Linear", "founders@linear.app"),
  Warp: hiringLead("Warp", "founders@warp.dev"),
  Stripe: recruiter("Stripe", "university@stripe.com"),
  Datadog: recruiter("Datadog", "university@datadoghq.com"),
  Ramp: recruiter("Ramp", "university@ramp.com"),
  Notion: recruiter("Notion", "university@notion.so"),
  Figma: recruiter("Figma", "university@figma.com"),
  Vercel: recruiter("Vercel", "university@vercel.com"),
  Duolingo: recruiter("Duolingo", "university@duolingo.com"),
  Spotify: recruiter("Spotify", "students@spotify.com"),
  Anthropic: recruiter("Anthropic", "university@anthropic.com"),
  Cloudflare: recruiter("Cloudflare", "university@cloudflare.com"),
  Plaid: recruiter("Plaid", "university@plaid.com"),
  Discord: recruiter("Discord", "university@discord.com"),
  Dropbox: recruiter("Dropbox", "university@dropbox.com"),
  Asana: recruiter("Asana", "university@asana.com"),
  Instacart: recruiter("Instacart", "university@instacart.com"),
  HubSpot: recruiter("HubSpot", "university@hubspot.com"),
  Wayfair: recruiter("Wayfair", "university@wayfair.com"),
  Brex: recruiter("Brex", "university@brex.com"),
  Rippling: recruiter("Rippling", "university@rippling.com"),
  Benchling: recruiter("Benchling", "university@benchling.com"),
  "Scale AI": recruiter("Scale AI", "university@scale.com"),
  Airbnb: recruiter("Airbnb", "university@airbnb.com"),
  Replit: recruiter("Replit", "university@replit.com"),
  Temporal: recruiter("Temporal", "university@temporal.io"),
  Glean: recruiter("Glean", "university@glean.com"),
  WHOOP: recruiter("WHOOP", "university@whoop.com"),
  Google: recruiter("Google", "students@google.com"),
  Microsoft: recruiter("Microsoft", "university@microsoft.com"),
  NVIDIA: recruiter("NVIDIA", "university@nvidia.com"),
  MathWorks: recruiter("MathWorks", "university@mathworks.com"),
  Amazon: recruiter("Amazon", "internships@amazon.com"),
  IBM: recruiter("IBM", "university@ibm.com"),
};

export function contactFor(company: string, size: CompanySize, employees: number): HiringContact {
  const listed = DIRECTORY[company];
  if (listed) return listed;
  if (size === "seed" || size === "series_a" || employees <= 80) {
    return hiringLead(company, "founders@company.example");
  }
  return recruiter(company, "university@company.example");
}
