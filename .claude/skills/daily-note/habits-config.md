# Alexander's Daily Habits & Targets

Personal configuration for the `/daily-note` skill.

## Daily Habits

Track these as checkboxes each day:

| Habit | Target | Notes |
|-------|--------|-------|
| Morning walk | Done | Start the day with movement |
| Read | 30 min | Books or long-form articles |
| Workout | Done | Strength or cardio session |
| Deep work | 45 min | Focused, uninterrupted work |

## Daily Metrics

Track these values each day:

| Metric | Target | Format |
|--------|--------|--------|
| Steps | 7000+ | number |
| Calories | < 2800 | number |
| Protein | 180g+ | number in grams |
| Eating window | Nothing after 20:00 | yes/no if respected |

## Template Section

Use this format in daily notes:

```markdown
## Habits

- [ ] Morning walk
- [ ] Read (30 min)
- [ ] Workout
- [ ] Deep work (45 min)

## Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Steps | | 7000+ |
| Calories | | < 2800 |
| Protein | | 180g+ |
| Eating window respected | | ✓ |
```

## AskUserQuestion Format

When prompting for habits:

```yaml
question: "Which habits did you complete today?"
header: "Habits"
multiSelect: true
options:
  - label: "Morning walk"
    description: "Morning movement"
  - label: "Read (30 min)"
    description: "Books or articles"
  - label: "Workout"
    description: "Strength or cardio"
  - label: "Deep work (45 min)"
    description: "Focused work block"
```

When prompting for metrics:

```yaml
question: "Which metrics to log?"
header: "Metrics"
multiSelect: true
options:
  - label: "Steps"
    description: "Target: 7000+"
  - label: "Calories"
    description: "Target: < 2800"
  - label: "Protein"
    description: "Target: 180g+"
  - label: "Eating window"
    description: "Nothing after 20:00"
```
