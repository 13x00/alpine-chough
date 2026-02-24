'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from '@carbon/icons-react'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
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
        'min-w-[48px] min-h-[48px] flex items-center justify-center',
        'text-layer-6 hover:text-layer-8 hover:bg-layer-3 transition-colors',
        'rounded-lg'
      )}
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
