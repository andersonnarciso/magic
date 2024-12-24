'use client'

import React, { useState } from 'react'
import FundList from '@/components/FundList'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Loading from './loading'

interface HomeProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function Home({ searchParams }: HomeProps) {
  const page = Number(searchParams?.page) || 1
  const router = useRouter()
  const searchParamsObj = useSearchParams()

  const [itemsPerPage, setItemsPerPage] = useState('24')
  const [sortBy, setSortBy] = useState(searchParamsObj?.get('orderBy') || '')
  const [filterType, setFilterType] = useState(searchParamsObj?.get('type') || 'all')
  const [filterDividend, setFilterDividend] = useState(searchParamsObj?.get('dividend') || '')
  const [search, setSearch] = useState(searchParamsObj?.get('search') || '')

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
      case 'type':
        setFilterType(value)
        break
      case 'dividend':
        setFilterDividend(value)
        break
      case 'search':
        setSearch(value)
        break
    }
  }

  return (
    <div className="w-full px-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Hero Section */}
      <section className="pt-12 text-center space-y-4">
        <h1 className="text-4xl font-bold">Invest Tools</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto inherit">
          Analise e compare Ações, Fundos Imobiliários, Índices e BDRs de forma simples e rápida
        </p>
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
                      <option value="dividendYield">Maiores Dividend Yield</option>
                      <option value="marketValue">Maiores Valor de Mercado</option>
                      <option value="pvp">Menor P/VP</option>
                      <option value="lastDividend">Maior Dividendo</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-muted-foreground">Tipo de Fundo</label>
                    <select 
                      className="input max-w-xs"
                      value={filterType}
                      onChange={(e) => handleParamChange('type', e.target.value)}
                    >
                      <option value="all">Todos os tipos</option>
                      <option value="Tijolo">Tijolo</option>
                      <option value="Papel">Papel</option>
                      <option value="FOF">FOF</option>
                      <option value="Energia">Energia</option>
                      <option value="Agro">Agro</option>
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
                perPage={Number(itemsPerPage)}
                search={search}
                orderBy={sortBy}
                type={filterType}
                dividend={filterDividend}
              />
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  )
}
