import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function yearFromDate(date?: string | null): string | undefined {
  if (!date) return undefined
  const year = new Date(date).getFullYear()
  return Number.isNaN(year) ? undefined : String(year)
}
