---
title: "Optimizing GitHub Actions Workflows for Speed"
type: article
url: "https://marcusfelling.com/blog/2025/optimizing-github-actions-workflows-for-speed"
tags:
  - ci-cd
  - automation
  - best-practices
  - performance
authors:
  - marcus-felling
summary: "Practical techniques to speed up GitHub Actions workflows through caching, parallelization, matrix builds, and conditional execution."
date: 2026-01-04
---

## Summary

Slow CI/CD pipelines harm developer productivity by forcing context switches and increasing costs through GitHub Actions billing. This article presents actionable optimization techniques with concrete examples.

## Key Techniques

### Caching Dependencies

Store npm packages using lockfile-based cache keys with fallback strategies. Cache both `~/.npm` and `node_modules`, then use `npm ci --prefer-offline` to prioritize locally cached packages.

### Docker Layer Optimization

Use BuildKit caching to prevent rebuilding layers. Cache Docker build contexts locally and rotate cache directories to prevent storage bloat.

### Job Parallelization

Split work into separate jobs (lint, test, build) that run concurrently. Use the `needs` keyword to establish dependency chains only where necessary.

### Matrix Testing

Test across multiple Node versions simultaneously rather than sequentially. Matrix builds execute all permutations in parallel.

### Path-Based Filtering

Use `dorny/paths-filter` to skip jobs when relevant directories haven't changed. Prevents running full test suites for documentation-only changes.

### Self-Hosted Runners

Consider self-hosted infrastructure for specialized hardware needs like GPU access or high compute requirements.

### Performance Monitoring

Track workflow duration over time using the GitHub API. Data-driven decisions reveal which optimizations have the biggest impact.

## Related

For GitHub Actions fundamentals and security best practices, see [[github-actions-complete-guide]].
