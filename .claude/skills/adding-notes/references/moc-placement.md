# MOC Placement Guide

After saving a note, check for MOC placement opportunities.

## 1. Suggest Existing MOC Placement

```bash
python3 .claude/skills/moc-curator/scripts/cluster-notes.py --mode=for-note --note={slug}
```

If suggestions score >= 0.7, present to user. Apply selections to the MOC's `## Suggested` section.

## 2. Check MOC Creation Threshold

For each tag on the new note, check if it exceeds the threshold:

```bash
# Count notes with that tag
Grep pattern: "tags:.*{tag}" glob: "content/*.md" output_mode: "count"
```

**IF tag count >= 15 AND no existing MOC for that tag:**

Use AskUserQuestion to offer MOC creation:
- Option 1: Create MOC (invoke moc-curator skill with `--mode=new-clusters --tag={tag}`)
- Option 2: Skip for now

## When to Suggest MOCs

- A tag has 15+ notes without a dedicated MOC
- The new note creates a natural cluster with 5+ related notes
- The topic deserves a curated learning path
