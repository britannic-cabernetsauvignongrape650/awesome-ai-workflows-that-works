---
name: Natural Language → SQL → Dashboard
category: research
difficulty: intermediate
tools: Claude, PostgreSQL MCP Server, Hex / Metabase
tested: true
---

# Natural Language → SQL → Dashboard

> Ask data questions in plain English, get live SQL executed against your database, results formatted and explained — no copy-pasting queries.

## What this is for

Connect Claude directly to your database via MCP and ask analytical questions in natural language. Claude generates SQL, executes it, and interprets the results in context. For recurring analyses, Hex or Metabase turns the SQL into a scheduled dashboard.

This workflow replaces the typical loop: think of question → write SQL → copy to client → paste results into doc → explain to stakeholders. Instead: ask once → get answer + SQL in one step.

---

## Stack

| Tool | Role | Docs |
|------|------|------|
| [Claude Code](https://claude.ai/code) | Translates questions to SQL, interprets results | [Docs](https://docs.anthropic.com/en/docs/claude-code) |
| [PostgreSQL MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres) | Direct read-only database access | [MCP Servers repo](https://github.com/modelcontextprotocol/servers) |
| [Hex](https://hex.tech) | Collaborative notebooks + scheduled dashboards | Free (personal), Team $24/seat/mo |
| [Metabase](https://metabase.com) | Self-hosted BI with natural language support | Free open-source |

---

## Setup

### 1. Create a Read-Only Database User

**Always use a read-only user for analytical access.** Never connect Claude to a database with write permissions.

```sql
-- PostgreSQL
CREATE USER claude_analyst WITH PASSWORD 'your_password';
GRANT CONNECT ON DATABASE your_db TO claude_analyst;
GRANT USAGE ON SCHEMA public TO claude_analyst;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO claude_analyst;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO claude_analyst;
```

### 2. Configure PostgreSQL MCP Server

Add to Claude Code settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://claude_analyst:your_password@localhost:5432/your_db"
      ]
    }
  }
}
```

Or with environment variable (more secure):
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://claude_analyst:password@localhost/db"
      }
    }
  }
}
```

Restart Claude Code. Verify with: `claude "List the tables in my database"`

---

## Usage

### Basic Questions

```bash
claude "
What were the top 10 customers by revenue in Q1 2026?
Show me the trend — how does each of them compare to Q1 2025?
"
```

### Iterative Analysis (follow-up questions)

Claude remembers the database schema and previous queries within a session:

```
claude "How many users signed up this week vs last week?"
[Result: This week 1,247 (+23% vs 1,014 last week)]

claude "What acquisition channel drove the most of this week's signups?"
[Result: Organic 41%, Referral 28%, Paid 22%, Direct 9%]

claude "Show me the lifetime value of users from each channel"
[Result: Referral LTV $847, Organic $612, Paid $389, Direct $1,102]
```

### Structured Analysis Request

```
claude "
Run a cohort analysis on user retention:
- Cohorts: monthly signup cohort for January-March 2026
- Retention: % of users who were active in each subsequent month
- Return a matrix: cohort × months since signup (M0 through M6)
- Flag any cohort with Month 1 retention below 30%
"
```

---

## Sample Output

```
claude "What's the revenue breakdown by product category this month vs last month?"

Running query against your_db...

March 2026 vs February 2026 — Revenue by Category:

┌──────────────────┬──────────────┬──────────────┬──────────┐
│ Category         │  March 2026  │  Feb 2026    │  Change  │
├──────────────────┼──────────────┼──────────────┼──────────┤
│ Enterprise       │ $2,841,220   │ $2,390,110   │ +18.9%   │
│ SMB              │ $1,102,450   │ $1,287,330   │ -14.4%   │
│ Individual       │   $391,880   │   $388,920   │  +0.8%   │
└──────────────────┴──────────────┴──────────────┴──────────┘

Observation: Enterprise growth is strong but SMB is contracting significantly
(-14.4%). This could be worth investigating — was there a pricing change,
a support issue, or is it consistent with a seasonal pattern?

SQL used:
WITH monthly AS (
  SELECT
    product_category,
    SUM(CASE WHEN DATE_TRUNC('month', created_at) = '2026-03-01' THEN amount END) AS march_rev,
    SUM(CASE WHEN DATE_TRUNC('month', created_at) = '2026-02-01' THEN amount END) AS feb_rev
  FROM orders
  WHERE created_at >= '2026-02-01'
  GROUP BY 1
)
SELECT
  product_category,
  march_rev,
  feb_rev,
  ROUND((march_rev - feb_rev) / feb_rev * 100, 1) AS pct_change
FROM monthly
ORDER BY march_rev DESC;
```

Claude surfaces the insight (SMB contraction) without being asked — this is the key benefit over raw SQL output.

---

## For Recurring Dashboards: Use Hex

For questions you answer every week, [Hex](https://hex.tech) turns the SQL into a scheduled, shareable dashboard:

1. Copy the SQL Claude generated
2. Paste into a Hex notebook cell
3. Add a chart visualization (Hex auto-suggests chart type)
4. Set a refresh schedule (daily/weekly)
5. Share the notebook URL with stakeholders

Hex also has a built-in AI that can generate SQL from natural language directly — but Claude with full context about your schema often produces better queries for complex analyses.

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Read-only user is non-negotiable.** Claude with write access could accidentally run destructive queries. Use `GRANT SELECT` only.
- **Schema complexity:** Claude works better when your schema is well-named. Columns like `f1`, `amt_trx` will confuse it. Add a comment to your prompt: "The column `f1` is the foreign key to the users table."
- **Slow queries on large tables:** Claude doesn't know your indexes. If a query is slow, ask: "Rewrite the query to use the index on `created_at`. Avoid full table scans."
- **Hallucinated table names:** On the first query, Claude may guess table names that don't exist. It will correct itself once it reads the schema — just let it run `\dt` first.
- **GDPR/data privacy:** Be careful with personal data (emails, names). Use a data warehouse or anonymized analytics replica, not your production DB with PII.

---

## Sources

- [PostgreSQL MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres) — setup and config reference
- [MCP servers registry](https://github.com/modelcontextprotocol/servers) — MySQL, SQLite, BigQuery, and other DB adapters
- [Hex documentation](https://learn.hex.tech) — notebooks, SQL cells, scheduling
- [Metabase open-source setup](https://www.metabase.com/docs/latest/installation-and-operation/installing-metabase) — self-hosted BI
- [Claude Code MCP documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)


