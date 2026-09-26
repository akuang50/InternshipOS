import { NextResponse } from "next/server";
import { withDb } from "@/lib/db";
import { requireUser } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const url = new URL(request.url);
  const ids = new Set(url.searchParams.get("ids")?.split(",").filter(Boolean) ?? []);
  const tasks = await withDb((db) =>
    db.tasks.filter((task) => task.userId === auth.session.userId && (ids.size === 0 || ids.has(task.id))),
  );
  return NextResponse.json({ tasks });
}
