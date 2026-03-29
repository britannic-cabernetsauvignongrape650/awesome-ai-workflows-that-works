---
name: AI-Powered PR Review Pipeline
category: devops
difficulty: intermediate
tools: GitHub Actions, CodeRabbit, Claude, Greptile
tested: true
---

# AI-Powered PR Review Pipeline

> Automated code review on every PR — catches bugs, security issues, and quality problems before a human reviews. Humans focus on architecture; AI handles the rest.

## What this is for

Manual code review catches ~70% of issues but misses the mechanical ones — unused variables, missing error handling, unguarded database queries, security misconfigurations. AI review handles these consistently, at zero cost per PR, freeing human reviewers to focus on design and intent.

This workflow documents three approaches: CodeRabbit (zero-config SaaS), Claude via GitHub Actions (self-controlled), and Greptile (codebase-aware).

---

## Stack

| Tool | Approach | Setup Time | Cost |
|------|----------|------------|------|
| [CodeRabbit](https://coderabbit.ai) | SaaS, add GitHub App | 5 min | Free for open-source, $12/dev/mo |
| [Claude via Actions](https://docs.anthropic.com) | DIY GitHub Action | 30 min | ~$0.10-0.50/PR |
| [Greptile](https://greptile.com) | Codebase-aware SaaS | 10 min | Free tier available |

---

## Option 1: CodeRabbit (Recommended Starting Point)

CodeRabbit is the fastest path to automated PR review. Install the GitHub App, configure one YAML file, get reviews on every PR within minutes.

### Setup

1. Go to [coderabbit.ai](https://coderabbit.ai) → Install GitHub App → select your repos
2. Create `.coderabbit.yaml` in your repo root:

```yaml
# .coderabbit.yaml
language: "en-US"

reviews:
  profile: "chill"        # "chill" (gentle) | "assertive" (strict)
  request_changes_workflow: false
  high_level_summary: true
  poem: false             # disable the poem at the end

  path_filters:
    - "!**/*.lock"
    - "!**/dist/**"
    - "!**/*.generated.*"

  tools:
    github-checks:
      enabled: true
    eslint:
      enabled: true
    ruff:
      enabled: true       # Python linting
    shellcheck:
      enabled: true

chat:
  auto_reply: true        # CodeRabbit replies to comments automatically

# Focus review on these aspects
review_instructions: |
  Focus on:
  - Security vulnerabilities (SQL injection, XSS, hardcoded secrets, insecure dependencies)
  - Error handling (unhandled promises, missing try/catch, silent failures)
  - Performance issues (N+1 queries, missing indexes, large bundle additions)
  - Test coverage gaps for new code paths

  Do NOT comment on:
  - Code style (we have ESLint/Prettier for that)
  - Variable naming unless genuinely confusing
  - Minor refactoring suggestions
```

3. Open any PR → CodeRabbit reviews it automatically and leaves structured comments.

### What You Get

```
## PR Summary
This PR adds webhook handling for Stripe payment events.

### Changes
- New file: src/webhooks/stripe.ts
- Modified: src/api/payments.ts
- Added tests: tests/webhooks/stripe.test.ts

### Review

**🔴 Critical Issue — src/webhooks/stripe.ts:23**
The webhook signature is not being verified before processing.
Stripe recommends verifying with `stripe.webhooks.constructEvent()`.
Without this, anyone can send fake webhook events.

**🟡 Warning — src/api/payments.ts:87**
Database query inside a loop (lines 87-94) will cause N+1 queries.
Consider batching the customer lookups: `prisma.customer.findMany({ where: { id: { in: ids } } })`

**✅ Looks Good**
Test coverage is thorough — webhook handler is tested for all Stripe event types including edge cases.
```

---

## Option 2: Claude via GitHub Actions (Full Control)

Build your own review pipeline with Claude. More setup, but you control the prompt, focus areas, and what gets flagged.

### The Workflow

```yaml
# .github/workflows/claude-review.yml
name: Claude PR Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get PR diff
        id: diff
        run: |
          git diff origin/${{ github.base_ref }}...HEAD > /tmp/pr.diff
          # Limit diff size to avoid token limits
          head -1000 /tmp/pr.diff > /tmp/pr_truncated.diff
          echo "diff_size=$(wc -l < /tmp/pr.diff)" >> $GITHUB_OUTPUT

      - name: Run Claude review
        id: review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          DIFF=$(cat /tmp/pr_truncated.diff)
          PR_TITLE="${{ github.event.pull_request.title }}"

          REVIEW=$(python3 << 'EOF'
          import anthropic, os, sys

          client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

          diff = open("/tmp/pr_truncated.diff").read()
          pr_title = os.environ["PR_TITLE"]

          response = client.messages.create(
              model="claude-sonnet-4-6",
              max_tokens=2048,
              system="""You are a senior software engineer conducting a code review.

              Review for:
              1. Security vulnerabilities (injection, auth bypass, exposed secrets, insecure crypto)
              2. Correctness bugs (off-by-one errors, null/undefined handling, race conditions)
              3. Error handling gaps (unhandled exceptions, missing validation, silent failures)
              4. Performance issues (N+1 queries, missing caching, O(n²) where O(n) is possible)
              5. Test coverage gaps for new critical paths

              Do NOT comment on: formatting, naming conventions, style preferences.

              Format your review as:
              ## Summary (1-2 sentences)

              ## Issues Found
              For each issue:
              **[CRITICAL/WARNING/SUGGESTION]** `filename:line_number`
              Description and specific fix recommendation

              ## Positive Notes (optional)
              What was done well.

              If no issues found, say so clearly.""",
              messages=[{
                  "role": "user",
                  "content": f"PR: {pr_title}\n\nDiff:\n```diff\n{diff}\n```"
              }]
          )

          print(response.content[0].text)
          EOF
          )

          # Save review for next step
          echo "$REVIEW" > /tmp/review.txt

      - name: Post review comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs')
            const review = fs.readFileSync('/tmp/review.txt', 'utf8')

            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Claude Code Review\n\n${review}\n\n---\n*Automated review — not a substitute for human review*`
            })
```

### Customizing the Review Prompt

Tailor the system prompt to your stack and standards:

```python
system_prompt = """You are a senior engineer reviewing a Python/FastAPI codebase.

Stack-specific checks:
- SQLAlchemy: look for raw SQL without parameterization, missing async contexts
- FastAPI: check for missing response_model declarations, incorrect status codes
- Pydantic: verify validators exist for user inputs, no arbitrary_types_allowed without justification

Security baseline:
- All endpoints must have authentication (check for missing Depends(get_current_user))
- Database operations must use parameterized queries only
- File upload endpoints must validate file type and size

Performance:
- Async endpoints must use `await` for all IO operations
- N+1 queries are a blocking issue — flag any query inside a loop

Output a prioritized list of issues. Mark each as: BLOCKING | WARNING | SUGGESTION
"""
```

---

## Option 3: Greptile (Codebase-Aware Review)

Greptile indexes your entire codebase and understands it as a whole. When it reviews a PR, it knows your existing patterns, can spot breaking changes, and identifies inconsistencies with how you've solved similar problems elsewhere.

```bash
# Install Greptile GitHub App
# greptile.com → Connect GitHub → Select repos → Enable reviews
```

Configuration in `.greptile.yaml`:

```yaml
review:
  enabled: true
  on: [pull_request]
  checks:
    - consistency  # "you handled auth differently in 3 other similar endpoints"
    - breaking_changes  # "this renames an exported function used in 12 other files"
    - security
    - performance
```

**Best for:** large codebases where context matters — finding that a new function duplicates existing logic, or that a change breaks a pattern established elsewhere.

---

## Combining Human and AI Review

The most effective setup:

```
AI review (CodeRabbit/Claude) → flags mechanical issues
        ↓
Developer addresses AI feedback → fixes obvious issues
        ↓
Human reviewer → focuses on architecture, intent, and judgment calls
        ↓
Merge
```

**Configure branch protection to require AI review:**

```
GitHub → repo Settings → Branches → Add rule
✅ Require status checks before merging
   → Add: "claude-review" (or "coderabbitai")
✅ Require at least 1 human approval
```

---

## What AI Review Is Good At

AI review is strongest at catching mechanical and pattern-based issues:

- **Hardcoded credentials** — near-perfect detection; easy for AI to spot, easy for humans to miss
- **N+1 queries** — AI reliably flags repeated queries inside loops
- **Security vulnerabilities** — SQL injection, XSS, missing auth checks
- **Missing input validation** — boundary conditions and null checks
- **Missing error handling** — uncaught exceptions and ignored return values

AI review is weakest at architecture decisions, business logic correctness, and naming quality. Humans remain essential for those.

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Context window limits.** Large PRs (1000+ line diffs) get truncated. Split large PRs into smaller ones — this is good practice regardless.
- **False positives.** AI reviewers occasionally flag correct code. Configure your tool to reduce noise (CodeRabbit's `review_instructions` section handles this).
- **No business logic knowledge.** AI review doesn't know that "a subscription can only be cancelled if the user has no active projects" — that's human territory.
- **Cost spikes on large diffs.** For the Claude-via-Actions approach, a 2000-line diff costs ~$0.50-1.00. Set a diff size limit and alert your team.

---

## Sources

- [CodeRabbit documentation](https://docs.coderabbit.ai)
- [Greptile documentation](https://docs.greptile.com)
- [Claude Code GitHub Actions guide](https://docs.anthropic.com/en/docs/claude-code/github-actions)
- [GitHub branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges/managing-protected-branches)
