import type { Metadata, Viewport } from "next"
import { ClientSessionProvider } from "@/components/session-provider"
import "./globals.css"

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
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background text-foreground">
        <ClientSessionProvider>
          {children}
        </ClientSessionProvider>
      </body>
    </html>
  )
}
