import { NextResponse } from "next/server";
import { newId, withDb } from "@/lib/db";
import { fail, requireUser } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const body = (await request.json().catch(() => null)) as { applicationIds?: string[]; index?: number; complete?: boolean } | null;
  const result = await withDb((db) => {
    const mine = new Set(db.applications.filter((item) => item.userId === auth.session.userId).map((item) => item.id));
    let session = db.prepSessions.find((item) => item.userId === auth.session.userId && !item.completedAt);
    if (body?.complete) {
      if (!session) return { error: "There isn't an application session to finish." };
      session.completedAt = new Date().toISOString();
      return { session };
    }
    if (typeof body?.index === "number" && session) {
      session.index = Math.max(0, Math.min(session.applicationIds.length - 1, body.index));
      return { session };
    }
    const applicationIds = (body?.applicationIds ?? []).filter((id) => mine.has(id)).slice(0, 25);
    if (!applicationIds.length) return { error: "Add roles to your queue before starting a session." };
    if (session) {
      session.applicationIds = applicationIds;
      session.index = 0;
      session.startedAt = new Date().toISOString();
      return { session };
    }
    session = {
      id: newId("session"),
      userId: auth.session.userId,
      applicationIds,
      index: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };
    db.prepSessions.push(session);
    return { session };
  });
  if ("error" in result && result.error) return fail(result.error, 400);
  return NextResponse.json(result);
}
