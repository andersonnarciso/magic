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
            R$ {fund.currentPrice?.toFixed(2) ?? 'N/A'}
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-xs text-gray-500 mb-1">Último Dividendo</p>
          <p className="font-semibold text-gray-900">
            R$ {fund.lastDividend?.toFixed(2) ?? 'N/A'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Rendimento Mensal
          </span>
          <span className="text-sm font-semibold text-green-600">
            {((fund.lastDividend || 0) / (fund.currentPrice || 1) * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}
