---
name: Multi-LLM Cost Router
category: dev
difficulty: intermediate
tools: LiteLLM, OpenAI-compatible clients, Anthropic, OpenAI, Gemini
tested: true
---

# Multi-LLM Cost Router

> Route each request to the cheapest model tier that can handle it. Cut spend sharply without rewriting your application around one provider.

## What this is for

Most teams overpay because they send every request to the same model tier.

That means:

- cheap extraction tasks hit expensive reasoning models
- simple support classification burns premium tokens
- product teams optimize prompts before fixing routing

The better pattern is simple:

- cheap tier for routine tasks
- balanced tier for most real work
- premium tier for the hard edge cases

## Freshness Note

Model IDs, prices, and provider positioning change quickly.

Treat this guide as a routing pattern, not a fixed ranking of named models.

Before rollout:

1. verify current model pricing upstream
2. verify the exact model IDs supported by your provider or LiteLLM version
3. benchmark on your own prompt mix, not generic internet examples

## The Core Idea

Use model tiers instead of hard-coding your app around one specific model.

| Tier | Use it for | Typical examples |
|------|------------|------------------|
| Tier 1: fast and cheap | short, low-risk tasks | classification, extraction, translation, formatting |
| Tier 2: balanced | general product work | writing, coding help, moderate analysis, agent coordination |
| Tier 3: premium | expensive but high-value tasks | architecture, deep debugging, high-stakes review |

The router decides the tier. Your app does not need to care which exact model currently sits behind that tier.

## Expected Outcome

On many teams, routing by tier produces one of these outcomes:

- the majority of traffic lands on cheap models
- the highest-cost models are used only on the minority of hard tasks
- total spend drops without a matching drop in quality

The exact savings depend on prompt length, response length, and task mix. Do not trust generic percentages more than your own logs.

## Stack

