---
name: MCP Security Checklist for Production
category: security
difficulty: beginner
tools: Claude, MCP servers, Docker
tested: false
---

# MCP Security Checklist for Production

> A growing share of MCP tools modify external state. Every tool call is a potential security event — here's how to deploy safely.

## Why This Matters

The MCP ecosystem has shifted rapidly from read-only tools (search, retrieve) toward "action tools" that modify external state: send email, write files, call APIs, push code. As more tools gain write access, a single compromised prompt can cause significant damage. The checklist below reflects what production teams actually do to contain this.

---

## The Checklist

### 1. Principle of Least Privilege

Each agent gets **only** the tools it needs for its task — nothing more.

```json
// BAD: one agent with access to everything
{
  "mcpServers": {
    "github": {...},
    "postgres": {...},
    "gmail": {...},
    "filesystem": {...},
    "slack": {...}
  }
}

// GOOD: scoped agents with specific tool sets
// Research agent: only web search + read-only DB
// Writing agent: only filesystem (write to docs/) + grammar check
// Notifier agent: only Slack (post to #releases channel)
```

**In Claude Code**, scope agents by defining tool allow-lists in `.claude/agents/`:

```markdown
---
name: db-analyst
tools: mcp__postgres__query, mcp__postgres__list_tables
# NOT: mcp__postgres__execute (which allows writes)
---
```

---

### 2. Read-Only Database Access

Never connect an AI agent to a database with write permissions unless explicitly required.

```sql
-- PostgreSQL: create a read-only user for all AI agent connections
CREATE USER ai_readonly WITH PASSWORD 'strong_random_password';
GRANT CONNECT ON DATABASE your_db TO ai_readonly;
GRANT USAGE ON SCHEMA public TO ai_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_readonly;

-- Prevent future tables from being writable by default
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM ai_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ai_readonly;
```

```json
// MCP config: use the read-only user
{
  "postgres": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres",
             "postgresql://ai_readonly:password@localhost/db"]
  }
}
```

---

### 3. Sandbox MCP Servers in Docker

MCP servers run as local processes with your user's permissions. Isolate them:

```yaml
# docker-compose.yml — run MCP servers in containers
services:
  mcp-postgres:
    image: node:22-alpine
    command: npx -y @modelcontextprotocol/server-postgres postgresql://ai_readonly:pass@db/mydb
    environment:
      - NODE_ENV=production
    networks:
      - mcp-internal
    # No external network access, no volume mounts
    read_only: true

  mcp-filesystem:
    image: node:22-alpine
    command: npx -y @modelcontextprotocol/server-filesystem /workspace/docs
    volumes:
      - ./docs:/workspace/docs:rw  # only the docs folder, read-write
      - ./src:/workspace/src:ro    # source code is read-only
    read_only: false
    tmpfs:
      - /tmp
```

---

### 4. Audit All Tool Calls

Log every MCP tool invocation with timestamp, tool name, parameters, and result.

**Claude Code hook** — fires on every tool call:

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "mcp__",
      "hooks": [{
        "type": "command",
        "command": "echo \"$(date -u +%Y-%m-%dT%H:%M:%SZ) TOOL_CALL: $TOOL_NAME params=$TOOL_INPUT\" >> ~/.claude/audit.log"
      }]
    }]
  }
}
```

For production, ship logs to your SIEM:

```bash
# Ship to Datadog
echo "$(date) [CLAUDE_TOOL] tool=$TOOL_NAME user=$USER session=$SESSION_ID" | \
  datadog-agent tee /var/log/claude-tools/audit.log
```

---

### 5. Human-in-the-Loop for High-Stakes Actions

Any tool that sends something external, modifies production data, or is irreversible should require explicit confirmation.

**In Claude Desktop:** Tools marked as "write" tools prompt for confirmation by default. Do not disable this.

**In Claude Code:** Use the `--no-auto-approve` flag for CI environments:

```bash
# Never auto-approve tool calls in automated pipelines
claude --no-auto-approve "deploy this to production"
```

**Categories that always need confirmation:**
- Email/Slack/messaging sends
- Database writes, updates, deletes
- File writes outside the project directory
- Git pushes to main/protected branches
- Any financial API calls (Stripe, etc.)
- DNS or infrastructure changes

---

### 6. Rate Limit Agent API Calls

Prevent runaway agents from exhausting API quotas or triggering detection:

```python
# Add rate limiting to your MCP server wrapper
import time
from collections import defaultdict

