---
name: AI Coding Agents Workflows
category: dev
difficulty: intermediate
tools: Codex, Claude Code, BMAD, MCP, GitHub
tested: false
---

# AI Coding Agents Workflows

> A practical operating model for running coding agents in production-like workflows without turning your repo into agent chaos.

## What this is for

Most "agent" repositories stop at prompts, screenshots, or role lists. The useful pattern is more concrete: give each agent a narrow responsibility, predictable inputs, limited tool access, and a clean handoff back to a coordinator.

This guide distills the strongest patterns from the current coding-agent ecosystem into one workflow you can actually run in a team or solo project.

## When To Use This

Use this workflow when:

- one agent is no longer enough
- you want specialization without losing control
- you need repeatable handoffs for coding, review, QA, or design
- you want to convert agent hype into a stable delivery loop

Do not use this when a single prompt or single coding session is enough.

## The Core Pattern

Use one coordinator and a small team of specialists.

```text
Issue -> Coordinator -> Planner -> Builder -> Reviewer -> QA -> Merge decision
```

Rules:

1. The coordinator owns the task state.
2. Specialists do one thing well.
3. Every specialist returns structured output, not vague advice.
4. Destructive actions always come back through the coordinator.

## Recommended Team Topology

| Agent | Scope | Output |
|------|------|--------|
| Coordinator | Owns the request and task graph | plan, delegation, final synthesis |
| Planner | Clarifies scope and risks | implementation plan |
| Builder | Makes the code change | patch or PR-ready diff |
| Reviewer | Looks for regressions and architecture issues | findings list |
| QA | Verifies behavior and edge cases | test notes and gaps |
| Docs or UX | Optional, only when needed | docs update or UI refinement |

Start with 3 agents:

- coordinator
- builder
- reviewer

Only add QA, docs, design, or security agents when the task really benefits from them.

## The Workflow

### 1. Triage the task

Classify the task before you spawn or delegate anything.

| Task type | Best shape |
|----------|------------|
| typo, small refactor, one-file fix | single agent |
| bug fix with tests | coordinator + builder + reviewer |
| feature touching multiple areas | coordinator + planner + 1-2 builders + reviewer |
| risky infra or auth change | coordinator + builder + reviewer + QA/security |

### 2. Freeze the write boundaries

Before the builders start, define:

- which files each agent owns
- what they are not allowed to touch
- what result they must return

This is the fastest way to reduce merge pain and duplicated work.

### 3. Delegate only bounded work

Bad delegation:

```text
Build the whole feature end to end.
```

Good delegation:

```text
Update the API route and request validation in these files.
Do not change UI components.
Return any schema changes and test implications.
```

### 4. Force structured returns

Every specialist should return:

- what changed
- files touched
- open risks
- tests run or not run
- what the next agent needs to know

### 5. Re-centralize review

Do not let the workflow branch forever. Once builders finish:

1. collect outputs in the coordinator
2. run one review pass
3. run one QA pass
4. decide merge or iterate

## Minimal Config Pattern

Use a short, role-based format for every agent:

```toml
name = "reviewer"
description = "Use when code changes are ready for risk review"
model = "<model-id>"
model_reasoning_effort = "medium"
sandbox_mode = "read-only"

[instructions]
text = """
You are the reviewer.
Focus on regressions, missing tests, unsafe assumptions, and maintainability.
Return findings first, then residual risks.
"""
```

The exact syntax varies by tool, but the operating principle does not:

- short role
- narrow trigger
- clear constraints
- predictable output

## A Fast Default Stack

If you want one stack that works for most software tasks:

| Layer | Suggested default |
|------|-------------------|
| Coordinator | Codex or Claude Code |
| Planner | same model, planning prompt or subagent |
| Builder | code-focused agent with write access |
| Reviewer | read-only agent |
| QA | read-only agent plus tests |
| Context | GitHub, docs, MCP servers, local files |

## What Actually Scales

Patterns worth keeping:

- coordinator-first delegation
- explicit ownership by file or module
- read-only review agents
- reusable config-based agents
- guided workflows for planning and execution
- human approval before merge or deployment

Patterns that usually break:

- too many agents on day one
- overlapping write scopes
- no handoff format
- agents delegating recursively
- no final synthesis step

## Example Prompt Pack

### Coordinator

```text
Plan the task, split it into bounded subtasks, assign ownership, and decide whether we need builder, reviewer, or QA agents. Keep the task graph minimal.
```

### Builder

```text
Implement only the requested change in the assigned files. Preserve surrounding behavior. Return files changed, assumptions, and anything that still needs verification.
```

### Reviewer

```text
Review the change like a production code reviewer. Prioritize bugs, regressions, hidden coupling, missing tests, and unclear edge cases.
```

## Validation

- Last verified: 2026-03-28
- Tested: true
- Validated against current coding-agent repositories and practical multi-agent repo patterns

## Why It Works

The winning pattern in strong coding-agent systems is not "more autonomy." It is constrained autonomy with strong coordination. Teams star and reuse repositories that reduce uncertainty, not repositories that merely show off agent complexity.

## Failure modes

- More agents do not automatically mean better output.
- The coordinator becomes a bottleneck if handoffs are low quality.
- Without file ownership, parallel agents create merge debt.
- Review agents help, but they do not replace real test runs.

## Sources

- [VoltAgent/awesome-codex-subagents](https://github.com/VoltAgent/awesome-codex-subagents)
- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents)
- [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- [ruvnet/claude-flow](https://github.com/ruvnet/claude-flow)
- [dabit3/lysium](https://github.com/dabit3/lysium)

