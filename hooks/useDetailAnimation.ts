'use client'

import { useEffect, useRef, useState } from 'react'
import type { ViewType, DetailItem } from '@/types/content'

const SLIDE_IN_DELAY_MS = 300
const SWAP_DURATION_MS = 300

interface UseDetailAnimationParams {
  hasDetail: boolean
  selectedItem: DetailItem | null
  currentView: ViewType
  onCloseAnimationComplete?: () => void
}

export function useDetailAnimation({
  hasDetail,
  selectedItem,
  currentView,
  onCloseAnimationComplete,
}: UseDetailAnimationParams) {
  const [showDetail, setShowDetail] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [displayItem, setDisplayItem] = useState<DetailItem | null>(null)
  const [outgoingItem, setOutgoingItem] = useState<DetailItem | null>(null)
  const [swapAnimating, setSwapAnimating] = useState(false)
  const [displayView, setDisplayView] = useState<ViewType>('portrait')
  const [outgoingView, setOutgoingView] = useState<ViewType | null>(null)

  const genRef = useRef(0)
  const displayItemRef = useRef<DetailItem | null>(null)
  const displayViewRef = useRef<ViewType>('portrait')
  const timeoutsRef = useRef<{
    slideIn?: ReturnType<typeof setTimeout>
    expand?: ReturnType<typeof setTimeout>
    swapDone?: ReturnType<typeof setTimeout>
    shrink?: ReturnType<typeof setTimeout>
    exitSlide?: ReturnType<typeof setTimeout>
  }>({})
  const rafRef = useRef<{ swapRaf1?: number; swapRaf2?: number }>({})

  const clearAllTimers = () => {
    if (timeoutsRef.current.slideIn) {
      clearTimeout(timeoutsRef.current.slideIn)
      timeoutsRef.current.slideIn = undefined
    }
    if (timeoutsRef.current.expand) {
      clearTimeout(timeoutsRef.current.expand)
      timeoutsRef.current.expand = undefined
    }
    if (timeoutsRef.current.swapDone) {
      clearTimeout(timeoutsRef.current.swapDone)
      timeoutsRef.current.swapDone = undefined
    }
    if (timeoutsRef.current.shrink) {
      clearTimeout(timeoutsRef.current.shrink)
      timeoutsRef.current.shrink = undefined
    }
    if (timeoutsRef.current.exitSlide) {
      clearTimeout(timeoutsRef.current.exitSlide)
      timeoutsRef.current.exitSlide = undefined
    }
    if (rafRef.current.swapRaf1 !== undefined) {
      cancelAnimationFrame(rafRef.current.swapRaf1)
      rafRef.current.swapRaf1 = undefined
    }
    if (rafRef.current.swapRaf2 !== undefined) {
      cancelAnimationFrame(rafRef.current.swapRaf2)
      rafRef.current.swapRaf2 = undefined
    }
  }

  // Unmount-only cleanup — clear timers when the hook unmounts
  useEffect(() => () => clearAllTimers(), [])

  // Handle detail view entrance animation - two stages
  useEffect(() => {
    const currentDisplay = displayItemRef.current

    // No-op: same item already displayed — don't touch gen or timers
    if (
      hasDetail &&
      selectedItem &&
      currentDisplay !== null &&
      selectedItem.id === currentDisplay.id
    ) {
      return
    }

    const gen = ++genRef.current

    if (hasDetail && selectedItem) {
      if (currentDisplay !== null) {
        clearAllTimers()

        setShowDetail(true)
        setIsExpanded(true)
        setOutgoingItem(currentDisplay)
        setOutgoingView(displayViewRef.current)
        setDisplayItem(selectedItem)
        displayItemRef.current = selectedItem
        setDisplayView(currentView)
        displayViewRef.current = currentView
        setSwapAnimating(false)

        const raf1 = requestAnimationFrame(() => {
          if (genRef.current !== gen) return
          const raf2 = requestAnimationFrame(() => {
            if (genRef.current !== gen) return
            setSwapAnimating(true)
          })
          rafRef.current.swapRaf2 = raf2
        })
        rafRef.current.swapRaf1 = raf1

        const doneTimer = setTimeout(() => {
          if (genRef.current !== gen) return
          setOutgoingItem(null)
          setOutgoingView(null)
          setSwapAnimating(false)
          timeoutsRef.current.swapDone = undefined
        }, SWAP_DURATION_MS)
        timeoutsRef.current.swapDone = doneTimer

        return
      }

      clearAllTimers()

      // First open: set item, slide in, expand
      setOutgoingItem(null)
      setDisplayItem(selectedItem)
      displayItemRef.current = selectedItem
      setDisplayView(currentView)
      displayViewRef.current = currentView
      setIsExpanded(false)
      setShowDetail(false)

      const slideTimer = setTimeout(() => {
        if (genRef.current !== gen) return
        setShowDetail(true)
        timeoutsRef.current.slideIn = undefined
        const expandTimer = setTimeout(() => {
          if (genRef.current !== gen) return
          setIsExpanded(true)
          timeoutsRef.current.expand = undefined
        }, 300)
        timeoutsRef.current.expand = expandTimer
      }, SLIDE_IN_DELAY_MS)
      timeoutsRef.current.slideIn = slideTimer

      return
    }

    if (!hasDetail && (displayItemRef.current || outgoingItem)) {
      clearAllTimers()

      setIsExpanded(false)
      setOutgoingItem(null)

      const shrinkTimer = setTimeout(() => {
        if (genRef.current !== gen) return
        setShowDetail(false)
        timeoutsRef.current.shrink = undefined
        const slideTimer = setTimeout(() => {
          if (genRef.current !== gen) return
          setDisplayItem(null)
          displayItemRef.current = null
          onCloseAnimationComplete?.()
          timeoutsRef.current.exitSlide = undefined
        }, 300)
        timeoutsRef.current.exitSlide = slideTimer
      }, 300)
      timeoutsRef.current.shrink = shrinkTimer
    }
  }, [hasDetail, selectedItem, currentView, onCloseAnimationComplete])

  return {
    showDetail,
    isExpanded,
    displayItem,
    outgoingItem,
    swapAnimating,
    displayView,
    outgoingView,
  }
}
