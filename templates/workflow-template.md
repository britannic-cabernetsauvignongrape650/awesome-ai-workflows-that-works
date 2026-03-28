---
name: Workflow Name
category: dev | devops | marketing | research | productivity | music | video | security | meetings | nocode
difficulty: beginner | intermediate | advanced
tools: Tool A, Tool B, Tool C
tested: true | false
---

# Workflow Name

> One-sentence summary of what this workflow accomplishes.

Write this like a maintainer note, not like ad copy.

Use the sections that help. Do not force every file into the same shape.

Recommended structure:

- `## What this is for`
- `## Stack`
- `## Workflow`
- `## Validation`
- `## Example`
- `## Failure modes`
- `## Sources`

If the workflow is simple, fewer sections are better.

## What this is for

Explain the actual problem. Mention who should use this and who should not.

## Stack

| Tool | Role |
|------|------|
| Tool A | What it does in this workflow |
| Tool B | What it does in this workflow |

## Workflow

Use concrete steps. If there is a handoff, say exactly what moves from one tool to the next.

1. Step one
2. Step two
3. Step three

## Validation

- Last verified: YYYY-MM-DD
- Tested: true or false
- If not tested, say what you confirmed from official docs or source code

## Example

Show a realistic example.
Include sample prompts, configs, or outputs only if they help someone run the workflow.

```bash
# Example command or config
```

## Failure modes

- What usually breaks first
- What needs human review
- What becomes expensive or annoying at scale

## Sources

- Link the real docs or upstream repo you relied on
- Prefer official sources when they exist
