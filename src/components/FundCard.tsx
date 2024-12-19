'use client'

import { Fund } from '@prisma/client'
import { useState } from 'react'

interface FundCardProps {
  fund: Fund
  onClick: (fund: Fund) => void
}

export default function FundCard({ fund, onClick }: FundCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/funds/${fund.ticker}`)
      if (!response.ok) {
        throw new Error('Failed to fetch fund details')
      }
      const updatedFund = await response.json()
      onClick(updatedFund)
    } catch (error) {
      console.error('Error fetching fund details:', error)
      onClick(fund) // Use existing data if update fails
    } finally {
      setIsLoading(false)
    }
  }

  // Calcula quanto tempo desde a última atualização
  const getUpdateTime = () => {
    const now = new Date()
    const updated = new Date(fund.updatedAt)
    const diff = now.getTime() - updated.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min atrás`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`
    return `${Math.floor(minutes / 1440)}d atrás`
  }

  // Formata a data do último dividendo
  const formatDividendDate = () => {
    if (!fund.lastDividendDate) return 'N/A'
    const date = new Date(fund.lastDividendDate)
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  // Formata valores monetários
  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return 'N/A'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Calcula o dividend yield mensal
  const calculateMonthlyYield = () => {
    if (!fund.lastDividend || !fund.currentPrice || fund.currentPrice <= 0) {
      return 'N/A'
    }
    const dividendYield = (fund.lastDividend / fund.currentPrice) * 100
    return `${dividendYield.toFixed(2)}%`
  }

  const dividendYield = fund.lastDividend && fund.currentPrice 
    ? ((fund.lastDividend * 12) / fund.currentPrice) * 100 
    : 0

  const formattedDividendYield = dividendYield.toFixed(2)
  const formattedLastDividend = fund.lastDividend?.toFixed(2) || '0.00'
  const formattedLastDividendDate = fund.lastDividendDate 
    ? new Date(fund.lastDividendDate).toLocaleDateString('pt-BR')
    : 'N/A'

  return (
    <div 
      onClick={handleClick}
      className={`
        bg-white rounded-lg shadow-lg p-6 
        hover:shadow-xl transition-all transform hover:-translate-y-1 
        cursor-pointer border border-gray-200
        ${isLoading ? 'opacity-70' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-blue-600">{fund.ticker}</h3>
          <p className="text-sm text-gray-500">{fund.name}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getUpdateTime()}
          </span>
          {isLoading && (
            <span className="text-xs text-blue-500 mt-1 animate-pulse">
              Atualizando...
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500 mb-1">Preço Atual</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(fund.currentPrice)}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500 mb-1">Último Dividendo</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(fund.lastDividend)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDividendDate()}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Dividend Yield Mensal
          </span>
          <span className={`text-sm font-semibold ${
            fund.lastDividend && fund.currentPrice 
              ? 'text-green-600' 
              : 'text-gray-500'
          }`}>
            {calculateMonthlyYield()}
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Último Dividendo</p>
          <p className="font-semibold">R$ {formattedLastDividend}</p>
          <p className="text-xs text-gray-400">{formattedLastDividendDate}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Dividend Yield (Anual)</p>
          <p className="font-semibold">{formattedDividendYield}%</p>
        </div>
      </div>
    </div>
  )
}
