import { useEffect, useState } from 'react';

interface Indicator {
  name: string;
  value: number;
  description: string;
}

interface Indicators {
  selic: Indicator;
  ipca: Indicator;
  cdi: Indicator;
  igpm: Indicator;
  usd: Indicator;
}

export default function IndicatorsGrid() {
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const response = await fetch('/api/indicators');
        if (!response.ok) {
          throw new Error('Failed to fetch indicators');
        }
        const data = await response.json();
        setIndicators(data);
      } catch (err) {
        setError('Erro ao carregar indicadores');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, []);

  if (loading) {
    return (
      <div className="w-full mb-8">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg p-4 h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mb-8">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!indicators) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <div className="bg-white shadow rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Indicadores Econômicos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.values(indicators).map((indicator) => (
            <div
              key={indicator.name}
              className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {indicator.name}
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {indicator.name === 'Dólar'
                  ? `R$ ${Number(indicator.value || 0).toFixed(2)}`
                  : `${Number(indicator.value || 0).toFixed(2)}%`}
              </p>
              <p className="text-sm text-gray-600 mt-2">{indicator.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
