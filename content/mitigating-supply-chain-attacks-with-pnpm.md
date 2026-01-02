---
title: "Mitigating Supply Chain Attacks with pnpm"
type: article
url: "https://pnpm.io/supply-chain-security"
tags:
  - security
  - developer-experience
  - best-practices
authors:
  - pnpm
summary: "pnpm v10 introduces built-in protections against npm supply chain attacks through script blocking, dependency restrictions, and release delays."
date: 2026-01-02
---

npm packages get compromised with malware regularly. Security firms like Socket, Snyk, and Aikido catch issues quickly, but a vulnerability window remains. pnpm v10 addresses this with five built-in protections.

## Key Security Features

### Block Risky Postinstall Scripts

pnpm v10 disables automatic postinstall script execution by default. Use the `allowBuilds` setting to explicitly permit only trusted dependencies rather than enabling all builds globally. This stops newly compromised versions from running malicious code.

### Prevent Exotic Transitive Dependencies

The `blockExoticSubdeps` setting restricts transitive dependencies from using non-standard sources like git repositories or direct tarball URLs. All packages must come from trusted registries.

### Delay Dependency Updates

The `minimumReleaseAge` setting requires a waiting period before pnpm installs newly published versions. Setting this to 1,440 minutes (one day) or 10,080 minutes (one week) gives security teams time to detect and remove malware.

### Enforce Trust with trustPolicy

Set `trustPolicy` to `no-downgrade` to prevent installing packages with diminished trust levels compared to prior releases. Use `trustPolicyExclude` and `trustPolicyIgnoreAfter` for specific package exceptions.

### Use a Lockfile

Commit lockfiles to version control. This prevents unexpected dependency changes and ensures consistent installations across all environments.
