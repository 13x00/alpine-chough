'use client'

import { useState, useCallback } from 'react'
import type { ViewType, DetailItem } from '@/types/content'

export function useContent() {
  const [currentView, setCurrentView] = useState<ViewType>('portrait')
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null)

  const setView = useCallback((view: ViewType, item?: DetailItem) => {
    setCurrentView(view)
    setSelectedItem(item || null)
  }, [])

  const goHome = useCallback(() => {
    setCurrentView('portrait')
    setSelectedItem(null)
  }, [])

  return {
    currentView,
    selectedItem,
    setView,
    goHome,
  }
}
