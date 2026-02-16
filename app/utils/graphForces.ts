import { forceSimulation, forceLink, forceManyBody, forceCenter, forceRadial, forceY, forceCollide } from 'd3-force'
import type { Simulation } from 'd3-force'
import type { UnifiedGraphNode, UnifiedGraphEdge } from '~/types/graph'

export interface ForceConfig {
  linkDistance: number
  chargeStrength: number
  collisionPadding: number
  // Radial-specific
  radialStrength?: number
  radialRadius?: number
  level2RadialRadius?: number
  level2ChargeMultiplier?: number
  // Freeform-specific
  centerStrength?: number
  yStrength?: number
}

export const RADIAL_DEFAULTS: ForceConfig = {
  linkDistance: 70,
  chargeStrength: -200,
  collisionPadding: 8,
  radialStrength: 0.4,
  radialRadius: 90,
  level2RadialRadius: 144, // 90 * 1.6
  level2ChargeMultiplier: 0.4,
}

export const FREEFORM_DEFAULTS: ForceConfig = {
  linkDistance: 150,
  chargeStrength: -500,
  collisionPadding: 6,
  centerStrength: 0.05,
  yStrength: 0.02,
}

export function createRadialSimulation(
  nodes: UnifiedGraphNode[],
  edges: UnifiedGraphEdge[],
  width: number,
  height: number,
  config: Partial<ForceConfig> = {},
  radiusScale: (node: UnifiedGraphNode) => number,
): Simulation<UnifiedGraphNode, UnifiedGraphEdge> {
  const c = { ...RADIAL_DEFAULTS, ...config }
  const radialRadius = c.radialRadius ?? 90
  const level2RadialRadius = c.level2RadialRadius ?? 144
  const radialStrength = c.radialStrength ?? 0.4

  return forceSimulation<UnifiedGraphNode>(nodes)
    .force('link', forceLink<UnifiedGraphNode, UnifiedGraphEdge>(edges)
      .id(d => d.id)
      .distance(c.linkDistance))
    .force('charge', forceManyBody<UnifiedGraphNode>()
      .strength((d) => {
        if (d.isCenter) return c.chargeStrength
        if (d.level === 2) return c.chargeStrength * (c.level2ChargeMultiplier ?? 0.4)
        return c.chargeStrength
      }))
    .force('center', forceCenter(width / 2, height / 2))
    .force('radial', forceRadial<UnifiedGraphNode>(
      (d): number => {
        if (d.isCenter) return 0
        if (d.level === 2) return level2RadialRadius
        return radialRadius
      },
      width / 2,
      height / 2,
    ).strength((d): number => d.isCenter ? 0 : radialStrength))
    .force('collision', forceCollide<UnifiedGraphNode>()
      .radius(d => radiusScale(d) + c.collisionPadding))
    .alphaDecay(0.05)
}

export function createFreeformSimulation(
  nodes: UnifiedGraphNode[],
  edges: UnifiedGraphEdge[],
  width: number,
  height: number,
  config: Partial<ForceConfig> = {},
  radiusScale: (node: UnifiedGraphNode) => number,
  clusteringForce?: (alpha: number) => void,
): Simulation<UnifiedGraphNode, UnifiedGraphEdge> {
  const c = { ...FREEFORM_DEFAULTS, ...config }
  const yStrength = c.yStrength ?? 0.02

  const simulation = forceSimulation<UnifiedGraphNode>(nodes)
    .force('link', forceLink<UnifiedGraphNode, UnifiedGraphEdge>(edges)
      .id(d => d.id)
      .distance(c.linkDistance))
    .force('charge', forceManyBody().strength(c.chargeStrength))
    .force('center', forceCenter(width / 2, height / 2))
    .force('y', forceY(height / 2).strength(yStrength))
    .force('collision', forceCollide<UnifiedGraphNode>()
      .radius(d => radiusScale(d) + c.collisionPadding))

  if (clusteringForce) {
    simulation.force('cluster', clusteringForce)
  }

  return simulation
}
