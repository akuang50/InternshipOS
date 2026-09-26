const ALLOWED = new Set([
  "feature",
  "job_role_family",
  "company_size",
  "industry",
  "generation_time_ms",
  "source",
  "status",
  "match_band",
  "outcome",
  "count",
]);

export function scrubAnalyticsProps(
  props: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!ALLOWED.has(key)) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safe[key] = typeof value === "string" ? value.slice(0, 80) : value;
    }
  }
  return safe;
}
