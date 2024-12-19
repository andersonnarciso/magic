import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '../lib/utils'
import { TooltipProvider } from '../components/ui/tooltip'
import './globals.css'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ferramentas FII',
  description: 'Ferramentas para análise de Fundos de Investimento Imobiliário',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <Header />
        <TooltipProvider>
          <main className="flex-1">
            {children}
          </main>
        </TooltipProvider>
        <Footer />
      </body>
    </html>
  )
}
