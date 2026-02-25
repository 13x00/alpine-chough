'use client'

import { TabButton } from '@/components/ui/Tabs'
import { ContentType } from '@/types/content'

const TAB_TRANSITION = 'transition-transform duration-300 ease-out'

interface ContentTabsProps {
  currentTab: ContentType
  onTabChange: (tab: ContentType) => void
  className?: string
}

export function ContentTabs({ currentTab, onTabChange, className }: ContentTabsProps) {
  return (
    <div className={`relative flex border-b border-cds-border-subtle ${className || ''}`}>
      <TabButton
        active={currentTab === 'images'}
        onClick={() => onTabChange('images')}
      >
        Photography
      </TabButton>
      <TabButton
        active={currentTab === 'projects'}
        onClick={() => onTabChange('projects')}
      >
        Design
      </TabButton>
      {/* Sliding indicator — matches paper strip timing (300ms ease-out) */}
      <div
        className={`absolute bottom-0 left-0 w-1/2 h-0.5 bg-layer-8 ${TAB_TRANSITION}`}
        style={{
          transform: currentTab === 'projects' ? 'translateX(100%)' : 'translateX(0)',
        }}
        aria-hidden
      />
    </div>
  )
}
