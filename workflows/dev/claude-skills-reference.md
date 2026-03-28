---
name: Claude Skills — Complete Reference
category: dev
difficulty: beginner
tools: Claude Code, Claude.ai, Composio, Anthropic Skills
tested: false
---

# Claude Skills — Complete Reference

> Skills extend Claude's capabilities with domain-specific instructions, tools, and app integrations. Install once, use everywhere.

## What Are Claude Skills?

Skills are instruction sets (SKILL.md files) that inject domain expertise, workflows, and tool access into Claude at invocation time. They work across:
- **Claude.ai** (chat interface)
- **Claude Code** (terminal agent)
- **Claude API** (programmatic use)

Skills are separate from MCP servers: MCP gives Claude tool access; Skills give Claude knowledge and workflow patterns.

---

## Installing Skills

Skills are Markdown files (SKILL.md) placed in specific directories. There is no `npx` installer or `--skill` CLI flag.

```bash
# Project-level skill (shared via git)
mkdir -p .claude/skills/tdd
# Create .claude/skills/tdd/SKILL.md with your instructions

# User-level skill (personal, all projects)
mkdir -p ~/.claude/skills/debugging
# Create ~/.claude/skills/debugging/SKILL.md
```

Claude Code reads all skills from `.claude/skills/` automatically at startup. Reference them by name in your prompts:

```bash
claude "Write tests for the checkout module. Follow the TDD skill."
```

---

## Community Skill Libraries

### Development Skills

Browse these repositories for ready-to-use SKILL.md files:

| Skill | Source | What It Does |
|-------|--------|--------------|
| TDD patterns | [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | Red-Green-Refactor enforcement |
| Debugging | [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | Root cause tracing before patching |
| Terraform | [hashicorp/agent-skills](https://github.com/hashicorp/agent-skills) | HCL patterns and provider knowledge |

Copy the SKILL.md files you want into your `.claude/skills/` directory.

---

## Composio Skills — 500+ App Integrations

[Composio](https://composio.dev) provides skills that give Claude the ability to take real actions in 1,000+ applications.

**GitHub:** [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)

```bash
# Install the Composio connector
npm install -g composio-core
composio add github  # authenticate with GitHub
composio add linear  # authenticate with Linear
```

### CRM Integrations
- **HubSpot** — create contacts, deals, notes; update CRM records
- **Salesforce** — manage leads, opportunities, accounts
- **Pipedream** — CRM automation workflows
- **Zoho CRM** — manage contacts and pipeline

```
# With Composio skill installed:
claude "Create a HubSpot deal for Acme Corp, $50k, closing Q2, assign to john@company.com"
```

### Project Management
- **GitHub** — create issues, PRs, manage labels, review code
- **GitLab** — same as GitHub for GitLab projects
- **Linear** — create and update issues, manage cycles
- **Jira** — create tickets, update status, manage sprints
- **Asana** — create tasks, manage projects
- **Notion** — create pages, update databases
- **Trello** — manage cards and boards
- **Monday.com** — create items, update status

### Communication
- **Slack** — send messages, create channels, manage threads
- **Discord** — send messages, manage servers
- **Microsoft Teams** — post messages, manage channels
- **Gmail** — send emails, manage labels, search
- **Outlook** — same for Microsoft email

### Developer Tools
- **CircleCI** — trigger pipelines, check build status
- **GitHub Actions** — trigger workflows, check run status
- **Vercel** — deploy projects, manage domains
- **Netlify** — deploy sites, manage builds

### Storage & Files
- **Google Drive** — create, read, update files
- **Dropbox** — file management
- **OneDrive** — Microsoft storage integration
- **Box** — enterprise file storage

### Social Media
- **LinkedIn** — post content, manage connections
- **Twitter/X** — post tweets, search, manage DMs
- **Instagram** — post content (via API)
- **TikTok** — manage content

### E-Commerce & Payments
- **Shopify** — manage products, orders, customers
- **Stripe** — create charges, manage subscriptions, issue refunds
- **Square** — payment processing

### Productivity
- **Google Calendar** — create events, check availability, send invites
- **Google Sheets** — read/write data, create sheets
- **Airtable** — manage bases and records

---

## Document Processing Skills (Composio)

```bash
composio add document-processing
```

- **Word document processing** — read, edit, create `.docx` files
- **PDF manipulation** — extract text, split, merge, annotate
- **PowerPoint editing** — create slides, update presentations
- **Spreadsheet analysis** — multi-sheet Excel processing
- **EPUB conversion** — e-book format handling

---

## Data & Analysis Skills

| Skill | Capability |
|-------|-----------|
| CSV analysis | Statistical analysis, anomaly detection, visualization suggestions |
| Deep research | Multi-source web research with citation synthesis |
| PostgreSQL | Query generation, schema analysis, optimization |
| Root-cause tracing | Error log analysis, debugging methodology |

---

## Security Skills

| Skill | Capability |
|-------|-----------|
| Computer forensics | Log analysis, artifact examination, timeline reconstruction |
| Threat hunting | SIEM query generation, IOC identification |
| OWASP Security | Code review against OWASP Top 10 |

---

## Creative & Media Skills

| Skill | Capability |
|-------|-----------|
| Canvas design | Layout and visual design guidance |
| Image enhancement prompts | Stable Diffusion / DALL-E prompt engineering |
| GIF creation | Animated image workflows |
| Video downloading | yt-dlp integration patterns |

---

## Business Skills

| Skill | Capability |
|-------|-----------|
| Brand guidelines | Apply brand voice and style rules to content |
| Competitive ad extraction | Analyze competitor advertising patterns |
| Domain brainstorming | Name generation with availability checks |
| Lead research | Company and contact enrichment |
| Invoice management | Extract, validate, process invoice data |
| Resume parsing | Structured extraction from CV documents |

---

## Writing Your Own Skill (SKILL.md)

Skills are Markdown files with a YAML frontmatter and instruction body. The format works across Claude, Cursor, and other AI tools.

```markdown
---
name: my-custom-skill
description: What this skill does
author: your-github-handle
version: 1.0.0
---

# My Custom Skill

## When to Use This Skill
[Describe the situations where this skill should be applied]

## Core Principles
1. Always do X before Y
2. When you see Z, handle it by...

## Workflow
1. First step with specific instructions
2. Second step
3. Validation step

## Common Mistakes to Avoid
- Don't do X because Y
- Always check Z before proceeding

## Examples

### Example 1
Input: ...
Expected output: ...
```

**Store in:**
- `~/.claude/skills/my-skill/SKILL.md` (user-level)
- `.claude/skills/my-skill/SKILL.md` (project-level)
- Submit to: [awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: unknown
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Sources

- [Composio awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — 500+ app integration skills
- [VoltAgent awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) — community skill library
- [Anthropic Claude Code skills docs](https://docs.anthropic.com/en/docs/claude-code/skills) — official skill documentation
- [SKILL.md specification](https://docs.anthropic.com/en/docs/claude-code/memory) — format reference
- [Composio documentation](https://docs.composio.dev) — integration setup



