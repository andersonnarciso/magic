'use client'

import { Fund } from '@prisma/client'
import { formatCurrency, formatPercent } from '@/utils/format'

interface FundCardProps {
  fund: Fund
  onClick: () => void
  isUpdating?: boolean
}

export default function FundCard({ fund, onClick, isUpdating }: FundCardProps) {
  return (
    <div
      className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{fund.ticker}</h3>
        <span className="text-sm text-gray-500">{fund.sector}</span>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-2" title={fund.name}>
        {fund.name}
      </p>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Preço Atual:</span>
          <span className="font-medium">{formatCurrency(fund.currentPrice)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">P/VP:</span>
          {isUpdating ? (
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <span className={`font-medium ${fund.pvp && fund.pvp < 1 ? 'text-green-600' : 'text-gray-900'}`}>
              {fund.pvp ? fund.pvp.toFixed(2) : '-'}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Último Dividendo:</span>
          {isUpdating ? (
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <span className="font-medium">{formatCurrency(fund.lastDividend)}</span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Dividend Yield:</span>
          {isUpdating ? (
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <span className={`font-medium ${!fund.dividendYield || fund.dividendYield === 0 ? 'text-gray-400' : 'text-green-600'}`}>
              {formatPercent(fund.dividendYield)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
