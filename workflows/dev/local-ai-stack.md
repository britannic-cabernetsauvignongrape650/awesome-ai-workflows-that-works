---
name: Local AI Stack
category: dev
difficulty: beginner
tools: Ollama, Open WebUI, LM Studio, local models
tested: true
---

# Local AI Stack

> Run local models on your own machine for private experimentation, offline assistance, and cost-sensitive workflows.

## What this is for

This workflow is for people who want one of these outcomes:

- prompts and files stay on-device
- local experimentation without API spend
- a workable offline assistant for notes, drafting, and coding support

Do not treat it as a drop-in replacement for top hosted frontier models. The point is privacy, control, and acceptable local quality, not pretending every local model matches the strongest hosted systems.

## Stack

| Tool | Role | Install |
|------|------|---------|
| [Ollama](https://ollama.ai) | local model runtime | installer or shell script |
| [Open WebUI](https://github.com/open-webui/open-webui) | browser chat UI for local models | Docker or Python |
| [LM Studio](https://lmstudio.ai) | GUI-first local model app | desktop installer |

## Workflow

### 1. Pick the local runtime

Use one of these:

- `Ollama + Open WebUI` if you want the standard self-hosted path
- `LM Studio` if you want the fastest no-terminal setup

### 2. Install a small model first

Start with a model that definitely fits your machine, then scale up.

```bash
ollama pull llama3.2
ollama pull qwen2.5:14b
ollama list
```

The wrong first move is downloading the largest model you can find and then debugging memory issues for an hour.

### 3. Add a usable interface

If you want a browser UI:

```bash
docker run -d \
  --name open-webui \
  -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

Open `http://localhost:3000` and connect it to your local runtime.

If you prefer a desktop UI, use LM Studio and download one model inside the app before worrying about APIs or automation.

### 4. Choose the model by hardware, not by hype

| Hardware | Good starting point |
|------|------|
| 8GB RAM | 3B class models |
| 16GB RAM | 7B to 8B class models |
| 32GB RAM | 14B class models |
| 64GB+ RAM or strong unified memory | 30B+ class models |

For most people, `7B to 14B` is the practical local range.

### 5. Use local endpoints only with compatible tools

Ollama and LM Studio expose local endpoints that many OpenAI-compatible tools can use.

Use this pattern:

```text
Local model runtime -> local endpoint -> tool that explicitly supports custom base URLs
```

Good fits:

- Open WebUI
- LM Studio clients
- editor tools or scripts that document support for custom OpenAI-compatible endpoints

Bad fit:

- assuming any hosted-model client can be pointed at Ollama just because both speak JSON

### 6. Verify that it is actually local

Before you trust the setup, confirm what is leaving the machine.

```bash
# macOS / Linux example
sudo tcpdump -i any -n port 11434
```

You want to understand which traffic is local runtime traffic and which traffic comes from optional connected tools.

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- Reviewed against current Ollama, Open WebUI, and LM Studio docs and checked the setup flow for local-only usage.

## Failure modes

- Local quality varies a lot by model size and quantization.
- A tool saying "OpenAI-compatible" does not guarantee clean local support.
- Large context windows often degrade before the advertised limit.
- Local models are useful, but they still lag strong hosted models on difficult coding and reasoning tasks.

## Sources

- [Ollama documentation](https://ollama.ai/docs)
- [Ollama model library](https://ollama.ai/library)
- [Open WebUI documentation](https://docs.openwebui.com)
- [LM Studio documentation](https://lmstudio.ai/docs)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [Open WebUI GitHub](https://github.com/open-webui/open-webui)
