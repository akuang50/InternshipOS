import { NextResponse } from "next/server";
import { scrubAnalyticsProps } from "@internshipos/api";
import { newId, withDb } from "@/lib/db";
import { readCookie } from "@/lib/http";
import { hashToken } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: string; props?: Record<string, unknown> } | null;
  const name = body?.name?.slice(0, 60) ?? "";
  if (!/^[a-z0-9_]+$/.test(name)) return NextResponse.json({ ok: true });
  const props = scrubAnalyticsProps(body?.props ?? {});
  const token = readCookie(request, "ios_session");
  await withDb((db) => {
    let userId: string | null = null;
    if (token) {
      const hash = hashToken(token);
      userId = db.sessions.find((session) => session.tokenHash === hash)?.userId ?? null;
    }
    const profile = userId ? db.profiles.find((item) => item.userId === userId) : undefined;
    if (profile && !profile.privacy.shareAnonymizedProductData) return;
    db.analytics.push({
      id: newId("evt"),
      userId,
      name,
      props,
      createdAt: new Date().toISOString(),
    });
    db.analytics = db.analytics.slice(-500);
  });
  return NextResponse.json({ ok: true });
}
