import { NextResponse } from "next/server";
import { newId, withDb } from "@/lib/db";
import { fail, requireUser } from "@/lib/http";
import { pumpQueue } from "@/lib/prepare";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const body = (await request.json().catch(() => null)) as { applicationIds?: string[]; batchName?: string } | null;
  const ids = Array.from(new Set(body?.applicationIds ?? [])).slice(0, 25);
  if (!ids.length) return fail("Select at least one application to prepare.");
  const batchName = body?.batchName?.trim().slice(0, 80) || null;

  const tasks = await withDb((db) => {
    const now = new Date().toISOString();
    const created = [];
    for (const id of ids) {
      const app = db.applications.find((item) => item.id === id && item.userId === auth.session.userId);
      if (!app) continue;
      if (batchName) app.batchName = batchName;
      if (app.status === "saved" || app.status === "queued" || app.status === "ready") app.status = "preparing";
      app.updatedAt = now;
      const task = {
        id: newId("task"),
        userId: auth.session.userId,
        type: "prepare_application" as const,
        applicationId: app.id,
        status: "queued" as const,
        createdAt: now,
        updatedAt: now,
      };
      db.tasks.push(task);
      created.push(task);
    }
    return created;
  });
  if (!tasks.length) return fail("None of those applications are on your account.", 404);
  void pumpQueue(withDb);
  return NextResponse.json({ tasks });
}
