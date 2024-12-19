'use client'

import { Fund } from '@prisma/client'
import FundCard from './FundCard'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FundModal from './FundModal'
import Pagination from './Pagination'
import Link from 'next/link'

interface FundListProps {
  initialFunds: Fund[]
}

export default function FundList({ initialFunds }: FundListProps) {
  const [funds, setFunds] = useState<Fund[]>(initialFunds || [])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalFunds, setTotalFunds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [updatingFunds, setUpdatingFunds] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setLoading(true)
        const searchTerm = searchParams.get('search') || ''
        const perPage = '8'
        const orderBy = searchParams.get('orderBy') || ''
        const type = searchParams.get('type') || 'all'
        
        const response = await fetch(`/api/funds?page=${page}&search=${searchTerm}&perPage=${perPage}&orderBy=${orderBy}&type=${type}`)
        const data = await response.json()
        
        setFunds(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalFunds(data.pagination?.total || 0)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching funds:', error)
        setFunds([])
        setLoading(false)
      }
    }

    fetchFunds()
  }, [page, searchParams])

  const handleFundClick = (fund: Fund) => {
    setSelectedFund(fund)
  }

  const handleCloseModal = () => {
    setSelectedFund(null)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {loading ? (
          // Skeleton cards - 12 placeholders
          [...Array(12)].map((_, i) => (
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
