'use client'

import { ArchiveApp } from './ArchiveApp'

/** Single-route shell — shareable paths are handled client-side via history API. */
export function ArchiveRoot(_props: { children: React.ReactNode }) {
  return <ArchiveApp />
}
