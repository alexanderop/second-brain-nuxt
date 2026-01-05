# Courses

Online courses from platforms like Udemy, Coursera, Skillshare.

## Detection

- URL contains: udemy.com, coursera.org, skillshare.com, egghead.io, frontendmasters.com
- Type auto-detected as `course`

## Metadata Collection

**Agent A - Course Info:**
Use WebFetch to extract: title, instructor, description, key topics

**Agent B - Instructor Check:**
```bash
.claude/skills/adding-notes/scripts/check-author-exists.sh 'Instructor Name'
```

## Frontmatter

```yaml
---
title: "Course Title"
type: course
url: "https://udemy.com/course/..."
tags:
  - topic-1
  - topic-2
authors:
  - instructor-slug
summary: "Core value: What capability does this course provide? (assertion, not description)"
date: 2026-01-01
---
```

## Body Template

```markdown
## Course Overview

[What the course covers and target audience]

## Key Lessons

- Lesson 1: Description
- Lesson 2: Description

## Projects/Exercises

[Notable hands-on work from the course]

## Connections

[Each link must explain WHY you're connecting these notes. Minimum 2 links required.]

- [[prerequisite-topic]] - [1-sentence explanation of the relationship]
- [[advanced-topic]] - [1-sentence explanation of the relationship]
```

## Technical Courses

If the course is technical (programming, DevOps, etc.):
- Set `isTechnical: true`
- Add Code Snippets section (see `references/code-extraction.md`)
- Extract practical examples from course materials
