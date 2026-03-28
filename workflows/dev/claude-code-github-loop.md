---
name: Claude Code + Skills + GitHub — The Full Loop
category: dev
difficulty: intermediate
tools: Claude Code, Agent Skills, GitHub CLI
tested: true
---

# Claude Code + Skills + GitHub — The Full Loop

> From GitHub issue to merged PR entirely from the terminal. Skills make Claude follow real engineering practices instead of generic patterns.

## What this is for

Claude Code without any configuration writes functional code but often skips tests, uses wrong project conventions, and doesn't follow your team's patterns. Agent Skills fix this by injecting domain expertise directly into Claude's context at invocation time.

This workflow chains: read issue → create branch → implement with TDD → open PR → iterate until merge.

---

## Stack

| Tool | Role | Install |
|------|------|---------|
| [Claude Code](https://claude.ai/code) | AI coding agent, runs in terminal | `npm install -g @anthropic-ai/claude-code` |
| [Agent Skills](https://github.com/VoltAgent/awesome-agent-skills) | Domain-specific instructions (TDD, frontend-design, debugging) | Create `.claude/skills/*/SKILL.md` files |
| [GitHub CLI](https://cli.github.com) | Branch and PR management | `brew install gh` / `winget install GitHub.cli` |

---

## Setup (One Time)

### 1. Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. Add Skills

Skills are Markdown files stored in `.claude/skills/*/SKILL.md` inside your project or in `~/.claude/skills/*/SKILL.md` at user level. Browse the [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) repo for examples, then create your own:

```bash
mkdir -p .claude/skills/tdd
```

```markdown
# .claude/skills/tdd/SKILL.md

## When to Use
When implementing features or fixing bugs.

## Rules
1. Write a failing test first (Red)
2. Implement the minimum code to pass (Green)
3. Refactor only when tests are green
4. Run the full test suite before committing
```

Claude Code reads skills automatically from `.claude/skills/` when it starts.

### 3. Add a CLAUDE.md to Your Project

This is the most important step most people skip. Claude Code reads `CLAUDE.md` at startup and applies everything in it to every session:

```markdown
# CLAUDE.md

## Project: [Name]
[One paragraph describing what this project does]

## Tech Stack
- Backend: Node.js 22, Express, PostgreSQL
- Frontend: React 18, TypeScript, Tailwind CSS
- Testing: Vitest, Testing Library, Playwright (E2E)

## Conventions
- Branch names: `feature/[ticket-id]-short-description`
- Commit format: Conventional Commits (`feat:`, `fix:`, `refactor:`)
- PR titles: "[TICKET-ID] Short description"

## Testing Requirements
- Unit tests required for all new functions
- Test file location: `src/__tests__/[filename].test.ts`
- Minimum coverage: 80% for new code

## Do Not
- Import from `../utils/legacy` — deprecated, use `../lib/` instead
- Use `any` TypeScript type without a comment explaining why
- Push directly to main
```

---

## The Loop

### Step 1: Point Claude at an Issue

```bash
# Option A: reference GitHub issue directly
claude "
Fix issue #88 from the GitHub repo.
Follow the TDD approach from the project skills.
Workflow:
1. Read the issue
2. Create branch: fix/88-checkout-loading-state
3. Write failing tests first (Red)
4. Implement the fix (Green)
5. Refactor if needed
6. Run the full test suite — all tests must pass
7. Open a draft PR
"
```

```bash
# Option B: describe the task inline
claude "
Issue: the checkout button shows no loading state while the payment is processing.
Expected: button shows spinner and 'Processing...' text while awaiting POST /api/checkout response.
Current: button remains active with no visual feedback.

Use the TDD approach: write a failing test first, then implement, then refactor.
Branch: fix/checkout-loading-state
Run tests before and after to confirm nothing regresses.
"
```

### Step 2: Monitor Progress

Claude Code streams its output. You'll see:
```
Reading issue #88...
Creating branch fix/88-checkout-loading-state...
Writing failing test: checkout-button.test.tsx...
  ✗ FAIL: button should show spinner when processing
Running test suite... 1 failing, 47 passing
Implementing loading state...
  Modified: src/components/CheckoutButton.tsx
Running test suite... 48 passing ✓
Opening draft PR...
PR #241 created: https://github.com/your/repo/pulls/241
```

### Step 3: Iterate in Conversation

If the PR needs changes after review:

```bash
# In the same Claude Code session (context preserved)
claude "
The reviewer left a comment on PR #241: 'The spinner should be accessible — add aria-busy and aria-label attributes.'
Address the feedback and push to the same branch.
"
```

### Step 4: Mark Ready and Merge

```bash
gh pr ready 241
gh pr merge 241 --squash
```

---

## Full Real Example

**Issue #42:** "Search results don't show when query has trailing whitespace"

**Terminal:**
```bash
claude "
Debug issue #42: search returns 0 results when the query string has trailing whitespace.
Repo: github.com/your-org/your-app

Process:
1. Reproduce the bug with a failing test
2. Trace root cause (don't patch symptoms)
3. Fix at the root
4. Verify no similar issues exist elsewhere in the codebase
5. PR with explanation of root cause in description
"
```

**Claude's process:**
```
Reading codebase... Found search handler in src/api/search.ts:28
Writing failing test for whitespace edge case...
  ✗ FAIL: search('  query  ') should return results
Tracing call chain: Controller → SearchService → queryBuilder
Found root cause: queryBuilder at line 47 does not call .trim() before
  passing to SQL LIKE clause
Checking for same pattern elsewhere... Found 2 similar issues in filterService.ts
Fixing all 3 locations...
Running full test suite... 94 passing ✓
Opening PR...
```

---

## Why It Works

Without skills, Claude has no information about your team's conventions, preferred test framework, file structure, or code quality bar. It fills those gaps with training data defaults — which are usually wrong for your project.

Skills + CLAUDE.md give Claude a complete picture. The TDD skill specifically enforces Red-Green-Refactor every time instead of writing tests as an afterthought.

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Context window on large repos:** If your codebase is very large, Claude may miss relevant files. Be explicit: "The relevant code is in `src/api/` and `src/components/Checkout/`."
- **Skills eat context:** Each skill adds context. If you stack 5 skills, you may hit limits on long sessions. Use only the skills relevant to the current task.
- **CLAUDE.md is per-project:** Put it in the repo root. Claude Code reads it automatically on startup.
- **Don't skip the PR review:** Claude Code opens draft PRs deliberately. Review before marking ready.

---

## Sources

- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) — full reference
- [CLAUDE.md guide — Anthropic](https://docs.anthropic.com/en/docs/claude-code/memory) — how to write effective project instructions
- [awesome-agent-skills (VoltAgent)](https://github.com/VoltAgent/awesome-agent-skills) — community skill library
- [GitHub CLI manual](https://cli.github.com/manual/) — `gh pr`, `gh issue` commands
- [Conventional Commits spec](https://www.conventionalcommits.org) — commit format used in the workflow


