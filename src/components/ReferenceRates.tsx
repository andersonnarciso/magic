'use client'

import { useEffect, useState } from 'react'

interface ReferenceRates {
  SELIC?: number;
  CDI?: number;
}

export default function ReferenceRates() {
  const [rates, setRates] = useState<ReferenceRates>({})

  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await fetch('/api/rates', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch rates')
        }
        const data = await response.json()
        setRates(data)
      } catch (error) {
        console.error('Error fetching rates:', error)
      }
    }

    fetchRates()
  }, [])

  return (
    <>
      <div className="text-center">
        <div className="text-sm text-gray-600">SELIC</div>
        <div className="font-semibold">{rates.SELIC?.toFixed(2)}%</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600">CDI</div>
        <div className="font-semibold">{rates.CDI?.toFixed(2)}%</div>
      </div>
    </>
  )
}
