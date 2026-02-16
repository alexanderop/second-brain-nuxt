export function handleImageError(event: Event): void {
  if (!(event.target instanceof HTMLImageElement)) return
  event.target.style.display = 'none'
  const fallback = event.target.nextElementSibling
  if (fallback instanceof HTMLElement) {
    fallback.style.display = 'flex'
  }
}
