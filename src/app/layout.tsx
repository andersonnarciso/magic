import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Efeito Bola de Neve - Calculadora de FIIs',
  description: 'Calcule o número mágico para seus investimentos em FIIs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">
        <div className="min-h-screen bg-gray-50">
          {/* Navbar */}
          <nav className="bg-white border-b border-gray-200">
            <div className="container-custom">
              <div className="relative flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-blue-600">
                    Efeito Bola de Neve
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    Sobre
                  </a>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    Como Funciona
                  </a>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container-custom py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="container-custom py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sobre</h3>
                  <p className="text-gray-600">
                    Calcule o número mágico para alcançar sua independência financeira através de Fundos Imobiliários.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="#" className="text-gray-600 hover:text-blue-600">
                        Como Calcular
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-gray-600 hover:text-blue-600">
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contato</h3>
                  <p className="text-gray-600">
                    Tem alguma dúvida? Entre em contato conosco.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-center text-gray-500">
                  {new Date().getFullYear()} Efeito Bola de Neve. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
