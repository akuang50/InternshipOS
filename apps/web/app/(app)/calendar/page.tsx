"use client";

import { useIOS } from "@/components/provider";
import { EmptyState } from "@/components/states";
import Link from "next/link";
import { useState } from "react";

export default function CalendarPage() {
  const ios = useIOS();
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array.from({ length: first }, () => 0), ...Array.from({ length: days }, (_, index) => index + 1)];
  const events = ios.applications.filter((app) => app.job.deadline);
  const hasAny = events.length > 0;

  return (
    <div className="page">
      <header className="spread">
        <div>
          <h1>Calendar</h1>
          <p className="lead">Deadlines from roles you have saved or tracked. No external calendar is connected.</p>
        </div>
        <div className="row">
          <button className="btn" onClick={() => setCursor(new Date(year, month - 1, 1))}>Previous</button>
          <strong>{cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}</strong>
          <button className="btn" onClick={() => setCursor(new Date(year, month + 1, 1))}>Next</button>
        </div>
      </header>
      {!hasAny ? (
        <EmptyState title="No deadlines yet" body="Save or queue a role that lists a deadline and it will land on this month." action={<Link className="btn btn-primary" href="/opportunities">Find roles</Link>} />
      ) : (
        <div className="cal-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => <div key={label} className="tiny">{label}</div>)}
          {cells.map((day, index) => {
            const hits = day
              ? events.filter((app) => {
                  const date = new Date(app.job.deadline ?? "");
                  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
                })
              : [];
            return (
              <div key={`${day}-${index}`} className="cal-cell">
                {day ? <strong className="num">{day}</strong> : null}
                {hits.map((app) => <Link key={app.id} href={`/applications/${app.id}`}>{app.job.company}</Link>)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
