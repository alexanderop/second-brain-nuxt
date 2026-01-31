---
title: "IsoCity & IsoCoaster"
type: github
url: "https://github.com/amilich/isometric-city"
stars: 1797
language: "TypeScript"
tags:
  - game-development
  - canvas
  - simulation
  - open-source
authors:
  - andrew-milich
summary: "Open-source browser games prove you can build complex simulations with vanilla Canvas APIs—no game engine required."
date: 2026-01-31
---

## Overview

Two open-source isometric simulation games from Andrew Milich (Cursor, ex-Skiff CEO): **IsoCity** is a city builder with transportation and pedestrian systems, while **IsoCoaster** is a theme park builder with roller coasters, shops, and guests. Both run in the browser with no signup required and include co-op multiplayer.

The project stands out for using raw HTML5 Canvas instead of game engines like Phaser or Unity. This demonstrates that complex depth sorting, layer management, and pathfinding work fine with vanilla browser APIs.

## Key Features

- Custom isometric rendering with depth sorting and layer management
- Autonomous vehicle traffic simulation
- NPC pathfinding and crowd mechanics
- Resource management and zoning systems
- Save/load persistence across sessions
- Touch-optimized mobile interface
- Co-op multiplayer support

## Code Snippets

### Installation

```bash
npm install
npm run dev
```

Access at `localhost:3000`.

### Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas API (native, no game engines)
- **UI**: Lucide React icons

## Technical Details

The architecture centers on a `CanvasIsometricGrid` component that handles sprite rendering, depth sorting, and layer management. The tile-based grid supports interactive placement mechanics with state persistence. By avoiding game engine dependencies, the codebase stays lean and demonstrates what's possible with platform primitives.

## Links

- [Play IsoCoaster](https://iso-coaster.com) - Live demo, no signup required
