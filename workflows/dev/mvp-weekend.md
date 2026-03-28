---
name: Idea → MVP in a Weekend
category: dev
difficulty: intermediate
tools: Claude, Claude Code (TDD + frontend-design skills), Vercel / Railway / Fly.io
tested: true
---

# Idea → MVP in a Weekend

> A repeatable solo-dev workflow from idea to deployed, shareable product in 2 days. Not a toy — something real people can use.

## What this is for

The bottleneck for solo builders isn't coding speed — it's decision fatigue and context switching. This workflow front-loads all decisions (spec, design, data model) in the first 2-3 hours, then lets AI handle execution. The result is a deployed MVP by Sunday evening, not a half-finished local project.

**What "MVP" means here:** A deployed app with real functionality that you can share a link to. Not a demo. Not localhost. Something that works.

**Realistic scope:** CRUD apps, SaaS tools, internal dashboards, content sites, API services. Not ML products, marketplaces, or anything requiring hardware.

---

## Stack

| Tool | Role |
|------|------|
| Claude | Spec pressure-testing, UI generation, launch copy |
| Claude Code + TDD skill | Implementation |
| Vercel / Railway / Fly.io | Deployment |
| Supabase / PlanetScale | Database (zero-ops) |

**Estimated cost:** <$5 in API credits for the whole weekend.

---

## The Timeline

```
Saturday
  9:00 AM  Spec + pressure test (45 min)
 10:00 AM  Design + UI generation (60 min)
 11:00 AM  Data model + API design (30 min)
 11:30 AM  Build: backend (3-4 hrs)
  3:30 PM  Build: frontend (2-3 hrs)
  6:30 PM  Deploy to staging (45 min)
  7:15 PM  Real user test — share to 2-3 people (evening)

Sunday
  9:00 AM  Fix feedback from Saturday evening
 11:00 AM  Deploy to production (30 min)
 11:30 AM  Write launch copy (45 min)
 12:15 PM  Launch
```

---

## Step 1: Spec — 45 Minutes

Write a 1-page PRD. Then pressure-test it with Claude:

```
I'm building [product name]. Here's my 1-page spec:

[paste your spec]

Act as a critical product investor. Give me:
1. The 5 most likely reasons this product fails within 30 days of launching
2. The one assumption I'm making that's most likely wrong
3. What the simplest possible version is that still delivers the core value
4. One feature I'm including that I should cut
```

Revise the spec based on Claude's response. If Claude can't find good objections, your spec is probably solid. If it finds 5 obvious ones, fix them before writing a line of code.

**Red flags to cut before building:**
- Features that "would be nice" — cut them
- Anything that requires a second user to be useful (chicken-and-egg)
- Features you're including because they're fun to build, not because users need them

---

## Step 2: Design — 60 Minutes

Use Claude with a frontend-design skill (see [Claude Skills Reference](claude-skills-reference.md) for how to set up skills):

```bash
claude "
Design a minimal UI for [product name].

Purpose: [one sentence]
Primary user action: [what they do most]
Stack: [Next.js / React + Tailwind / etc.]
Style: clean, modern, no decorative elements — functional first

Generate:
1. The main page layout with a component breakdown
2. The key user flow (3-5 screens/states)
3. A color palette (3-4 colors max)
"
```

**Iterate 3-4 times.** The first output is always generic. Push for specificity:

```
"The layout is too generic. I want it to feel like [reference product] but for [your audience].
The hero section needs to show the actual product UI immediately, not abstract benefits.
Redo the main page with that in mind."
```

---

## Step 3: Data Model — 30 Minutes

Before writing any application code, define the data model. This is the most important decision you make:

```
claude "
Design the database schema for [product name].

What it needs to do:
[list 3-5 core user actions]

Give me:
1. PostgreSQL table definitions with all fields, types, and constraints
2. Relationships (foreign keys, indexes)
3. Any fields I'll probably need that I haven't thought of
4. What I should NOT put in the database (e.g., computed fields, things that belong in state)
"
```

