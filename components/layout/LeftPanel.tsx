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
      <section className="flex-1 min-h-[180px] rounded-lg bg-layer-2 border border-layer-3 px-6 py-6 overflow-hidden">
        <AboutSection />
      </section>

      {/* Project list card */}
      <section className="flex-1 min-h-[220px] rounded-lg bg-layer-2 border border-layer-3 overflow-y-auto">
        <ul className="flex flex-col divide-y divide-layer-3">
          {projectItems.map((item, index) => {
            const rowNumber = String(index + 1).padStart(2, '0')
            const isStriped = index % 2 === 1

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={item.onClick}
                  className={`flex h-12 w-full items-center justify-between px-6 text-left text-xs md:text-sm transition-colors ${
                    isStriped ? 'bg-layer-surface/80 hover:bg-layer-surface' : 'hover:bg-layer-surface/60'
                  }`}
                >
                  <div className="flex items-center gap-6 text-layer-6">
                    <span className="font-mono text-[13px]">{rowNumber}</span>
                    <span className="text-layer-7">{item.title}</span>
                  </div>
                  <span className="text-[11px] md:text-xs text-layer-6">
                    {item.category ?? 'Project'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Footer contact card */}
      <footer className="rounded-lg bg-layer-2 border border-layer-3 px-6 py-6 flex items-end justify-between">
        <div>
          <p className="mb-2 text-xs text-layer-6">Want to have a chat?</p>
          <ul className="space-y-1 text-xs text-layer-7">
            <li>
              <a
                href="mailto:andreas.mitchley@occstudio.com"
                className="hover:text-layer-8 transition-colors"
              >
                [ andreas.mitchley@occstudio.com ]
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-layer-8 transition-colors"
              >
                [ LinkedIn ]
              </a>
            </li>
            <li>
              <span>[ Org nr: 932 150 840 ]</span>
            </li>
          </ul>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[#684e00] bg-[#302400] px-4 py-2 text-[13px] text-[#fccd27]">
          <span className="text-[#fccd27]">//</span>
          <span>Alpine-Chough</span>
        </div>
      </footer>
    </div>
  )
}
