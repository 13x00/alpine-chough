'use client'

import { AboutSection } from '@/components/content/AboutSection'
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
  return (
    <div className="relative flex h-full min-h-0 flex-col gap-2">
      {/* About card */}
      <Surface as="section" padding="md" className="flex-1 min-h-[11.25rem] overflow-hidden">
        <AboutSection />
      </Surface>

      {/* Photos & collections list */}
      <Surface as="section" padding="none" className="flex-1 min-h-[11.25rem] overflow-y-auto">
        {/* data-nav-card covers the full list surface so row-gap clicks don't close the overlay */}
        <ul data-nav-card className="flex flex-col divide-y divide-border-subtle-00">
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
                    <span className="font-mono text-xl text-text-primary">
                      {rowNumber}
                    </span>
                    <span className="transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-sm text-text-secondary">
                    {item.category ?? 'Photo'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Surface>

      {/* Footer contact card */}
      <Surface as="footer" padding="md" className="shrink-0 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm text-text-secondary">Want to have a chat?</p>
          <ul className="space-y-1 text-sm text-text-primary">
            <li>
              <a
                href="mailto:andreas.mitchley@occstudio.com"
                className="transition-colors"
              >
                [ andreas.mitchley@occstudio.com ]
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
              >
                [ LinkedIn ]
              </a>
            </li>
            <li>
              <span>[ Org nr: 932 150 840 ]</span>
            </li>
          </ul>
        </div>

        <div className="status-pill inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm">
          <span>Alpine-Chough</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </Surface>
    </div>
  )
}
