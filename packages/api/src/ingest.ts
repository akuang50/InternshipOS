import { hashText, normalize } from "@internshipos/ai";
import type { Job, JobSource } from "@internshipos/types";
import { contactFor } from "./fixtures/contacts";
import { daysFromNow, describeFreshness, hoursAgo } from "./freshness";
import {
  extraAshbyListings,
  extraGreenhouseListings,
  extraLeverListings,
  extraWorkdayListings,
} from "./fixtures/more-listings";
import {
  ashbyListings,
  greenhouseListings,
  leverListings,
  workdayListings,
  type ListingMeta,
} from "./fixtures/listings";

type Normalized = {
  company: string;
  title: string;
  location: string;
  description: string;
  applicationUrl: string;
  source: JobSource;
  meta: ListingMeta;
};

function fromGreenhouse(): Normalized[] {
  return [...greenhouseListings, ...extraGreenhouseListings].map((listing) => ({
    company: listing.company_name,
    title: listing.title,
    location: listing.location.name,
    description: listing.content,
    applicationUrl: listing.absolute_url,
    source: { name: "greenhouse", url: listing.absolute_url },
    meta: listing.metadata,
  }));
}

function fromLever(): Normalized[] {
  return [...leverListings, ...extraLeverListings].map((listing) => ({
    company: listing.categories.team,
    title: listing.text,
    location: listing.categories.location,
    description: listing.descriptionPlain,
    applicationUrl: listing.hostedUrl,
    source: { name: "lever", url: listing.hostedUrl },
    meta: listing.metadata,
  }));
}

function fromAshby(): Normalized[] {
  return [...ashbyListings, ...extraAshbyListings].map((listing) => ({
    company: listing.organization,
    title: listing.title,
    location: listing.locationName,
    description: listing.descriptionHtml.replace(/<[^>]+>/g, " "),
    applicationUrl: listing.jobUrl,
    source: { name: "ashby", url: listing.jobUrl },
    meta: listing.metadata,
  }));
}

function fromWorkday(): Normalized[] {
  return [...workdayListings, ...extraWorkdayListings].map((listing) => ({
    company: listing.company,
    title: listing.title,
    location: listing.locationsText,
    description: listing.jobDescription,
    applicationUrl: listing.externalUrl,
    source: { name: "workday", url: listing.externalUrl },
    meta: listing.metadata,
  }));
}

function canonicalKey(item: Normalized): string {
  return [
    normalize(item.company),
    normalize(item.title),
    normalize(item.location),
    hashText(item.description),
  ].join("|");
}

export function ingestListings(now = new Date()): Job[] {
  const normalized = [...fromGreenhouse(), ...fromLever(), ...fromAshby(), ...fromWorkday()];
  const byKey = new Map<string, Job>();

  for (const item of normalized) {
    const key = canonicalKey(item);
    const existing = byKey.get(key);
    if (existing) {
      if (!existing.sourceUrls.includes(item.applicationUrl)) {
        existing.sourceUrls.push(item.applicationUrl);
        existing.sources.push(item.source);
      }
      continue;
    }
    const posted = hoursAgo(item.meta.openedHoursAgo, now);
    byKey.set(key, {
      id: `job_${hashText(key)}`,
      company: item.company,
      title: item.title,
      location: item.location,
      workplace: item.meta.workplace,
      description: item.description.replace(/\s+/g, " ").trim(),
      requirements: item.meta.requirements,
      skills: item.meta.skills,
      applicationUrl: item.applicationUrl,
      sourceUrls: [item.applicationUrl],
      sources: [item.source],
      industry: item.meta.industry,
      companySize: item.meta.companySize,
      employeeCount: item.meta.employeeCount,
      companySummary: item.meta.companySummary,
      deadline: item.meta.deadlineDaysFromNow == null ? null : daysFromNow(item.meta.deadlineDaysFromNow, now),
      workAuth: item.meta.workAuth,
      graduationYears: item.meta.graduationYears,
      roleFamily: item.meta.roleFamily,
      degreeHints: item.meta.degreeHints,
      descriptionHash: hashText(item.description),
      freshness: describeFreshness(posted, posted, now),
      contact: contactFor(item.company, item.meta.companySize, item.meta.employeeCount),
    });
  }

  return Array.from(byKey.values());
}

export function withFreshness(job: Job, now = new Date()): Job {
  return {
    ...job,
    freshness: describeFreshness(job.freshness.sourcePostedAt, job.freshness.firstSeenAt, now),
  };
}
