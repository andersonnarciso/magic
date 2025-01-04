'use client'

import { Fund } from '@prisma/client'
import FundCard from './FundCard'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FundModal from './FundModal'
import Pagination from './Pagination'
import Link from 'next/link'

interface FundListProps {
  page?: number
  itemsPerPage?: number
  search?: string
  orderBy?: string
  sector?: string
  dividend?: string
  completeness?: string
}

export default function FundList({ 
  page = 1, 
  itemsPerPage = 8, 
  search = '', 
  orderBy = '', 
  sector = 'all',
  dividend = '',
  completeness = 'all'
}: FundListProps) {
  const [funds, setFunds] = useState<Fund[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalFunds, setTotalFunds] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null)
  const [updatingFunds, setUpdatingFunds] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const fetchFunds = async () => {
      setLoading(true);
      try {
        console.log('Fetching funds...');
        const params = new URLSearchParams()
        
        params.set('page', String(page))
        params.set('itemsPerPage', String(itemsPerPage))
        params.set('search', search)
        params.set('orderBy', orderBy)
        params.set('sector', sector)
        params.set('dividend', dividend)
        params.set('completeness', completeness)

        console.log('API URL:', `/api/funds?${params.toString()}`)

        const response = await fetch(`/api/funds?${params.toString()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        const data = await response.json();
        console.log('Received funds:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch funds')
        }
        
        setFunds(data.items || [])
        setTotalPages(data.totalPages || 1)
        setTotalFunds(data.totalItems || 0)
      } catch (error) {
        console.error('Error fetching funds:', error)
        setError('Failed to load funds')
      } finally {
        setLoading(false)
      }
    }

    fetchFunds()
  }, [page, itemsPerPage, search, orderBy, sector, dividend, completeness])

  const handleFundClick = (fund: Fund) => {
    setSelectedFund(fund)
  }

  const handleCloseModal = () => {
    setSelectedFund(null)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set('page', newPage.toString())
    router.push(`/?${params.toString()}`)
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
