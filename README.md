# Financial Planning Intake AI

A GitHub-ready MVP for a CFP-style financial planning tool.

## What it does

- Collects household planning facts through a polished online questionnaire
- Captures planning scope, priority goals, liquidity, debt, insurance, and estate basics
- Sends the questionnaire to an API route for AI analysis
- Returns a structured preliminary planning brief for advisor review
- Falls back to a local rules-based analysis when `OPENAI_API_KEY` is not configured, so the demo still works

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Route Handler API at `src/app/api/analyze/route.ts`

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

## Environment variables

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

If no API key is present, the app uses a deterministic fallback analysis engine.

## Deployment

### Vercel
- Import the repo into Vercel
- Set `OPENAI_API_KEY` and optional `OPENAI_MODEL`
- Deploy

### GitHub
This repo is ready to push to GitHub directly. If you want to host it, pair the GitHub repo with Vercel for server-side AI calls.

## Product notes

This MVP intentionally avoids collecting highly sensitive fields like full SSNs or full account numbers. It is positioned as a pre-planning intake and preliminary analysis tool, not final advice.
