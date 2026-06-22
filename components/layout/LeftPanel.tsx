'use client'

import { useEffect, useRef } from 'react'
import { Folder, Image } from '@carbon/icons-react'
import { AboutSection } from '@/components/content/AboutSection'
import { FooterCard } from '@/components/layout/FooterCard'
import { Surface } from '@/components/ui/Surface'

const prefetchedSrcs = new Set<string>()

function prefetchImage(src: string) {
  if (!src || prefetchedSrcs.has(src)) return
  prefetchedSrcs.add(src)
  const img = new window.Image()
  img.src = src.startsWith('http') ? src : `${typeof window !== 'undefined' ? window.location.origin : ''}${src}`
}

interface LeftPanelProps {
  projectItems: Array<{
    id: string
    title: string
    category?: string
    image: string
    onClick: () => void
  }>
  selectedItemId?: string | null
}

export function LeftPanel({ projectItems, selectedItemId = null }: LeftPanelProps) {
  const listRef = useRef<HTMLUListElement>(null)

  // When selectedItemId changes (e.g. arrow-key navigation from the right panel),
  // move focus to the newly selected button. This clears the stale ring on the old
  // item, keeps a single consistent indicator, and scrolls the row into view for
  // free. The RightPanel key handler is on `window` so it fires regardless of where
  // focus lives — moving focus here does not break keyboard navigation.
  useEffect(() => {
    if (!selectedItemId || !listRef.current) return
    const selected = listRef.current.querySelector<HTMLElement>('[data-selected="true"]')
    selected?.focus({ preventScroll: false })
  }, [selectedItemId])

  return (
    <div className="relative flex h-full min-h-0 flex-col gap-2">
      {/* About card */}
      <Surface as="section" padding="md" className="flex-1 min-h-[11.25rem] overflow-hidden">
        <AboutSection />
      </Surface>

      {/* Photos & collections list */}
      <Surface as="section" padding="xs" className="flex-1 min-h-[11.25rem] overflow-y-auto">
        {/* data-nav-card covers the full list surface so row-gap clicks don't close the overlay */}
        <ul ref={listRef} data-nav-card className="flex flex-col divide-y divide-border-subtle-00">
          {projectItems.map((item, index) => {
            const rowNumber = String(index + 1).padStart(2, '0')

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={item.onClick}
                  onMouseEnter={() => prefetchImage(item.image)}
                  onFocus={() => prefetchImage(item.image)}
                  data-nav-card
                  data-selected={selectedItemId === item.id ? true : undefined}
                  className={`group flex h-12 w-full items-center justify-between px-6 text-left text-base transition-colors text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus ${
                    selectedItemId === item.id
                      ? 'bg-layer-selected-01 hover:bg-layer-selected-hover-01'
                      : 'bg-layer-01 hover:bg-layer-hover-01'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-base text-text-secondary">
                      {rowNumber}
                    </span>
                    <span className="transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-text-secondary">
                    {item.category === 'Collection'
                      ? <Folder size={16} aria-label="Collection" />
                      : <Image size={16} aria-label="Photo" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Surface>

      <FooterCard />
    </div>
  )
}
