'use client'

import { TabButton } from '@/components/ui/Tabs'
import { ContentType } from '@/types/content'

interface ContentTabsProps {
  currentTab: ContentType
  onTabChange: (tab: ContentType) => void
  className?: string
}

export function ContentTabs({ currentTab, onTabChange, className }: ContentTabsProps) {
  return (
    <div className={`flex space-x-1 border-b border-layer-3 ${className || ''}`}>
      <TabButton
        active={currentTab === 'images'}
        onClick={() => onTabChange('images')}
      >
        Images
      </TabButton>
      <TabButton
        active={currentTab === 'projects'}
        onClick={() => onTabChange('projects')}
      >
        Projects
      </TabButton>
    </div>
  )
}
