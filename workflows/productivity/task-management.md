---
name: AI-Powered Task Management and Weekly Planning
category: productivity
difficulty: beginner
tools: Claude, Todoist / Linear / Notion, Google Calendar MCP, GitHub MCP
tested: true
---

# AI-Powered Task Management and Weekly Planning

> Claude reviews your tasks, calendar, and commitments — then builds a realistic weekly plan and flags what won't fit.

## What this is for

Most task management fails not because of bad tools, but because humans are optimistic about time and bad at prioritization. Claude doesn't have those biases. Give it your task list, your calendar, and your goals — it returns a week plan that actually fits, identifies what to defer, and spots commitments that conflict.

---

## Stack

| Tool | Role |
|------|------|
| [Claude Code](https://claude.ai/code) with Calendar + GitHub MCP | Reads context, generates plan |
| [Todoist](https://todoist.com) / [Linear](https://linear.app) / [Notion](https://notion.so) | Task source |
| [Google Calendar MCP](../dev/mcp-standard-stack.md) | Real calendar context |
| [GitHub MCP](../dev/mcp-standard-stack.md) | Open PRs and issues as tasks |

---

## Weekly Planning Prompt

Run every Monday morning with Calendar + GitHub MCPs active:

```bash
claude "
Build my week plan.

Pull context from:
1. My Google Calendar for this week (Monday-Friday)
2. My open GitHub PRs and assigned issues
3. The task list I'll paste below

My task list:
---
[PASTE YOUR TASKS HERE — one per line, with priority markers if you have them]
---

My constraints this week:
- Deep work hours: 9am-12pm (protect these)
- Meetings I can't move: [list]
- Hard deadline: [if any]
- Energy note: [e.g. 'traveling Wednesday, low energy Friday']

Build:
1. A day-by-day schedule (what to work on each day, in order)
2. Tasks that don't fit this week → move to 'Next Week' list
3. Any conflicts or double-bookings I should know about
4. One thing I should delegate or cancel

Be realistic about time. Assume each task takes 1.5x the estimated time.
Deep work blocks = 90 minutes max, then break.
"
```

---

## Daily Planning (5-Minute Morning Routine)

A lighter version for each morning:

```bash
claude "
Quick morning plan for today [date].

Check my calendar for today's meetings.
Check my GitHub for anything due/urgent.

Given these meetings, I have roughly [X] hours of deep work.

My top tasks from yesterday that are still open:
[paste 3-5 tasks]

Give me:
1. Today's 3 most important tasks (MIT) — ordered
2. What to do in the first 30 minutes (before checking email/Slack)
3. One thing to say 'no' to today if asked
"
```

---

## Task Capture and Processing

Convert raw inputs (voice notes, scattered thoughts) into actionable tasks:

```
claude "
Clean up these rough task notes into a proper task list.

Raw notes:
- call marco about q2 pricing thing
- fix that bug sarah mentioned in standup
- finish reading the new MCP spec
- need to review like 3 PRs from the team
- prepare slides for thursday
- send invoice to acme for march
- look into why the api is slow on certain queries

For each, give me:
- Clear task title (verb + object)
- Category: [work/admin/learning/project]
- Rough time estimate
- Any implicit deadline I should set
- Dependencies (tasks that must happen first)
"
```

**Output:**
```
1. Call Marco re: Q2 pricing proposal
   Category: work | 30 min | Deadline: before Thursday meeting | No dependencies

2. Debug and fix issue Sarah flagged in standup (describe specific symptom here)
   Category: work | 1-2 hr | Soon | Dependency: reproduce the bug first

3. Review 3 team PRs (name them for clarity)
   Category: work | 45 min total | Before EOD | No dependencies

4. Prepare Thursday presentation slides
   Category: work | 2-3 hr | Wednesday EOD | Dependency: finalize agenda first

5. Send March invoice to Acme Corp
   Category: admin | 15 min | ASAP — this is overdue | No dependencies

6. Read MCP specification (note: which sections?)
   Category: learning | 1 hr | This week | No dependencies

7. Investigate API latency on [specific query type]
   Category: work | 1-2 hr | Not urgent unless customers are affected | No dependencies
```

---

## Project Review Prompt (Monthly)

Once a month, review all active projects:

```
claude "
Monthly project review.

Active projects and their current state:
[paste projects with last update]

For each project:
1. Is it actually moving forward? (yes/stalled/blocked)
2. What's the one thing that would unblock it?
3. Is it still worth doing given my current priorities?

Then:
- Projects to kill or pause: [list with reason]
- Projects to prioritize next month: [list]
- What I'm overcommitted on: [honest assessment]
"
```

---

## Integrating with Todoist (Automated)

### n8n: Auto-Create Tasks from Multiple Sources

```
Daily trigger (9:00 AM)
    ↓
GitHub: fetch issues assigned to me with no linked PR
    ↓
Gmail (MCP): fetch emails flagged 'needs-action' from yesterday
    ↓
Claude: "Convert these inputs into Todoist tasks with proper labels and due dates"
    ↓
Todoist API: create tasks
    ↓
Telegram: "Added 4 tasks to Todoist"
```

**Claude task creation prompt:**

```
Convert these items into Todoist tasks.

GitHub issues (assign to #dev project):
{{ $json.github_issues }}

Flagged emails (assign to #admin project):
{{ $json.flagged_emails }}

For each task:
- content: clear verb + object title
- due_date: today if urgent, this Friday otherwise, null if no deadline
- priority: 4=urgent, 3=high, 2=normal, 1=low
- labels: ["github"|"email"] + one from ["deep-work","quick","waiting"]

Return JSON array of Todoist task objects.
```

---

## End-of-Day Review (10 Minutes)

```bash
claude "
End-of-day review for [date].

Completed today (from git log and calendar):
[or pull from GitHub MCP + Calendar MCP]

Quick assessment:
1. Did I work on my 3 MITs today? (Yes/partially/no — why?)
2. What's one thing I should do differently tomorrow?
3. Roll open tasks to tomorrow's list — which ones drop off entirely?
4. Set up tomorrow: what's the #1 priority for first thing tomorrow morning?
"
```

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Claude doesn't know your energy levels.** Tell it explicitly ("I'm low energy this week", "I have a hard deadline Friday"). Without this, it makes optimistic plans.
- **Task lists go stale fast.** This only works if your task list is current. Schedule 5 minutes every evening to update it.
- **Context switching cost.** Claude doesn't automatically account for context switching between different types of work. Group similar tasks and tell Claude you prefer batching.
- **GitHub issues ≠ actual priorities.** Just because an issue is open and assigned doesn't mean it's important this week. Give Claude explicit priority signals.

---

## Sources

- [Getting Things Done (David Allen)](https://gettingthingsdone.com) — the underlying capture/process/organize methodology
- [Todoist API](https://developer.todoist.com/rest/v2/)
- [Linear API](https://developers.linear.app/docs)
- [Google Calendar MCP setup](../dev/mcp-standard-stack.md)
- [Deep Work (Cal Newport)](https://calnewport.com/deep-work/) — protecting focus time
