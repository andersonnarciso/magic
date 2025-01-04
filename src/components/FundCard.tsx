'use client'

import { Fund } from '@prisma/client'
import { formatCurrency, formatPercent, formatPercentDirect } from '../lib/format'
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
    switch (type?.trim()) {
      case 'Energia':
        return 'border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80'
      case 'FiAgro':
        return 'border-transparent bg-green-600 text-white hover:bg-green-600/80'
      case 'Híbrido':
        return 'border-transparent bg-lime-500 text-white hover:bg-lime-500/80'
      case 'Logística':
        return 'border-transparent bg-orange-500 text-white hover:bg-orange-500/80'
      case 'Shopping':
        return 'border-transparent bg-pink-500 text-white hover:bg-pink-500/80'
      case 'Lajes Corporativas':
        return 'border-transparent bg-cyan-500 text-white hover:bg-cyan-500/80'
      case 'Papel':
        return 'border-transparent bg-blue-500 text-white hover:bg-blue-500/80'
      case 'FOF':
        return 'border-transparent bg-purple-500 text-white hover:bg-purple-500/80'
      case 'Hospitalar':
        return 'border-transparent bg-red-500 text-white hover:bg-red-500/80'
      case 'Educacional':
        return 'border-transparent bg-indigo-500 text-white hover:bg-indigo-500/80'
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

  const formatAbbreviatedValue = (value: number | null) => {
    if (!value) return 'N/A';
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M`;
    }
    if (value >= 1e3) {
      return `${(value / 1e3).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow h-full flex flex-col"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{fund.ticker}</h2>
          <Badge 
            className={cn(getBadgeColor(fund.type))}
          >
            {fund.type || 'N/A'}
          </Badge>
        </div>
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

          <div>
            <p className="text-sm text-muted-foreground">P/VP</p>
            {isUpdating ? (
              <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />
            ) : (
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
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Último Pagamento</p>
            {isUpdating ? (
              <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />
            ) : (
              <p className="font-medium">
                {fund.lastDividend ? formatCurrency(fund.lastDividend) : 'N/A'}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Dividend Yield</p>
            {isUpdating ? (
              <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />
            ) : (
              <p className="font-medium">
                {fund.dividendYield ? formatPercentDirect(fund.dividendYield / 100) : 'N/A'}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Valor de Mercado</p>
            {isUpdating ? (
              <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />
            ) : (
              <p className="font-medium">
                {formatAbbreviatedValue(fund.marketValue)}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Patrimônio</p>
            {isUpdating ? (
              <div className="h-6 w-20 animate-pulse bg-gray-200 rounded" />
            ) : (
              <p className="font-medium">
                {formatAbbreviatedValue(fund.netWorth)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button 
              onClick={onClick} 
              variant="default" 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-500/80 text-white w-full"
            >
              Magic Number
            </Button>
            <Link href={`/fund/${fund.ticker}`} className="group w-full">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 w-full bg-gray-50"
              >
                Conheça
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
