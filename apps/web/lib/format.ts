import type { CompanySize, Priority } from "@internshipos/types";

export function greeting(name: string): string {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = name.trim().split(/\s+/)[0] || "there";
  return `${part}, ${first}`;
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function deadlineLabel(iso: string | null): string {
  const days = daysUntil(iso);
  if (days == null) return "No deadline listed";
  if (days < 0) return "Deadline passed";
  if (days === 0) return "Deadline today";
  if (days === 1) return "Deadline tomorrow";
  return `Deadline ${days}d`;
}

export function priorityLabel(priority: Priority): string {
  if (priority === "apply_now") return "Apply now";
  if (priority === "apply_soon") return "Apply soon";
  if (priority === "stretch") return "Stretch";
  return "Low priority";
}

export function sizeLabel(size: CompanySize): string {
  if (size === "series_a") return "Series A";
  if (size === "series_b") return "Series B";
  return size[0].toUpperCase() + size.slice(1);
}

export function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/home";
  return value;
}

export function minutesBetween(start: string, end = new Date()): number {
  return Math.max(1, Math.round((end.getTime() - new Date(start).getTime()) / 60000));
}
