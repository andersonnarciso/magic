import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CompletenessFilterProps {
  value: string;
  onChange: (value: string) => void;
  stats: {
    complete: number;
    partial: number;
    incomplete: number;
  };
}

export function CompletenessFilter({ value, onChange, stats }: CompletenessFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Todos os fundos" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Qualidade dos Dados</SelectLabel>
          <SelectItem value="all">Todos os fundos</SelectItem>
          <SelectItem value="complete">
            Dados completos ({stats.complete})
          </SelectItem>
          <SelectItem value="partial">
            Dados parciais ({stats.partial})
          </SelectItem>
          <SelectItem value="incomplete">
            Dados básicos ({stats.incomplete})
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
