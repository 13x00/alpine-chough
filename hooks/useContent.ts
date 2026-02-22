'use client'

import { useState, useCallback } from 'react'
import type { ContentType, ViewType, Project, Article, Photography } from '@/types/content'

export function useContent() {
  const [currentTab, setCurrentTab] = useState<ContentType>('images')
  const [currentView, setCurrentView] = useState<ViewType>('portrait')
  const [selectedItem, setSelectedItem] = useState<Project | Article | Photography | null>(null)

  const setTab = useCallback((tab: ContentType) => {
    setCurrentTab(tab)
  }, [])

  const setView = useCallback((view: ViewType, item?: Project | Article | Photography) => {
    setCurrentView(view)
    setSelectedItem(item || null)
  }, [])

  const goHome = useCallback(() => {
    setCurrentView('portrait')
    setSelectedItem(null)
  }, [])

  return {
    currentTab,
    currentView,
    selectedItem,
    setTab,
    setView,
    goHome,
  }
}
