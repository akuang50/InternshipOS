"use client";

import type { ApplicationView, CoverTone, Job, MatchResult, PrepSession, PrepTask, Profile, Resume } from "@internshipos/types";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type FeedJob = Job & { match: MatchResult };

type Bootstrap = {
  profile: Profile;
  resume: Resume | null;
  jobs: FeedJob[];
  applications: ApplicationView[];
  session: PrepSession | null;
  tasks: PrepTask[];
};

type Ctx = {
  loading: boolean;
  error: string | null;
  profile: Profile | null;
  resume: Resume | null;
  jobs: FeedJob[];
  applications: ApplicationView[];
  session: PrepSession | null;
  flash: string | null;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  refresh: () => Promise<void>;
  signup: (input: { email: string; password: string; name: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<string>;
  logout: () => Promise<void>;
  saveProfile: (profile: Partial<Profile>) => Promise<void>;
  saveResume: (resume: Resume) => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  loadSample: () => Promise<void>;
  trackJob: (jobId: string, mode: "save" | "queue", batchName?: string) => Promise<ApplicationView | null>;
  updateApplication: (id: string, patch: Record<string, unknown>) => Promise<void>;
  prepare: (ids: string[], batchName?: string) => Promise<void>;
  startSession: (ids: string[]) => Promise<void>;
  moveSession: (index: number) => Promise<void>;
  completeSession: () => Promise<PrepSession | null>;
  setFlash: (message: string | null) => void;
};

const InternshipContext = createContext<Ctx | null>(null);

async function readJson(response: Response) {
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error || "Something went wrong. Try again.");
  return data as Record<string, unknown>;
}

export function Provider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobs, setJobs] = useState<FeedJob[]>([]);
  const [applications, setApplications] = useState<ApplicationView[]>([]);
  const [session, setSession] = useState<PrepSession | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    const response = await fetch("/api/bootstrap", { cache: "no-store" });
    if (response.status === 401) {
      setProfile(null);
      setResume(null);
      setJobs([]);
      setApplications([]);
      setSession(null);
      setLoading(false);
      return;
    }
    const data = (await readJson(response)) as unknown as Bootstrap;
    setProfile(data.profile);
    setResume(data.resume);
    setJobs(data.jobs);
    setApplications(data.applications);
    setSession(data.session);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh().catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "We couldn't load your workspace.");
      setLoading(false);
    });
  }, [refresh]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 4200);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const signup = useCallback(async (input: { email: string; password: string; name: string }) => {
    await readJson(await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }));
    await refresh();
    router.push("/onboarding");
  }, [refresh, router]);

  const login = useCallback(async (input: { email: string; password: string }) => {
    const data = await readJson(await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }));
    await refresh();
    return data.onboardingComplete ? "home" : "onboarding";
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setProfile(null);
    router.push("/");
  }, [router]);

  const saveProfile = useCallback(async (next: Partial<Profile>) => {
    const data = await readJson(await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }));
    setProfile(data.profile as Profile);
  }, []);

  const saveResume = useCallback(async (next: Resume) => {
    const data = await readJson(await fetch("/api/resume", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }));
    setResume(data.resume as Resume);
    await refresh();
  }, [refresh]);

  const uploadResume = useCallback(async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const data = await readJson(await fetch("/api/resume/upload", { method: "POST", body: form }));
    setResume(data.resume as Resume);
    setFlash(String(data.notice || "Resume imported."));
    await refresh();
  }, [refresh]);

  const loadSample = useCallback(async () => {
    const data = await readJson(await fetch("/api/onboarding/sample", { method: "POST" }));
    setProfile(data.profile as Profile);
    setResume(data.resume as Resume);
    setFlash(String(data.banner));
    await refresh();
  }, [refresh]);

  const trackJob = useCallback(async (jobId: string, mode: "save" | "queue", batchName?: string) => {
    const data = await readJson(
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ jobId, mode, batchName }),
      }),
    );
    const application = data.application as ApplicationView;
    setApplications((current) => {
      const index = current.findIndex((item) => item.id === application.id);
      if (index >= 0) {
        const copy = [...current];
        copy[index] = application;
        return copy;
      }
      return [application, ...current];
    });
    setFlash(data.alreadyTracked ? "This role is already in your pipeline." : mode === "queue" ? "Added to your queue." : "Saved.");
    return application;
  }, []);

  const updateApplication = useCallback(async (id: string, patch: Record<string, unknown>) => {
    if (patch.remove) {
      setApplications((current) => current.filter((item) => item.id !== id));
    }
    const data = await readJson(
      await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }),
    );
    if (data.application) {
      const application = data.application as ApplicationView;
      setApplications((current) => current.map((item) => (item.id === application.id ? application : item)));
    }
    await refresh();
  }, [refresh]);

  const prepare = useCallback(async (ids: string[], batchName?: string) => {
    const data = await readJson(
      await fetch("/api/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds: ids, batchName }),
      }),
    );
    setFlash("Preparing in the background. Review each draft before you submit — nothing is sent for you.");
    const taskIds = (data.tasks as PrepTask[]).map((task) => task.id).join(",");
    for (let attempt = 0; attempt < 40; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const polled = await readJson(await fetch(`/api/tasks?ids=${taskIds}`));
      const tasks = polled.tasks as PrepTask[];
      if (tasks.every((task) => task.status === "succeeded" || task.status === "failed")) {
        const failed = tasks.find((task) => task.status === "failed");
        setFlash(failed?.error || `Prepared ${tasks.length} application${tasks.length === 1 ? "" : "s"}. Review before submitting.`);
        await refresh();
        return;
      }
    }
    setFlash("Preparation is still running. Refresh in a moment.");
  }, [refresh]);

  const startSession = useCallback(async (ids: string[]) => {
    const data = await readJson(await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicationIds: ids }) }));
    setSession(data.session as PrepSession);
    router.push("/session");
  }, [router]);

  const moveSession = useCallback(async (index: number) => {
    const data = await readJson(await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ index }) }));
    setSession(data.session as PrepSession);
  }, []);

  const completeSession = useCallback(async () => {
    const data = await readJson(await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ complete: true }) }));
    const done = data.session as PrepSession;
    setSession(null);
    return done;
  }, []);

  const value = useMemo<Ctx>(() => ({
    loading, error, profile, resume, jobs, applications, session, flash, paletteOpen, setPaletteOpen,
    refresh, signup, login, logout, saveProfile, saveResume, uploadResume, loadSample, trackJob,
    updateApplication, prepare, startSession, moveSession, completeSession, setFlash,
  }), [
    loading, error, profile, resume, jobs, applications, session, flash, paletteOpen, refresh, signup,
    login, logout, saveProfile, saveResume, uploadResume, loadSample, trackJob, updateApplication,
    prepare, startSession, moveSession, completeSession,
  ]);

  return (
    <InternshipContext.Provider value={value}>
      {children}
      {flash ? <div className="toast" role="status">{flash}</div> : null}
    </InternshipContext.Provider>
  );
}

export function useIOS() {
  const ctx = useContext(InternshipContext);
  if (!ctx) throw new Error("useIOS must be used inside Provider");
  return ctx;
}
