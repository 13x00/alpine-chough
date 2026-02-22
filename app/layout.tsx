import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Alpine Chough | Portfolio',
  description: 'Personal hub and archive for design projects, articles, and photography',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Set theme before paint to prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t||'dark');})()`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
