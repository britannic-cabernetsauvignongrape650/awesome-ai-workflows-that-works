---
name: Release Notes and Changelog Automation
category: devops
difficulty: beginner
tools: GitHub Releases, GitHub Actions, Claude
tested: true
---

# Release Notes and Changelog Automation

> Turn merged pull requests into clean release notes, changelog entries, and launch copy without rebuilding the same summary by hand every release.

## What this is for

Most teams already have the raw ingredients for release notes:

- merged PRs
- labels
- commits
- issues

What they do not have is a reliable workflow that turns that raw history into something users and teammates can actually read.

## Stack

| Tool | Role |
|------|------|
| GitHub Releases | auto-generate release notes from merged PRs |
| `.github/release.yml` | categorize changes by label |
| Claude or another LLM | rewrite the raw notes for users, customers, or internal teams |

## Workflow

### 1. Label work properly before release day

Useful labels:

- `feature`
- `bug`
- `performance`
- `docs`
- `breaking-change`
- `dependencies`

### 2. Configure GitHub release categories

Create `.github/release.yml`:

```yaml
changelog:
  categories:
    - title: Features
      labels:
        - feature
        - enhancement
    - title: Fixes
      labels:
        - bug
    - title: Performance
      labels:
        - performance
    - title: Docs
      labels:
        - docs
    - title: Other Changes
      labels:
        - "*"
```

### 3. Generate the release notes in GitHub

When drafting a release:

- choose the tag
- choose the previous tag if needed
- click `Generate release notes`

### 4. Turn the raw notes into audience-specific output

Use AI for three outputs:

- public release notes
- internal team summary
- customer-facing announcement

Prompt:

```text
Rewrite these raw release notes into:
1. clear public release notes
2. a short internal summary for Slack
3. a concise changelog entry

Keep the facts, remove noise, and call out breaking changes clearly.
```

## Example

**Raw**

```text
- Merge pull request #481 from feature/new-checkout
- Merge pull request #486 from fix/webhook-retries
- Merge pull request #490 from docs/billing-update
```

**Processed**

```text
Release summary
- Added the new checkout flow
- Improved webhook retry handling for failed payment events
- Updated billing documentation
```

## Why It Works

The release data already exists. The leverage comes from structuring it early and reusing it in multiple formats instead of rewriting everything at the end.

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- bad PR titles create bad release notes
- missing labels reduce category quality
- AI rewrite should never invent features that were not shipped

## Sources

- [GitHub Docs: Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
- [GitHub Docs: Releases API](https://docs.github.com/en/rest/releases/releases)



