export function scoreTone(score: number): "strong" | "good" | "stretch" | "low" {
  if (score >= 85) return "strong";
  if (score >= 72) return "good";
  if (score >= 55) return "stretch";
  return "low";
}
