---
title: "How to Harden GitHub Actions: The Unofficial Guide"
type: article
url: "https://www.wiz.io/blog/github-actions-security-guide"
tags:
  - security
  - ci-cd
  - automation
  - best-practices
authors:
  - rami-mccarthy
  - shay-berkovich
summary: "A comprehensive security guide covering organization-level configuration, workflow hardening, and self-hosted runner protection for GitHub Actions."
date: 2026-01-04
---

## Summary

GitHub Actions' event-driven automation introduces security risks when misconfigured. Attackers exploit weak permissions, poisoned pipelines, and exposed secrets to compromise CI/CD workflows. This guide covers defensive configurations at organization, workflow, and runner levels.

## Organization-Level Hardening

Set workflow token permissions to read-only by default. Restrict actions to verified creators and GitHub-maintained sources, with optional allowlists for trusted actions. Isolate self-hosted runners by trust level and disable GitHub Actions' ability to create or approve pull requests.

## Workflow Security Patterns

Pin third-party actions to specific commit SHAs rather than version tags. Even hash-pinned actions inherit risk from their dependencies—audit transitive action references.

Never expose all secrets at once:

```yaml
# Dangerous - exposes all secrets
env:
  SECRETS: ${{ toJson(secrets) }}
```

Access secrets individually by name instead.

Prefer OpenID Connect (OIDC) over long-lived secrets for authenticating to downstream services like AWS or GCP.

## Common Attack Vectors

**Poisoned Pipeline Execution (PPE)**: Attacker-controlled input reaches trusted execution paths. Audit workflow triggers and interpolated variables.

**Pwn Request**: Misusing `pull_request_target` triggers grants forked PRs access to repository secrets. Use `pull_request` instead unless you explicitly need the base context.

**Command Injection**: Interpolating untrusted values in shell scripts enables arbitrary code execution. Validate and sanitize all workflow inputs.

**GITHUB_ENV/GITHUB_PATH Manipulation**: Attackers inject malicious binaries by modifying environment files. Restrict write access to these files.

## Self-Hosted Runner Security

Self-hosted runners should never run on public repositories. Use ephemeral infrastructure that destroys runner state after each job. Implement network egress controls and instrument runners for anomaly detection.

## Tools

- **zizmor**: Static analysis for GitHub Actions misconfigurations
- **gato/Gato-X**: Enumeration and attack tooling for security testing
- **allstar**: OpenSSF GitHub App for policy enforcement

## Related

See also [[github-actions-complete-guide]] for general GitHub Actions architecture and patterns.
