import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { DEFAULT_PREFERENCES, DEFAULT_PRIVACY } from "@internshipos/types";
import { hashPassword, hashToken, newId, publicUser, withDb } from "@/lib/db";
import { fail, limited, sessionCookie } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = limited(request, "auth", 10);
  if (blocked) return blocked;
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string; name?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  const name = body?.name?.trim() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Enter a valid email address.");
  if (password.length < 8) return fail("Use at least 8 characters for your password.");
  if (name.length < 2) return fail("Add the name you want on your profile.");

  try {
    const token = randomBytes(32).toString("hex");
    const result = await withDb((db) => {
      if (db.users.some((user) => user.email === email)) {
        return { error: "An account with that email already exists. Sign in instead." };
      }
      const { hash, salt } = hashPassword(password);
      const id = newId("user");
      const now = new Date().toISOString();
      db.users.push({ id, email, name, passwordHash: hash, passwordSalt: salt, createdAt: now });
      db.profiles.push({
        userId: id,
        name,
        email,
        school: "",
        major: "",
        headline: "",
        location: "",
        graduationYear: null,
        preferences: { ...DEFAULT_PREFERENCES, roles: [], workAuthorization: "" },
        privacy: { ...DEFAULT_PRIVACY },
        onboardingComplete: false,
      });
      db.sessions.push({ tokenHash: hashToken(token), userId: id, createdAt: now });
      return { user: publicUser(db.users[db.users.length - 1]) };
    });
    if ("error" in result && result.error) return fail(result.error, 409);
    const response = NextResponse.json(result);
    response.headers.set("Set-Cookie", sessionCookie(token));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create your account.";
    return fail(message, 500);
  }
}
