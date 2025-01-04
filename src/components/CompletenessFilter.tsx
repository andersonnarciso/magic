'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CompletenessFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCompleteness = searchParams.get('completeness') || 'all'

  const handleCompletenessChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('completeness')
    } else {
      params.set('completeness', value)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-muted-foreground">Qualidade dos Dados</label>
      <Select value={currentCompleteness} onValueChange={handleCompletenessChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione a qualidade" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">Todos os fundos</SelectItem>
            <SelectItem value="complete">Dados completos</SelectItem>
            <SelectItem value="partial">Dados parciais</SelectItem>
            <SelectItem value="incomplete">Dados básicos</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
