'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, totalItems, onPageChange }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/?${params.toString()}`)
  }

  // Função para gerar o array de páginas a serem mostradas
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    const halfVisible = Math.floor(maxVisiblePages / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Ajusta o startPage se estiver próximo do final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm text-gray-600">
        Mostrando {Math.min(20, totalItems)} de {totalItems} fundos
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`px-4 py-2 rounded-md ${
            currentPage <= 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Anterior
        </button>
        
        <div className="flex items-center space-x-1">
          {currentPage > 3 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                1
              </button>
              <span className="px-2">...</span>
            </>
          )}

          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-4 py-2 rounded-md ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {currentPage < totalPages - 2 && (
            <>
              <span className="px-2">...</span>
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`px-4 py-2 rounded-md ${
            currentPage >= totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Próxima
        </button>
      </div>
    </div>
  )
}
