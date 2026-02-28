'use client'

import { AboutSection } from '@/components/content/AboutSection'

interface LeftPanelProps {
  projectItems: Array<{
    id: string
    title: string
    category?: string
    image: string
    onClick: () => void
  }>
}

export function LeftPanel({ projectItems }: LeftPanelProps) {
  return (
    <div className="relative flex h-full flex-col gap-2">
      {/* About card */}
      <section className="flex-1 min-h-[11.25rem] rounded-lg bg-layer-01 border border-border-subtle-00 px-6 py-6 overflow-hidden">
        <AboutSection />
      </section>

      {/* Project list card */}
      <section className="flex-1 min-h-[13.75rem] rounded-lg bg-layer-01 border border-border-subtle-00 overflow-y-auto">
        <ul className="flex flex-col divide-y divide-border-subtle-00">
          {projectItems.map((item, index) => {
            const rowNumber = String(index + 1).padStart(2, '0')

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={item.onClick}
                  className="group flex h-12 w-full items-center justify-between px-6 text-left text-base transition-colors bg-layer-01 hover:bg-layer-hover-01 text-text-primary"
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
                    {item.category ?? 'Project'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Footer contact card */}
      <footer className="rounded-lg bg-layer-01 border border-border-subtle-00 px-6 py-6 flex items-end justify-between">
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
      </footer>
    </div>
  )
}
