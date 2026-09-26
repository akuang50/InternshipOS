import type { FreshnessBucket, JobFreshness } from "@internshipos/types";

export function describeFreshness(sourcePostedAt: string, firstSeenAt: string, now = new Date()): JobFreshness {
  const posted = new Date(sourcePostedAt).getTime();
  const hours = Math.max(0, (now.getTime() - posted) / 36e5);
  let bucket: FreshnessBucket = "older";
  let freshnessScore = 25;
  if (hours <= 24) {
    bucket = "brand_new";
    freshnessScore = 100;
  } else if (hours <= 72) {
    bucket = "very_recent";
    freshnessScore = 82;
  } else if (hours <= 24 * 7) {
    bucket = "recent";
    freshnessScore = 58;
  } else {
    freshnessScore = Math.max(12, 40 - Math.floor(hours / 24));
  }

  let label = "Opened just now";
  if (hours >= 1 && hours < 24) label = `Opened ${Math.floor(hours)} hour${Math.floor(hours) === 1 ? "" : "s"} ago`;
  else if (hours >= 24 && hours < 48) label = "Opened yesterday";
  else if (hours >= 48) {
    const days = Math.floor(hours / 24);
    label = `Opened ${days} day${days === 1 ? "" : "s"} ago`;
  }

  return {
    firstSeenAt,
    sourcePostedAt,
    lastSeenAt: now.toISOString(),
    freshnessScore,
    isNew: hours <= 24,
    isRecentlyOpened: hours <= 24 * 7,
    label,
    bucket,
  };
}

export function hoursAgo(hours: number, now = new Date()): string {
  return new Date(now.getTime() - hours * 36e5).toISOString();
}

export function daysFromNow(days: number, now = new Date()): string {
  return new Date(now.getTime() + days * 86400000).toISOString();
}
