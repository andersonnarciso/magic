'use client'

import { Fund } from '@prisma/client'
import { useState, useEffect } from 'react'

interface FundModalProps {
  fund: Fund
  onClose: () => void
}

export default function FundModal({ fund, onClose }: FundModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingState, setLoadingState] = useState('Consultando integração...')

  useEffect(() => {
    const loadingStates = [
      { text: 'Calculando Magic Number...', time: 0 },
      { text: 'Simulando Renda Passiva para Independência Financeira...', time: 1000 },
      { text: 'Concluído!', time: 2000 },
    ]

    loadingStates.forEach(({ text, time }) => {
      setTimeout(() => setLoadingState(text), time)
    })

    setTimeout(() => setIsLoading(false), 2500)
  }, [])

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDY = (value: number | null) => {
    if (value == null) return '-'
    return value === 0 ? '0,00%' : `${(value * 100).toFixed(2)}%`
  }

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {/* Informações principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>

      {/* Efeito Bola de Neve */}
      <div className="bg-green-50 p-4 rounded-lg mt-4">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="bg-white p-4 rounded-lg">
          <div className="h-10 bg-gray-200 rounded w-32 mx-auto mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Renda Passiva */}
      <div className="bg-blue-50 p-4 rounded-lg mt-4">
        <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-40 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 w-full">
              <div className="flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900">{fund.ticker}</h2>
                <p className="text-sm text-gray-600">{fund.name}</p>
              </div>
              {/* Espaço para Google AdSense */}
              <div className="bg-gray-100 border border-gray-200 rounded px-3 py-2 text-xs text-gray-500 hidden md:block flex-grow">
                <div className="h-[50px] flex items-center justify-center">
                  Anúncio
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 flex-shrink-0 ml-4"
            >
              <span className="sr-only">Fechar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 relative">
          <div className={isLoading ? 'opacity-20' : ''}>
            <LoadingSkeleton />
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80">
              <div className="text-lg font-semibold text-gray-600 mb-4">{loadingState}</div>
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Informações principais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Preço Atual</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(fund.currentPrice)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Último Dividendo</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(fund.lastDividend)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {fund.lastDividendDate ? new Date(fund.lastDividendDate).toLocaleDateString('pt-BR') : 'Não pago'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Dividend Yield (Anual)</p>
                  <p className={`text-lg font-bold ${!fund.dividendYield || fund.dividendYield === 0 ? 'text-gray-400' : 'text-green-600'}`}>
                    {formatDY(fund.dividendYield)}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Rendimento Mensal</p>
                  <p className={`text-lg font-bold ${!fund.dividendYield || fund.dividendYield === 0 ? 'text-gray-400' : 'text-green-600'}`}>
                    {fund.dividendYield ? `${((fund.dividendYield / 12) * 100).toFixed(2)}%` : '-'}
                  </p>
                </div>
              </div>

              {/* Efeito Bola de Neve */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3 text-center">
                  Efeito Bola de Neve - Magic Number
                </h3>
                <div className="bg-white p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600 mb-3">
                    {Math.ceil(fund.currentPrice / (fund.lastDividend || 1)).toLocaleString()} cotas
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Para iniciar o efeito bola de neve com <span className="font-bold">{fund.ticker}</span>, você precisará de <span className="font-bold">{Math.ceil(fund.currentPrice / (fund.lastDividend || 1)).toLocaleString()} cotas</span>, 
                    o que representa um investimento aproximado de <span className="font-bold">{formatCurrency(Math.ceil(fund.currentPrice / (fund.lastDividend || 1)) * (fund.currentPrice || 0))}</span>.
                    Com este investimento, seus dividendos mensais serão de <span className="font-bold">{formatCurrency(Math.ceil(fund.currentPrice / (fund.lastDividend || 1)) * (fund.lastDividend || 0))}</span>, 
                    permitindo que você compre uma nova cota todo mês apenas com os rendimentos.
                  </p>
                </div>
              </div>

              {/* Renda Passiva */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 text-center">
                  Renda Passiva para Independência Financeira
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1000, 5000, 10000].map((value) => {
                    const cotas = Math.ceil((value / (fund.lastDividend || 1)))
                    return (
                      <div key={value} className="bg-white p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Para receber
                          <br />
                          <span className="font-bold">{formatCurrency(value)}</span> por mês
                        </p>
                        <p className="font-bold text-blue-600 text-xl">
                          {cotas.toLocaleString()} cotas
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Investimento: <span className="font-bold">{formatCurrency(cotas * (fund.currentPrice || 0))}</span>
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