class RateLimitedMCPServer:
    def __init__(self, max_calls_per_minute=60):
        self.max_calls = max_calls_per_minute
        self.call_counts = defaultdict(list)

    def call_tool(self, tool_name: str, params: dict):
        now = time.time()
        minute_ago = now - 60

        # Clean old entries
        self.call_counts[tool_name] = [
            t for t in self.call_counts[tool_name] if t > minute_ago
        ]

        if len(self.call_counts[tool_name]) >= self.max_calls:
            raise Exception(f"Rate limit exceeded for {tool_name}: {self.max_calls} calls/min")

        self.call_counts[tool_name].append(now)
        return self._execute_tool(tool_name, params)
```

---

### 7. Validate MCP Tool Inputs

Malicious content in tool inputs can cause server-side injection. Always validate before executing:

```python
# Example: filesystem MCP server with path traversal prevention
import os
from pathlib import Path

ALLOWED_BASE = Path("/workspace/docs").resolve()

def write_file(path: str, content: str) -> str:
    # Resolve and validate path stays within allowed directory
    resolved = (ALLOWED_BASE / path).resolve()

    if not str(resolved).startswith(str(ALLOWED_BASE)):
        raise ValueError(f"Path traversal detected: {path}")

    if len(content) > 1_000_000:  # 1MB limit
        raise ValueError("Content too large")

    resolved.write_text(content)
    return f"Written: {resolved}"
```

---

### 8. Auth Per Server, Never Shared Tokens

Each MCP server authenticates independently. Never share a single token across multiple servers.

```json
// BAD: one master API key used everywhere
{
  "github": { "env": { "API_KEY": "master_token" } },
  "slack": { "env": { "API_KEY": "master_token" } }
}

// GOOD: scoped tokens per server
{
  "github": { "env": { "GITHUB_TOKEN": "ghp_readonly_token_scoped_to_repo" } },
  "slack": { "env": { "SLACK_TOKEN": "xoxb_channel_specific_token" } }
}
```

Use fine-grained GitHub tokens scoped to specific repos, not classic tokens with broad access.

---

### 9. Secret Management

MCP config files store credentials in plaintext. Mitigate this:

```bash
# Restrict permissions on config file
chmod 600 ~/.claude/claude_desktop_config.json

# Better: use environment variables instead of hardcoded values
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"  // resolved from shell env
    }
  }
}

# Export from .env file (not committed to git)
export GITHUB_TOKEN=$(cat ~/.secrets/github_token)
```

---

## Quick Audit: Is Your MCP Setup Secure?

```bash
# 1. List all MCP servers and their tools
claude "List all MCP tools you have access to, grouped by server name"

# 2. Check which tools can modify state
claude "For each MCP tool you have access to, tell me whether it reads data only or can also write/send/modify"

# 3. Review your config for hardcoded secrets
grep -i "token\|password\|secret\|key" ~/.claude/claude_desktop_config.json
```

---

## Incident Response Checklist

If an agent takes an unexpected action:

1. **Immediately:** Revoke the affected API token(s)
2. **Within 10 min:** Check audit log for what the agent actually called and with what parameters
3. **Within 30 min:** Identify the blast radius — what data was read/written/sent
4. **Remediation:** Rotate credentials, review the prompt that caused the issue, add guardrails

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: false
- Source-validated against MCP security documentation, OWASP LLM Top 10, and Claude Code permissions docs. Individual techniques are well-established but the combined checklist has not been end-to-end verified in a production deployment.

## Sources

- [MCP Security documentation](https://modelcontextprotocol.io/docs/concepts/security)
- [OWASP Top 10 for LLM Applications 2025](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Claude Code permissions documentation](https://docs.anthropic.com/en/docs/claude-code/security)
