'use client'

import { Logo } from '@/components/content/Logo'
import { ThemeToggle } from '@/components/content/ThemeToggle'
import { AboutSection } from '@/components/content/AboutSection'
import { ContentTabs } from '@/components/content/ContentTabs'
import { NavCardCarousel } from '@/components/content/NavCardCarousel'
import { ContentType } from '@/types/content'

interface LeftPanelProps {
  currentTab: ContentType
  onTabChange: (tab: ContentType) => void
  onHomeClick: () => void
  imageItems: Array<{
    id: string
    title: string
    category?: string
    image: string
    onClick: () => void
  }>
  projectItems: Array<{
    id: string
    title: string
    category?: string
    image: string
    onClick: () => void
  }>
}

export function LeftPanel({
  currentTab,
  onTabChange,
  onHomeClick,
  imageItems,
  projectItems,
}: LeftPanelProps) {
  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-layer-bg">

      {/* Header: logo left, theme toggle right */}
      <div className="flex items-center justify-between px-5 py-4">
        <Logo onClick={onHomeClick} />
        <ThemeToggle />
      </div>

      {/* About */}
      <div className="px-5 pb-5">
        <AboutSection />
      </div>

      {/* Tabs */}
      <div className="px-5">
        <ContentTabs currentTab={currentTab} onTabChange={onTabChange} />
      </div>

      {/* Card Carousel — one strip (paper): Images left, Projects right; shove left to show Projects */}
      <div className="flex-1 min-h-0 px-5 pt-0">
        <div className="h-full w-full overflow-hidden">
          <div
            className="flex h-full w-[200%] transition-transform duration-300 ease-out"
            style={{
              transform: currentTab === 'projects' ? 'translateX(-50%)' : 'translateX(0)',
            }}
          >
            <div className="w-1/2 h-full flex-shrink-0 overflow-hidden">
              <NavCardCarousel items={imageItems} />
            </div>
            <div className="w-1/2 h-full flex-shrink-0 overflow-hidden">
              <NavCardCarousel items={projectItems} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer contact */}
      <footer className="px-5 pt-4 pb-10 border-t border-layer-3 bg-layer-bg">
        <p className="text-xs text-layer-5 mb-2">Want to have a chat?</p>
        <ul className="space-y-1">
          {[
            { label: 'andreas.mitchley@occstudio.com', href: 'mailto:andreas.mitchley@occstudio.com' },
            { label: 'LinkedIn', href: 'https://linkedin.com' },
            { label: 'Org nr: 932 150 840', href: null },
          ].map(({ label, href }) => (
            <li key={label} className="flex items-center">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-layer-6 hover:text-layer-8 transition-colors"
                >
                  [ {label} ]
                </a>
              ) : (
                <span className="text-xs text-layer-6">[ {label} ]</span>
              )}
            </li>
          ))}
        </ul>
      </footer>

      {/* Status pill — floating bottom-right */}
      <div
        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-layer-3 bg-layer-1"
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'hsl(var(--color-accent))' }} />
        <span className="text-xs text-layer-7 whitespace-nowrap">Currently working at Open Studio</span>
      </div>

    </div>
  )
}
