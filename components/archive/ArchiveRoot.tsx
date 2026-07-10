'use client'

import { usePathname } from 'next/navigation'
import { ArchiveApp } from './ArchiveApp'

const archivePath = /^\/(?:p\/[^/]+|c\/[^/]+)?$/

export function ArchiveRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return archivePath.test(pathname) ? <ArchiveApp /> : children
}
