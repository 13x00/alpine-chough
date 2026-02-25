'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from '@carbon/icons-react'
import { cn } from '@/lib/utils'
import { applyCarbonTheme } from '@/lib/carbonTheme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initialTheme = savedTheme ?? 'dark'
    setTheme(initialTheme)
    document.documentElement.setAttribute('data-theme', initialTheme)
    applyCarbonTheme(initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    applyCarbonTheme(newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      data-ignore-outside="true"
      className={cn(
        'min-w-[3rem] min-h-[3rem] flex items-center justify-center',
        'text-layer-6 hover:text-layer-8 hover:bg-layer-3 transition-colors',
      )}
      style={{ borderRadius: '0.5rem' }}
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
