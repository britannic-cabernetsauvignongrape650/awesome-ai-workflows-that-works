---
name: The Standard MCP Stack for Productivity
category: dev
difficulty: beginner
tools: Claude Desktop, Claude Code, MCP, GitHub, Google Workspace, PostgreSQL, Slack
tested: true
---

# The Standard MCP Stack for Productivity

> Connect an AI assistant to the tools you actually use without hard-coding your setup to package names that may drift next quarter.

## What this is for

Model Context Protocol (MCP) is the open standard for giving AI agents access to external tools and data. Once configured, Claude or another MCP-capable client can read docs, query systems, inspect repositories, and act across real tools without constant copy-paste.

The useful pattern is stable even when the ecosystem moves:

- start with one high-value tool
- prefer maintained vendor servers
- add read-only systems first
- verify every server upstream before installing it

## Freshness Note

The MCP ecosystem changes quickly.

Use this guide as a stable architecture pattern, not as a promise that every package name stays unchanged forever.

Before installing any MCP server:

1. Check the [MCP Registry](https://registry.modelcontextprotocol.io).
2. Prefer vendor-maintained or officially documented servers.
3. Treat older reference repositories as implementation examples, not as your only source of truth.

## What MCP Is (and Isn't)

**MCP is:** a standard that lets an AI client call tools and access resources through a consistent interface.

**MCP is not:** a guarantee that every listed server is current, secure, or production-ready for your use case.

**MCP works best when:** you give the assistant narrow, useful capabilities tied to real workflows.

## The Standard Stack

| Layer | What it gives you | Where to get it |
|--------|-------------------|-----------------|
| GitHub | repos, issues, PRs, branches, file access | official [github/github-mcp-server](https://github.com/github/github-mcp-server) |
| Google Workspace | Gmail and Calendar workflows | a currently maintained Google Workspace server from the [MCP Registry](https://registry.modelcontextprotocol.io) |
| PostgreSQL | structured data access | a currently maintained Postgres server from the registry |
| Slack | messaging and team coordination | a currently maintained Slack server from the registry or a vendor-supported integration |

If you want the fastest path to value, start with:

- GitHub
- one read-only data source

Only add Gmail, Calendar, and Slack after the first workflow is genuinely useful.

## Recommended Rollout Order

### Phase 1: GitHub only

Use MCP to:

- inspect code
- read and open issues
- review PRs
- connect coding workflows to the repo

### Phase 2: Add one read-only business system

Good second steps:

- PostgreSQL for querying internal data
- Gmail for inbox triage
- Calendar for meeting prep

### Phase 3: Add communication and write-capable tools

Only after you trust the workflow:

- Slack posting
- issue creation
- calendar updates
- write-capable business actions

## Configuration Pattern

Use a simple structure and replace placeholders only after checking the current maintained package or server URL.

### Claude Desktop: `~/.claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "<official-github-mcp-command-or-remote-setup>",
      "args": ["<vendor-documented-args>"],
      "env": {
        "GITHUB_TOKEN": "your_token_here"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "<current-postgres-mcp-package>"],
      "env": {
        "DATABASE_URL": "postgresql://readonly_user:password@localhost:5432/your_db"
      }
    },
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "<current-google-workspace-mcp-package>"],
      "env": {
        "GOOGLE_CLIENT_ID": "your_client_id",
        "GOOGLE_CLIENT_SECRET": "your_client_secret",
        "GOOGLE_REFRESH_TOKEN": "your_refresh_token"
      }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "<current-slack-mcp-package>"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token"
      }
    }
  }
}
```

### Claude Code: `~/.claude/settings.json`

Use the same structure, adjusted to the host's MCP configuration format.

## Setup Checklist

### GitHub

Use the official GitHub MCP server documentation first. Depending on host support, your setup may use:

- a remote GitHub MCP endpoint
- a local GitHub MCP server
- OAuth
- a PAT with least-privilege scopes

Do not assume every host needs the same auth flow.

### Google Workspace

Treat Gmail and Calendar as one integration decision:

1. pick a maintained Google Workspace server from the registry
2. verify the exact scopes it needs
3. create OAuth credentials for that specific server
4. keep scopes as narrow as possible

### PostgreSQL

Always use a read-only role first.

```sql
CREATE USER claude_readonly WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE your_db TO claude_readonly;
GRANT USAGE ON SCHEMA public TO claude_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO claude_readonly;
```

### Slack

Add Slack only when the workflow already works without it. Messaging tools feel powerful, but they also create the easiest visible mistakes.

## Good First Prompts

Once your first server is connected, test with simple prompts:

```text
List my open GitHub issues.
```

```text
Show me the tables in the analytics database.
```

```text
Summarize my next three meetings today.
```

If those fail, fix setup before adding more servers.

## Validation

After each new server:

1. restart the MCP-capable client
2. test one read-only action
3. test one realistic workflow
4. only then add another server

This sequence is slower than "install everything now," but much faster than debugging four broken integrations at once.

## Security Best Practices

- use read-only access wherever possible
- prefer narrow OAuth scopes and least-privilege tokens
- keep destructive tools behind human review
- audit which servers are actually worth the startup and trust cost
- remove servers you no longer use

## Other Useful MCP Servers

| Server | What It Does | Where to look |
|--------|-------------|---------------|
| Filesystem | read/write local files | [reference server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) |
| Memory | graph-style persistent memory | [reference server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) |
| Playwright | browser control | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) |
| Linear | issue workflows | [linear/linear-mcp](https://github.com/linear/linear-mcp) |
| Notion | docs and databases | [makenotion/notion-mcp-server](https://github.com/makenotion/notion-mcp-server) |
| Qdrant | vector search | [qdrant/mcp-server-qdrant](https://github.com/qdrant/mcp-server-qdrant) |

Registry first: [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io)  
Reference implementations: [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)

## Failure modes

- package names and setup flows change faster than the architecture pattern
- not every MCP server in the ecosystem is equally maintained
- local convenience can hide large trust and security differences
- adding too many servers too early makes approval flow and debugging worse

## Sources

- [MCP specification](https://modelcontextprotocol.io)
- [MCP Registry](https://registry.modelcontextprotocol.io)
- [Model Context Protocol reference servers](https://github.com/modelcontextprotocol/servers)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [Claude Code MCP documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [MCP security guide](https://modelcontextprotocol.io/docs/concepts/security)
