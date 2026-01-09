---
title: "Databases in 2025: A Year in Review"
type: article
url: "https://www.cs.cmu.edu/~pavlo/blog/2026/01/2025-databases-retrospective.html"
tags:
  - databases
  - postgresql
  - industry-trends
  - acquisitions
authors:
  - andy-pavlo
summary: "PostgreSQL dominated 2025 through major acquisitions, while MCP standardized LLM-database integration and file format fragmentation continued despite Parquet's ubiquity."
date: 2026-01-04
---

## Summary

Andy Pavlo's annual database retrospective captures 2025 as the year PostgreSQL consolidated its dominance. Major acquisitions—Databricks buying Neon for $1B, Snowflake acquiring CrunchyData for $250M—signal that most database energy now flows into PostgreSQL companies rather than fundamentally new systems. Three competing distributed PostgreSQL projects (Multigres, Neki, PgDog) emerged to tackle horizontal sharding, the platform's remaining weakness.

## Key Points

- **PostgreSQL wins**: Every major cloud vendor now offers PostgreSQL. The ecosystem is so pervasive that innovation happens within it rather than outside.

- **MCP adoption is universal**: The Model Context Protocol standardized how databases connect to LLMs. Every major system adopted it. Pavlo cautions that enterprise implementations have better guardrails than open-source alternatives—"nobody should trust an application with unfettered database access."

- **MongoDB vs FerretDB lawsuit**: The legal dispute over API compatibility raises unresolved questions about database API replication. The Oracle v. Google fair use precedent exists but outcomes remain uncertain.

- **File format wars continue**: Five new columnar formats challenged Parquet. None succeeded. Real-world analysis showed 94% of Parquet files use only v1 features from 2013, demonstrating how hard standardization is to overcome.

- **Consolidation through M&A**: Private equity involvement and major acquisitions suggest the database market is maturing with fewer independent players.

- **Larry Ellison's wealth peak**: Oracle's stock surge made him the world's richest person, a notable cultural marker for database industry relevance.

## Connections

✓ No diagram needed: Content is industry analysis without spatial structure or process flows.

This note is standalone—no genuine connections exist in the current knowledge base for database or industry trend topics.
