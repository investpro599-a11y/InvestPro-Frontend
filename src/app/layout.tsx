import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import '../index.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'InvestPro - Premium Investment Portfolio Platform',
  description: 'Track your investments, manage your portfolio, and maximize returns with InvestPro.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className={`${inter.className} antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 