---
name: AI Agent Frameworks — Reference
category: dev
difficulty: intermediate
tools: CrewAI, LangChain, LangGraph, AutoGen, OpenAI Agents SDK, and more
tested: false
---

# AI Agent Frameworks — Reference

> Every major framework for building single agents, multi-agent systems, and LLM pipelines — with setup, use cases, and honest comparisons.

---

## Choosing a Framework

| Situation | Recommended Framework |
|-----------|----------------------|
| Multi-agent teams with roles | CrewAI |
| Complex stateful agent flows | LangGraph |
| Quick prototyping, any LLM | LangChain |
| Microsoft stack, conversational agents | AutoGen |
| Simple agentic Python scripts | OpenAI Agents SDK |
| Type-safe TypeScript agents | Mastra |
| Minimal overhead, code execution | SmolAgents (HuggingFace) |
| Production RAG pipelines | LlamaIndex |
| Visual LLM app building | Langflow or Flowise |
| Enterprise governance + .NET/Java support | Semantic Kernel |

---

## Multi-Agent Orchestration

### CrewAI
**GitHub:** [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) — 32K+ ⭐
**Language:** Python · **License:** MIT

Define "crews" where each agent has a role, a goal, backstory, and tools. The framework handles task delegation, inter-agent communication, and error recovery. Used by Fortune 500 companies.

```bash
pip install crewai crewai-tools
```

```python
from crewai import Agent, Task, Crew
from crewai_tools import SerperDevTool

researcher = Agent(
    role="Research Analyst",
    goal="Find the latest AI developments",
    backstory="Expert at synthesizing technical information",
    tools=[SerperDevTool()],
    verbose=True
)

writer = Agent(
    role="Technical Writer",
    goal="Write clear, engaging summaries",
    backstory="Translates complex topics for general audiences",
    verbose=True
)

research_task = Task(
    description="Research the latest developments in AI agent frameworks",
    expected_output="A bullet-point brief with sources",
    agent=researcher
)

write_task = Task(
    description="Write a 500-word summary based on the research",
    expected_output="A clear, well-structured article",
    agent=writer
)

crew = Crew(agents=[researcher, writer], tasks=[research_task, write_task])
result = crew.kickoff()
```

- [docs.crewai.com](https://docs.crewai.com)
- [CrewAI tools library](https://docs.crewai.com/concepts/tools)

---

### LangGraph
**GitHub:** [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) — 10K+ ⭐
**Language:** Python + TypeScript · **License:** MIT

Graph-based framework for stateful, cyclical agent workflows. Each node is an agent or tool; edges define transitions. Supports conditional branching, loops, and human-in-the-loop interrupts. The right choice when you need complex orchestration that CrewAI can't express.

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Sequence
import operator

class AgentState(TypedDict):
    messages: Annotated[Sequence[str], operator.add]

def researcher_node(state: AgentState):
    # research step
    return {"messages": [f"Research result: ..."]}

def writer_node(state: AgentState):
    # writing step
    return {"messages": [f"Draft: ..."]}

def should_revise(state: AgentState):
    # conditional edge
    return "writer" if len(state["messages"]) < 3 else END

graph = StateGraph(AgentState)
graph.add_node("researcher", researcher_node)
graph.add_node("writer", writer_node)
graph.add_conditional_edges("writer", should_revise)
graph.set_entry_point("researcher")

app = graph.compile()
result = app.invoke({"messages": []})
```

- [langchain-ai.github.io/langgraph](https://langchain-ai.github.io/langgraph)

---

### AutoGen (Microsoft)
**GitHub:** [microsoft/autogen](https://github.com/microsoft/autogen) — 35K+ ⭐
**Language:** Python · **License:** MIT

Conversational multi-agent framework from Microsoft Research. Agents communicate through messages in a chat-like interface. Supports code execution in Docker sandboxes, human-in-the-loop, and teacher-student agent patterns.

```python
from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent(
    name="assistant",
    llm_config={"model": "claude-sonnet-4-6"}
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE",  # stop when task is done
    code_execution_config={"work_dir": "coding", "use_docker": True}
)

user_proxy.initiate_chat(
    assistant,
    message="Write a Python script to analyze sales.csv and produce a monthly trend chart"
)
```

- [microsoft.github.io/autogen](https://microsoft.github.io/autogen)

---

### OpenAI Agents SDK
**GitHub:** [openai/openai-agents-python](https://github.com/openai/openai-agents-python) — 11K+ ⭐
**Language:** Python · **Release:** March 2025

Lightweight, opinionated SDK for building agentic pipelines. Three core primitives: Agents, Handoffs (between agents), and Guardrails (input/output validation). Works with any model via OpenAI-compatible API.

```bash
pip install openai-agents
```

```python
from agents import Agent, Runner, handoff

triage_agent = Agent(
    name="Triage",
    instructions="Route customer messages to the right team",
    handoffs=[
        handoff("billing_agent", "billing and payment issues"),
        handoff("support_agent", "technical support issues"),
    ]
)

result = Runner.run_sync(triage_agent, "I can't log in to my account")
```

- [openai.github.io/openai-agents-python](https://openai.github.io/openai-agents-python)

---

### Google ADK (Agent Development Kit)
**GitHub:** [google/adk-python](https://github.com/google/adk-python)
**Release:** April 2025 · **Language:** Python

Google's official framework for building agents with Gemini. Supports multi-agent orchestration, tool use, streaming, and deployment to Vertex AI.

- [google.github.io/adk-python](https://google.github.io/adk-python)

---

## LLM Foundations

### LangChain
**GitHub:** [langchain-ai/langchain](https://github.com/langchain-ai/langchain) — 90K+ ⭐
**Language:** Python + TypeScript · **License:** MIT

The foundational LLM framework. Provides chains, tools, memory, document loaders, and integrations for 80+ LLM providers. Useful as a component library even when building with LangGraph or other frameworks.

```bash
pip install langchain langchain-anthropic langchain-community
```

```python
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate

llm = ChatAnthropic(model="claude-sonnet-4-6")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant"),
    ("human", "{input}")
])
chain = prompt | llm
response = chain.invoke({"input": "Explain RAG in 2 sentences"})
```

- [python.langchain.com](https://python.langchain.com)
- [LangSmith](https://smith.langchain.com) — observability and tracing for LangChain apps

---

### LlamaIndex
**GitHub:** [run-llama/llama_index](https://github.com/run-llama/llama_index) — 36K+ ⭐
**Language:** Python + TypeScript

The leading data framework for RAG. Document loaders for 160+ sources, indexing strategies, query engines, and retrieval optimization. See [rag-pipeline.md](rag-pipeline.md) for a complete implementation guide.

- [docs.llamaindex.ai](https://docs.llamaindex.ai)

---

### Semantic Kernel (Microsoft)
**GitHub:** [microsoft/semantic-kernel](https://github.com/microsoft/semantic-kernel) — 22K+ ⭐
**Language:** Python, C#, Java · **License:** MIT

Enterprise-grade framework for agentic workflows. Deep integration with Azure AI, Microsoft 365, and enterprise systems. Favored in .NET/enterprise environments over LangChain.

- [learn.microsoft.com/en-us/semantic-kernel](https://learn.microsoft.com/en-us/semantic-kernel/overview/)

---

## Lightweight / Specialist Frameworks

### SmolAgents (HuggingFace)
**GitHub:** [huggingface/smolagents](https://github.com/huggingface/smolagents) — 10K+ ⭐
**Language:** Python

Minimal agent library that executes Python code rather than calling predefined tools. The "code agent" approach: write code, execute it, observe output, repeat. Favored for data analysis and scripting tasks.

```python
from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel

