import { NextResponse } from "next/server";
import type { PrivacySettings, Profile, Preferences } from "@internshipos/types";
import { withDb } from "@/lib/db";
import { fail, requireUser } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const body = (await request.json().catch(() => null)) as Partial<Profile> | null;
  if (!body) return fail("That profile update was empty.");
  const saved = await withDb((db) => {
    const profile = db.profiles.find((item) => item.userId === auth.session.userId);
    if (!profile) return null;
    const preferences = { ...profile.preferences, ...(body.preferences ?? {}) } as Preferences;
    const privacy = { ...profile.privacy, ...(body.privacy ?? {}) } as PrivacySettings;
    Object.assign(profile, {
      name: body.name?.trim() || profile.name,
      school: body.school?.trim() ?? profile.school,
      major: body.major?.trim() ?? profile.major,
      headline: body.headline?.trim() ?? profile.headline,
      location: body.location?.trim() ?? profile.location,
      graduationYear: body.graduationYear === undefined ? profile.graduationYear : body.graduationYear,
      preferences,
      privacy,
      onboardingComplete: body.onboardingComplete ?? profile.onboardingComplete,
    });
    const user = db.users.find((item) => item.id === profile.userId);
    if (user && profile.name) user.name = profile.name;
    return profile;
  });
  if (!saved) return fail("Your profile is missing. Sign in again.", 401);
  return NextResponse.json({ profile: saved });
}
