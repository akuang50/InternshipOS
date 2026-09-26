import { NextResponse } from "next/server";
import { parseResumeText } from "@internshipos/api";
import { newId, saveUpload, withDb } from "@/lib/db";
import { fail, requireUser } from "@/lib/http";

export const dynamic = "force-dynamic";

const MAX = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if ("error" in auth) return auth.error;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("Choose a text resume to upload.");
  if (file.size > MAX) return fail("That file is over 10MB. Upload a smaller text export.");
  const mime = file.type || "text/plain";
  const name = file.name || "resume.txt";
  if (/pdf|word|officedocument/i.test(mime) || /\.(pdf|docx?)$/i.test(name)) {
    return fail("PDF and Word parsing isn't connected yet. Export a .txt file or paste the text.", 415);
  }
  if (!/^text\/|application\/json|application\/octet-stream/.test(mime) && !/\.(txt|md|markdown)$/i.test(name)) {
    return fail("Upload a .txt or .md file. Other formats aren't parsed yet.", 415);
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > MAX) return fail("That file is over 10MB.");
  const text = bytes.toString("utf8");
  if (text.includes("\u0000")) return fail("That file doesn't look like plain text.");
  const uploadId = newId("upload");
  await saveUpload(auth.session.userId, uploadId, bytes);
  const resume = await withDb((db) => {
    const parsed = parseResumeText(auth.session.userId, name, text);
    const index = db.resumes.findIndex((item) => item.userId === auth.session.userId);
    if (index >= 0) db.resumes[index] = parsed;
    else db.resumes.push(parsed);
    db.uploads.push({
      id: uploadId,
      userId: auth.session.userId,
      name,
      mime: "text/plain",
      createdAt: new Date().toISOString(),
    });
    return parsed;
  });
  return NextResponse.json({
    resume,
    notice: "Imported bullets and skills from the file. Check the company labels before you trust a match.",
  });
}
