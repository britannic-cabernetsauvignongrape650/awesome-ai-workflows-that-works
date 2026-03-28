---
name: Docs-as-Code with AI — Auto-Updated Documentation
category: marketing
difficulty: beginner
tools: Claude Code, GitHub Actions, Markdown
tested: true
---

# Docs-as-Code with AI — Auto-Updated Documentation

> Keep documentation permanently in sync with code. Every merged PR triggers Claude to find and fix stale docs — automatically.

## What this is for

Documentation rots because updating it is always lower priority than shipping. This workflow removes the human-memory dependency entirely: a GitHub Action fires after every PR merge, Claude reviews the diff, finds any stale documentation, and opens a follow-up PR with the updates.

Works for: API docs, README files, architecture docs, changelogs, and function-level documentation stored as Markdown in the same repo as the code.

---

## Stack

| Tool | Role |
|------|------|
| [Claude](https://claude.ai) / [Claude Code](https://claude.ai/code) | Reviews diffs, identifies stale docs, writes updates |
| [GitHub Actions](https://github.com/features/actions) | Triggers on PR merge, runs the doc sync job |
| Markdown files in the repo | Docs stored alongside code — the source of truth |

---

## How It Works

```
Developer merges PR
        ↓
GitHub Actions fires: "docs-sync" job
        ↓
Job fetches the PR diff
        ↓
Claude reviews: "What in docs/ is now stale?"
        ↓
Claude writes updated docs
        ↓
Job commits to a new branch
        ↓
Job opens a doc-sync PR
        ↓
Human reviews and merges
```

---

## Setup

### Step 1: Organize Your Docs

Store documentation as Markdown files next to the code they describe:

```
project/
  src/
    api/
      search.ts
      payments.ts
  docs/
    api/
      search.md       ← documents search.ts
      payments.md     ← documents payments.ts
    architecture.md
    deployment.md
  README.md
```

### Step 2: Store the Anthropic API Key

```
GitHub repo → Settings → Secrets → New repository secret
Name: ANTHROPIC_API_KEY
Value: sk-ant-...
```

### Step 3: Create the Workflow

`.github/workflows/docs-sync.yml`:

```yaml
name: Docs Sync

on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  sync-docs:
    # Only run when a PR is actually merged (not just closed)
    if: github.event.pull_request.merged == true

    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Get PR info
        id: pr
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          PR_NUMBER="${{ github.event.pull_request.number }}"
          PR_TITLE="${{ github.event.pull_request.title }}"

          # Get the diff
          git fetch origin ${{ github.event.pull_request.base.sha }}
          DIFF=$(git diff ${{ github.event.pull_request.base.sha }}..HEAD -- '*.ts' '*.js' '*.py' '*.go' '*.rs' 2>/dev/null | head -500)

          echo "PR_NUMBER=$PR_NUMBER" >> $GITHUB_OUTPUT
          echo "PR_TITLE=$PR_TITLE" >> $GITHUB_OUTPUT

          # Save diff to file (avoid env var size limits)
          echo "$DIFF" > /tmp/pr_diff.txt

      - name: Configure git
        run: |
          git config user.name "docs-sync[bot]"
          git config user.email "docs-sync[bot]@users.noreply.github.com"

      - name: Run Claude doc sync
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          PR_NUMBER: ${{ steps.pr.outputs.PR_NUMBER }}
          PR_TITLE: ${{ steps.pr.outputs.PR_TITLE }}
        run: |
          DIFF=$(cat /tmp/pr_diff.txt)

          claude --no-interactive "
          A developer just merged PR #${PR_NUMBER}: '${PR_TITLE}'.

          Here is the code diff from this PR:
          ---
          ${DIFF}
          ---

          Review the documentation in the docs/ directory and README.md.

          Your task:
          1. Identify any documentation that is now STALE due to the code changes above
          2. Update those documents to accurately reflect the new code behavior
          3. If the diff adds a new public function/endpoint/config option, add documentation for it
          4. Do NOT update docs for code that didn't change
          5. Do NOT rewrite docs that are still accurate — only update what's stale

          Be conservative. Only modify documentation that is clearly wrong or missing based on the diff.
          " 2>&1

      - name: Check for changes
        id: changes
        run: |
          if git diff --quiet docs/ README.md; then
            echo "changed=false" >> $GITHUB_OUTPUT
          else
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Create doc-sync branch and PR
        if: steps.changes.outputs.changed == 'true'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          PR_NUMBER: ${{ steps.pr.outputs.PR_NUMBER }}
        run: |
          BRANCH="docs/sync-pr-${PR_NUMBER}"
          git checkout -b "$BRANCH"
          git add docs/ README.md
          git commit -m "docs: sync documentation with PR #${PR_NUMBER}"
          git push origin "$BRANCH"

          gh pr create \
            --title "docs: sync with PR #${PR_NUMBER}" \
            --body "Automated documentation update following PR #${PR_NUMBER}.

          **Review checklist:**
          - [ ] Updated content is accurate
          - [ ] Nothing was changed that shouldn't be
          - [ ] Formatting is consistent with surrounding docs

          🤖 Generated by docs-sync action" \
            --base main \
            --head "$BRANCH" \
            --label "documentation"
```

---

## Prompt Tuning for Your Codebase

The default prompt is generic. Improve it by specifying your doc conventions:

```bash
# In the Claude command, replace the generic prompt with:
claude --no-interactive "
A developer merged PR #${PR_NUMBER}: '${PR_TITLE}'.

Diff:
---
${DIFF}
---

Documentation conventions for this project:
- API endpoints are documented in docs/api/ — one file per endpoint group
- Each endpoint doc must include: method, URL, request body schema, response schema, example curl
- Architecture decisions go in docs/architecture/ with ADR format
- Public functions in src/lib/ must have JSDoc in the source AND a usage example in docs/usage/

Update the docs following these conventions. Only touch what's stale.
"
```

---

## Changelog Generation

Add an extra step to auto-generate changelog entries:

```yaml
      - name: Update CHANGELOG.md
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          PR_NUMBER: ${{ steps.pr.outputs.PR_NUMBER }}
          PR_TITLE: ${{ steps.pr.outputs.PR_TITLE }}
        run: |
          DIFF=$(cat /tmp/pr_diff.txt)

          claude --no-interactive "
          Add a changelog entry for PR #${PR_NUMBER}: '${PR_TITLE}'.

          Diff:
          ---
          ${DIFF}
          ---

          Add ONE entry to the [Unreleased] section in CHANGELOG.md.
          Format: Keep a Changelog (keepachangelog.com)
          Categories: Added, Changed, Deprecated, Removed, Fixed, Security

          One concise sentence. No jargon. Describe the user-visible impact, not the implementation.
          "
```

---

## What Claude Updates Well

- **API endpoint documentation** — new parameters, changed response shapes, removed fields
- **Configuration option docs** — new env vars, changed defaults
- **README install/setup steps** — when dependencies or commands change
- **Function signatures in JSDoc** — when parameters are added or renamed

## What to Review Carefully

- **Architecture docs** — Claude may oversimplify design decisions
- **Security-sensitive docs** — verify Claude hasn't accidentally exposed implementation details
- **Anything with business context** — Claude only sees the code, not the reasoning

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Large diffs exceed the context window.** The prompt truncates diffs at 500 lines. For very large PRs, the sync will miss some changes — add a comment in the PR to manually review.
- **Claude may over-update.** It sometimes updates docs that didn't need updating. The "review checklist" in the PR description helps reviewers catch this.
- **Only works for docs in the repo.** External wikis (Notion, Confluence) require a different approach — use their APIs to push updates after the sync PR is merged.
- **First run takes time.** For repos with many existing docs, the first trigger may take 3-5 minutes.

---

## Sources

- [GitHub Actions documentation](https://docs.github.com/actions)
- [Claude Code GitHub Actions guide](https://docs.anthropic.com/en/docs/claude-code/github-actions)
- [Keep a Changelog format](https://keepachangelog.com)
- [Docs-as-code approach (Write the Docs)](https://www.writethedocs.org/guide/docs-as-code/)