Review the schema yourself before proceeding. Changing the data model mid-build is the #1 cause of weekend MVPs dying on Sunday.

---

## Step 4: Build — 6-8 Hours

### Setup (20 min)

```bash
# Next.js + Supabase (recommended stack)
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app

# Or: Vite + Express + PostgreSQL
npm create vite@latest my-app -- --template react-ts
```

### Add CLAUDE.md

```markdown
# CLAUDE.md

## Product: [Name]
[One paragraph description]

## Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Next.js API routes (or Express)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth

## Build Order
1. Database schema (already defined in /schema.sql)
2. API routes (src/app/api/)
3. Page components (src/app/)
4. Auth/protected routes last

## Rules
- Write tests for all API routes
- No TypeScript `any` without a comment explaining why
- All database queries go through /lib/db.ts
- Commit after each working feature, not at the end
```

### Build in Order

```bash
# 1. Database first
claude "
Implement the database layer.
Use the schema in schema.sql.
Create /lib/db.ts with typed functions for each table operation.
Write tests for each function against the real Supabase instance.
"

# 2. API routes
claude "
Implement the API routes:
- POST /api/[resource] — create
- GET /api/[resource] — list
- GET /api/[resource]/[id] — get one
- PUT /api/[resource]/[id] — update
- DELETE /api/[resource]/[id] — delete

Use the database functions from /lib/db.ts.
Add input validation with Zod.
Write integration tests.
"

# 3. Frontend pages
claude "
Implement the UI following the design we defined.
Connect to the API routes.
Handle loading states, error states, and empty states.
No placeholder UI — implement everything properly.
"
```

**Commit after each working piece.** "Working" means tests pass, not just "it compiles."

---

## Step 5: Deploy to Staging — 45 Minutes

### Vercel (recommended for Next.js)

```bash
npm install -g vercel
vercel --env NEXT_PUBLIC_SUPABASE_URL=... --env NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Custom domain later — use vercel.app URL for testing
```

### Railway (recommended for backend/API services)

```bash
npm install -g @railway/cli
railway login
railway up
```

### Fly.io (recommended for full control, Docker)

```bash
npm install -g flyctl
fly launch
fly deploy
```

---

## Step 6: Launch Copy — 45 Minutes

```
claude "
Write launch copy for [product name] for three platforms.

Product: [one sentence]
Who it's for: [specific user]
Core value: [what it replaces or saves]

Give me:

1. Show HN post (250-400 words)
   - Start with the problem, not the product
   - Include: what it does, how it works, tech stack, why I built it
   - End with the actual link

2. Twitter/X thread (6-8 tweets)
   - Tweet 1: hook — specific problem or surprising insight
   - Tweets 2-6: how it works (one aspect per tweet)
   - Tweet 7-8: launch + link

3. Reddit post for r/[relevant subreddit] (150-250 words)
   - Follow subreddit rules — no pure self-promotion
   - Lead with value, not product pitch
"
```

Edit all three for your own voice. AI launch copy is recognizable — the more you edit it, the better it performs.

---

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **This works for CRUD apps.** If your MVP requires real-time collaboration, ML, payments, or mobile apps, add 1-2 days minimum.
- **AI-generated frontend CSS takes iteration.** Budget 20-30% more time than you think for styling.
- **Supabase free tier has limits.** 500MB storage, 2GB bandwidth, 50,000 MAU. Fine for launch; check before scaling.
- **Skip features relentlessly.** The single most common failure mode: building too much, running out of weekend, deploying nothing. One core feature, shipped, beats five half-built features every time.
- **The deploy step always takes longer.** Environment variables, DNS, CORS — budget 45-60 min even if you've done it before.

---

## Sources

- [Anthropic frontend-design skill](https://docs.anthropic.com/en/docs/claude-code/skills)
- [Supabase documentation](https://supabase.com/docs)
- [Vercel deployment docs](https://vercel.com/docs)
- [Railway documentation](https://docs.railway.app)
- [Show HN guidelines](https://news.ycombinator.com/showhn.html)

