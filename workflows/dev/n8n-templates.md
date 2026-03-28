---
name: n8n Templates and Workflow Sources
category: dev
difficulty: beginner
tools: n8n, OpenAI, Claude, Gemini, Slack, Telegram, Gmail, Notion
tested: false
---

# n8n Templates and Workflow Sources

> Use this page to find the right n8n template source before you start wiring nodes from scratch.

## What this is for

There are now several strong n8n template collections, but they are good at different things:

- official examples
- broad AI workflow dumps
- smaller example repos you can actually read end to end

## Start with the source type

| If you need... | Start here |
|------|------|
| official community templates | `n8n.io/workflows` |
| a very large AI-heavy collection | `ultimate-n8n-ai-workflows` |
| smaller free examples to learn from | `n8n_examples` |
| broader community discovery | `awesome-n8n` and related curated lists |

## How to use a template safely

1. Import the workflow into a test instance first.
2. Inspect credentials, webhooks, and external calls.
3. Replace model IDs, destinations, and app secrets with your own values.
4. Run once with sample data.
5. Add error handling before using it on production data.

## Best source by use case

### Official n8n workflow library

Best when you want:

- something maintained by the community around the product
- a quick import path
- a known-good starting point

### `ultimate-n8n-ai-workflows`

Best when you want:

- raw breadth
- lots of AI-oriented patterns
- ideas for assistants, content, support, and agent-like flows

### `n8n_examples`

Best when you want:

- smaller examples
- easier reading and adaptation
- less noise than giant dump repos

## Validation

- Last verified: 2026-03-28
- Tested: false
- Source-validated against current n8n docs and the referenced template repositories

## Sources

- [n8n community workflows](https://n8n.io/workflows/)
- [n8n AI documentation](https://docs.n8n.io/advanced-ai/)
- [restyler/awesome-n8n](https://github.com/restyler/awesome-n8n)
- [oxbshw/ultimate-n8n-ai-workflows](https://github.com/oxbshw/ultimate-n8n-ai-workflows)
- [egouilliard/n8n_examples](https://github.com/egouilliard/n8n_examples)
