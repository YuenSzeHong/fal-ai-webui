import './globals.css'
import { NotificationProvider } from '@/components/common/NotificationContext'
import { TranslationsProvider } from '@/components/TranslationsProvider'
import { QueryProvider } from '@/lib/query-client'
import type { Metadata } from 'next'

// Use system font stack as fallback for environments without internet access
const fontClassName = 'font-sans'

export const metadata: Metadata = {
  title: 'FAL.AI Web UI',
  description: 'Web interface for FAL.AI image and video generation models',
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params?: Promise<{ locale?: string }>
}) {
  // Next.js 15: params is now a Promise
  const { locale = 'en' } = params ? await params : {};
  
  return (
    <html lang={locale}>
      <body className={fontClassName}>
        <QueryProvider>
          <NotificationProvider>
            <TranslationsProvider locale={locale}>
              <main className="min-h-screen">
                {children}
              </main>
            </TranslationsProvider>
          </NotificationProvider>
        </QueryProvider>
      </body>
    </html>
  )
} 