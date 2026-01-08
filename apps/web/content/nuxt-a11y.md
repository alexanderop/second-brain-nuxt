---
title: "Nuxt a11y"
type: github
url: "https://github.com/nuxt/a11y"
stars: 25
language: "TypeScript"
tags:
  - accessibility
  - nuxt
  - devtools
  - testing
authors:
  - nuxt
summary: "Real-time accessibility auditing inside Nuxt DevTools catches WCAG violations during development rather than after deployment."
date: 2026-01-06
---

## Overview

Nuxt a11y integrates accessibility testing directly into Nuxt DevTools. Instead of running separate audits or waiting for QA feedback, developers see WCAG violations as they build. The module uses axe-core—the same engine Google and Microsoft rely on—to perform comprehensive accessibility checks.

## Key Features

- **DevTools integration**: Rich UI tab within Nuxt DevTools displays violations with element highlighting
- **Severity grouping**: Violations organized by impact (critical, serious, moderate, minor)
- **Route tracking**: Monitors accessibility state across different application routes
- **Auto-scan mode**: Real-time scanning triggered by user interactions
- **Configurable rules**: Adjustable axe-core parameters for project-specific needs

## Code Snippets

### Installation

```bash
npx nuxi module add @nuxt/a11y
```

### Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/a11y'],
  a11y: {
    // Enable auto-scanning on interactions
    autoScan: true,
    // Configure axe-core options
    axe: {
      runOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
      }
    }
  }
})
```

## Technical Details

Built with TypeScript (68%) and Vue (32%), the module hooks into Nuxt's DevTools infrastructure to provide a dedicated accessibility tab. The numbered badge system highlights affected elements directly on the page, making it easy to locate and fix issues without switching contexts.

Supports WCAG 2.0, 2.1, and 2.2 standards. The axe-core integration means the same accessibility rules used by major tech companies apply to your Nuxt application.
