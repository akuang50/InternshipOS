import { NextResponse } from "next/server";
import { hashToken, withDb } from "@/lib/db";
import { clearSessionCookie, readCookie } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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
