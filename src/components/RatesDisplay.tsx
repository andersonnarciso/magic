'use client'

import { useEffect, useState } from 'react'

interface ReferenceRates {
  selic?: number
  cdi?: number
}

export function RatesDisplay() {
  const [rates, setRates] = useState<ReferenceRates>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRates() {
      try {
        const response = await fetch('/api/rates')
        const data = await response.json()
        setRates(data)
      } catch (error) {
        console.error('Erro ao buscar taxas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [])

  if (loading) {
    return null
  }

  return (
    <div className="flex gap-4 text-sm text-muted-foreground">
      {rates.selic !== undefined && (
        <div>
          SELIC: <span className="font-medium">{rates.selic.toFixed(2)}%</span>
        </div>
      )}
      {rates.cdi !== undefined && (
        <div>
          CDI: <span className="font-medium">{rates.cdi.toFixed(2)}%</span>
        </div>
      )}
    </div>
  )
}
