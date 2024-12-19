'use client'

import { useEffect, useState } from 'react'
import FundCard from './FundCard'
import FundModal from './FundModal'
import Pagination from './Pagination'
import { Fund } from '@prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'

interface FundListProps {
  page: number
}

export default function FundList({ page }: FundListProps) {
  const [funds, setFunds] = useState<Fund[]>([])
  const [totalFunds, setTotalFunds] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialLoad, setInitialLoad] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function loadFunds() {
      try {
        const params = new URLSearchParams(searchParams.toString())
        const perPage = params.get('perPage') || '8'
        const currentSearch = params.get('search') || ''
        const orderBy = params.get('orderBy') || 'ticker'
        const order = params.get('order') || 'asc'
        
        const response = await fetch(
          `/api/funds?page=${page}&perPage=${perPage}${currentSearch ? `&search=${currentSearch}` : ''}&orderBy=${orderBy}&order=${order}`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch funds')
        }
        const data = await response.json()
        setFunds(data.funds)
        setTotalFunds(data.totalFunds)
        setTotalPages(data.totalPages)
      } catch (err) {
        setError('Failed to load funds')
        console.error('Error loading funds:', err)
      } finally {
        setLoading(false)
        setInitialLoad(false)
      }
    }

    loadFunds()
  }, [page, searchParams])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/?${params.toString()}`)
  }

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const currentOrderBy = params.get('orderBy') || 'ticker'
    const currentOrder = params.get('order') || 'asc'
    
    if (currentOrderBy === field) {
      // Se já estiver ordenando por este campo, inverte a ordem
      params.set('order', currentOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Se for um novo campo, começa com ordem ascendente
      params.set('orderBy', field)
      params.set('order', 'asc')
    }
    
    params.set('page', '1') // Volta para a primeira página ao mudar a ordenação
    router.push(`/?${params.toString()}`)
  }

  const handleFundClick = async (fund: Fund) => {
    try {
      const response = await fetch(`/api/funds/${fund.ticker}`)
      if (!response.ok) {
        throw new Error('Failed to fetch fund details')
      }
      const updatedFund = await response.json()
      
      setFunds(currentFunds => 
        currentFunds.map(f => 
          f.ticker === updatedFund.ticker ? updatedFund : f
        )
      )
      
      setSelectedFund(updatedFund)
    } catch (err) {
      console.error('Error fetching fund details:', err)
      setSelectedFund(fund)
    }
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  if (loading && initialLoad) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const currentOrderBy = searchParams.get('orderBy') || 'ticker'
  const currentOrder = searchParams.get('order') || 'asc'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => handleSort('ticker')}
          className={`px-4 py-2 rounded ${
            currentOrderBy === 'ticker' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Ticker {currentOrderBy === 'ticker' && (currentOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('currentPrice')}
          className={`px-4 py-2 rounded ${
            currentOrderBy === 'currentPrice' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Preço {currentOrderBy === 'currentPrice' && (currentOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('lastDividend')}
          className={`px-4 py-2 rounded ${
            currentOrderBy === 'lastDividend' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Dividendo {currentOrderBy === 'lastDividend' && (currentOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {funds.map((fund) => (
          <FundCard
            key={fund.ticker}
            fund={fund}
            onClick={() => handleFundClick(fund)}
          />
        ))}
      </div>
      
      {selectedFund && (
        <FundModal
          fund={selectedFund}
          onClose={() => setSelectedFund(null)}
        />
      )}

      <div className="mt-8">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalFunds}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
