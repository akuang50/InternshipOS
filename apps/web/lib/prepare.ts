import "server-only";
import { draftAnswers } from "@internshipos/ai";
import type { Database } from "./db";
import { buildCoverLetter, buildTailoredResume } from "./drafts";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let running = false;

export async function pumpQueue(run: <T>(fn: (db: Database) => Promise<T> | T) => Promise<T>): Promise<void> {
  if (running) return;
  running = true;
  try {
    for (;;) {
      const nextId = await run((db) => {
        const task = db.tasks.find((item) => item.status === "queued");
        if (!task) return null;
        task.status = "running";
        task.updatedAt = new Date().toISOString();
        return task.id;
      });
      if (!nextId) break;
      await wait(280);
      await run(async (db) => {
        const task = db.tasks.find((item) => item.id === nextId);
        if (!task) return;
        const app = db.applications.find((item) => item.id === task.applicationId && item.userId === task.userId);
        const profile = db.profiles.find((item) => item.userId === task.userId);
        const resume = db.resumes.find((item) => item.userId === task.userId) ?? null;
        const job = app ? db.jobs.find((item) => item.id === app.jobId) : undefined;
        const now = new Date().toISOString();
        try {
          if (!app || !profile || !job) throw new Error("That application is no longer available.");
          if (!resume || (!resume.skills.length && !resume.experiences.length)) {
            throw new Error("Add skills or experience to your resume before preparing this application.");
          }
          app.tailored = await buildTailoredResume(db, profile, resume, job);
          app.coverLetter = await buildCoverLetter(db, profile, resume, job, "concise");
          app.answers = draftAnswers(profile, resume, job);
          app.status = "ready";
          app.updatedAt = now;
          task.status = "succeeded";
          task.error = undefined;
        } catch (error) {
          task.status = "failed";
          task.error = error instanceof Error ? error.message : "Preparation failed. Try again.";
          if (app && app.status === "preparing") app.status = "queued";
        }
        task.updatedAt = now;
      });
    }
  } finally {
    running = false;
  }
}
