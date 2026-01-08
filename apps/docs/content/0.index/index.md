---
title: Home
navigation: false
layout: page
---

::hero
---
announcement:
  title: 'Second Brain Documentation'
  to: /getting-started/introduction
  icon: 'i-heroicons-book-open'
actions:
  - label: Get Started
    icon: i-heroicons-arrow-right-20-solid
    trailing: true
    to: /getting-started/introduction
    size: lg
  - label: GitHub
    icon: i-simple-icons-github
    size: lg
    color: neutral
    variant: subtle
    to: https://github.com/alexanderop/second-brain-nuxt
    target: _blank
---

#title
Second Brain

#description
A personal knowledge base for capturing and connecting content using Zettelkasten-style wiki-links. Built with Nuxt 4 and @nuxt/content v3.
::

::card-group
  ::card{icon="i-heroicons-document-text" title="Content Types" to="/content/overview"}
  Learn about the different content types: podcasts, articles, books, notes, and more.
  ::

  ::card{icon="i-heroicons-link" title="Wiki-Links" to="/content/wiki-links"}
  Connect your notes using [[slug]] syntax and build a web of knowledge.
  ::

  ::card{icon="i-heroicons-chart-bar" title="Knowledge Graph" to="/features/knowledge-graph"}
  Visualize connections between your notes with an interactive graph.
  ::

  ::card{icon="i-heroicons-command-line" title="Claude Code Skills" to="/claude-code/overview"}
  Automate content creation and enhancement with 19+ Claude Code skills.
  ::
::
