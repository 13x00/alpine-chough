'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from '@carbon/icons-react'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initialTheme = savedTheme ?? 'dark'
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      data-ignore-outside="true"
      className={cn(
        'touch-target flex items-center justify-center rounded-lg',
        'text-text-helper hover:text-text-primary hover:bg-layer-hover-01 transition-colors',
      )}
      style={{ borderRadius: 'var(--radius-control)' }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-current" />
      ) : (
        <Moon size={20} className="text-current" />
      )}
    </button>
  )
}
