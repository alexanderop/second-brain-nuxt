# Performance

## D3.js Tree-Shaking

D3 is modular. Importing `import * as d3 from 'd3'` bundles ~273KB. Instead, import from subpackages:

```typescript
// ❌ Imports entire D3 library
import * as d3 from 'd3'

// ✅ Tree-shakeable - only imports what you use
import { select } from 'd3-selection'
import { scaleLinear, scaleBand } from 'd3-scale'
import { forceSimulation, forceLink } from 'd3-force'
import { line, area, curveMonotoneX } from 'd3-shape'
import { max, extent } from 'd3-array'
import { zoom, zoomIdentity } from 'd3-zoom'
import { drag } from 'd3-drag'
```

For TypeScript, install the corresponding type packages:

```bash
pnpm add -D @types/d3-selection @types/d3-scale @types/d3-force @types/d3-shape @types/d3-array @types/d3-zoom @types/d3-drag
```

**Common subpackage mappings:**
| Function | Package |
|----------|---------|
| `select`, `selectAll` | `d3-selection` |
| `scaleLinear`, `scaleBand`, `scalePoint`, `scalePow` | `d3-scale` |
| `forceSimulation`, `forceLink`, `forceManyBody`, `forceCenter`, `forceRadial`, `forceCollide`, `forceY` | `d3-force` |
| `line`, `area`, `curveMonotoneX` | `d3-shape` |
| `max`, `extent` | `d3-array` |
| `zoom`, `zoomIdentity`, `zoomTransform` | `d3-zoom` |
| `drag` | `d3-drag` |

## Lighthouse CI

Performance testing runs in CI via Lighthouse CI. Configuration is in `lighthouserc.json`.

### Nuxt-Specific Configuration

Key differences from standard Vite/SPA setups:

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "pnpm preview",
      "startServerReadyPattern": "Local:",  // Nuxt preview outputs "Local: http://..."
      "url": ["http://localhost:3000/", ...]
    }
  }
}
```

- **Build output**: Nuxt uses `.output/` not `dist/`
- **Server command**: Use `pnpm preview` (serves the built Nuxt app)
- **Ready pattern**: Match Nuxt's "Local:" output to detect server startup

### URL Sampling Strategy

Testing all pre-rendered pages is impractical (133 pages × 3 runs × ~15s = 1+ hour). Instead, test representative page types:

| URL | Tests |
|-----|-------|
| `/` | Homepage, core layout, main assets |
| `/atomic-habits` | Content note rendering |
| `/authors` | Collection listing queries |
| `/authors/aaron-francis` | Detail page pattern |

### Thresholds

Current budgets (moderate):
- Performance: 75%
- Accessibility: 95%
- Best Practices: 90%
- SEO: 90%

### Running Locally

```bash
pnpm build           # Build the site first
pnpm lhci autorun    # Run Lighthouse CI
```
