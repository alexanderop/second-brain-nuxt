---
title: "Mutation Testing Without Stryker: How AI Agents Fill the Gap"
status: draft
tags:
  - testing
  - mutation-testing
  - claude-code
  - vitest
  - code-quality
core_idea: "When traditional mutation testing tools don't support your stack (like Vitest browser mode), AI coding agents can systematically apply mutations manually to find test gaps that code coverage misses."
target_audience: "Developers using Vitest browser mode, Playwright component testing, or other setups where Stryker doesn't work—who still want mutation testing insights."
created: 2026-01-12
updated: 2026-01-12
---

## Core Idea

Traditional mutation testing tools like Stryker don't support every test framework. When you're using Vitest in browser mode, these tools simply don't work. But the mutation testing algorithm is simple enough that an AI coding agent can execute it manually—applying mutations, running tests, and reporting which "mutants" survive.

## Outline

### 1. The Coverage Lie (Hook)
- Open with code that has 100% coverage but 0% usefulness
- The test that exercises but doesn't verify

### 2. What Is Mutation Testing?
- Flip the question: "if I break this code, do tests fail?"
- The process: mutate → run tests → evaluate
- Surviving mutants = test gaps

### 3. The Vitest Browser Mode Problem
- Stryker's instrumentation assumes Node.js execution
- Browser mode runs in actual Chromium via Playwright
- Switching to Node-based testing loses the behavior you're testing

### 4. AI Agents as Manual Mutation Testers
- The algorithm is simple enough for agents to execute
- Claude Code can: read code, apply mutations, run tests, record results, restore, report
- The mutation testing skill with operator priority tables

### 5. Real Example: Settings Feature
- Integration tests looked comprehensive
- Results: 38% mutation score (5 killed, 8 survived)
- Three surviving mutants with code examples
- The fixes: specific tests for each gap

### 6. How to Set This Up
- Creating the skill file
- Invoking it
- Reviewing and acting on results

### 7. When to Use This Approach
- Good fit: browser mode, Playwright, small codebases, pre-merge review
- Not ideal: large codebases, CI automation, strict thresholds

### 8. Key Takeaways
- Coverage doesn't equal confidence
- Mutation testing reveals gaps
- AI agents can execute the algorithm
- Focus on surviving mutants
- Complements, not replaces automated tools

## Source Notes

