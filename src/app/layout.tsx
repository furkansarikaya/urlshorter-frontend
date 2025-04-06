import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import Navbar from '@/components/layout/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import QueryProvider from '@/components/QueryProvider'
import { Toaster } from '@/components/ui/toaster'
import { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Link from "next/link";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'URL Shortener',
  description: 'URL Kısaltma ve yönetme uygulaması',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(inter.className, "antialiased min-h-screen")}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ThemeProvider>
            <QueryProvider>
              <ErrorBoundary>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <footer className="py-6 md:px-8 md:py-0 border-t">
                    <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                      <p className="text-center text-sm text-muted-foreground md:text-left">
                        &copy; {new Date().getFullYear()} URL Shortener. All rights reserved.
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <Link href="/info" className="hover:text-foreground hover:underline">
                          Daha Fazla Bilgi
                        </Link>
                        <Link href="/contact" className="hover:text-foreground hover:underline">
                          İletişim
                        </Link>
                        <Link href="/privacy" className="hover:text-foreground hover:underline">
                          Gizlilik Politikası
                        </Link>
                        <Link href="/terms" className="hover:text-foreground hover:underline">
                          Kullanım Koşulları
                        </Link>
                      </div>
                    </div>
                  </footer>
                </div>
              </ErrorBoundary>
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
