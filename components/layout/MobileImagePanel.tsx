'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { isImageCached } from '@/lib/image-preload'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { scrubStepsFromDelta } from '@/lib/mobile-scrub'

const EXPAND_DRAG_THRESHOLD = 48
const isApiImage = (src: string) => src.startsWith('/api/')

interface MobileImagePanelProps {
  imageSrc: string
  title: string
  isFullscreen: boolean
  onFullscreenChange: (fullscreen: boolean) => void
  onNavigate?: (delta: -1 | 1) => void
}

function DragHandle() {
  return (
    <div className="flex h-12 w-12 items-end justify-center pb-2">
      <div className="h-1 w-8 rounded-full bg-border-strong-01" />
    </div>
  )
}

export function MobileImagePanel({
  imageSrc,
  title,
  isFullscreen,
  onFullscreenChange,
  onNavigate,
}: MobileImagePanelProps) {
  const [loaded, setLoaded] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const scrubAccumRef = useRef(0)
  const dragStartYRef = useRef(0)
  const lastYRef = useRef(0)
  const lastTimeRef = useRef(0)
  const dragModeRef = useRef<'none' | 'resize' | 'scrub'>('none')
  const pointerIdRef = useRef<number | null>(null)
  const didDragRef = useRef(false)

  useLayoutEffect(() => {
    if (!isApiImage(imageSrc)) {
      setLoaded(false)
      return
    }
    setLoaded(isImageCached(imageSrc))
  }, [imageSrc])

  const resetDrag = useCallback(() => {
    dragModeRef.current = 'none'
    pointerIdRef.current = null
    scrubAccumRef.current = 0
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const target = e.target
      if (!(target instanceof Element)) return

      const onHandle = target.closest('[data-mobile-handle]')
      const onImage = target.closest('[data-mobile-image-area]')

      if (onHandle) {
        dragModeRef.current = 'resize'
      } else if (isFullscreen && onImage) {
        dragModeRef.current = 'scrub'
      } else {
        return
      }

      e.preventDefault()
      e.stopPropagation()
      didDragRef.current = false
      pointerIdRef.current = e.pointerId
      dragStartYRef.current = e.clientY
      lastYRef.current = e.clientY
      lastTimeRef.current = performance.now()
      scrubAccumRef.current = 0
      panelRef.current?.setPointerCapture(e.pointerId)
    },
    [isFullscreen],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return

      e.preventDefault()
      e.stopPropagation()

      const now = performance.now()
      const deltaY = e.clientY - lastYRef.current
      const dt = Math.max(now - lastTimeRef.current, 1)
      const velocity = deltaY / dt
      lastYRef.current = e.clientY
      lastTimeRef.current = now

      if (Math.abs(e.clientY - dragStartYRef.current) > 4) {
        didDragRef.current = true
      }

      if (dragModeRef.current === 'resize') {
        const totalDrag = e.clientY - dragStartYRef.current
        if (!isFullscreen && totalDrag > EXPAND_DRAG_THRESHOLD) {
          onFullscreenChange(true)
          resetDrag()
        } else if (isFullscreen && totalDrag < -EXPAND_DRAG_THRESHOLD) {
          onFullscreenChange(false)
          resetDrag()
        }
        return
      }

      if (dragModeRef.current === 'scrub' && onNavigate) {
        const { steps, accumulated } = scrubStepsFromDelta(
          deltaY,
          velocity,
          scrubAccumRef.current,
        )
        scrubAccumRef.current = accumulated
        if (steps !== 0) {
          const direction = steps > 0 ? 1 : -1
          const count = Math.min(Math.abs(steps), 8)
          for (let i = 0; i < count; i += 1) onNavigate(direction)
        }
      }
    },
    [isFullscreen, onFullscreenChange, onNavigate, resetDrag],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return

      e.preventDefault()
      e.stopPropagation()

      if (panelRef.current?.hasPointerCapture(e.pointerId)) {
        panelRef.current.releasePointerCapture(e.pointerId)
      }
      resetDrag()
    },
    [resetDrag],
  )

  const blockClick = useCallback((e: React.MouseEvent) => {
    if (didDragRef.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return (
    <section
      ref={panelRef}
      data-ignore-outside="true"
      className={cn(
        'relative flex touch-none flex-col overflow-hidden rounded-base border border-border-subtle-00 bg-layer-01 transition-[flex,height] duration-300 ease-out motion-reduce:transition-none',
        isFullscreen
          ? 'min-h-0 flex-1 basis-0'
          : 'h-[min(46dvh,26rem)] shrink-0',
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={blockClick}
    >
      <div
        data-mobile-image-area
        className="relative flex h-full min-h-0 w-full flex-1 items-center justify-center overflow-hidden p-1"
      >
        {isApiImage(imageSrc) ? (
          <img
            src={imageSrc}
            alt={title}
            onLoad={() => setLoaded(true)}
            draggable={false}
            className={cn(
              'h-full w-full select-none object-contain rounded-xs transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
          />
        ) : (
          <Image
            src={imageSrc}
            alt={title}
            width={1200}
            height={800}
            onLoadingComplete={() => setLoaded(true)}
            draggable={false}
            className={cn(
              'h-full w-full select-none object-contain rounded-xs transition-opacity duration-300',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
            sizes="100vw"
          />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1">
        <div
          data-mobile-handle
          role="button"
          tabIndex={0}
          aria-label={isFullscreen ? 'Drag up to show list' : 'Drag down for full screen'}
          className="rounded-base text-text-primary"
        >
          <DragHandle />
        </div>
      </div>
    </section>
  )
}