- [[mutation-testing-skill]] - The Claude Code skill that codifies this workflow, originally created by [Paul Hammond](https://www.linkedin.com/in/paulhammond/) ([GitHub](https://github.com/citypaul/.dotfiles/blob/main/claude/.claude/skills/mutation-testing/SKILL.md))
- [[kill-all-mutants-intro-to-mutation-testing]] - Dave Aronson's foundational talk on why code coverage lies
- [[vitest-browser-mode]] - Jessica Sachs on real browser testing with Vitest
- [[stryker-mutator]] - The tool this approach works around
- [[write-tests-not-too-many-mostly-integration]] - Kent C. Dodds on integration test value

## Draft Sections

### The Coverage Lie

Code coverage lies. A test that exercises a line doesn't mean it verifies that line does the right thing:

```typescript
// 100% code coverage, 0% usefulness
it('processes', () => {
  processOrder(order) // No assertion!
})
```

Mutation testing flips the question. Instead of asking "did tests run this code?", it asks **"if I break this code, do tests fail?"**

The process:
1. **Mutate**: Introduce a small bug (change `>` to `>=`, swap `&&` for `||`, delete a line)
2. **Run tests**: Execute your test suite against the mutated code
3. **Evaluate**: If tests pass with the bug, your tests are weak. If tests fail, they caught it.

A mutation that tests fail to catch is a "surviving mutant"—proof of a test gap.

---

### The Vitest Browser Mode Problem

Stryker, the most popular mutation testing framework for JavaScript, doesn't support Vitest's browser mode. Their instrumentation assumes Node.js execution, but browser mode runs tests in actual Chromium via Playwright.

My setup:
- **Framework**: Vitest 4 with `browser.enabled: true`
- **Provider**: Playwright (Chromium)
- **Test style**: Integration tests with real DOM

Stryker's mutation coverage reports? Not an option. And switching to Node-based testing would mean losing the browser-specific behavior I'm actually testing.

---

### AI Agents as Manual Mutation Testers

The mutation testing algorithm is simple enough that an AI coding agent can execute it manually. Claude Code can:

1. Read your source code
2. Apply mutations systematically
3. Run `pnpm test --run`
4. Record whether tests passed or failed
5. Restore the original code
6. Report surviving mutants with suggested fixes

I adapted a Claude Code skill originally created by [Paul Hammond](https://www.linkedin.com/in/paulhammond/) that codifies this workflow.

::mermaid
<pre>
flowchart TD
    subgraph Agent["AI Agent Workflow"]
        A[Read source file] --> B[Identify mutation targets]
        B --> C[Apply single mutation]
        C --> D[Run test suite]
        D --> E{Tests fail?}
        E -->|Yes| F[Mutant KILLED]
        E -->|No| G[Mutant SURVIVED]
        F --> H[Restore original code]
        G --> H
        H --> I{More mutations?}
        I -->|Yes| C
        I -->|No| J[Generate report]
    end

    subgraph Results["Report Output"]
        J --> K[Killed mutants: Tests caught the bug]
        J --> L[Survived mutants: Test gaps found]
        L --> M[Suggested fixes for each gap]
    end

    style G fill:#f96,stroke:#333
    style F fill:#6f9,stroke:#333
    style L fill:#f96,stroke:#333
    style K fill:#6f9,stroke:#333
</pre>
::

#### The Mutation Testing Skill

The skill defines mutation operators in priority order:

**Priority 1 - Boundaries** (most likely to survive):

| Original | Mutate To |
|----------|-----------|
| `<` | `<=` |
| `>` | `>=` |
| `<=` | `<` |
| `>=` | `>` |

**Priority 2 - Boolean Logic**:

| Original | Mutate To |
|----------|-----------|
| `&&` | `\|\|` |
| `\|\|` | `&&` |
| `!condition` | `condition` |

**Priority 3 - Return Values**:

| Original | Mutate To |
|----------|-----------|
| `return x` | `return null` |
| `return true` | `return false` |
| Early return | Remove it |

**Priority 4 - Statement Removal**:

| Original | Mutate To |
|----------|-----------|
| `array.push(x)` | Remove |
| `await save(x)` | Remove |
| `emit('event')` | Remove |

The agent applies each mutation one at a time, runs tests, records results, and restores the original code immediately.

---

### Real Example: Settings Feature

I ran this against my settings feature. The integration tests looked comprehensive—theme toggling, language switching, unit preferences. Code coverage would show high percentages.

**Results: 38% mutation score** (5 killed, 8 survived out of 13 mutations)

Here's what the AI agent found:

#### Surviving Mutant #1: Volume Boundary Not Tested

```typescript
// Original (stores/settings.ts:65)
Math.min(Math.max(volume, 0.5), 1)

// Mutation: Change 0.5 to 0.4
Math.min(Math.max(volume, 0.4), 1)

// Result: Tests PASSED -> Mutant SURVIVED
```

My tests never verified the minimum volume constraint. A bug changing the minimum from 50% to 40% would ship undetected.

#### Surviving Mutant #2: Theme DOM Class Not Verified

```typescript
// Original (composables/useTheme.ts:26)
newMode === 'dark'

// Mutation: Negate the condition
newMode !== 'dark'

// Result: Tests PASSED -> Mutant SURVIVED
```

My test checked that clicking the toggle changed the stored preference. It never verified that `document.documentElement.classList` actually received the `dark` class. The UI could break while tests pass.

#### Surviving Mutant #3: Error Handling Path Untested

```typescript
// Original (stores/settings.ts:28)
if (error) return

// Mutation: Negate the condition
if (!error) return

// Result: Tests PASSED -> Mutant SURVIVED
```

No test exercised the error handling branch. A bug that inverted error handling would go unnoticed.

#### The Fixes

The agent suggested specific tests for each surviving mutant:

```typescript
// Fix for Mutant #1: Boundary test
it('volume slider has minimum value constraint of 50%', async () => {
  const volumeSlider = page.getByTestId('timer-sound-volume-slider')
  await expect.poll(async () => {
    const el = await volumeSlider.element()
    return el.getAttribute('min')
  }).toBe('0.5')
})

// Fix for Mutant #2: DOM verification
it('adds dark class to html element when dark mode enabled', async () => {
  const themeToggle = page.getByTestId('theme-toggle')
  await userEvent.click(themeToggle)

  await expect.poll(() =>
    document.documentElement.classList.contains('dark')
  ).toBe(true)
})
```

---

### How to Set This Up

#### Step 1: Create the Skill

Save this as `.claude/skills/mutation-testing/SKILL.md`:

```markdown
# Mutation Testing

Execute this workflow for each function:

1. READ the original file
2. APPLY one mutation
3. RUN tests: pnpm test --run
4. RECORD: KILLED (test failed) or SURVIVED (test passed)
5. RESTORE original code immediately
6. Repeat for next mutation

## Mutation Operators

[Include the priority tables from above]

## Report Format

| Mutation | Location | Result | Action Needed |
|----------|----------|--------|---------------|
| `>` -> `>=` | file.ts:42 | SURVIVED | Add boundary test |
```

#### Step 2: Invoke It

```bash
claude "Run mutation testing on the settings feature"
```

The agent will:
- Find changed files on your branch
- Identify testable functions
- Apply mutations systematically
- Report surviving mutants with suggested test fixes

#### Step 3: Review and Fix

The agent produces a markdown report. Review each surviving mutant and decide:
- Add the suggested test
- Accept the risk (document why)
- Refactor the code to be more testable

---

### When to Use This Approach

**Good fit:**
- Vitest browser mode (no Stryker support)
- Playwright component testing
- Small-to-medium codebases
- Pre-merge review of specific features
- Learning what makes tests effective

**Not ideal for:**
- Large codebases needing full mutation coverage
- CI/CD automation (manual agent invocation)
- Strict mutation score thresholds

---

### Key Takeaways

1. **Coverage doesn't equal confidence.** High code coverage can coexist with ineffective tests.

2. **Mutation testing reveals test gaps.** By breaking code and checking if tests notice, you find what's actually being verified.

3. **AI agents can execute manual mutation testing.** When tooling doesn't support your stack, an agent can apply the algorithm systematically.

4. **Focus on surviving mutants.** Each one is a potential bug your tests wouldn't catch.

5. **This complements, not replaces.** Use this alongside coverage reports, not instead of automated mutation testing where available.

---

### Resources

- [Paul Hammond's Mutation Testing Skill](https://github.com/citypaul/.dotfiles/blob/main/claude/.claude/skills/mutation-testing/SKILL.md) - The original skill this post is based on
- [Mutation Testing on Wikipedia](https://en.wikipedia.org/wiki/Mutation_testing)
- [Stryker Mutator](https://stryker-mutator.io/) - When your stack supports it
- [Claude Code Skills](https://docs.anthropic.com/en/docs/claude-code) - Building custom agent workflows

## Open Questions

- Should I include the full skill file in the post or link to Paul's gist?
- Include timing data (how long the manual process takes vs. automated)?
