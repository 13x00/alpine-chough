'use client'

import { useEffect, useRef } from 'react'
import { Folder, Image as ImageIcon } from '@carbon/icons-react'
import { AboutSection } from '@/components/content/AboutSection'
import { FooterCard } from '@/components/layout/FooterCard'
import { preloadImage } from '@/lib/image-preload'
import { cn } from '@/lib/utils'
import type { ProjectListItem } from '@/types/content'

const rowOverlay =
  'pointer-events-none absolute inset-x-0 -top-px -bottom-px rounded-xs transition-opacity duration-fast ease-[var(--easing-standard)] motion-reduce:transition-none'

interface LeftPanelProps {
  projectItems: ProjectListItem[]
  selectedItemId?: string | null
  /** Hide about block (mobile detail states) */
  showAbout?: boolean
  /** Show list section */
  showList?: boolean
  variant?: 'desktop' | 'mobile'
  className?: string
}

export function LeftPanel({
  projectItems,
  selectedItemId = null,
  showAbout = true,
  showList = true,
  variant = 'desktop',
  className,
}: LeftPanelProps) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    projectItems.forEach((item) => {
      preloadImage(item.image)
    })
  }, [projectItems])

  useEffect(() => {
    if (!selectedItemId || !listRef.current) return
    const selected = listRef.current.querySelector<HTMLElement>('[data-selected="true"]')
    selected?.focus({ preventScroll: false })
  }, [selectedItemId])

  const isMobile = variant === 'mobile'

  return (
    <div className={cn('relative flex min-h-0 flex-col gap-2', className)}>
      {showAbout && (
        <section className="shrink-0 rounded-base p-6">
          <AboutSection />
        </section>
      )}

      {showList && (
      <section className="flex min-h-[11.25rem] flex-1 flex-col overflow-y-auto rounded-base border border-border-subtle-00 bg-layer-01">
        <ul ref={listRef} data-nav-card className="flex w-full flex-col p-2">
          {projectItems.map((item, index) => {
            const rowNumber = String(projectItems.length - index).padStart(2, '0')
            const isCollection = item.category === 'Collection'
            const isSelected = selectedItemId === item.id

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={item.onClick}
                  onMouseEnter={() => preloadImage(item.image)}
                  onFocus={() => preloadImage(item.image)}
                  data-nav-card
                  data-selected={isSelected ? true : undefined}
                  className={cn(
                    'group relative h-12 w-full text-left text-text-primary',
                    'border-b border-border-subtle-00',
                    'focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
                    'hover:z-10',
                    isSelected && 'z-10 rounded-xs border-b-transparent',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      rowOverlay,
                      isSelected
                        ? 'bg-layer-active-01 opacity-100 transition-[background-color] duration-fast group-hover:bg-layer-active-02'
                        : 'bg-layer-hover-01 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
                    )}
                  />
                  <span
                    className={cn(
                      'relative z-10 flex h-full w-full items-center px-6',
                      isMobile ? 'gap-4' : 'gap-6',
                    )}
                  >
                    <div
                      className={cn(
                        'flex min-w-0 items-center',
                        isMobile ? 'min-w-0 flex-1 gap-6' : 'w-64 shrink-0 gap-6',
                      )}
                    >
                      <span className="shrink-0 font-mono text-base leading-normal text-text-secondary">
                        {rowNumber}
                      </span>
                      <span className="min-w-0 truncate text-base leading-normal text-text-primary">
                        {item.title}
                      </span>
                    </div>
                    {!isMobile && (
                      <>
                        <span className="min-w-0 flex-1 font-mono text-base leading-normal text-text-primary">
                          {item.year ?? ''}
                        </span>
                        <span className="flex shrink-0 items-center justify-end text-base text-text-secondary">
                          {isCollection ? (
                            <Folder aria-label="Collection" className="size-[1em]" />
                          ) : (
                            <ImageIcon aria-label="Photo" className="size-[1em]" />
                          )}
                        </span>
                      </>
                    )}
                    {isMobile && (
                      <span className="shrink-0 font-mono text-base leading-normal text-text-primary">
                        {item.year ?? ''}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
      )}

      <FooterCard />
    </div>
  )
}
