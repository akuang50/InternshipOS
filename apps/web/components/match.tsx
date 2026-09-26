import type { MatchResult } from "@internshipos/types";
import { scoreTone } from "@internshipos/ui";

export function matchBadgeClass(label: MatchResult["label"]): string {
  if (label === "Strong Match") return "badge badge-strong";
  if (label === "Good Match") return "badge badge-good";
  if (label === "Stretch") return "badge badge-stretch";
  return "badge badge-low";
}

export function MatchMeter({ score }: { score: number }) {
  const tone = scoreTone(score);
  return (
    <div
      className="meter"
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${score}% match`}
    >
      <span style={{ width: `${score}%`, background: tone === "low" ? "var(--text-tertiary)" : undefined }} />
    </div>
  );
}

export function FactorList({ match }: { match: MatchResult }) {
  return (
    <div className="factors">
      {match.factors.map((factor) => (
        <div className="factor" key={factor.key}>
          <span>{factor.label}</span>
          <MatchMeter score={factor.score} />
          <b className="num">{factor.score}%</b>
        </div>
      ))}
    </div>
  );
}
