export function formatDate(
  date?: Date | string,
  style: 'long' | 'short' = 'long',
): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: style,
    day: 'numeric',
  })
}
