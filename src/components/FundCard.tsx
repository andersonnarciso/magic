'use client'

import { Fund } from '@prisma/client'
import { formatCurrency, formatPercent } from '../lib/format'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import Link from 'next/link'
import { cn } from '../lib/utils'
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip'
import { Info } from './ui/icons'

interface FundCardProps {
  fund: Fund
  onClick: () => void
  isUpdating?: boolean
}

export default function FundCard({ fund, onClick, isUpdating }: FundCardProps) {
  const getBadgeColor = (type: string | null) => {
    switch (type) {
      case 'Energia':
        return 'border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80'
      case 'Agro':
        return 'border-transparent bg-green-600 text-white hover:bg-green-600/80'
      case 'Híbrido':
        return 'border-transparent bg-lime-500 text-white hover:bg-lime-500/80'
      case 'Tijolo':
        return 'border-transparent bg-orange-500 text-white hover:bg-orange-500/80'
      case 'Papel':
        return 'border-transparent bg-blue-500 text-white hover:bg-blue-500/80'
      case 'FOF':
        return 'border-transparent bg-purple-500 text-white hover:bg-purple-500/80'
      default:
        return 'border-transparent bg-gray-500 text-white hover:bg-gray-500/80'
    }
  }

  const getPvpColor = (pvp: number | null) => {
    if (!pvp) return ''
    if (pvp < 1) return 'text-green-600'
    if (pvp > 3) return 'text-red-600'
    return 'text-gray-900'
  }

  const getPvpTooltip = (pvp: number | null) => {
    if (!pvp) return '';
    
    if (pvp < 1) {
      return 'Negociado abaixo do que vale no papel, ou seja, com desconto.';
    } else if (pvp === 1) {
      return 'O preço está igual ao valor real do patrimônio.';
    } else {
      return 'Custando mais do que o valor do patrimônio, ou seja, está com um preço premium.';
    }
  };

  const getTooltipColor = (pvp: number | null) => {
    if (!pvp) return 'text-gray-500';
    if (pvp < 1) return 'text-green-500 hover:text-green-600';
    if (pvp === 1) return 'text-blue-500 hover:text-blue-600';
    return 'text-yellow-500 hover:text-yellow-600';
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow h-full flex flex-col"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{fund.ticker}</CardTitle>
          <Badge 
            className={cn(getBadgeColor(fund.type))}
          >
            {fund.type || 'N/A'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2" title={fund.name}>
          {fund.name}
        </p>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Preço</p>
            {isUpdating ? (
              <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />
            ) : (
              <p className="font-medium">
                {formatCurrency(fund.currentPrice || 0)}
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-500">P/VP</span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${getPvpColor(fund.pvp)}`}>
                {fund.pvp ? fund.pvp.toFixed(2) : 'N/A'}
              </span>
              {fund.pvp && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="cursor-help">
                      <Info size={16} className={getTooltipColor(fund.pvp)} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    className="bg-white border border-gray-200 shadow-lg p-3 rounded-lg w-64 text-sm text-gray-700"
                    side="right"
                  >
                    <p className="leading-relaxed">{getPvpTooltip(fund.pvp)}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Último Rendimento</p>
            {isUpdating ? (
              <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />
            ) : (
              <p className="font-medium">
                {formatCurrency(fund.lastDividend || 0)}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Dividend Yield</p>
            {isUpdating ? (
              <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />
            ) : (
              <p className="font-medium">
                {formatPercent(fund.dividendYield || 0)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button onClick={onClick} variant="primary" size="sm" className="bg-blue-500 hover:bg-blue-500/80 text-white">
              Magic Number
            </Button>
            <Link href={`/fund/${fund.ticker}`} className="group">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-1"
              >
                Conheça o fundo
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transform transition-transform group-hover:translate-x-1"
                >
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
