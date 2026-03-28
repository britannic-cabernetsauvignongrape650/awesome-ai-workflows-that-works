---
name: Agentic Patterns — The Complete Anthropic Taxonomy
category: dev
difficulty: intermediate
tools: Claude Code, Claude API, any LLM
tested: false
---

# Agentic Patterns — The Complete Anthropic Taxonomy

> The definitive framework for choosing between workflows and agents — based on Anthropic's research on building effective agentic systems.

## The Core Distinction

```
Workflows  →  code controls the flow
               predefined paths, predictable steps

Agents     →  LLM controls the flow
               dynamic decisions, open-ended problems
```

Start with the simplest pattern that solves your problem. Complexity = risk. Every step an agent takes independently is a step where something can go wrong.

---

## Quick Decision Guide

| Situation | Use |
|-----------|-----|
| Simple task, one step | [Baseline](#0-baseline) |
| 2-4 sequential steps | [Prompt Chaining](#1-prompt-chaining) |
| Need to categorize and route inputs | [Routing](#2-routing) |
| Independent parallel subtasks | [Parallelization](#3-parallelization) |
| Task needs multiple specialist roles | [Orchestrator-Workers](#4-orchestrator-workers) |
| Output quality needs iteration | [Evaluator-Optimizer](#5-evaluator-optimizer) |
| Open-ended, unpredictable steps | [Autonomous Agent](#6-autonomous-agent) |
| Destructive/irreversible operations | [Wizard pattern](#wizard-pattern) |
| Long-running tasks (>10 min) | [Multi-Window](#multi-window-variant) |

---

## Workflows (Code Controls the Flow)

### 0. Baseline

The simplest pattern. One prompt, one response. No chaining, no agents.

```
User input → LLM → Output
```

**When to use:** Any task that can be expressed in a single, well-crafted prompt. Most tasks are baseline tasks.

**Example:**
```python
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Summarize this article: {article}"}]
)
```

**Mistake to avoid:** Reaching for chaining or agents when a better prompt would do the job.

---

### 1. Prompt Chaining

Sequential prompts where each step feeds into the next. Code defines the order and passes outputs forward.

```
Input → Step 1 → Step 2 → Step 3 → Output
```

**When to use:**
- Tasks with clear sequential phases (research → outline → draft → review)
- When intermediate outputs need validation before proceeding
- When later steps need structured output from earlier steps

**Example — document pipeline:**
```python
# Step 1: Extract key facts
facts = llm("Extract the 10 key facts from this document: {doc}")

# Step 2: Identify gaps
gaps = llm(f"Given these facts: {facts}\nWhat important context is missing?")

# Step 3: Generate questions
questions = llm(f"Facts: {facts}\nGaps: {gaps}\nGenerate 5 research questions to fill these gaps.")
```

**Variant — Wizard Pattern:**
For destructive or irreversible operations, add an explicit confirmation step before execution:
```
Plan → Show plan to user → User confirms → Execute
```
Never automate steps that can't be undone without a human checkpoint.

---

### 2. Routing

Classify input and send it to the appropriate handler. One LLM classifies; specialized prompts or agents handle each category.

```
Input → Classifier → Route A
                   → Route B
                   → Route C
```

**When to use:**
- Customer support (billing / technical / general)
- Document processing (invoice / contract / email)
- Multi-domain assistants with very different response styles

**Example — support ticket router:**
```python
CATEGORIES = ["billing", "technical", "account", "general"]

def route(ticket: str) -> str:
    classification = llm(
        f"Classify this support ticket as one of {CATEGORIES}. Return only the category name.\n\nTicket: {ticket}"
    )
    return classification.strip()

def handle(ticket: str):
    category = route(ticket)
    handlers = {
        "billing": billing_prompt,
        "technical": technical_prompt,
        "account": account_prompt,
        "general": general_prompt,
    }
    return llm(handlers[category].format(ticket=ticket))
```

---

### 3. Parallelization

Run multiple LLM calls simultaneously for independent subtasks; merge results.

```
           → Worker A ↘
Input  →   → Worker B → Aggregator → Output
           → Worker C ↗
```

**Two variants:**

**A. Sectioning** — different workers handle different parts of the same input:
```python
import asyncio

async def analyze_parallel(document: str):
    tasks = [
        llm_async("Summarize the main argument: " + document),
        llm_async("List all claims made: " + document),
        llm_async("Identify logical fallacies: " + document),
        llm_async("Assess credibility of sources: " + document),
    ]
    results = await asyncio.gather(*tasks)
    return results
```

**B. Voting** — multiple workers attempt the same task; you aggregate for higher confidence:
```python
async def high_confidence_answer(question: str, n_votes: int = 5):
    responses = await asyncio.gather(*[llm_async(question) for _ in range(n_votes)])
    # Pass all responses to a synthesizer
    return llm(f"These {n_votes} AI responses address the same question. Synthesize the most accurate answer:\n\n" + "\n---\n".join(responses))
```

**When to use:**
- Independent subtasks that don't depend on each other's output
- Long documents you want analyzed from multiple angles simultaneously
- High-stakes decisions where you want multiple "opinions"

---

### 4. Orchestrator-Workers

A central orchestrator LLM decomposes a task and delegates subtasks to specialized worker LLMs (or the same LLM with different system prompts).

```
           ↔ Worker: Researcher
Orchestrator ↔ Worker: Writer
           ↔ Worker: Fact-checker
```

**When to use:**
- Complex tasks that benefit from specialization
- Tasks where the full scope isn't known upfront (orchestrator plans dynamically)
- Multi-step coding, content creation, research workflows

**Example with CrewAI:**
```python
from crewai import Agent, Task, Crew

orchestrator = Agent(
    role="Project Manager",
    goal="Decompose the task and coordinate specialists to deliver a complete result",
    backstory="Expert at breaking down complex problems and delegating effectively"
)

researcher = Agent(
    role="Research Analyst",
    goal="Find accurate, current information on any topic",
    tools=[web_search, arxiv_search]
)

writer = Agent(
    role="Technical Writer",
    goal="Turn research findings into clear, well-structured documents",
)

fact_checker = Agent(
    role="Fact Checker",
    goal="Verify all claims against sources before final output"
)

crew = Crew(
    agents=[orchestrator, researcher, writer, fact_checker],
    tasks=[research_task, writing_task, verification_task],
    process="hierarchical",
    manager_agent=orchestrator
)
```

---

### 5. Evaluator-Optimizer

A generator produces output; an evaluator scores it; if below threshold, the generator revises. Loops until quality criteria are met.

```
Generator → Output → Evaluator → pass? → Final
                              ↓ fail
                         Feedback
                              ↓
                         Generator (again)
```

**When to use:**
- Translation quality assurance
- Code generation with test feedback
- Content that needs to meet specific rubrics
- Any task where "good enough" can be measured

**Example — code generation with test loop:**
```python
def generate_with_tests(spec: str, tests: str, max_iterations: int = 5):
    code = llm(f"Write Python code that satisfies this spec:\n{spec}")

    for i in range(max_iterations):
        test_result = run_tests(code, tests)

        if test_result.passed:
            return code

        feedback = llm(
            f"This code failed the following tests:\n{test_result.failures}\n\n"
            f"Original code:\n{code}\n\n"
            f"Fix the code so all tests pass. Return only the corrected code."
        )
        code = feedback

    raise Exception(f"Failed to produce passing code in {max_iterations} iterations")
```

---

## Autonomous Agent (LLM Controls the Flow)

### 6. Autonomous Agent

The LLM decides what to do next. Given a goal and tools, it reasons, acts, observes results, and continues until the task is complete.

```
Goal → [Think → Act → Observe → Think → Act → Observe ...] → Done
```

The ReAct (Reasoning + Acting) loop:

```python
from anthropic import Anthropic

client = Anthropic()

tools = [
    {"name": "web_search", "description": "Search the web", ...},
    {"name": "read_file", "description": "Read a file", ...},
    {"name": "write_file", "description": "Write a file", ...},
    {"name": "run_code", "description": "Execute Python code", ...},
]

messages = [{"role": "user", "content": goal}]

while True:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        tools=tools,
        messages=messages
    )

    if response.stop_reason == "end_turn":
        break  # Agent decided it's done

    # Execute tool calls
    tool_results = []
    for block in response.content:
        if block.type == "tool_use":
            result = execute_tool(block.name, block.input)
            tool_results.append({"tool_use_id": block.id, "content": result})

    messages.append({"role": "assistant", "content": response.content})
    messages.append({"role": "user", "content": tool_results})
```

**When to use:**
- Open-ended tasks where you can't predict the required steps in advance
- Research tasks that require following unexpected leads
- Debugging where the root cause is unknown
- Tasks requiring dynamic tool selection

**When NOT to use:**
- Any task where the steps are predictable → use a workflow instead
- Anything that modifies production data without review
- Tasks with strict latency requirements (agents are slow)

---

### Multi-Window Variant

For tasks that take longer than a single context window (large codebase analysis, long research tasks), the agent externalizes state:

```
Session 1: [Work → Save state to file] →
Session 2: [Load state → Continue work → Save state] →
Session N: [Load state → Complete → Final output]
```

With Claude Code:
```bash
# Session 1
claude "Research and analyze the codebase. Save your findings and progress to .claude/state/analysis.md before stopping."

# Session 2 (fresh context)
claude "Continue the analysis from .claude/state/analysis.md. Pick up where you left off."
```

---

## Critical Architecture Rule

**Subagents cannot spawn other subagents.** All delegation flows through the main agent.

```
Main Agent → Subagent A → result back to Main
Main Agent → Subagent B → result back to Main
Subagent A ✗ cannot spawn Subagent C
```

Allowing arbitrary agent spawning creates runaway recursion, uncontrolled costs, and unpredictable behavior. The main agent is always the coordination point.

---

## Claude Code Implementation Components

When building agentic systems with Claude Code, four components compose the architecture:

### Subagents (`.claude/agents/*.md`)
Specialized agents with scoped tool access and specific roles.
```markdown
---
name: researcher
description: Web research and source synthesis
tools: web_search, read_url
---
You are a research specialist. When given a topic...
```

### Slash Commands (`.claude/commands/*.md`)
Reusable multi-step procedures triggered by `/command-name`.
```markdown
# /research [topic]
1. Search for recent sources on {topic}
2. Evaluate credibility of each source
3. Synthesize findings into a brief with citations
```

### Skills (`.claude/skills/*/SKILL.md`)
Domain expertise injected into context. See [claude-skills-reference.md](claude-skills-reference.md).

### Hooks (`.claude/settings.json`)
Shell commands triggered by agent lifecycle events.
```json
{
  "hooks": {
    "PreToolUse": [{"matcher": "Bash", "hooks": [{"type": "command", "command": "echo 'Running: $TOOL_INPUT'"}]}],
    "PostToolUse": [{"matcher": "Write", "hooks": [{"type": "command", "command": "git add -p"}]}]
  }
}
```

---

## 9-Category Agentic Workflow Taxonomy

From [Awesome-Agentic-Workflow (irfanfadhullah)](https://github.com/irfanfadhullah/Awesome-Agentic-Workflow):

| Category | Description | When to Use |
|----------|-------------|-------------|
| **Autonomous** | Self-governing, fully independent execution | Known-safe environments, well-scoped tasks |
| **Human-in-the-Loop** | Human oversight at defined checkpoints | Irreversible actions, high-stakes decisions |
| **Hybrid** | Mixed autonomous + human control | Partial automation with escalation paths |
| **Multi-Agent** | Coordinated specialist agent teams | Complex tasks needing diverse expertise |
| **Orchestrated** | Centrally managed workflow execution | Predictable workflows with dynamic content |
| **Planning & Reasoning** | Strategic planning before execution | Tasks requiring long-horizon reasoning |
| **Reflection & Adaptation** | Self-evaluation and course correction | Quality-critical outputs, iterative refinement |
| **Single Agent** | One agent, full task scope | Simple to moderate complexity |
| **Tool Integration** | Agent with external tool access | Tasks requiring real-world data or actions |

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Using agents when workflows would do | Unpredictability, higher cost, slower | Map the steps first; if they're fixed, use a workflow |
| Subagents spawning subagents | Runaway recursion, uncontrolled cost | All spawning goes through the main agent |
| No human checkpoint on destructive ops | Irreversible mistakes | Add Wizard pattern before any write/delete/send |
| Too many tools per agent | Confusion, wrong tool selection | Each agent gets only the tools it needs |
| Infinite retry loops | Stuck agent burns tokens | Set max iterations and fail gracefully |

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: unknown
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Sources

- [Building Effective Agents — Anthropic Engineering](https://www.anthropic.com/engineering/building-effective-agents)
- [Agentic AI Systems repo (ThibautMelen)](https://github.com/ThibautMelen/agentic-ai-systems) — full pattern documentation with Mermaid diagrams
- [Awesome-Agentic-Workflow (irfanfadhullah)](https://github.com/irfanfadhullah/Awesome-Agentic-Workflow) — curated repos by category
- [Claude Code agent documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Anthropic Cookbook — agents](https://github.com/anthropics/anthropic-cookbook/tree/main/multiagent)
- [ReAct: Synergizing Reasoning and Acting in LLMs](https://arxiv.org/abs/2210.03629) — the foundational paper


