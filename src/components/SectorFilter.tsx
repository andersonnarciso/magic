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

export function SectorFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSector = searchParams.get('sector') || 'all'

  const handleSectorChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('sector')
    } else {
      params.set('sector', value)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-muted-foreground">Setor</label>
      <Select value={currentSector} onValueChange={handleSectorChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione um setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">Todos os setores</SelectItem>
            <SelectItem value="Logística">Logística</SelectItem>
            <SelectItem value="Hospitalar">Hospitalar</SelectItem>
            <SelectItem value="Papel">Papel</SelectItem>
            <SelectItem value="Híbrido">Híbrido</SelectItem>
            <SelectItem value="Shopping">Shopping</SelectItem>
            <SelectItem value="FiAgro">FiAgro</SelectItem>
            <SelectItem value="Educacional">Educacional</SelectItem>
            <SelectItem value="Lajes Corporativas">Lajes Corporativas</SelectItem>
            <SelectItem value="FOF">Fundo de Fundos</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
