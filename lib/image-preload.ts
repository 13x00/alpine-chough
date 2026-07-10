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

function isMobileViewport(): boolean {
  return window.matchMedia('(max-width: 767px)').matches
}

/** Desktop: preload all list images. Mobile: batch a few to avoid tab OOM/crash loops. */
export function preloadListImages(srcs: string[]): void {
  if (typeof window === 'undefined' || srcs.length === 0) return

  if (!isMobileViewport()) {
    for (const src of srcs) preloadImage(src)
    return
  }

  const initial = srcs.slice(0, 10)
  for (const src of initial) preloadImage(src)

  const rest = srcs.slice(10)
  if (rest.length === 0) return

  let index = 0
  const batchSize = 4

  const pump = () => {
    const batch = rest.slice(index, index + batchSize)
    index += batchSize
    for (const src of batch) preloadImage(src)
    if (index < rest.length) {
      setTimeout(pump, 400)
    }
  }

  const schedule = (fn: () => void) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(fn, { timeout: 2000 })
    } else {
      setTimeout(fn, 800)
    }
  }

  schedule(pump)
}

/** @deprecated Use preloadListImages */
export function preloadAllImages(srcs: string[]): void {
  preloadListImages(srcs)
}
