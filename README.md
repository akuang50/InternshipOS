# InternshipOS

A command center for the internship search: fresh roles, an explainable match, a queue you prepare yourself, and a tracker. The app does not submit applications.

This repository follows the v2 product spec’s build order. The core loop is implemented. Networking, interview prep, and live job-board crawling are explicit later steps — the UI says so instead of filling them with fake people or problems.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Accounts, resumes, and applications persist in `apps/web/.data` on this machine. Passwords are hashed. Uploaded resumes stay in a private folder, not a public URL.

Copy `.env.example` if you want a model provider. Without `AI_API_KEY`, resume ordering and cover letters are assembled from the profile and the UI labels them that way.

## What’s in the core loop

- Account, onboarding, resume text upload, and an optional labeled sample background
- Listing ingestion from Greenhouse, Lever, Ashby, and Workday-shaped fixtures, deduped to one card per role
- Explainable match scores, freshness (“Opened 6 hours ago”), and a side panel that keeps your place in the list
- Save, apply queue, background preparation, application session, tailoring diffs, cover letters, and question drafts that leave salary and unknown work authorization blank
- Tracker, deadline calendar, settings with export and deletion
- Chrome extension that matches an open Greenhouse, Lever, Ashby, or Workday posting and fills empty application fields from your profile. It does not submit, and it leaves salary and work authorization blank.

Load `apps/extension` as an unpacked extension while the app is running on port 3000. `apps/extension/config.js` is the API origin. Leave it on `http://127.0.0.1:3000` for development. After you change the extension, click Reload on `chrome://extensions`.

## Going public

Launch on Vercel’s free hostname, `https://internshipos.vercel.app` (or the name Vercel assigns). A custom domain is not required for a public HTTPS app. Add one later by pointing DNS at the same Vercel project; the web app does not need a code change. When you do, update the Supabase redirect URLs and `INTERNSHIPOS_ORIGIN` in the extension.

1. **Hosting.** Import this GitHub repo in Vercel. Set the project name to `internshipos` if you want that subdomain. Set **Root Directory** to `apps/web` so Vercel builds the Next.js app and still installs this npm workspace from the repo root. Every pull request gets a preview deployment. Merging to `main` deploys production. No DNS records at this stage.
2. **Database.** Create three Supabase projects: dev, staging, and production. Apply `supabase/migrations/0001_init.sql` to each. Never point local development at production. The file store in `apps/web/.data` is for this machine only. A Vercel deployment will not accept accounts until the Supabase adapter is actually connected, because serverless disk does not keep resumes. Setting the URL alone is not enough.
3. **Auth callbacks.** In the production Supabase project, set the site URL and redirect allow-list to `https://internshipos.vercel.app`, not a custom domain. Use `http://localhost:3000` on the dev project. Change these only after a domain is attached.
4. **Environment variables.** Set AI keys, the Supabase service role key, and any Stripe secrets in Vercel’s dashboard for Production, Preview, and Development. Do not commit them. Do not expose the service role or server AI key with a `NEXT_PUBLIC_` name. See `.env.example`.
5. **Chrome extension.** Package `apps/extension` on its own. Set `INTERNSHIPOS_ORIGIN` to `https://internshipos.vercel.app` and keep that host in `manifest.json` before uploading. The Chrome Web Store developer account is a one-time fee. Expect a review delay.
6. **Legal pages.** `/legal` links to privacy, terms, security, data deletion, and cookies. Those pages are placeholders. Get a real legal review before public signups; do not replace them with text copied from another product.
7. **Payments.** Add Stripe only when charging. Keep webhook handling idempotent, and keep the webhook secret server-side.
8. **Launch checklist.** Before opening signups, confirm rate limits, the `/api/health` check, backups you have actually restored, error reporting, and a load test. The marketing page can deploy before the database is connected. Accounts should wait.
9. **Domain, later.** About $10–15/year from a registrar such as Namecheap or Cloudflare. Point DNS at the same Vercel project (`www` for a marketing site, `app` for the product) with no downtime. Then update Supabase and the extension origin to match.
