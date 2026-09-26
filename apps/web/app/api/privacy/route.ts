import { NextResponse } from "next/server";
import { deleteUserFiles, hashToken, withDb } from "@/lib/db";
import { clearSessionCookie, fail, readCookie, requireUser } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const data = await withDb((db) => {
    const userId = auth.session.userId;
    return {
      profile: db.profiles.find((item) => item.userId === userId) ?? null,
      resume: db.resumes.find((item) => item.userId === userId) ?? null,
      applications: db.applications.filter((item) => item.userId === userId),
      uploads: db.uploads.filter((item) => item.userId === userId).map(({ id, name, mime, createdAt }) => ({ id, name, mime, createdAt })),
      sessions: db.prepSessions.filter((item) => item.userId === userId),
    };
  });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const target = url.searchParams.get("target");
  if (target === "resume") {
    await withDb((db) => {
      db.resumes = db.resumes.filter((item) => item.userId !== auth.session.userId);
      db.uploads = db.uploads.filter((item) => item.userId !== auth.session.userId);
      db.applications.forEach((app) => {
        if (app.userId === auth.session.userId) {
          app.tailored = null;
          app.coverLetter = null;
        }
      });
    });
    await deleteUserFiles(auth.session.userId);
    return NextResponse.json({ ok: true });
  }
  if (target === "account") {
    const body = (await request.json().catch(() => null)) as { email?: string } | null;
    const userId = auth.session.userId;
    const removed = await withDb((db) => {
      const user = db.users.find((item) => item.id === userId);
      if (!user || user.email !== body?.email?.trim().toLowerCase()) return false;
      db.users = db.users.filter((item) => item.id !== userId);
      db.profiles = db.profiles.filter((item) => item.userId !== userId);
      db.resumes = db.resumes.filter((item) => item.userId !== userId);
      db.applications = db.applications.filter((item) => item.userId !== userId);
      db.prepSessions = db.prepSessions.filter((item) => item.userId !== userId);
      db.tasks = db.tasks.filter((item) => item.userId !== userId);
      db.aiEvents = db.aiEvents.filter((item) => item.userId !== userId);
      db.analytics = db.analytics.filter((item) => item.userId !== userId);
      db.uploads = db.uploads.filter((item) => item.userId !== userId);
      db.sessions = db.sessions.filter((item) => item.userId !== userId);
      return true;
    });
    if (!removed) return fail("Type the email on this account to confirm deletion.");
    await deleteUserFiles(userId);
    const token = readCookie(request, "ios_session");
    if (token) {
      const tokenHash = hashToken(token);
      await withDb((db) => {
        db.sessions = db.sessions.filter((session) => session.tokenHash !== tokenHash);
      });
    }
    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", clearSessionCookie());
    return response;
  }
  return fail("Choose resume or account.");
}
