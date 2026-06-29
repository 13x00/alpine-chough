/** Pixels of vertical drag needed per item step — lower = coarser (fast scrub) */
export function scrubPixelsPerItem(velocityPxPerMs: number) {
  const speed = Math.min(1, velocityPxPerMs / 1.2)
  const minPx = 28
  const maxPx = 140
  return maxPx - speed * (maxPx - minPx)
}

export function scrubStepsFromDelta(
  deltaY: number,
  velocityPxPerMs: number,
  accumulated: number,
) {
  const pxPerItem = scrubPixelsPerItem(Math.abs(velocityPxPerMs))
  let next = accumulated + deltaY
  let steps = 0

  while (next >= pxPerItem) {
    steps += 1
    next -= pxPerItem
  }
  while (next <= -pxPerItem) {
    steps -= 1
    next += pxPerItem
  }

  return { steps, accumulated: next }
}
