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
