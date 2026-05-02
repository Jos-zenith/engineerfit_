import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ClientSessionProvider } from "@/components/session-provider"
import "./globals.css"

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  fallback: ['system-ui', 'arial'],
  preload: false,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  fallback: ['system-ui', 'monospace'],
  preload: false,
})

export const metadata: Metadata = {
  title: 'engineerfit',
  description:
    'Vernacular psychometric engine quantifying potential beyond language. IRT-adaptive assessments, cosine similarity matching, and precision placements for Tier-2/3 engineering students.',
  icons: {
    icon: '/pawn.jpg',
  },
}

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <ClientSessionProvider>
          {children}
        </ClientSessionProvider>
      </body>
    </html>
  )
}
