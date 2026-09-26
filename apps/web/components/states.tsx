import type { ReactNode } from "react";

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="empty card">
      <svg width="72" height="48" viewBox="0 0 72 48" aria-hidden="true">
        <rect x="4" y="8" width="40" height="28" rx="6" fill="var(--primary-soft)" />
        <rect x="28" y="16" width="40" height="24" rx="6" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <circle cx="40" cy="28" r="4" fill="var(--primary)" />
      </svg>
      <h2>{title}</h2>
      <p className="muted">{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry?: () => void }) {
  return (
    <div className="error-box card" role="alert">
      <h2>{title}</h2>
      <p className="muted">{body}</p>
      {onRetry ? (
        <button className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="stack" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="sk-card" key={index} />
      ))}
    </div>
  );
}
