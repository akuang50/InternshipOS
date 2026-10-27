import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

const KV_KEY = "internship/applications";

const statuses = [
  "researching",
  "drafting",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

type ApplicationRecord = {
  id: string;
  company: string;
  role: string;
  status: (typeof statuses)[number];
  notes: string;
  postingUrl: string;
  updatedAt: string;
};

type ApplicationStore = {
  items: ApplicationRecord[];
};

const inputSchema = z.object({
  action: z.enum(["save", "list", "get", "update"]),
  company: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(statuses).optional(),
  notes: z.string().optional(),
  postingUrl: z.string().optional(),
  id: z.string().optional(),
});

function slugId(company: string, role: string): string {
  const raw = `${company}-${role}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return raw.slice(0, 80) || "application";
}

async function loadStore(kv: {
  get: (key: string) => Promise<unknown>;
}): Promise<ApplicationStore> {
  const stored = await kv.get(KV_KEY);
  if (
    typeof stored === "object" &&
    stored !== null &&
    !Array.isArray(stored) &&
    Array.isArray((stored as ApplicationStore).items)
  ) {
    return stored as ApplicationStore;
  }
  return { items: [] };
}

export default defineTool({
  description:
    "Save, list, get, or update internship applications in durable store. Use save when the user names a company and role.",
  inputSchema,
  execution: "server",
  effect: (input) =>
    input.action === "list" || input.action === "get" ? "read" : "write",
  async execute(input, ctx) {
    const store = await loadStore(ctx.host.kv);
    const now = new Date().toISOString();

    if (input.action === "list") {
      return { count: store.items.length, items: store.items };
    }

    if (input.action === "get") {
      const id =
        input.id ??
        (input.company && input.role
          ? slugId(input.company, input.role)
          : undefined);
      if (!id) {
        return { error: "get needs id or company+role" };
      }
      const item = store.items.find((row) => row.id === id);
      if (!item) {
        return { error: "not found", id };
      }
      return { item };
    }

    if (input.action === "save") {
      if (!input.company || !input.role) {
        return { error: "save needs company and role" };
      }
      const id = slugId(input.company, input.role);
      const existing = store.items.find((row) => row.id === id);
      const item: ApplicationRecord = {
        id,
        company: input.company,
        role: input.role,
        status: input.status ?? existing?.status ?? "researching",
        notes: input.notes ?? existing?.notes ?? "",
        postingUrl: input.postingUrl ?? existing?.postingUrl ?? "",
        updatedAt: now,
      };
      const items = existing
        ? store.items.map((row) => (row.id === id ? item : row))
        : [...store.items, item];
      await ctx.host.kv.put(KV_KEY, { items });
      return { saved: true, item };
    }

    if (input.action === "update") {
      const id =
        input.id ??
        (input.company && input.role
          ? slugId(input.company, input.role)
          : undefined);
      if (!id) {
        return { error: "update needs id or company+role" };
      }
      const existing = store.items.find((row) => row.id === id);
      if (!existing) {
        return { error: "not found", id };
      }
      const item: ApplicationRecord = {
        ...existing,
        company: input.company ?? existing.company,
        role: input.role ?? existing.role,
        status: input.status ?? existing.status,
        notes: input.notes ?? existing.notes,
        postingUrl: input.postingUrl ?? existing.postingUrl,
        updatedAt: now,
      };
      const items = store.items.map((row) => (row.id === id ? item : row));
      await ctx.host.kv.put(KV_KEY, { items });
      return { updated: true, item };
    }

    return { error: "unknown action" };
  },
});
