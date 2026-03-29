---
name: AI Email Triage — Zero Inbox on Autopilot
category: productivity
difficulty: beginner
tools: Claude, Gmail MCP / n8n, Notion / Todoist
tested: true
---

# AI Email Triage — Zero Inbox on Autopilot

> Every morning, Claude processes your inbox: classifies each email, drafts replies for the actionable ones, creates tasks for anything requiring follow-up, and archives the noise.

## What this is for

Email is a todo list that other people write for you. This workflow brings structure to it: Claude reads everything that arrived overnight, decides what matters and what doesn't, drafts responses, and surfaces only the emails that genuinely need your attention. The result is going from "open inbox with dread" to "review 4 important emails and 8 pre-drafted replies" in 15 minutes.

**Two modes:**
1. **Interactive** — run manually when you open email; Claude guides you through the inbox
2. **Automated** — n8n processes email every morning at 7am and sends you a briefing

---

## Stack

| Tool | Role | Setup |
|------|------|-------|
| [Gmail MCP](https://github.com/modelcontextprotocol/servers) | Claude reads/labels email | See [mcp-standard-stack.md](../dev/mcp-standard-stack.md) |
| [Claude Code](https://claude.ai/code) | Triage logic and reply drafting | `npm install -g @anthropic-ai/claude-code` |
| [n8n](https://n8n.io) | Automated daily processing | Docker or cloud |
| [Notion](https://notion.so) / [Todoist](https://todoist.com) | Task creation from email | Via MCP or n8n integration |

---

## Mode 1: Interactive (Claude Code + Gmail MCP)

Run this each morning with Gmail MCP configured:

```bash
claude "
Process my inbox.

For each unread email:
1. Classify it: [ACTION_NEEDED / FYI / NEWSLETTER / AUTOMATED / SPAM]
2. If ACTION_NEEDED: summarize what's needed and draft a reply or next step
3. If FYI: one sentence summary
4. If NEWSLETTER / AUTOMATED / SPAM: mark as read and archive

After processing everything:
- List all ACTION_NEEDED emails with their drafted replies
- Create tasks in Notion for anything that requires more than a quick reply
- Show me a count by category

Start with emails received in the last 24 hours.
"
```

**Output example:**

```
Inbox: 47 unread emails

📋 ACTION NEEDED (4):
━━━━━━━━━━━━━━━━━━━━
1. marco@acme.com — "Q2 contract renewal"
   Needs: confirm pricing by Thursday
   Draft reply ready: "Hi Marco, confirming our standard rates for Q2..."

2. sarah@team.com — "Feedback on the new onboarding flow"
   Needs: review design doc and respond
   Draft: [attached below]
   → Created Notion task: "Review Sarah's onboarding doc" due Thursday

3. no-reply@stripe.com — "Action required: update payment method"
   Needs: update credit card before April 1
   → Link: stripe.com/billing

4. hiring@company.com — "Technical interview request — candidate #41"
   Needs: confirm availability Wednesday 3-5pm
   Draft ready.

📌 FYI (8): [collapsed — tap to expand]
🗞️ NEWSLETTERS (18): archived
⚙️ AUTOMATED (17): archived

Drafted replies ready for your review. Reply 'send [1-4]' to send any of them.
```

---

## Mode 2: Automated Daily Briefing (n8n)

### n8n Workflow

```
Schedule trigger: Monday-Friday, 7:00 AM
    ↓
Gmail node: fetch emails since yesterday 7am (unread only)
    ↓
Claude node: triage + summarize + draft replies
    ↓
Todoist/Notion node: create tasks for ACTION_NEEDED items
    ↓
Gmail node: label processed emails
    ↓
Slack / Telegram: send morning briefing
```

**n8n Gmail node config:**
```json
{
  "operation": "getAll",
  "filters": {
    "q": "is:unread after:yesterday",
    "maxResults": 100
  }
}
```

**n8n Claude node prompt:**

```
You are an executive assistant. Process these emails and return a morning briefing.

Emails:
{{ JSON.stringify($json.emails) }}

Return a JSON object:
{
  "action_needed": [
    {
      "from": "name@email.com",
      "subject": "...",
      "summary": "one sentence — what they want",
      "urgency": "today|this_week|no_deadline",
      "draft_reply": "ready-to-send reply text",
      "task": "task description if more work needed beyond a reply, or null"
    }
  ],
  "fyi": [
    { "from": "...", "subject": "...", "summary": "..." }
  ],
  "noise_count": 35,
  "total_processed": 47
}
```

**Slack notification (formatted from Claude's JSON output):**

```
📬 Morning Briefing — Wednesday March 26

📋 Needs your attention (4):
• Marco (Acme) — Q2 contract renewal, needs pricing confirmation by Thursday
• Sarah — Onboarding feedback, wants design review
• Stripe — Update payment method before April 1 ⚠️
• Hiring — Interview scheduling, candidate #41

📌 FYI (8 emails) — full list in Notion

✅ Triaged 35 automated/newsletter emails — no action needed
```

---

## Reply Drafting Prompts

For specific email types, customize the drafting prompt:

### Sales/Vendor Outreach (High Volume)

```
For cold sales emails and vendor pitches, draft a polite decline:
"Thanks for reaching out. We're not looking for [category] right now,
but I'll keep you in mind. No need to follow up — I'll reach out if that changes."

Never give specific reasons for declining. Keep it warm but final.
```

### Meeting Requests

```
For meeting requests, check my calendar and draft based on availability.
If I have a slot: propose the specific time.
If I'm busy: propose 2 alternatives.
Default: 30 minutes, video call.
Never accept in-person meetings from people I haven't met before.
```

### Technical Questions from Users/Customers

```
For technical support questions:
1. Check if there's an existing answer in docs/ directory
2. If yes: draft reply linking to the specific doc section
3. If no: summarize the question and tag it for escalation
4. Mark high-urgency if the person says they're blocked or it's a billing/production issue
```

---

## Building Your Email Rules

The more you tell Claude about your context, the better the triage:

```
# Add to your triage prompt:

Context about my work:
- I'm a [role] at [company type]
- High priority senders: [list domains or names]
- Always respond within 24h: [categories]
- Delegate to team: emails from [domain] about [topic]
- Never respond to: [categories]
- My assistant handles: [types of requests]

Calendar context:
- Currently working on: [active projects]
- Out of office: [dates]
- Focus time (no meetings): [days/times]
```

---

## Weekly Rollup

Add a weekly summary for pattern analysis:

```
n8n: every Friday 5pm
    ↓
Fetch all emails from the week
    ↓
Claude:
"Analyze my email patterns this week:
1. Who sent the most email requiring action?
2. What topics consumed the most of my time?
3. What recurring requests could I solve with documentation or delegation?
4. Did I miss any important emails this week (reply >48h delay)?
Suggest 2-3 workflow improvements."
```

---

## Privacy Note

This workflow sends email content to the Claude API (Anthropic). If your emails contain:
- Legal privileged communications
- Medical information (HIPAA)
- Financial data under NDA
- Customer PII under GDPR

...use a local LLM via Ollama (e.g., Llama, Mistral) or ensure your Anthropic data processing agreement covers your use case.

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Gmail API rate limits.** The Gmail MCP server is rate-limited. For very high-volume inboxes (500+ emails/day), add delays between fetches.
- **Draft quality varies.** Claude drafts good replies for simple emails (confirmations, scheduling, polite declines) but needs human editing for complex, relationship-sensitive responses.
- **Threading context.** The triage prompt only sees the latest email in a thread, not the full history. For long threads, mention "include full thread context" in your prompt.
- **False ACTION_NEEDED.** Some automated emails get misclassified as needing action. Improve accuracy by adding examples: "Emails from Stripe, GitHub, Vercel are always automated — classify as AUTOMATED regardless of content."

---

## Sources

- [Gmail MCP server](https://github.com/modelcontextprotocol/servers/tree/main/src/google)
- [n8n Gmail integration docs](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.gmail/)
- [Google Workspace CLI (gws)](https://github.com/googleworkspace/cli) — simplifies Gmail/Calendar OAuth
- [Zero Inbox methodology (Merlin Mann)](https://www.43folders.com/izero)