| Tool | Role |
|------|------|
| [LiteLLM](https://github.com/BerriAI/litellm) | unified routing and provider abstraction |
| fast-tier model | cheap classification and low-risk requests |
| balanced-tier model | default model for most application logic |
| premium-tier model | difficult reasoning, review, and edge cases |

## Routing Strategy

Three approaches, in order of sophistication:

### Approach 1: Rule-Based Routing

Start here unless you have a strong reason not to.

```python
from litellm import completion

def classify_task_complexity(prompt: str, context: dict = {}) -> str:
    """Returns: 'simple' | 'medium' | 'complex'"""

    simple_keywords = ["summarize", "translate", "classify", "extract", "list", "format"]
    complex_keywords = ["architect", "design", "analyze trade-offs", "compare approaches",
                        "debug", "refactor", "review", "implement"]

    prompt_lower = prompt.lower()
    token_count = len(prompt.split())

    if (
        token_count < 200
        and any(k in prompt_lower for k in simple_keywords)
        and "code" not in context
    ):
        return "simple"

    if (
        token_count > 500
        or any(k in prompt_lower for k in complex_keywords)
        or context.get("task_type") in ["code_review", "architecture", "debugging"]
    ):
        return "complex"

    return "medium"


MODEL_MAP = {
    "simple": "tier-1-fast",
    "medium": "tier-2-balanced",
    "complex": "tier-3-premium",
}

PROVIDER_MAP = {
    "tier-1-fast": "<current-fast-model-id>",
    "tier-2-balanced": "<current-balanced-model-id>",
    "tier-3-premium": "<current-premium-model-id>",
}


def route(prompt: str, context: dict = {}, **kwargs):
    tier = classify_task_complexity(prompt, context)
    model = PROVIDER_MAP[MODEL_MAP[tier]]

    print(f"[router] tier={tier} -> model={model}")

    return completion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        **kwargs
    )
```

Best for:

- teams that want predictable behavior
- apps with known request shapes
- fast rollout with low operational risk

### Approach 2: LLM-as-Router

Use a cheap model to classify before forwarding to the right tier.

```python
import json
from litellm import completion

ROUTING_PROMPT = """Classify the user's request into one tier.

Return JSON only:
{
  "tier": "simple" | "medium" | "complex",
  "reason": "one sentence",
  "estimated_tokens_needed": number
}

simple: extraction, formatting, translation, short summaries
medium: writing, moderate coding, structured analysis
complex: architecture, deep debugging, high-stakes review

User request: {prompt}"""


def classify_with_llm(prompt: str) -> dict:
    response = completion(
        model="<current-fast-model-id>",
        messages=[{
            "role": "user",
            "content": ROUTING_PROMPT.format(prompt=prompt[:500])
        }],
        max_tokens=100
    )
    return json.loads(response.choices[0].message.content)
```

Best for:

- messy inputs
- apps where hand-written routing rules are too coarse
- teams willing to trade a small classification cost for smarter dispatch

### Approach 3: LiteLLM Router with Fallbacks

Use this when routing is now part of real production behavior.

```python
from litellm import Router

router = Router(
    model_list=[
        {
            "model_name": "tier-1-fast",
            "litellm_params": {
                "model": "<current-fast-model-id>",
                "api_key": "os.environ/FAST_TIER_API_KEY",
            },
            "tpm": 100000,
        },
        {
            "model_name": "tier-1-fast",
            "litellm_params": {
                "model": "<current-fast-fallback-model-id>",
                "api_key": "os.environ/FALLBACK_API_KEY",
            },
        },
        {
            "model_name": "tier-2-balanced",
            "litellm_params": {
                "model": "<current-balanced-model-id>",
                "api_key": "os.environ/BALANCED_TIER_API_KEY",
            },
        },
        {
            "model_name": "tier-3-premium",
            "litellm_params": {
                "model": "<current-premium-model-id>",
                "api_key": "os.environ/PREMIUM_TIER_API_KEY",
            },
        },
    ],
    fallbacks=[
        {"tier-1-fast": ["tier-2-balanced"]},
        {"tier-2-balanced": ["tier-3-premium"]},
    ],
    allowed_fails=2,
    cooldown_time=60,
)
```

Best for:

- multi-provider routing
- load balancing and fallbacks
- budget ceilings and observability

## Proxy Setup

Run LiteLLM as a local or service proxy so your app uses a stable interface while the router handles provider selection.

```yaml
model_list:
  - model_name: app-default-fast
    litellm_params:
      model: <current-fast-model-id>
      api_key: os.environ/FAST_TIER_API_KEY

  - model_name: app-default-balanced
    litellm_params:
      model: <current-balanced-model-id>
      api_key: os.environ/BALANCED_TIER_API_KEY

router_settings:
  routing_strategy: "cost-based-routing"

litellm_settings:
  max_budget: 10.0
  budget_duration: "1d"
```

Your app can keep using one stable client surface while the backend mapping changes over time.

## Cost Tracking

```python
from litellm import completion_cost

response = completion(model="<current-balanced-model-id>", messages=[...])
cost = completion_cost(completion_response=response)
print(f"This call: ${cost:.6f}")
```

Also log:

- task type
- selected tier
- latency
- user-visible success or failure

Without those signals, routing turns into blind cost cutting.

## Sample Output

```text
[router] simple (email classification) -> tier-1-fast
[router] simple (extract JSON) -> tier-1-fast
[router] medium (write product description) -> tier-2-balanced
[router] complex (review auth middleware) -> tier-3-premium
[router] simple (translate 3 sentences) -> tier-1-fast

=== Cost Summary ===
Tier 1 handled most requests
Tier 2 handled moderate requests
Tier 3 handled the hard edge cases

Result: lower total spend with premium models reserved for the small set of tasks that actually need them
```

## Rollout Advice

Start small:

1. route one low-risk workflow
2. log quality by tier
3. add fallback rules
4. expand only after the data says it works

Good first candidates:

- support ticket classification
- metadata extraction
- simple summarization
- internal writing assistants

Bad first candidates:

- high-stakes legal review
- security-critical code review
- user-facing outputs with no human fallback

## Why It Works

Most applications do not need premium reasoning on every request. Routing creates leverage because it fixes the economics at the orchestration layer instead of forcing every team to manually choose a model every time.

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- cheap models sometimes misclassify hard work
- a low-cost router can still create quality regressions if your thresholds are weak
- cross-provider parity is never perfect, especially for tools and structured outputs
- stale pricing assumptions can make your routing logic wrong even if the code still works
- optimization without quality monitoring usually backfires

## Sources

- [LiteLLM documentation](https://docs.litellm.ai)
- [LiteLLM Router](https://docs.litellm.ai/docs/routing)
- [LiteLLM proxy setup](https://docs.litellm.ai/docs/proxy/quick_start)
- [Anthropic pricing](https://www.anthropic.com/pricing)
- [OpenAI pricing](https://openai.com/api/pricing/)
- [Google AI pricing](https://ai.google.dev/pricing)