const prefetchedSrcs = new Set<string>()

export function preloadImage(src: string): void {
  if (!src || typeof window === 'undefined' || prefetchedSrcs.has(src)) return

  prefetchedSrcs.add(src)
  const image = new window.Image()
  image.decoding = 'async'
  image.fetchPriority = 'low'
  image.src = src
  void image.decode().catch(() => {
    prefetchedSrcs.delete(src)
  })
}

export function isImageCached(src: string): boolean {
  if (!src || typeof window === 'undefined') return false
  const probe = new window.Image()
  probe.src = src
  return probe.complete && probe.naturalWidth > 0
}

/** Preload every list image as soon as the list is available. */
export function preloadAllImages(srcs: string[]): void {
  if (typeof window === 'undefined' || srcs.length === 0) return
  for (const src of srcs) preloadImage(src)
}
