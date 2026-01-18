---
title: "prek"
type: github
url: "https://github.com/j178/prek"
stars: 3621
language: "Rust"
tags:
  - git
  - git-hooks
  - pre-commit
  - developer-tools
authors:
  - j178
summary: "Pre-commit hooks don't need Python or slow installations—prek delivers the same functionality as a single Rust binary that runs multiple times faster."
date: 2026-01-17
---

## Overview

Pre-commit is the standard for running git hooks across many languages, but it drags along Python as a dependency and takes time to install hooks. Prek reimagines this as a single Rust binary with zero runtime dependencies. The result: multiple times faster execution and half the disk space.

## Key Features

- **Single binary** - No Python, no virtual environments, just one executable
- **Parallel execution** - Clones repos and runs hooks concurrently
- **Full compatibility** - Works with existing `.pre-commit-config.yaml` files
- **Built-in hooks** - Rust-native implementations of common hooks for extra speed
- **Monorepo support** - First-class workspace mode for large repositories
- **Supply chain security** - `--cooldown-days` flag for safer auto-updates

## Code Snippets

### Installation

```bash
# macOS/Linux via Homebrew
brew install j178/tap/prek

# Or via cargo
cargo install prek
```

### Basic Usage

```bash
# Install hooks from .pre-commit-config.yaml
prek install

# Run all hooks
prek run

# Run on specific files
prek run --files path/to/file.py

# Run on last commit changes
prek run --last-commit
```

### Configuration

Prek uses the same `.pre-commit-config.yaml` format:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
```

## Technical Details

Built in Rust, prek leverages `uv` for Python environment setup when hooks require it. Priority-based scheduling ensures hooks run in optimal order. Production-tested in Apache Airflow, FastAPI, and CPython.

## Connections

- [[essential-ai-coding-feedback-loops-for-typescript-projects]] - Discusses Husky for pre-commit hooks as part of AI coding feedback loops; prek offers a faster alternative for the same purpose
