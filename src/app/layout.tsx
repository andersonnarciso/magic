import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Efeito Bola de Neve - Calculadora de FIIs',
  description: 'Encontre os melhores Fundos de Investimento Imobiliário para sua estratégia de Bola de Neve',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <div className="container-custom">
            <main className="flex-grow py-8">
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  )
}
