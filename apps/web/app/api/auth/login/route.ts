import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { hashToken, publicUser, verifyPassword, withDb } from "@/lib/db";
import { fail, limited, sessionCookie } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = limited(request, "auth", 10);
  if (blocked) return blocked;
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  if (!email || !password) return fail("Enter your email and password.");

  try {
    const token = randomBytes(32).toString("hex");
    const result = await withDb((db) => {
      const user = db.users.find((item) => item.email === email);
      if (!user || !verifyPassword(password, user)) return { error: "That email and password don't match." };
      db.sessions.push({ tokenHash: hashToken(token), userId: user.id, createdAt: new Date().toISOString() });
      const profile = db.profiles.find((item) => item.userId === user.id);
      return { user: publicUser(user), onboardingComplete: Boolean(profile?.onboardingComplete) };
    });
    if ("error" in result && result.error) return fail(result.error, 401);
    const response = NextResponse.json(result);
    response.headers.set("Set-Cookie", sessionCookie(token));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not sign you in.";
    return fail(message, 500);
  }
}
