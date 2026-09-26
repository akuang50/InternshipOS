export type ModelRequest = {
  apiKey: string;
  baseUrl: string;
  model: string;
  system: string;
  user: string;
  timeoutMs?: number;
};

export async function completeText(request: ModelRequest): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), request.timeoutMs ?? 20000);
  try {
    const response = await fetch(`${request.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${request.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: request.model,
        temperature: 0.3,
        messages: [
          { role: "system", content: request.system },
          { role: "user", content: request.user },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`Model request failed (${response.status}).`);
    }
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Model returned an empty draft.");
    return text;
  } finally {
    clearTimeout(timer);
  }
}
