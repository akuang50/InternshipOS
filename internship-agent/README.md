# internship-agent

Standalone Agent SDK bot that helps with internships: cover letters, referral strategy, application walkthroughs, and a durable application tracker.

It is a chat agent (playground / HTTP), not a website.

## Run locally

```bash
cd internship-agent
npx @grok/agent-sdk login
npx @grok/agent-sdk dev
```

Open the playground URL the CLI prints. Try:

- “Draft a cover letter for Stripe SWE intern. I built a React campus app called Circles.”
- “How do I find a referral at Jane Street?”
- “Save that I applied to Stripe SWE intern.”

## Check

```bash
npx @grok/agent-sdk validate --dir .
npx tsc --noEmit
npx @grok/agent-sdk tool call track_application --dir . --input '{"action":"list"}'
npx @grok/agent-sdk eval --dir .
```
