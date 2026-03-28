---
name: AI Customer Support Triage
category: marketing
difficulty: intermediate
tools: Claude, n8n, Zendesk, Intercom, Linear, Slack
tested: true
---

# AI Customer Support Triage

> Use an LLM for first-pass triage, response drafting, and escalation packaging so humans spend time on the tickets that actually need judgment.

## What this is for

This workflow is useful when your support queue has a lot of repeatable work:

- password resets
- billing questions
- export requests
- basic product navigation
- bug reports that need clean escalation notes

The point is not full autopilot. The point is a controlled first-response layer with clear escalation rules.

## Stack

| Tool | Role |
|------|------|
| [Anthropic API](https://docs.anthropic.com/en/api/messages) | classification and drafting |
| [n8n](https://n8n.io) | orchestration |
| [Zendesk](https://www.zendesk.com/) or [Intercom](https://www.intercom.com/) | ticket intake and human handoff |
| [Linear](https://linear.app/) | structured bug escalation |
| [Slack](https://slack.com/) | urgent routing |

## Workflow

### 1. Build a support knowledge base

Create one plain-text or Markdown file with:

- common issues
- approved replies
- hard escalation triggers
- product limits the model must not invent around

Example categories:

- auth and login
- billing and refunds
- exports and privacy requests
- rate limits and API errors
- escalation-only cases

### 2. Run triage before any response is sent

Return structured output, not prose.

```json
{
  "category": "billing | auth | export | bug | feature_request | other",
  "priority": "low | normal | high | urgent",
  "can_auto_resolve": true,
  "draft_reply": "string or null",
  "internal_note": "string",
  "needs_bug_ticket": false,
  "escalate_reason": "string or null"
}
```

The critical rule is simple: if the model is unsure, it escalates.

### 3. Route safe cases automatically

Safe cases:

- simple known answers from the knowledge base
- low-risk help articles
- basic account navigation

Unsafe cases:

- legal threats
- data breach language
- angry high-value customers
- large billing disputes
- anything that needs account-specific judgment

### 4. Pre-write the human handoff

When a ticket is escalated, have the model produce:

- a short issue summary
- the likely next action
- a safe draft the human can edit
- a bug summary if product or engineering should see it

### 5. Review misses every week

Use a weekly review note with:

- tickets the model escalated correctly
- tickets it should not have auto-resolved
- missing knowledge-base entries
- categories that should always force human review

## Example Flow

```text
New ticket -> classify -> safe reply or escalate

If safe:
  draft response -> human approval or direct send

If escalate:
  internal summary -> priority tag -> Slack or assignment -> bug ticket if needed
```

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- Reviewed against the Anthropic Messages API and current Zendesk, Intercom, n8n, and Linear integrations.

## Failure modes

- A weak knowledge base produces confident but wrong answers.
- Billing and compliance cases need stricter approval gates than generic support questions.
- An auto-close step is dangerous unless your escalation logic is conservative.
- Teams often overfocus on reply drafting and underinvest in the human handoff note.

## Sources

- [Anthropic Messages API](https://docs.anthropic.com/en/api/messages)
- [n8n Zendesk integration](https://n8n.io/integrations/zendesk/)
- [n8n Linear integration](https://n8n.io/integrations/linear/)
- [Intercom webhooks](https://developers.intercom.com/docs/build-an-integration/webhooks/)
