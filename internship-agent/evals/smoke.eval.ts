import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Tracks an internship application when the user names a company and role.",
  async test(t) {
    await t.send(
      "Save that I'm applying to Stripe for a software engineering intern role this summer.",
    );
    t.succeeded();
    t.calledTool("track_application");
  },
});
