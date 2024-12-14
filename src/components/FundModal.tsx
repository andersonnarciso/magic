import { Fund } from '@prisma/client'

interface FundModalProps {
  fund: Fund
  onClose: () => void
}

export default function FundModal({ fund, onClose }: FundModalProps) {
  const calculateMagicNumber = (monthlyIncome: number) => {
    const monthlyDividend = fund.lastDividend || 0
    if (monthlyDividend <= 0) return 0
    return Math.ceil((monthlyIncome / monthlyDividend) * (fund.currentPrice || 0))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{fund.ticker}</h2>
              <p className="text-gray-600">{fund.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Fechar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações principais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Preço Atual</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {fund.currentPrice?.toFixed(2) ?? 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Último Dividendo</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {fund.lastDividend?.toFixed(2) ?? 'N/A'}
              </p>
            </div>
          </div>

          {/* Calculadora do Número Mágico */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Calculadora do Número Mágico
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-blue-700 mb-2">
                  Rendimento Mensal Desejado
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[1000, 5000, 10000].map((value) => (
                    <div key={value} className="bg-white p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-600 mb-1">
                        R$ {value.toLocaleString()}
                      </p>
                      <p className="font-bold text-blue-600">
                        {calculateMagicNumber(value).toLocaleString()} cotas
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Rendimento Mensal
              </h4>
              <p className="text-2xl font-bold text-green-600">
                {((fund.lastDividend || 0) / (fund.currentPrice || 1) * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Última Atualização
              </h4>
              <p className="text-gray-600">
                {new Date(fund.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
