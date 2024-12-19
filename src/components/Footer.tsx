import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-12 border-t mt-auto">
      <div className="container-custom mx-auto max-w-[1600px] py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
                <a 
                  href="https://brapi.dev" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-blue-600"
                >
                  BRAPI - API de Dados
                </a>
              </li>
              <li>
                <a 
                  href="https://www.b3.com.br/pt_br/produtos-e-servicos/negociacao/renda-variavel/fundos-de-investimentos/fii/fiis-listados/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-blue-600"
                >
                  FIIs Listados na B3
                </a>
              </li>
              <li>
                <a 
                  href="https://www.gov.br/cvm/pt-br" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-blue-600"
                >
                  CVM
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/termos-de-uso"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  href="/politica-de-privacidade"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link 
                  href="/politicas-do-google-adsense"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Políticas do Google AdSense
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 text-center text-gray-600 h-16 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Efeito Bola de Neve. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
