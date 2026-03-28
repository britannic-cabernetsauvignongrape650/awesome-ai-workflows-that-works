---
name: Blog Post Pipeline
category: marketing
difficulty: intermediate
tools: Claude, Perplexity, Brave Search MCP, your CMS
tested: true
---

# Blog Post Pipeline

> Research first, outline second, draft third. That order is what keeps AI blog posts from turning generic.

## What this is for

This workflow is for writing posts that need substance, not just structure.

It works best when you want to:

- collect sources before drafting
- compare competing angles
- keep the article grounded in current material
- ship faster without publishing filler

## Stack

| Tool | Role |
|------|------|
| [Perplexity](https://www.perplexity.ai/) or web search | research and citations |
| [Claude](https://claude.ai) | outlining and first draft |
| [Brave Search MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search) | optional search path inside an MCP-capable setup |
| your CMS | publishing |

## Workflow

### 1. Build a research brief first

Ask for:

- key facts with URLs
- current consensus
- counterpoints
- underreported angles
- weak or conflicting evidence

The research brief is the factual base. Do not skip it.

### 2. Generate multiple outlines

Have the model propose three structures with:

- title
- angle
- H2 sections
- which research items belong in each section

Pick one outline before drafting.

### 3. Draft against the outline only

The model should follow the approved structure, not improvise a new one halfway through.

Include:

- audience
- tone
- specific facts that must appear
- what the reader should do or understand at the end

### 4. Edit as a human, not as a spellchecker

Check for:

- source accuracy
- obvious AI phrasing
- weak opening
- repeated points
- filler that should be cut

### 5. Format for the final channel

After the edit pass, ask for:

- Markdown or HTML cleanup
- meta description
- social pull quotes
- image alt-text suggestions

## Example research shape

**Topic:** "How developers are using AI agents in CI/CD pipelines"

Good research output should surface things like:

- where teams start first
- what they avoid automating
- where approval paths matter
- what practitioners disagree about

That gives the draft a real angle instead of a generic "AI is changing everything" structure.

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- Reviewed against the current research and writing flow used across this repo and checked the upstream search and writing references below.

## Failure modes

- Research summaries can still distort the original source.
- AI drafts are often structurally fine but tonally flat.
- YMYL topics need stronger human review than general tech or product writing.
- A keyword-driven brief can still produce a boring article if the angle is weak.

## Sources

- [Perplexity](https://www.perplexity.ai/)
- [Brave Search MCP server](https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search)
- [Anthropic: Claude character and style](https://www.anthropic.com/research/claude-character)
- [The Elements of Style](https://en.wikipedia.org/wiki/The_Elements_of_Style)
