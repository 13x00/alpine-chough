import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Serve shareable /p/* and /c/* URLs from the home page — avoids App Router segment changes. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (/^\/p\/[^/]+$/.test(pathname) || /^\/c\/[^/]+$/.test(pathname)) {
    return NextResponse.rewrite(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/p/:path*', '/c/:path*'],
}
