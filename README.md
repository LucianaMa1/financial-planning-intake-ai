# Financial Planning Intake AI

A GitHub-ready MVP for a CFP-style financial planning tool, deployed on Cloudflare.

## What it does

- Collects household planning facts through a polished online questionnaire
- Captures planning scope, priority goals, liquidity, debt, insurance, and estate basics
- Sends the questionnaire to an API route for AI analysis
- Returns a structured preliminary planning brief for advisor review
- Falls back to a local rules-based analysis when `OPENAI_API_KEY` is not configured, so the app still works without an AI secret

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- OpenNext for Cloudflare
- Cloudflare Workers + Wrangler
- Route Handler API at `src/app/api/analyze/route.ts`

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

## Cloudflare local preview

```bash
npm install
npm run preview
```

This builds the app with OpenNext and runs it through Wrangler locally.

## Environment variables

For local Next.js development:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

For Cloudflare production, set secrets with Wrangler:

```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put OPENAI_MODEL
```

If no API key is present, the app uses a deterministic fallback analysis engine.

## Deployment

### Deploy to Cloudflare

```bash
npm run deploy
```

The Wrangler config is preconfigured to publish the Worker and attach the custom domain:

- `financialplanning.luciana.digital`

Worker config lives in `wrangler.jsonc`.

## Product notes

This MVP intentionally avoids collecting highly sensitive fields like full SSNs or full account numbers. It is positioned as a pre-planning intake and preliminary analysis tool, not final advice.
