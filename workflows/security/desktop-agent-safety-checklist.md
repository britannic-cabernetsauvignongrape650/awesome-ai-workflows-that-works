---
name: Desktop Agent Safety Checklist
category: security
difficulty: intermediate
tools: VMs, sandbox accounts, MCP, desktop agents
tested: false
---

# Desktop Agent Safety Checklist

> If an LLM can click, type, and navigate your machine, treat it like a privileged operator, not a toy.

## What this is for

Giving an LLM full desktop control dramatically expands both power and risk.

This checklist is the minimum bar before using:

- Open Interface
- Windows-MCP
- OmniParser-style computer-use stacks
- any screenshot-plus-mouse automation loop

## Checklist

### Environment

- run on a VM or disposable user account first
- isolate browser profiles
- keep password managers and personal apps out of scope
- separate work automation from your main daily account

### Permissions

- grant only the permissions required
- know whether the tool captures screenshots, keyboard, mouse, or all three
- review what network access the stack has

### Workflow design

- prefer APIs over UI control when available
- define stop conditions
- define forbidden apps and folders
- require approval for send, delete, purchase, deploy, shutdown, and irreversible actions

### Observability

- log actions where possible
- capture screenshots or state for audit
- keep prompts and high-level task intent traceable

### Rollout

- start with harmless tasks
- move to medium-risk tasks
- only later allow write-capable system actions

## Why It Works

Most failures in computer-use automation are not model failures. They are scope failures. The system was allowed to act in too much space with too little supervision.

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: false
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- even a good model can misclick
- layouts and popups change unexpectedly
- the "just one shortcut" mindset often drifts into unsafe privilege over time

## Sources

- [Windows-MCP security notes](https://github.com/CursorTouch/Windows-MCP)
- [Microsoft Research: OmniParser V2 risks and mitigations](https://www.microsoft.com/en-us/research/articles/omniparser-v2-turning-any-llm-into-a-computer-use-agent/)
- [Open Interface](https://github.com/AmberSahdev/Open-Interface)


