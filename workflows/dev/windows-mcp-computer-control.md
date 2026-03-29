---
name: Windows MCP for Full Desktop Control
category: dev
difficulty: advanced
tools: Windows-MCP, Claude Desktop, Codex CLI, uvx
tested: false
---

# Windows MCP for Full Desktop Control

> Expose Windows UI automation as MCP tools so an LLM can navigate files, control apps, inspect UI state, and operate the desktop.

## What this is for

Windows-MCP bridges AI agents and Windows by exposing desktop interaction through MCP.

That makes it a strong option when you want:

- Windows-native app control
- MCP-based integration with Claude Desktop or Codex CLI
- local or remote desktop automation
- a reusable tool layer instead of a one-off script

## Stack

| Tool | Role |
|------|------|
| [Windows-MCP](https://github.com/CursorTouch/Windows-MCP) | MCP server for Windows computer use |
| Claude Desktop or Codex CLI | MCP client |
| `uvx` | easiest way to run the latest package |

## Fast Setup

### Claude Desktop

Add this to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "windows-mcp": {
      "command": "uvx",
      "args": ["windows-mcp"]
    }
  }
}
```

### Codex CLI

Add this to `%USERPROFILE%/.codex/config.toml`:

```toml
[mcp_servers.windows-mcp]
command = "uvx"
args = ["windows-mcp"]
```

Then restart the client.

## What It Enables

Typical capabilities include:

- file navigation
- application control
- keyboard and mouse actions
- UI state capture
- QA-style desktop testing

## Recommended Rollout

### Phase 1

Run locally with harmless tasks:

- open Notepad
- navigate to a folder
- capture UI state
- test window switching

### Phase 2

Use for workflow tasks:

- export a report from a Windows-only app
- automate repeated desktop QA steps
- gather screenshots and state from a target application

### Phase 3

Only after trust is established:

- remote mode
- cloud-hosted Windows automation
- broader operational use

## Safety Rules

Windows-MCP explicitly warns that it operates with full system access.

Treat it like privileged automation:

- use a non-primary Windows account or VM first
- block password managers, banking apps, and personal email
- disable telemetry if your environment requires it
- keep a human in the loop for anything destructive

## Example Task

```text
Open the finance exports folder, locate the newest CSV file, open it to verify it loaded correctly, and stop before editing or moving any file.
```

## Local vs Remote

Use local mode first.

Remote mode is valuable for cloud-hosted Windows automation, but it increases complexity and risk. You should only move there once the local workflow is stable and auditable.

## Why It Works

Windows-MCP gives you a reusable MCP surface for desktop control instead of forcing every automation to be rebuilt from screenshots and prompts alone.

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: false
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- full system access means full blast radius
- UI automation can still be brittle across layouts and languages
- desktop-store installs and path handling on Windows can be annoying
- remote mode should be treated as infrastructure, not a casual experiment

## Sources

- [Windows-MCP GitHub repository](https://github.com/CursorTouch/Windows-MCP)
- [MCP Registry listing](https://registry.modelcontextprotocol.io)



