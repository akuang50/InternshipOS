import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { mkdir, readFile, rename, writeFile, rm } from "fs/promises";
import path from "path";
import { ingestListings } from "@internshipos/api";
import type {
  AiEvent,
  AnalyticsEvent,
  ApplicationRecord,
  PrepSession,
  PrepTask,
  Profile,
  Resume,
} from "@internshipos/types";
import type { Job } from "@internshipos/types";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

export type UploadRecord = {
  id: string;
  userId: string;
  name: string;
  mime: string;
  createdAt: string;
};

type SessionRecord = {
  tokenHash: string;
  userId: string;
  createdAt: string;
};

export type Database = {
  users: UserRecord[];
  sessions: SessionRecord[];
  profiles: Profile[];
  resumes: Resume[];
  jobs: Job[];
  applications: ApplicationRecord[];
  prepSessions: PrepSession[];
  tasks: PrepTask[];
  aiEvents: AiEvent[];
  analytics: AnalyticsEvent[];
  idempotency: Record<string, { userId: string; applicationId: string }>;
  uploads: UploadRecord[];
};

const root = path.join(process.cwd(), ".data");
const storePath = path.join(root, "store.json");

function emptyDb(): Database {
  return {
    users: [],
    sessions: [],
    profiles: [],
    resumes: [],
    jobs: [],
    applications: [],
    prepSessions: [],
    tasks: [],
    aiEvents: [],
    analytics: [],
    idempotency: {},
    uploads: [],
  };
}

async function read(): Promise<Database> {
  await mkdir(root, { recursive: true });
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Database;
    return { ...emptyDb(), ...parsed };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyDb();
    throw new Error("The local database could not be read. It may be corrupted.");
  }
}

async function write(db: Database): Promise<void> {
  await mkdir(root, { recursive: true });
  const tmp = `${storePath}.tmp`;
  await writeFile(tmp, JSON.stringify(db));
  await rename(tmp, storePath);
}

let chain: Promise<unknown> = Promise.resolve();

export function withDb<T>(fn: (db: Database) => Promise<T> | T): Promise<T> {
  if (process.env.VERCEL) {
    return Promise.reject(
      new Error(
        "This hosted deployment does not use the local file store. Accounts stay off until the Supabase adapter is connected to a non-production project first, then production. Local development is unchanged.",
      ),
    );
  }
  const run = chain.then(async () => {
    const db = await read();
    if (!db.jobs.length) db.jobs = ingestListings();
    const result = await fn(db);
    await write(db);
    return result;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")): { hash: string; salt: string } {
  return { hash: scryptSync(password, salt, 32).toString("hex"), salt };
}

export function verifyPassword(password: string, user: UserRecord): boolean {
  const hash = scryptSync(password, user.passwordSalt, 32);
  const stored = Buffer.from(user.passwordHash, "hex");
  if (hash.length !== stored.length) return false;
  return timingSafeEqual(hash, stored);
}

export function uploadsDir(userId: string): string {
  return path.join(root, "uploads", userId);
}

export async function saveUpload(userId: string, uploadId: string, bytes: Buffer): Promise<void> {
  const dir = uploadsDir(userId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, uploadId), bytes);
}

export async function deleteUserFiles(userId: string): Promise<void> {
  await rm(uploadsDir(userId), { recursive: true, force: true });
}

export function publicUser(user: UserRecord) {
  return { id: user.id, email: user.email, name: user.name };
}
