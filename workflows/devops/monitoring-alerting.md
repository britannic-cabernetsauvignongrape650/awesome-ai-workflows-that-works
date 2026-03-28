---
name: AI-Powered Monitoring and Alert Diagnosis
category: devops
difficulty: intermediate
tools: Claude, n8n / PagerDuty, Datadog / Grafana, GitHub MCP
tested: true
---

# AI-Powered Monitoring and Alert Diagnosis

> When an alert fires, Claude reads the logs, checks recent commits, and returns a diagnosis with a suggested fix — before you even open your laptop.

## What this is for

Traditional on-call is reactive: alert fires → human wakes up → human reads logs → human tries to understand what changed → human fixes it. This workflow adds an AI triage step: Claude processes the alert context, correlates it with recent deployments, and delivers a structured diagnosis so the on-call engineer starts with a clear picture, not a blank log screen.

**What changes:** You still get paged. But you open your phone and see a diagnosis, not just a stack trace.

---

## Stack

| Tool | Role |
|------|------|
| [Datadog](https://datadoghq.com) / [Grafana](https://grafana.com) | Alert trigger source |
| [PagerDuty](https://pagerduty.com) / [OpsGenie](https://opsgenie.com) | Incident management and paging |
| [n8n](https://n8n.io) | Workflow orchestration between tools |
| [Claude API](https://docs.anthropic.com/en/api/) | Log analysis and diagnosis |
| [GitHub MCP](https://github.com/github/github-mcp-server) | Correlate alerts with recent commits |
| [Slack](https://slack.com) | Alert delivery with AI diagnosis |

---

## The Diagnosis Workflow

```
Alert fires (Datadog / Grafana)
        ↓
n8n receives webhook
        ↓
n8n fetches: error logs (last 15 min) + recent deployments
        ↓
Claude: "What's wrong and why?"
        ↓
Slack message with: diagnosis + root cause hypothesis + suggested fix
        ↓
(Optional) PagerDuty incident created with diagnosis in description
        ↓
On-call engineer gets paged with context, not just an alert
```

---

## Setup

### 1. Create a Datadog Monitor Webhook

In Datadog → Monitors → Manage → your monitor → Notify your team → add webhook:

```
Webhook URL: https://your-n8n-instance.com/webhook/alert-triage
Payload:
{
  "alert_id": "{{alert_id}}",
  "alert_title": "{{alert_title}}",
  "alert_message": "{{alert_message}}",
  "host": "{{host.name}}",
  "service": "{{service}}",
  "severity": "{{alert_priority}}",
  "timestamp": "{{last_triggered_at_epoch}}"
}
```

### 2. Build the n8n Workflow

Import this workflow structure:

```
Webhook (POST /alert-triage)
    ↓
HTTP Request → Datadog API (fetch last 15 min of error logs for the service)
    ↓
HTTP Request → GitHub API (fetch last 5 commits to main branch)
    ↓
Claude node (diagnosis)
    ↓
Slack node (post to #incidents)
    ↓
(optional) PagerDuty node (create incident with diagnosis)
```

**n8n Claude node configuration:**

```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "messages": [{
    "role": "user",
    "content": "=You are an on-call engineer. An alert has fired. Diagnose the issue.\n\n## Alert\nTitle: {{ $json.alert_title }}\nMessage: {{ $json.alert_message }}\nService: {{ $json.service }}\nHost: {{ $json.host }}\nSeverity: {{ $json.severity }}\n\n## Error Logs (last 15 minutes)\n```\n{{ $('Fetch Logs').item.json.logs }}\n```\n\n## Recent Deployments\n{{ $('Fetch Commits').item.json.commits }}\n\n---\n\nProvide:\n1. **What's wrong** (1 sentence)\n2. **Likely root cause** (with evidence from logs)\n3. **Is this related to a recent deployment?** (check the commits)\n4. **Suggested immediate fix** (what to try first)\n5. **Severity assessment** (P1/P2/P3 and why)\n\nBe direct. The on-call engineer needs to act fast."
  }]
}
```

**n8n Slack node — message format:**

```
🚨 *Alert: {{ $('Webhook').item.json.alert_title }}*
Service: `{{ $('Webhook').item.json.service }}` | Severity: {{ $('Webhook').item.json.severity }}

*AI Diagnosis:*
{{ $('Claude').item.json.content[0].text }}

<https://app.datadoghq.com/monitors/{{ $('Webhook').item.json.alert_id }}|View in Datadog> | <https://github.com/your-org/your-repo/commits/main|Recent Commits>
```

---

## The Claude Diagnosis Prompt

The full prompt used in production (tune to your stack):

```
You are an experienced on-call engineer for a [Node.js / Python / Go] web service.

An alert has fired. You have the following context:

## Alert Details
Title: {alert_title}
Service: {service_name}
Environment: {environment}
Triggered at: {timestamp}
Threshold crossed: {metric} = {value} (threshold: {threshold})

## Error Logs (last 15 minutes)
```
{error_logs}
```

## Recent Deployments (last 5 commits to main)
{recent_commits}

## Current Service Metrics
- Error rate: {error_rate}%
- P99 latency: {p99_latency}ms
- Requests/min: {rps}
- Pod/instance count: {instance_count}

---

Provide a triage report in this format:

**What's Wrong** (1 sentence, plain language)

**Evidence** (2-3 specific log lines or metrics that support your diagnosis)

**Root Cause Hypothesis**
Most likely: [explanation]
Alternative: [if applicable]

**Recent Deployment Correlation**
[Does any recent commit explain this? Quote the relevant commit message and explain the connection. If no correlation, say so.]

**Immediate Actions** (ordered by likelihood to resolve)
1. [First thing to try]
2. [Second thing to try]

**Severity: P[1/2/3]**
[One sentence justification]
```

---

## Sample Output

**Alert:** High error rate on `/api/checkout` (18% 5xx errors)

```
**What's Wrong**
The checkout API is returning 500 errors with database connection timeouts.

**Evidence**
- Log line at 14:23:01: `Error: Connection timeout after 30000ms — pool exhausted (10/10 connections in use)`
- Log line at 14:23:04: `Unhandled rejection: Cannot read properties of undefined (reading 'stripe_customer_id')`
- Metric: DB connection pool utilization went from 45% to 100% at 14:22:50

**Root Cause Hypothesis**
Most likely: A slow query is holding connections open, exhausting the pool. The `stripe_customer_id` error suggests a null check is missing for users created before Stripe integration.
Alternative: Database CPU spike causing query slowdowns — check RDS metrics.

**Recent Deployment Correlation**
Commit `feat: add volume discounts to checkout` (deployed 14:20 by @marco) added a new
`calculateVolumeDiscount()` function. This function runs an unbatched query inside a loop
for each cart item — likely the source of the connection pool exhaustion.

**Immediate Actions**
1. Roll back to previous deploy: `kubectl rollout undo deployment/checkout-api`
2. If rollback not possible: reduce connection pool size to 5 (reduces throughput but prevents total failure)
3. Once stable: fix the N+1 query in `calculateVolumeDiscount()`

**Severity: P1**
18% error rate on checkout = direct revenue impact; escalate immediately.
```

---

## Recurring Alert Pattern Detection

For alerts that fire repeatedly, add a weekly summary:

```
n8n: weekly schedule (Monday 9am)
    ↓
Fetch all alerts from past 7 days (Datadog API)
    ↓
Claude: "What patterns do you see? What should we fix to reduce alert noise?"
    ↓
Post to #engineering Slack channel
```

**Prompt:**

```
Here are all alerts that fired in the past 7 days:
{alert_list_with_frequency}

Identify:
1. The top 3 alerts by frequency and estimated engineer time cost
2. Common root causes across multiple alerts
3. Specific code changes or configuration fixes that would eliminate or reduce each
4. Which alerts are likely false positives that should be tuned

Format as an action plan the team can prioritize.
```

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Log volume.** Fetch a reasonable window (5-15 min) and limit to error-level logs. Sending 10,000 log lines to Claude is expensive and the signal gets lost.
- **Sensitive data in logs.** Log lines may contain PII or credentials. Redact before sending to the Claude API. Use a local Claude deployment (Ollama) if logs contain regulated data.
- **AI diagnosis is hypothesis, not fact.** Engineers still verify before acting. The diagnosis gets you to the right hypothesis faster — it's not a guarantee.
- **Tail latency for triage.** The n8n → Datadog API → Claude API → Slack chain adds 10-30 seconds to the time before you get notified. If you need immediate paging, trigger PagerDuty first and run diagnosis in parallel.

---

## Sources

- [n8n documentation](https://docs.n8n.io)
- [Datadog webhooks](https://docs.datadoghq.com/integrations/webhooks/)
- [PagerDuty API](https://developer.pagerduty.com/api-reference/)
- [Claude API reference](https://docs.anthropic.com/en/api/getting-started)
- [Google SRE Book — Alerting on What Matters](https://sre.google/sre-book/practical-alerting/)
