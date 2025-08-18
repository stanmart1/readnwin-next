import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Providers from './components/Providers'
import Head from './head'
import FontLoader from './components/FontLoader'
import PreloadDisabler from './components/PreloadDisabler'
// import { NavigationLoader } from '../components/ui/NavigationLoader'
import { ErrorBoundary } from '../components/ui/ErrorBoundary'
import FlutterwaveScriptLoader from '../components/FlutterwaveScriptLoader'
import { initializeSecurityPatches } from '@/utils/apply-security-patches'

export const metadata: Metadata = {
  title: 'ReadnWin - Your Digital Library',
  description: 'Discover, read, and manage your digital book collection with ReadnWin.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/site.webmanifest',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize security patches early
  await initializeSecurityPatches()
  
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <head>
        <Head />
      </head>
      <body className="font-sans">
        <PreloadDisabler />
        <FontLoader />
        <Providers session={session}>
          <ErrorBoundary>
            {/* <NavigationLoader /> */}
            <FlutterwaveScriptLoader />
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
