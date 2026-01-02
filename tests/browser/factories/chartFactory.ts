/**
 * Factory functions for chart test data
 */

export interface BarChartDataItem {
  label: string
  value: number
  color?: string
}

export interface LineChartDataPoint {
  label: string
  value: number
}

/**
 * Create bar chart data with customizable items
 */
export function createBarChartData(count = 4): BarChartDataItem[] {
  const labels = ['Books', 'Articles', 'Podcasts', 'Notes', 'Videos', 'Courses']
  const values = [42, 28, 15, 67, 23, 11]

  return labels.slice(0, count).map((label, i) => ({
    label,
    value: values[i] ?? 10,
  }))
}

/**
 * Create bar chart data with custom colors
 */
export function createColoredBarChartData(): BarChartDataItem[] {
  return [
    { label: 'Primary', value: 50, color: '#6ee7b7' },
    { label: 'Secondary', value: 30, color: '#fcd34d' },
    { label: 'Tertiary', value: 20, color: '#c4b5fd' },
  ]
}

/**
 * Create line chart data (time series style)
 */
export function createLineChartData(months = 6): LineChartDataPoint[] {
  const baseLabels = [
    '2024-01', '2024-02', '2024-03', '2024-04',
    '2024-05', '2024-06', '2024-07', '2024-08',
    '2024-09', '2024-10', '2024-11', '2024-12',
  ]
  const baseValues = [5, 12, 8, 15, 22, 18, 25, 30, 28, 35, 42, 38]

  return baseLabels.slice(0, months).map((label, i) => ({
    label,
    value: baseValues[i] ?? 10,
  }))
}

/**
 * Create empty chart data
 */
export function createEmptyChartData(): BarChartDataItem[] {
  return []
}

/**
 * Create single item chart data
 */
export function createSingleItemData(): BarChartDataItem[] {
  return [{ label: 'Only', value: 100 }]
}
