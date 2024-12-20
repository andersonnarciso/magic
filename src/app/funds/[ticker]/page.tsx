import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '../../../lib/format';
import { 
  Building2, 
  DollarSign, 
  LineChart, 
  Scale, 
  Wallet, 
  CalendarDays,
  MapPin,
  Phone,
  FileText,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

async function getFund(ticker: string) {
  const fund = await prisma.fund.findUnique({
    where: { ticker },
  });
  
  if (!fund) {
    notFound();
  }
  
  return fund;
}

const getBadgeColor = (type: string | null) => {
  switch (type) {
    case 'Híbrido':
      return 'bg-lime-500 hover:bg-lime-500/80 text-white'
    case 'Tijolo':
      return 'bg-orange-500 hover:bg-orange-500/80 text-white'
    case 'Papel':
      return 'bg-blue-500 hover:bg-blue-500/80 text-white'
    case 'FOF':
      return 'bg-purple-500 hover:bg-purple-500/80 text-white'
    default:
      return 'bg-gray-500 hover:bg-gray-500/80 text-white'
  }
}

const getPvpColor = (pvp: number | null) => {
  if (!pvp) return ''
  if (pvp < 1) return 'text-green-600'
  if (pvp > 3) return 'text-red-600'
  return 'text-gray-900'
}

export default async function FundPage({ params }: { params: { ticker: string } }) {
  const fund = await getFund(params.ticker);
  
  return (
    <div className="container mx-auto py-8 max-w-[1600px]">
      <div className="grid gap-6">
        {/* Cabeçalho */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{fund.ticker}</h1>
              <p className="text-lg text-gray-600 mt-1">{fund.name}</p>
            </div>
            <Badge 
              variant="secondary" 
              className={cn("text-base px-4 py-1", getBadgeColor(fund.type))}
            >
              {fund.type || 'N/A'}
            </Badge>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <DollarSign className="w-4 h-4 text-blue-500 mr-2" />
              <CardTitle className="text-base">Valor de Mercado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(fund.marketValue || 0)}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Scale className="w-4 h-4 text-blue-500 mr-2" />
              <CardTitle className="text-base">P/VP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn("text-2xl font-bold", getPvpColor(fund.pvp))}>
                {fund.pvp?.toFixed(2) || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Building2 className="w-4 h-4 text-blue-500 mr-2" />
              <CardTitle className="text-base">Patrimônio Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(fund.netWorth || 0)}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <LineChart className="w-4 h-4 text-blue-500 mr-2" />
              <CardTitle className="text-base">Dividend Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatPercent(fund.dividendYield || 0)}</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Wallet className="w-4 h-4 text-blue-500 mr-2" />
              <CardTitle className="text-base">Último Dividendo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(fund.lastDividend || 0)}</p>
              <div className="flex items-center mt-1 text-gray-600">
                <CalendarDays className="w-4 h-4 mr-1" />
                <p className="text-sm">
                  {fund.lastDividendDate ? new Date(fund.lastDividendDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Building2 className="w-4 h-4 text-blue-500 mr-2" />
              <CardTitle className="text-base">Setor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{fund.sector || 'N/A'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Informações da Empresa */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-y-0">
            <Info className="w-5 h-5 text-blue-500 mr-2" />
            <CardTitle className="text-lg">Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="flex items-center text-sm font-medium text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 mr-1" /> Endereço
                </dt>
                <dd className="text-base text-gray-900">
                  {fund.address || 'N/A'}
                </dd>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="flex items-center text-sm font-medium text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 mr-1" /> Cidade
                </dt>
                <dd className="text-base text-gray-900">
                  {fund.city || 'N/A'}
                </dd>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="flex items-center text-sm font-medium text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 mr-1" /> Estado
                </dt>
                <dd className="text-base text-gray-900">
                  {fund.state || 'N/A'}
                </dd>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="flex items-center text-sm font-medium text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 mr-1" /> CEP
                </dt>
                <dd className="text-base text-gray-900">
                  {fund.zip || 'N/A'}
                </dd>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="flex items-center text-sm font-medium text-gray-600 mb-1">
                  <Phone className="w-4 h-4 mr-1" /> Telefone
                </dt>
                <dd className="text-base text-gray-900">
                  {fund.phone || 'N/A'}
                </dd>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <dt className="flex items-center text-sm font-medium text-gray-600 mb-1">
                  <Phone className="w-4 h-4 mr-1" /> Fax
                </dt>
                <dd className="text-base text-gray-900">
                  {fund.fax || 'N/A'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Descrição do Negócio */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-y-0">
            <FileText className="w-5 h-5 text-blue-500 mr-2" />
            <CardTitle className="text-lg">Descrição do Negócio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-gray-700 leading-relaxed">
              {fund.description || 'Nenhuma descrição disponível.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
