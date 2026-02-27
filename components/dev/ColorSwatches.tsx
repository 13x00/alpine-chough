import React from 'react'

const palettes: { name: string; steps: number[] }[] = [
  { name: 'warm-gray', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  { name: 'gray', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  { name: 'cool-gray', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  { name: 'blue', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  { name: 'cyan', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  { name: 'teal', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  { name: 'green', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  { name: 'red', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  { name: 'orange', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  { name: 'magenta', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
  { name: 'purple', steps: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
]

export function ColorSwatches() {
  return (
    <div className="space-y-8">
      {palettes.map((palette) => (
        <section key={palette.name} className="space-y-2">
          <h2 className="text-sm font-medium text-text-primary">
            Carbon {palette.name} scale
          </h2>
          <div className="flex flex-wrap gap-2">
            {palette.steps.map((step) => (
              <div
            key={step}
            className="flex flex-col items-center text-xs text-text-primary"
          >
                <div
                  className="h-10 w-10 rounded-md border border-border-subtle-01"
                  style={{
                    backgroundColor: `var(--cds-${palette.name}-${step})`,
                  }}
                />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

