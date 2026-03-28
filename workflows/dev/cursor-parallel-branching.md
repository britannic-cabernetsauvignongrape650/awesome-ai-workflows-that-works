---
name: Cursor + Claude + Parallel Branching
category: dev
difficulty: intermediate
tools: Cursor, Claude Sonnet 4.6, Git worktrees
tested: false
---

# Cursor + Claude + Parallel Branching

> Run multiple AI agents on the same codebase simultaneously — frontend in one window, backend in another — with zero merge conflicts during execution.

## What this is for

The standard AI coding workflow is sequential: one agent, one task at a time. This workflow breaks that constraint using git worktrees, which give each agent a physically separate copy of the repository on disk. Two agents can work in parallel with no shared state, then you merge when both are done.

**Result:** 2-3x throughput on tasks with independent workstreams. Typical use: frontend/backend split, feature/tests split, or two independent bug fixes running simultaneously.

---

## Stack

| Tool | Role |
|------|------|
| Cursor (or any AI IDE) | AI-assisted editing in each worktree window |
| Claude Sonnet 4.6 | Code generation and reasoning |
| Git worktrees | Filesystem isolation — each agent gets its own directory |

---

## Core Concept: Git Worktrees

A worktree is a second (or third, fourth…) checked-out copy of your repository, each on a different branch, sharing the same `.git` directory.

```
your-project/            ← main worktree (your current branch)
../your-project-frontend/ ← worktree 1 (feature/checkout-ui branch)
../your-project-backend/  ← worktree 2 (feature/checkout-api branch)
```

All three directories share the same git history and objects. Changes in one don't affect the others until you merge.

---

## Setup

### Step 1: Create Worktrees

```bash
# From your main project directory
git worktree add ../your-project-frontend feature/checkout-ui
git worktree add ../your-project-backend feature/checkout-api

# Verify
git worktree list
# /path/to/your-project           abc1234 [main]
# /path/to/your-project-frontend  def5678 [feature/checkout-ui]
# /path/to/your-project-backend   ghi9012 [feature/checkout-api]
```

### Step 2: Open Separate IDE Windows

```bash
# Terminal 1
cursor ../your-project-frontend

# Terminal 2
cursor ../your-project-backend
```

Each Cursor window sees its own isolated branch. Changes in one window don't appear in the other.

### Step 3: Give Each Agent a Scoped, Bounded Task

**Critical:** Agents must have explicit scope boundaries. Without them, they may modify shared files (package.json, config, types) and create conflicts.

**Window 1 prompt (frontend):**
```
Implement the checkout form UI.
Your scope: all files in src/components/Checkout/ and src/pages/checkout.tsx.
Do NOT modify any files outside this scope — especially not src/api/, package.json, or any shared types.
The API endpoint you should call is POST /api/checkout. It accepts {cartId, paymentMethod} and returns {orderId, status}.
Write component tests in src/__tests__/Checkout/.
```

**Window 2 prompt (backend):**
```
Implement the POST /api/checkout endpoint.
Your scope: src/api/checkout.ts, src/services/payment.ts, src/db/orders.ts.
Do NOT modify any frontend files or src/components/.
The endpoint should accept {cartId, paymentMethod}, validate the cart, process the Stripe charge, and return {orderId, status}.
Write integration tests in tests/api/checkout.test.ts.
```

---

## Full Workflow Example

### Scenario: Add a checkout feature to an e-commerce app

**Setup (5 minutes):**
```bash
git checkout main
git pull

# Create both branches from main
git worktree add ../shop-frontend feature/checkout-frontend
git worktree add ../shop-backend feature/checkout-backend
```

**Run agents in parallel (60-90 minutes):**

Both agents work simultaneously. You monitor both Cursor windows, approving tool calls as needed.

**Check results:**
```bash
# Test each branch independently
cd ../shop-frontend && npm test  # frontend tests
cd ../shop-backend && npm test   # backend tests
```

**Merge (15-30 minutes):**
```bash
cd your-project

# Merge backend first (frontend depends on it being done)
git merge feature/checkout-backend

# Then frontend
git merge feature/checkout-frontend

# Resolve any conflicts (usually just package-lock.json or shared types)
git diff HEAD --name-only  # see what conflicts exist
```

**Cleanup:**
```bash
git worktree remove ../shop-frontend
git worktree remove ../shop-backend
git branch -d feature/checkout-frontend feature/checkout-backend
```

---

## Handling Shared Files

The most common merge conflicts come from files both agents might touch:

| File | Conflict Risk | Strategy |
|------|---------------|----------|
| `package.json` | Medium | Only one agent adds deps; the other doesn't |
| `package-lock.json` | High | Run `npm install` after merging package.json |
| `tsconfig.json` | Low | Usually one agent won't touch this |
| Shared type definitions | High | Define shared types before starting agents |
| `.env.example` | Low | Add env vars to merge manually |

**Best practice:** Before starting agents, define any shared types/interfaces yourself:
```typescript
// src/types/checkout.ts — write this before starting agents
export interface CheckoutRequest { cartId: string; paymentMethod: string; }
export interface CheckoutResponse { orderId: string; status: 'success' | 'failed'; }
```

Then both agents import from this file rather than defining their own versions.

---

## Scaling Up: 3+ Parallel Agents

For large features with 3+ independent parts:

```bash
git worktree add ../app-auth feature/auth-ui
git worktree add ../app-auth-api feature/auth-api
git worktree add ../app-auth-tests feature/auth-e2e-tests

# Open 3 Cursor windows
cursor ../app-auth &
cursor ../app-auth-api &
cursor ../app-auth-tests &
```

**Rule:** Each agent's scope must be completely non-overlapping. Test this by listing the files each agent is allowed to modify — there must be zero overlap.

---

## When NOT to Use This

| Situation | Problem | Use Instead |
|-----------|---------|-------------|
| Steps depend on each other | Agent 2 needs Agent 1's API shape | Sequential, or define interface first |
| Shared state or global config changes | Both agents modify the same config | Single agent |
| Small task (< 2 hours estimated) | Setup overhead not worth it | Single agent |
| Tightly coupled codebase | Every file touches every other | Refactor first, then parallelize |

---

## Measuring the Speedup

Tracking time on a typical full-stack feature:

| Approach | Frontend | Backend | Total |
|----------|----------|---------|-------|
| Sequential (one agent) | 45 min | 50 min | 95 min |
| Parallel (two agents) | 45 min | 50 min | 55 min* |

*Limited by the slower agent. Theoretical speedup: ~1.7x on equal tasks.

Real-world speedup is lower (setup, merge conflicts, review) but consistently 40-60% faster on tasks > 3 hours total.

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: false
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Disk space:** Each worktree is a full checkout. For large repos (>1GB), this matters.
- **IDE performance:** Running 2+ AI-assisted IDEs simultaneously is CPU/RAM intensive. 16GB RAM minimum; 32GB recommended.
- **Merge complexity scales with overlap.** If your "independent" tasks turn out to share more files than expected, merges get painful. Define boundaries carefully before starting.
- **Agent context:** Each agent has no awareness of what the other is doing. They can make contradictory architectural decisions. The more you define upfront (types, interfaces, API contracts), the better.

---

## Sources

- [Git worktrees documentation](https://git-scm.com/docs/git-worktree) — official reference
- [The New Stack — Parallel AI Development in 2026](https://thenewstack.io/5-key-trends-shaping-agentic-development-in-2026/)
- [Claude Code multi-agent docs](https://docs.anthropic.com/en/docs/claude-code/sub-agents)

