import type { Metadata } from 'next'
import { Roboto, Roboto_Mono } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-sans',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Alpine Chough | Portfolio',
  description: 'Personal hub and archive for design projects, articles, and photography',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${roboto.variable} ${robotoMono.variable}`}
    >
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
