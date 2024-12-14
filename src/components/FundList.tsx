'use client'

import { useEffect, useState } from 'react'
import FundCard from './FundCard'
import FundModal from './FundModal'
import Pagination from './Pagination'
import { Fund } from '@prisma/client'

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

  useEffect(() => {
    async function loadFunds() {
      try {
        const response = await fetch(`/api/funds?page=${page}`)
        if (!response.ok) {
          throw new Error('Failed to fetch funds')
        }
        const data = await response.json()
        setFunds(data.funds)
        setTotalFunds(data.totalFunds)
        setTotalPages(data.totalPages)
        setInitialLoad(false)
      } catch (err) {
        console.error('Error loading funds:', err)
        setError('Erro ao carregar os fundos')
      } finally {
        setLoading(false)
      }
    }

    loadFunds()
  }, [page])

  if (error) {
    return (
      <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    )
  }

  if (loading && initialLoad) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Carregando fundos pela primeira vez...</p>
        <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
      </div>
    )
  }

  if (!funds.length) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600">Nenhum fundo encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {loading && !initialLoad && (
        <div className="fixed top-4 right-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-full shadow-lg">
          Atualizando...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {funds.map((fund) => (
          <FundCard
            key={fund.ticker}
            fund={fund}
            onClick={(fund) => setSelectedFund(fund)}
          />
        ))}
      </div>

      {selectedFund && (
        <FundModal
          fund={selectedFund}
          onClose={() => setSelectedFund(null)}
        />
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalFunds}
      />
    </div>
  )
}
