'use client'

import { Fund } from '@prisma/client'
import FundCard from './FundCard'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FundModal from './FundModal'
import Pagination from './Pagination'

interface FundListProps {
  initialFunds: Fund[]
}

export default function FundList({ initialFunds }: FundListProps) {
  const [funds, setFunds] = useState<Fund[]>(initialFunds || [])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFunds, setTotalFunds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingState, setLoadingState] = useState('Consultando integração...')
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [updatingFunds, setUpdatingFunds] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setLoading(true)
        const searchTerm = searchParams.get('search') || ''
        
        // Primeira carga: mostra sequência de mensagens
        if (page === 1 && isFirstLoad) {
          const response = await fetch(`/api/funds?page=${page}&search=${searchTerm}`)
          const data = await response.json()
          
          setLoadingState('Armazenando no banco de dados...')
          await new Promise(resolve => setTimeout(resolve, 800))
          
          setLoadingState('Concluído!')
          setFunds(data.funds || [])
          setTotalPages(data.totalPages || 1)
          setTotalFunds(data.totalFunds || 0)
          setIsFirstLoad(false)
          setLoading(false)

          // Força atualização em background apenas na primeira carga
          setUpdatingFunds(true)
          fetch(`/api/funds?page=${page}&search=${searchTerm}&forceUpdate=true`)
            .then(res => res.json())
            .then(data => {
              setFunds(data.funds)
              setTotalPages(data.totalPages)
              setTotalFunds(data.totalFunds)
              setUpdatingFunds(false)
            })
            .catch(error => {
              console.error(error)
              setUpdatingFunds(false)
            })
        } else {
          // Outras páginas: loading simples
          const response = await fetch(`/api/funds?page=${page}&search=${searchTerm}`)
          const data = await response.json()
          setFunds(data.funds || [])
          setTotalPages(data.totalPages || 1)
          setTotalFunds(data.totalFunds || 0)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching funds:', error)
        setFunds([])
        setLoading(false)
      }
    }

    fetchFunds()
  }, [page, searchParams, isFirstLoad])

  const handleFundClick = (fund: Fund) => {
    setSelectedFund(fund)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleCloseModal = () => {
    setSelectedFund(null)
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {loading ? (
          // Skeleton cards
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-36"></div>
              </div>
            </div>
          ))
        ) : funds && funds.length > 0 ? (
          funds.map((fund) => (
            <FundCard 
              key={fund.id} 
              fund={fund} 
              onClick={() => handleFundClick(fund)} 
              isUpdating={updatingFunds}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            Nenhum fundo encontrado
          </div>
        )}
      </div>

      {loading && page === 1 && isFirstLoad && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-60">
          <div className="text-lg font-semibold text-gray-600 mb-4">{loadingState}</div>
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="mt-8">
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={handlePageChange}
          totalItems={totalFunds}
        />
      </div>

      {selectedFund && (
        <FundModal fund={selectedFund} onClose={handleCloseModal} />
      )}
    </div>
  )
}
