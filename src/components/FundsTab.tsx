'use client'

import { FundList } from '@/components/FundList'
import { SectorFilter } from '@/components/SectorFilter'
import { CompletenessFilter } from '@/components/CompletenessFilter'
import { RatesDisplay } from '@/components/RatesDisplay'

interface FundsTabProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export function FundsTab({ searchParams }: FundsTabProps) {
  return (
    <>
      <section className="pt-4 text-center space-y-4">
        <h1 className="text-4xl font-bold">Invest Tools</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto inherit">
          Analise Fundos Imobiliários de forma simples e rápida
        </p>
        <RatesDisplay />
      </section>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SectorFilter />
            <CompletenessFilter />
          </div>

          {/* Results */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Ativos Disponíveis</h2>
            <FundList searchParams={searchParams} />
          </div>
        </div>
      </main>
    </>
  )
}