agent = CodeAgent(
    tools=[DuckDuckGoSearchTool()],
    model=HfApiModel()
)
agent.run("How many seconds would it take to drive from Paris to Berlin at 110 km/h?")
```

- [huggingface.co/docs/smolagents](https://huggingface.co/docs/smolagents)

---

### PydanticAI
**GitHub:** [pydantic/pydantic-ai](https://github.com/pydantic/pydantic-ai) — 7K+ ⭐
**Language:** Python

Type-safe agent framework built on Pydantic. Forces structured outputs with runtime validation. Good for production applications where you need guaranteed output schemas.

- [ai.pydantic.dev](https://ai.pydantic.dev)

---

### Mastra
**GitHub:** [mastra-ai/mastra](https://github.com/mastra-ai/mastra)
**Language:** TypeScript · **Best for:** JavaScript/Node.js teams

TypeScript-native agent framework with built-in integrations, memory, and workflow support. The LangChain equivalent for JS teams.

- [mastra.ai](https://mastra.ai)

---

### Swarms
**GitHub:** [kyegomez/swarms](https://github.com/kyegomez/swarms) — 4K+ ⭐
**Language:** Python

Framework for orchestrating large numbers of agents simultaneously. Useful for tasks that benefit from massive parallelism (market research across hundreds of sources, large-scale content generation).

- [swarms.world](https://swarms.world)

---

### MetaGPT
**GitHub:** [geekan/MetaGPT](https://github.com/geekan/MetaGPT) — 44K+ ⭐
**Language:** Python

Simulates a software company with assigned agent roles: Product Manager, Architect, Engineer, QA. You describe a feature; MetaGPT produces PRD, system design, code, and tests.

```python
from metagpt.software_company import SoftwareCompany
company = SoftwareCompany()
company.hire([ProductManager(), Architect(), Engineer(), QA()])
company.invest(3.0)
company.run_project("Build a URL shortener with click analytics")
```

- [metagpt.cn](https://www.metagpt.cn)

---

## Visual LLM App Builders

### Langflow
**GitHub:** [langflow-ai/langflow](https://github.com/langflow-ai/langflow) — 42K+ ⭐
**Type:** Self-hosted · **Approach:** Visual node graph for LangChain flows

Drag-and-drop interface for building LangChain pipelines. Export to Python code or serve as API endpoint.

```bash
pip install langflow && langflow run
```

- [langflow.org](https://www.langflow.org)

---

### Flowise
**GitHub:** [FlowiseAI/Flowise](https://github.com/FlowiseAI/Flowise) — 30K+ ⭐
**Type:** Self-hosted · **Approach:** Visual drag-and-drop

Similar to Langflow but focused on simplicity and quick deployment. Good for prototyping agents before coding them properly.

```bash
npm install -g flowise && npx flowise start
```

- [flowiseai.com](https://flowiseai.com)

---

## Memory & Persistence

### Mem0
**GitHub:** [mem0ai/mem0](https://github.com/mem0ai/mem0) — 25K+ ⭐
**Best for:** Persistent memory layer for AI agents across sessions

Gives agents long-term memory that persists across conversations. Stores user preferences, context, and learned facts.

```python
from mem0 import Memory
m = Memory()
m.add("I'm allergic to shellfish", user_id="john")
# Later...
memories = m.search("food preferences", user_id="john")
```

- [mem0.ai](https://mem0.ai)

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: unknown
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Sources

- [awesome-workflow-automation (dariubs)](https://github.com/dariubs/awesome-workflow-automation) — Agent frameworks section
- [LangChain documentation](https://python.langchain.com/docs)
- [CrewAI documentation](https://docs.crewai.com)
- [LangGraph documentation](https://langchain-ai.github.io/langgraph)
- [Awesome AI Apps (rohitg00)](https://github.com/rohitg00/awesome-ai-apps)
