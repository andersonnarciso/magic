'use client'

import React, { useState } from 'react'
import FundList from '@/components/FundList'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Loading from './loading'
import { SectorFilter } from '@/components/SectorFilter';
import { CompletenessFilter } from '@/components/CompletenessFilter';
import { RatesDisplay } from '@/components/RatesDisplay';

interface HomeProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function Home({ searchParams }: HomeProps) {
  const page = Number(searchParams?.page) || 1
  const router = useRouter()
  const searchParamsObj = useSearchParams()

  const [itemsPerPage, setItemsPerPage] = useState('8')
  const [sortBy, setSortBy] = useState(searchParamsObj?.get('orderBy') || '')
  const [filterSector, setFilterSector] = useState(searchParamsObj?.get('sector') || 'all')
  const [filterDividend, setFilterDividend] = useState(searchParamsObj?.get('dividend') || '')
  const [search, setSearch] = useState(searchParamsObj?.get('search') || '')
  const [completeness, setCompleteness] = useState(searchParamsObj?.get('completeness') || '')

  const handleParamChange = (param: string, value: string) => {
    const params = new URLSearchParams(searchParamsObj?.toString())
    params.set(param, value)
    params.set('page', '1')
    router.push(`/?${params.toString()}`)
    
    switch(param) {
      case 'itemsPerPage':
        setItemsPerPage(value)
        break
      case 'orderBy':
        setSortBy(value)
        break
      case 'sector':
        setFilterSector(value)
        break
      case 'dividend':
        setFilterDividend(value)
        break
      case 'search':
        setSearch(value)
        break
      case 'completeness':
        setCompleteness(value)
        break
    }
  }

  return (
    <div className="w-full px-6 max-w-[1600px] mx-auto">
      {/* Hero Section */}
      <section className="pt-4 text-center space-y-4">
        <h1 className="text-4xl font-bold">Invest Tools</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto inherit">
          Analise Fundos Imobiliários de forma simples e rápida
        </p>
        <RatesDisplay />
      </section>

      {/* Main Content */}
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-[1600px]">
          <Suspense fallback={<Loading />}>
            <div className="bg-white shadow rounded-lg p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Ativos Disponíveis
                </h2>
                <div className="flex flex-wrap gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">Pesquisar</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Digite o nome ou código do fundo"
                        className="input max-w-xs pr-8"
                        value={search}
                        onChange={(e) => handleParamChange('search', e.target.value)}
                      />
                      {search && (
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => handleParamChange('search', '')}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">Ordenar por</label>
                    <select 
                      className="input max-w-xs"
                      value={sortBy}
                      onChange={(e) => handleParamChange('orderBy', e.target.value)}
                    >
                      <option value="">Selecione uma ordenação</option>
                      <option value="pvp:asc">P/VP - Menor</option>
                      <option value="pvp:desc">P/VP - Maior</option>
                      <option value="dividendYield:asc">Dividend Yield - Menor</option>
                      <option value="dividendYield:desc">Dividend Yield - Maior</option>
                      <option value="lastDividend:asc">Último Pagamento - Menor</option>
                      <option value="lastDividend:desc">Último Pagamento - Maior</option>
                      <option value="marketValue:asc">Valor de Mercado - Menor</option>
                      <option value="marketValue:desc">Valor de Mercado - Maior</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">Setor</label>
                    <select 
                      className="input max-w-xs"
                      value={filterSector}
                      onChange={(e) => handleParamChange('sector', e.target.value)}
                    >
                      <option value="all">Todos os setores</option>
                      <option value="Logística">Logística</option>
                      <option value="Hospitalar">Hospitalar</option>
                      <option value="Papel">Papel</option>
                      <option value="Híbrido">Híbrido</option>
                      <option value="Shopping">Shopping</option>
                      <option value="FiAgro">FiAgro</option>
                      <option value="Educacional">Educacional</option>
                      <option value="Lajes Corporativas">Lajes Corporativas</option>
                      <option value="FOF">Fundo de Fundos</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">Qualidade dos Dados</label>
                    <select 
                      className="input max-w-xs"
                      value={completeness}
                      onChange={(e) => handleParamChange('completeness', e.target.value)}
                    >
                      <option value="all">Todos os fundos</option>
                      <option value="complete">Dados completos</option>
                      <option value="partial">Dados parciais</option>
                      <option value="incomplete">Dados básicos</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">Itens por página</label>
                    <select 
                      className="input max-w-xs"
                      value={itemsPerPage}
                      onChange={(e) => handleParamChange('itemsPerPage', e.target.value)}
                    >
                      <option value="8">8</option>
                      <option value="16">16</option>
                      <option value="24">24</option>
                      <option value="32">32</option>
                      <option value="48">48</option>
                      <option value="64">64</option>
                      <option value="100">100</option>
                    </select>
                  </div>
                </div>
              </div>
              <FundList
                page={page}
                itemsPerPage={Number(itemsPerPage)}
                search={search}
                orderBy={sortBy}
                sector={filterSector}
                dividend={filterDividend}
                completeness={completeness}
              />
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
