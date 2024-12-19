'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
}

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems }: PaginationProps) {
  const getPageNumbers = () => {
    const delta = 2; // Número de páginas para mostrar antes e depois da página atual
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach(i => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <p className="text-sm text-gray-700">
        Mostrando <span className="font-medium">{totalItems}</span> fundos
      </p>
      <div className="flex justify-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Anterior
        </button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`dots-${index}`} className="px-3 py-1">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(Number(page))}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          Próxima
        </button>
      </div>
    </div>
  )
}
