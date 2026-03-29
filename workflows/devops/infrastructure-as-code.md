---
name: Infrastructure as Code with Claude + Terraform
category: devops
difficulty: advanced
tools: Claude Code, HashiCorp Terraform, AWS/GCP/Azure
tested: true
---

# Infrastructure as Code with Claude + Terraform

> Describe your infrastructure in plain English, Claude generates the Terraform, runs `plan`, shows you the diff, and applies when you confirm.

## What this is for

Terraform is powerful but verbose. Writing correct HCL from scratch requires knowing provider-specific gotchas, module patterns, and state management. This workflow uses Claude Code with a project CLAUDE.md containing your Terraform conventions, which gives Claude the domain knowledge to produce correct, idiomatic Terraform on the first try.

**What it covers:** generating new infrastructure, modifying existing configs, diagnosing plan errors, explaining state drift.

---

## Stack

| Tool | Role | Docs |
|------|------|------|
| [Claude Code](https://claude.ai/code) | Orchestrates the workflow | [Docs](https://docs.anthropic.com/en/docs/claude-code) |
| [Terraform CLI](https://developer.hashicorp.com/terraform/downloads) | Plan, apply, state management | [Docs](https://developer.hashicorp.com/terraform/cli) |
| AWS / GCP / Azure | Target cloud provider | — |

---

## Setup

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Install Terraform CLI
brew install terraform          # macOS
winget install HashiCorp.Terraform  # Windows
```

---

## The Workflow

### 1. Describe Infrastructure in Natural Language

```bash
claude "
I need AWS infrastructure for a Node.js API service.

Requirements:
- VPC with 3 public subnets and 3 private subnets across 3 AZs
- ECS Fargate cluster in the private subnets
- ALB in the public subnets (HTTPS only, HTTP redirects to HTTPS)
- ACM certificate for api.mycompany.com
- RDS PostgreSQL 15 (Multi-AZ) in the private subnets
- Elasticache Redis cluster (for sessions) in the private subnets
- Security groups: ALB → ECS → RDS/Redis (no direct public access)
- S3 bucket for static assets (private, accessible via CloudFront)
- CloudFront distribution in front of S3

Environment: production
Region: eu-west-1
"
```

Claude generates:
```
Creating Terraform configuration...
  main.tf          — provider config, backend
  vpc.tf           — VPC, subnets, routing, NAT gateways
  ecs.tf           — cluster, task definition, service, IAM roles
  alb.tf           — load balancer, target group, listeners, ACM
  rds.tf           — DB instance, subnet group, parameter group
  redis.tf         — Elasticache cluster, subnet group
  s3.tf            — bucket, bucket policy, CloudFront OAI
  cloudfront.tf    — distribution, cache behaviors
  security.tf      — security groups for each tier
  variables.tf     — parameterized inputs
  outputs.tf       — ALB DNS, RDS endpoint, CloudFront URL

Running terraform init...
✓ Providers initialized

Running terraform plan...
```

### 2. Review the Plan

Claude shows you the plan in a readable summary before anything is applied:

```
Plan summary (eu-west-1):

  Creating:
  + aws_vpc.main                   (10.0.0.0/16)
  + aws_subnet.public (x3)         (10.0.1.0/24, 10.0.2.0/24, 10.0.3.0/24)
  + aws_subnet.private (x3)        (10.0.10.0/24, 10.0.20.0/24, 10.0.30.0/24)
  + aws_nat_gateway (x3)           (~$100/month each)
  + aws_ecs_cluster.main
  + aws_lb.api                     (internet-facing)
  + aws_db_instance.postgres       (db.t3.medium, Multi-AZ, ~$185/month)
  + aws_elasticache_cluster.redis  (cache.t3.micro, ~$16/month)
  + aws_s3_bucket.assets
  + aws_cloudfront_distribution.assets

  Estimated monthly cost: ~$620/month

  Do you want to apply?
```

Review the diff. If something is wrong, tell Claude in plain language:

```
"The 3 NAT gateways are expensive for a first deploy. Use a single NAT gateway
for now and I'll add the others before we hit production load."
```

### 3. Apply

```
claude "Looks good. Apply the plan."
→ Running terraform apply... (confirm)
→ Apply complete! 24 resources created.
→ Outputs:
   alb_dns = "api-prod-xxx.eu-west-1.elb.amazonaws.com"
   rds_endpoint = "postgres-prod.xxx.eu-west-1.rds.amazonaws.com"
   cloudfront_url = "https://dxxx.cloudfront.net"
```

---

## Common Patterns

### Modify Existing Infrastructure

```bash
claude "
Add an autoscaling policy to the ECS service in ecs.tf:
- Min capacity: 2 tasks
- Max capacity: 20 tasks
- Scale out when CPU > 70% for 2 minutes
- Scale in when CPU < 30% for 5 minutes
"
```

### Diagnose Plan Errors

```bash
# If terraform plan fails, paste the error to Claude:
claude "
terraform plan is failing with this error:

Error: creating ECS Service (api-service): InvalidParameterException:
The provided target group arn:aws:elasticloadbalancing:... has target type ip,
but it should be instance for cluster type EC2.

How do I fix this?"
```

Claude knows: you're using Fargate, which requires target type `ip`, not `instance`. It patches the ALB target group resource automatically.

### Import Existing Resources

If you have manually-created resources you want to bring under Terraform management:

```bash
claude "
I have an existing RDS instance 'prod-db-legacy' that was created manually.
Generate the Terraform resource block to match it, then give me the import command.
Instance: db.t3.medium, PostgreSQL 14.8, Multi-AZ, eu-west-1"
```

Claude generates the `resource` block + the `terraform import` command to associate it with state.

### Explain State Drift

```bash
claude "
terraform plan shows these resources need to be modified, but I haven't changed anything:

~ aws_security_group.ecs
    ingress.0.cidr_blocks: [\"10.0.0.0/8\"] -> [\"10.0.0.0/16\"]

Why is this happening and should I apply it?"
```

---

## Structuring Modules

For larger projects, ask Claude to generate a module structure:

```bash
claude "
Refactor the current flat Terraform into modules.
I need:
- modules/networking (VPC, subnets, NAT, routing)
- modules/compute (ECS cluster, service, task definition)
- modules/data (RDS, Redis)
- modules/cdn (CloudFront, S3)

Each module should accept variables for environment (dev/staging/prod)
and expose necessary outputs for cross-module references.

Show me the module structure and one complete example module."
```

---

## CI/CD: Terraform in GitHub Actions

Auto-plan on every PR, auto-apply on merge to main:

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  pull_request:
    paths: ['infra/**']
  push:
    branches: [main]
    paths: ['infra/**']

jobs:
  plan:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.7.x"

      - name: Terraform Plan
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          cd infra
          terraform init
          terraform plan -no-color -out=tfplan
          terraform show -no-color tfplan > tfplan.txt

      - name: Comment plan on PR
        uses: actions/github-script@v7
        with:
          script: |
            const plan = require('fs').readFileSync('infra/tfplan.txt', 'utf8')
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '```\n' + plan + '\n```'
            })

  apply:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - name: Terraform Apply
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          cd infra
          terraform init
          terraform apply -auto-approve
```

---

## Why the Terraform Skill Matters

Without domain context, Claude generates plausible-looking but often broken HCL:
- Wrong attribute names for specific provider versions
- Missing required nested blocks
- Incorrect resource dependencies (no `depends_on` where needed)
- IAM policy documents with syntax errors
- Security group rules in wrong format

Adding a CLAUDE.md with your Terraform conventions and provider versions helps Claude produce correct HCL on the first try instead of 3-4 fix cycles.

---

## Validation

- Last reviewed: 2026-03-28
- Tested flag in repo: true
- This revision checked the structure, links, and step order against the sources below. Re-run the workflow in your own stack before relying on exact UI labels, pricing, or model behavior.

## Failure modes

- **State file security.** Never commit `terraform.tfstate` to git. Use S3 (with encryption + versioning) or Terraform Cloud for remote state.
- **Provider version drift.** Pin provider versions in `required_providers`. Claude defaults to current versions which may not match your existing configs.
- **Cost estimates.** Claude's cost estimates are approximate. Use [Infracost](https://infracost.io) for accurate pricing before applying.
- **Complex existing setups.** For large, existing Terraform codebases, give Claude the relevant files to read before asking for modifications.
- **Skill context limits.** Very large infrastructure requests (50+ resources) may exceed context. Break into smaller modules.

---

## Sources

- [Terraform documentation](https://developer.hashicorp.com/terraform/docs)
- [Terraform in Depth](https://www.manning.com/books/terraform-in-depth) — Terraform and OpenTofu practices
- [Infracost](https://infracost.io) — cost estimation for Terraform plans
- [Checkov](https://github.com/bridgecrewio/checkov) — static analysis for Terraform security
- [terragrunt](https://github.com/gruntwork-io/terragrunt) — Terraform wrapper for DRY configs
