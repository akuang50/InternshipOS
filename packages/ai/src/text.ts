const STOP = new Set([
  "a", "an", "the", "and", "or", "to", "of", "in", "on", "for", "with", "your", "you",
  "our", "we", "is", "are", "be", "as", "at", "by", "from", "that", "this", "it",
  "will", "can", "able", "using", "use", "into", "about", "their", "they", "have",
]);

export function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function tokens(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((word) => word.length > 2 && !STOP.has(word));
}

export function includesTerm(haystack: string, term: string): boolean {
  const h = normalize(haystack);
  const t = normalize(term);
  if (!t) return false;
  return h.includes(t);
}

export function hashText(value: string): string {
  let h = 5381;
  const text = normalize(value);
  for (let i = 0; i < text.length; i += 1) {
    h = ((h << 5) + h) ^ text.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function resumeCorpus(parts: {
  summary?: string;
  skills?: string[];
  experiences?: { title: string; company: string; bullets: string[] }[];
  projects?: { name: string; bullets: string[]; skills: string[] }[];
  education?: { school: string; degree: string; major: string }[];
  personalize: boolean;
}): string {
  const chunks = [
    ...(parts.skills ?? []),
    ...(parts.education ?? []).flatMap((item) => [item.school, item.degree, item.major]),
  ];
  if (parts.personalize) {
    chunks.push(parts.summary ?? "");
    for (const exp of parts.experiences ?? []) {
      chunks.push(exp.title, exp.company, ...exp.bullets);
    }
    for (const project of parts.projects ?? []) {
      chunks.push(project.name, ...project.bullets, ...project.skills);
    }
  }
  return chunks.join(" \n ");
}
