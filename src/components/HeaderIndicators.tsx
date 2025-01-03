'use client'

import { useEffect, useState } from 'react';
import ReferenceRates from './ReferenceRates';

interface Indicator {
  name: string;
  value: number;
  description: string;
}

interface Indicators {
  ipca: Indicator;
  igpm: Indicator;
  usd: Indicator;
}

export function HeaderIndicators() {
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/indicators', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch indicators');
        }

        const data = await response.json();
        
        if (!data.ipca || !data.igpm || !data.usd) {
          throw new Error('Invalid data format');
        }

        setIndicators(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar indicadores:', err);
        setError('Erro ao carregar indicadores');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, []);

  if (loading) {
    return (
      <div className="hidden md:flex gap-8 text-gray-600">
        Carregando indicadores...
      </div>
    );
  }

  if (error || !indicators) {
    return (
      <div className="hidden md:flex gap-8 text-red-600">
        Erro ao carregar indicadores
      </div>
    );
  }

  return (
    <div className="hidden md:flex gap-8">
      <ReferenceRates />
      <div className="text-center">
        <div className="text-sm text-gray-600">IPCA</div>
        <div className="font-semibold">{indicators.ipca.value.toFixed(2)}%</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600">IGP-M</div>
        <div className="font-semibold">{indicators.igpm.value.toFixed(2)}%</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600">USD</div>
        <div className="font-semibold">R$ {indicators.usd.value.toFixed(2)}</div>
      </div>
    </div>
  );
}
