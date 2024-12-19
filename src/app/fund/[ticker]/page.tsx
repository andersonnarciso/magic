import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '../../../lib/format';

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
    <div className="container mx-auto py-8 max-w-[1600px]">
      <div className="grid gap-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{fund.ticker}</h1>
            <p className="text-base text-muted-foreground">{fund.name}</p>
          </div>
          <Badge variant="secondary" className="text-base px-4 py-1">
            {fund.type || 'N/A'}
          </Badge>
        </div>

        {/* Informações Principais */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Valor de Mercado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatCurrency(fund.marketValue || 0)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">P/VP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{fund.pvp?.toFixed(2) || 'N/A'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patrimônio Líquido</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatCurrency(fund.netWorth || 0)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dividend Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatPercent(fund.dividendYield || 0)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Último Dividendo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatCurrency(fund.lastDividend || 0)}</p>
              <p className="text-sm text-muted-foreground">
                {fund.lastDividendDate ? new Date(fund.lastDividendDate).toLocaleDateString() : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{fund.sector || 'N/A'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Informações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Endereço</dt>
                <dd className="text-base">
                  {fund.address || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Cidade</dt>
                <dd className="text-base">
                  {fund.city || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
                <dd className="text-base">
                  {fund.state || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">CEP</dt>
                <dd className="text-base">
                  {fund.zip || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Telefone</dt>
                <dd className="text-base">
                  {fund.phone || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Fax</dt>
                <dd className="text-base">
                  {fund.fax || 'N/A'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Descrição do Negócio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Descrição do Negócio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base">
              {fund.description || 'Nenhuma descrição disponível.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
