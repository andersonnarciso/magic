import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent, formatCurrencyCompact } from '../../../lib/format';
import { 
  Building2, 
  TrendingUp, 
  Wallet, 
  Scale, 
  DollarSign, 
  Calendar, 
  MapPin,
  Phone,
  Printer,
  Info
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

async function getFund(ticker: string) {
  const fund = await prisma.fund.findUnique({
    where: { ticker },
  });
  
  if (!fund) {
    notFound();
  }
  
  return fund;
}

export default async function FundPage({ params }: { params: { ticker: string } }) {
  const fund = await getFund(params.ticker);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header com gradiente mais vibrante */}
      <div className="bg-gradient-to-r from-blue-500/20 via-blue-400/10 to-background border-b">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">{fund.ticker}</h1>
              <Badge 
                variant="outline" 
                className={`text-base px-4 py-1 ${
                  fund.type === 'Tijolo' ? 'bg-red-100 text-red-700 border-red-200' :
                  fund.type === 'Papel' ? 'bg-green-100 text-green-700 border-green-200' :
                  fund.type === 'Híbrido' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                  'bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                {fund.type || 'N/A'}
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground font-medium">{fund.name}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="text-3xl font-bold text-blue-600">{formatCurrency(fund.currentPrice || 0)}</div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Preço Atual</span>
                <span className="text-sm font-medium text-blue-600">Atualizado hoje</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
          {/* Coluna da Esquerda - Anúncios */}
          <div className="space-y-6">
            {/* Anúncio Desktop */}
            <div className="hidden lg:block sticky top-6">
              <Card className="w-[300px] h-[300px] border-2 border-dashed border-blue-200">
                <CardContent className="p-0 flex items-center justify-center h-full">
                  <div className="text-sm text-muted-foreground">
                    Espaço para Anúncio Desktop
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Anúncio Mobile */}
            <div className="lg:hidden">
              <Card className="w-full h-[100px] border-2 border-dashed border-blue-200">
                <CardContent className="p-0 flex items-center justify-center h-full">
                  <div className="text-sm text-muted-foreground">
                    Espaço para Anúncio Mobile
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coluna Principal - Conteúdo */}
          <div className="space-y-6">
            {/* Cards Principais */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="transition-all hover:shadow-lg border-l-4 border-l-green-500 bg-green-50/50 hover:bg-green-50">
                <CardHeader className="flex flex-row items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-base">Valor de Mercado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-700">{formatCurrencyCompact(fund.marketValue || 0)}</p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg border-l-4 border-l-blue-500 bg-blue-50/50 hover:bg-blue-50">
                <CardHeader className="flex flex-row items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-base">P/VP</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-700">{fund.pvp?.toFixed(2) || 'N/A'}</p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg border-l-4 border-l-purple-500 bg-purple-50/50 hover:bg-purple-50">
                <CardHeader className="flex flex-row items-center gap-2">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-base">Patrimônio Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-700">{formatCurrencyCompact(fund.netWorth || 0)}</p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg border-l-4 border-l-yellow-500 bg-yellow-50/50 hover:bg-yellow-50">
                <CardHeader className="flex flex-row items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-base">Dividend Yield</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-700">{formatPercent(fund.dividendYield || 0)}</p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg border-l-4 border-l-orange-500 bg-orange-50/50 hover:bg-orange-50">
                <CardHeader className="flex flex-row items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-base">Último Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-700">{formatCurrency(fund.lastDividend || 0)}</p>
                  <p className="text-sm text-muted-foreground">
                    {fund.lastDividendDate ? new Date(fund.lastDividendDate).toLocaleDateString() : 'N/A'}
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-all hover:shadow-lg border-l-4 border-l-red-500 bg-red-50/50 hover:bg-red-50">
                <CardHeader className="flex flex-row items-center gap-2">
                  <Building2 className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-base">Setor</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-700">{fund.sector || 'N/A'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Informações da Empresa */}
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Informações da Empresa</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Endereço</dt>
                    <dd className="text-base font-medium">{fund.address || 'N/A'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Cidade</dt>
                    <dd className="text-base font-medium">{fund.city || 'N/A'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                    <dd className="text-base font-medium">{fund.state || 'N/A'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">CEP</dt>
                    <dd className="text-base font-medium">{fund.zip || 'N/A'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Telefone</dt>
                    <dd className="text-base font-medium">{fund.phone || 'N/A'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-muted-foreground">Fax</dt>
                    <dd className="text-base font-medium">{fund.fax || 'N/A'}</dd>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descrição do Negócio */}
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Descrição do Negócio</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed">
                  {fund.description || 'Nenhuma descrição disponível.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
