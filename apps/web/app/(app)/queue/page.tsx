"use client";

import { useIOS } from "@/components/provider";
import { EmptyState } from "@/components/states";
import { priorityLabel } from "@/lib/format";
import type { Priority } from "@internshipos/types";
import Link from "next/link";
import { useState } from "react";

const ORDER: Priority[] = ["apply_now", "apply_soon", "stretch", "low"];

export default function QueuePage() {
  const ios = useIOS();
  const [picked, setPicked] = useState<string[]>([]);
  const [batchName, setBatchName] = useState("");
  const [pending, setPending] = useState(false);
  const queued = ios.applications.filter((app) => ["queued", "preparing", "ready"].includes(app.status));
  const ids = picked.length ? picked : queued.map((app) => app.id);

  return (
    <div className="page">
      <header className="page-head">
        <h1>Apply queue</h1>
        <p className="lead">Prepare a batch, then review each application. Nothing is submitted for you.</p>
      </header>
      {queued.length === 0 ? (
        <EmptyState title="Your queue is empty" body="Add roles from Opportunities. Strong recent matches land in Apply now; weaker ones stay in Stretch or Low priority." action={<Link className="btn btn-primary" href="/opportunities">Find roles</Link>} />
      ) : (
        <>
          <div className="row">
            <input className="input" placeholder="Batch name, e.g. Boston SWE" value={batchName} onChange={(event) => setBatchName(event.target.value)} aria-label="Batch name" />
            <button
              className="btn btn-primary"
              disabled={pending}
              onClick={async () => {
                setPending(true);
                try {
                  await ios.prepare(ids, batchName || undefined);
                } catch (reason) {
                  ios.setFlash(reason instanceof Error ? reason.message : "Could not start preparation.");
                } finally {
                  setPending(false);
                }
              }}
            >
              {pending ? "Preparing…" : `Prepare ${ids.length}`}
            </button>
            <button className="btn" onClick={() => ios.startSession(queued.filter((app) => app.status === "ready" || picked.includes(app.id)).map((app) => app.id).concat(picked).filter((id, index, all) => all.indexOf(id) === index))}>
              Start session
            </button>
          </div>
          {ORDER.map((priority) => {
            const items = queued.filter((app) => app.priority === priority);
            if (!items.length) return null;
            return (
              <section key={priority} className="card">
                <h2>{priorityLabel(priority)}</h2>
                {items.map((app) => (
                  <label key={app.id} className="spread">
                    <span className="row">
                      <input
                        type="checkbox"
                        checked={picked.includes(app.id)}
                        onChange={(event) => setPicked((current) => event.target.checked ? [...current, app.id] : current.filter((id) => id !== app.id))}
                      />
                      <span>
                        <strong>{app.job.company}</strong> — {app.job.title}
                        <span className="tiny"> · {app.status}{app.batchName ? ` · ${app.batchName}` : ""}{app.stalled ? " · stalled" : ""}</span>
                      </span>
                    </span>
                    <Link href={`/applications/${app.id}`}>Open</Link>
                  </label>
                ))}
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
