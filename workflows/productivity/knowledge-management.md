---
name: Personal Knowledge Management with AI
category: productivity
difficulty: intermediate
tools: Claude, Obsidian / Notion, n8n, web clipper
tested: true
---

# Personal Knowledge Management with AI

> Capture anything (article, tweet, podcast, PDF), have Claude extract the key ideas, connect them to what you already know, and surface relevant notes when you need them.

## What this is for

The problem with most note-taking systems isn't capture — it's retrieval and synthesis. You save hundreds of articles but never read them. Notes sit in isolation without being connected to related ideas. This workflow uses Claude to do what humans are bad at: consistently extracting insights, tagging correctly, and linking related concepts.

**What this solves:**
- Notes that sit in "Read Later" forever
- Related ideas that never get connected
- Forgetting what you learned 3 months ago
- Not being able to find notes when you need them

---

## Stack

| Tool | Role |
|------|------|
| [Obsidian](https://obsidian.md) + [Smart Connections plugin](https://obsidian.md/plugins?id=smart-connections) | Local knowledge base with semantic search |
| [Notion](https://notion.so) | Alternative: cloud-based, better for teams |
| [Readwise Reader](https://readwise.io/read) | Read-later + highlights + Kindle sync (replaces Omnivore) |
| [Readwise](https://readwise.io) | Spaced repetition for highlights; backend for Reader |
| [Claude API](https://docs.anthropic.com/en/api/) | Extraction, summarization, connection-finding |
| [n8n](https://n8n.io) | Automation glue between tools |

---

## The Capture System

### What to Capture (and What Not To)

**Capture:**
- Articles and blog posts you finish reading
- Book highlights (via Readwise or Kindle)
- Podcast key moments (via transcript)
- Your own ideas and observations
- Meeting insights worth keeping

**Don't capture:**
- Articles you save "to read later" — you won't
- Tweets unless they contain a specific insight
- News (decays too fast)
- Anything you're bookmarking just to feel productive

### Capture Channels

```
Article → Readwise Reader clip → highlight key passages → auto-sync to Obsidian
Book → Kindle highlights → Readwise → processed note in Obsidian
Podcast → Whisper transcript → Claude summary → Obsidian
PDF → Claude extract → structured note → Obsidian
Twitter/X → manual copy + context → Claude extract → Obsidian
Your own thought → quick voice note → transcribe → Claude format → Obsidian
```

---

## The Claude Processing Prompt

Use this template when processing any captured content:

```
You are helping me build a personal knowledge base.

Process the following content and create a note using this structure:

---
title: [create a specific, searchable title — not generic like "Interesting article"]
date: {{today}}
source: [URL or source name]
tags: [3-5 tags from my existing taxonomy — see below]
type: article | book_note | podcast | idea | research
---

## Core Idea (1-2 sentences)
What is the single most important insight from this content?

## Key Points (3-7 bullets)
The most valuable and non-obvious ideas. Skip obvious things I already know.

## Mental Model / Framework (if applicable)
If this content introduces a useful thinking tool or framework, describe it concisely.

## Connections
How does this connect to other things I might already know about:
- [related domain]
- [related domain]
Think in terms of: contradictions, extensions, applications, analogies.

## Questions This Raises
What I should explore further, or what this leaves unresolved.

## My Take (leave blank — I'll fill this in)

---

My existing tag taxonomy:
#ai #product #engineering #psychology #learning #marketing #finance #creativity #systems-thinking #communication

Content to process:
{content}
```

---

## Workflow 1: Article Processing (Readwise Reader → Obsidian)

### n8n Automation

```
Trigger: Readwise Reader webhook (new highlight created)
    ↓
Fetch full article content + highlights from Readwise API
    ↓
Claude: process with extraction prompt above
    ↓
Create file in Obsidian vault (via local REST API plugin)
    ↓
(optional) Notify via Telegram: "Note created: [title]"
```

**Readwise Reader webhook setup:**
- Readwise Settings → Integrations → Webhooks → Add webhook
- URL: `https://your-n8n.com/webhook/readwise`
- Events: `highlight_created`

**Obsidian Local REST API plugin:**
```bash
# Install plugin in Obsidian: Settings → Community Plugins → Local REST API
# Then via n8n HTTP node:
POST http://localhost:27123/vault/Inbox/{{note_title}}.md
Content-Type: text/markdown
Authorization: Bearer your-api-key

{claude_output}
```

---

## Workflow 2: Book Notes (Readwise → Obsidian)

Readwise exports Kindle highlights. Claude turns raw highlights into structured insights.

```python
import anthropic
import requests

READWISE_TOKEN = "your_token"
ANTHROPIC_KEY = "your_key"

# Fetch highlights for a book
response = requests.get(
    "https://readwise.io/api/v2/highlights/",
    headers={"Authorization": f"Token {READWISE_TOKEN}"},
    params={"book_id": book_id}
)
highlights = response.json()["results"]

# Format highlights for Claude
highlights_text = "\n".join([
    f'"{h["text"]}" (loc. {h["location"]})'
    for h in highlights
])

# Process with Claude
client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
note = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2000,
    messages=[{
        "role": "user",
        "content": f"""Process these Kindle highlights from "{book_title}" by {book_author}.

{highlights_text}

Create a structured book note:
1. Core thesis (2-3 sentences)
2. Top 5 insights (with the exact highlight as evidence)
3. Practical applications (how I could use this)
4. Mental models introduced
5. Best quotes (3-5, verbatim)
6. My questions and pushback (what I'm skeptical about)
"""
    }]
)

# Save to Obsidian
with open(f"vault/Books/{book_title}.md", "w") as f:
    f.write(note.content[0].text)
```

---

## Workflow 3: Weekly Review and Connection-Finding

Every Sunday, Claude reviews recent notes and finds connections you missed:

```python
# Collect notes from the past 7 days
recent_notes = []
for file in vault_path.glob("**/*.md"):
    if file.stat().st_mtime > (time.time() - 7 * 86400):
        recent_notes.append({
            "title": file.stem,
            "content": file.read_text()
        })

# Find connections
connection_prompt = f"""
I captured {len(recent_notes)} notes this week. Find non-obvious connections.

Notes:
{json.dumps([{"title": n["title"], "excerpt": n["content"][:500]} for n in recent_notes])}

Return:
1. **Surprising connections** — ideas from different domains that support or contradict each other
2. **Emerging themes** — what topics am I returning to this week?
3. **A synthesis** — can you write a 3-sentence paragraph that combines 2-3 of these ideas in an interesting way?
4. **Gaps** — what related ideas should I explore next?
"""

synthesis = claude(connection_prompt)
```

---

## Workflow 4: On-Demand Search and Synthesis

When you're working on a problem, ask Claude to synthesize your existing notes:

```bash
# With Obsidian's vault accessible and Claude Code + filesystem MCP:

claude "
I'm writing a blog post about RAG pipelines.
Search my vault in ~/Documents/Obsidian/ for any notes related to:
- RAG, retrieval, embeddings, vector databases
- LLM application architecture
- Production AI systems

Synthesize what I've already captured:
1. What are the key points I've already collected?
2. What perspectives do I have from different sources?
3. What gaps are there — topics I should research more?
4. Suggest an outline for the blog post based on my existing notes.
"
```

---

## Spaced Repetition for Key Insights

For notes containing important facts or frameworks you want to remember:

```python
# Add to your processing prompt:
"If this note contains specific facts, statistics, or frameworks worth memorizing,
add a ## Flashcards section with 3-5 question/answer pairs."

# Then sync flashcards to Anki via AnkiConnect
import requests

for card in extract_flashcards(note):
    requests.post("http://localhost:8765", json={
        "action": "addNote",
        "params": {
            "note": {
                "deckName": "PKM",
                "modelName": "Basic",
                "fields": {"Front": card["question"], "Back": card["answer"]},
                "tags": ["ai-generated", note["tags"]]
            }
        }
    })
```

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **Quality in, quality out.** Claude can only extract insights from content that has insights. Don't expect AI to make shallow content meaningful.
- **Over-automation kills serendipity.** If everything is processed automatically, you lose the reflective reading that makes ideas stick. Keep a "slow reading" practice for important books.
- **Tag taxonomy drift.** Establish your tag taxonomy early and stick to it. Claude will suggest tags, but you should validate them against your existing structure.
- **Vault bloat.** Processing everything creates noise. Be selective: only process content you actually read and found valuable.

---

## Recommended Stack by Use Case

| Situation | Stack |
|-----------|-------|
| Individual, privacy-focused | Obsidian (local) + Claude API + Readwise Reader |
| Team knowledge base | Notion + Claude API + n8n |
| Heavy reader (books + articles) | Readwise Reader + Obsidian + Claude processing |
| Researcher | Zotero + Obsidian + Claude |
| Free, fully open-source | Obsidian + Ollama (local LLM) + Wallabag (self-hosted read-later) |

---

## Sources

- [Obsidian documentation](https://help.obsidian.md)
- [Smart Connections plugin](https://github.com/brianpetro/obsidian-smart-env) — semantic search in Obsidian
- [Readwise API](https://readwise.io/api_deets)
- [Readwise Reader API](https://readwise.io/reader_api)
- [Obsidian Local REST API plugin](https://github.com/coddingtonbear/obsidian-local-rest-api)
- [Building a Second Brain (Forte)](https://www.buildingasecondbrain.com) — the underlying methodology
