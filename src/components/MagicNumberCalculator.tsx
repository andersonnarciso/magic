'use client'

import { Fund } from '@/types/fund'
import { formatCurrency } from '@/lib/utils'
import { useMemo } from 'react'

interface MagicNumberCalculatorProps {
  fund: Fund
}

export default function MagicNumberCalculator({ fund }: MagicNumberCalculatorProps) {
  const magicNumber = useMemo(() => {
    if (!fund.currentPrice || !fund.lastDividend || fund.lastDividend === 0) {
      return null
    }
    // Número de cotas necessárias para que o dividendo mensal seja igual ao preço de uma nova cota
    return Math.ceil(fund.currentPrice / fund.lastDividend)
  }, [fund.currentPrice, fund.lastDividend])

  const totalInvestment = useMemo(() => {
    if (!magicNumber || !fund.currentPrice) {
      return null
    }
    return magicNumber * fund.currentPrice
  }, [magicNumber, fund.currentPrice])

  if (!magicNumber) {
    return (
      <div className="mt-4 p-4 bg-red-50 rounded-md">
        <p className="text-red-600">
          Não foi possível calcular o Magic Number devido à falta de dados ou dividendo zero.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-md">
      <h3 className="text-lg font-semibold mb-4">Resultado do Magic Number</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Cotas Necessárias:</span>
          <span className="font-medium">{magicNumber}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Investimento Total:</span>
          <span className="font-medium">{formatCurrency(totalInvestment)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Rendimento Mensal:</span>
          <span className="font-medium">{formatCurrency(fund.lastDividend * magicNumber)}</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
        <p className="text-sm text-blue-800">
          Com {magicNumber} cotas, seu rendimento mensal será suficiente para comprar uma nova cota!
        </p>
      </div>
    </div>
  )
}
