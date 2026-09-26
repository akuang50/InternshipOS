import "server-only";
import { NextResponse } from "next/server";
import { hashToken, withDb } from "./db";
import type { Profile } from "@internshipos/types";

const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (current.count >= limit) return { ok: false, retryAfter: current.reset - now };
  current.count += 1;
  return { ok: true };
}

export function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function limited(request: Request, bucket: string, limit: number) {
  const result = rateLimit(`${bucket}:${clientKey(request)}`, limit, 60_000);
  if (result.ok) return null;
  return fail("Too many requests. Wait a moment and try again.", 429);
}

export async function sessionUser(request: Request): Promise<{ userId: string; profile: Profile } | null> {
  const token = readCookie(request, "ios_session");
  if (!token) return null;
  const tokenHash = hashToken(token);
  return withDb((db) => {
    const session = db.sessions.find((item) => item.tokenHash === tokenHash);
    if (!session) return null;
    const profile = db.profiles.find((item) => item.userId === session.userId);
    if (!profile) return null;
    return { userId: session.userId, profile };
  });
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `ios_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${secure}`;
}

export function clearSessionCookie(): string {
  return "ios_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0";
}

export async function requireUser(request: Request) {
  const blocked = limited(request, "api", 180);
  if (blocked) return { error: blocked } as const;
  const session = await sessionUser(request);
  if (!session) return { error: fail("Sign in to continue.", 401) } as const;
  return { session } as const;
}
