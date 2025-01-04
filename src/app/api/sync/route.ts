import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getHGToken } from '@/lib/config'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FIIS = [
  // Fundos existentes
  'HGLG11', 'KNRI11', 'MXRF11', 'BCFF11', 'HGRE11', 'XPLG11', 'VILG11', 'VISC11', 'HSML11',
  'XPML11', 'HGRU11', 'MALL11', 'BRCO11', 'RECT11', 'RBRR11', 'HFOF11', 'RBRF11', 'BRCR11',
  'KNCR11', 'GGRC11', 'BTLG11', 'VRTA11', 'HGBS11', 'BBPO11', 'RBRP11', 'VINO11', 'VGIR11',
  'HGPO11', 'JSRE11', 'PVBI11', 'RCRB11', 'BTAL11', 'VTLT11', 'HSLG11', 'BLMG11', 'HCTR11',
  'ALZR11', 'FEXC11', 'RBVA11', 'RBRY11', 'RZTR11', 'BTRA11', 'XPCI11', 'RBED11', 'PLCR11',
  
  // Novos fundos
  'IRDM11', 'CPTS11', 'VGIP11', 'DEVA11', 'HGCR11', 'RECR11', 'RVBI11', 'VGHF11', 'VCJR11',
  'VSLH11', 'RBRP11', 'XPPR11', 'XPCA11', 'HGFF11', 'MCCI11', 'LVBI11', 'VIFI11', 'HAAA11',
  'AFHI11', 'ARRI11', 'BARI11', 'BBFI11', 'BBIM11', 'BBPO11', 'BBRC11', 'BBVJ11', 'BCFF11',
  'BCRI11', 'BCIA11', 'BCRI11', 'BMLC11', 'BPFF11', 'BPRP11', 'BRCR11', 'BRIP11', 'BTRA11',
  'BTWR11', 'CARE11', 'CBOP11', 'CEOC11', 'CFHI11', 'CJCT11', 'CKZR11', 'CNES11', 'CPFF11',
  'CPTS11', 'CVBI11', 'CXRI11', 'DMAC11', 'DRIT11', 'EDGA11', 'ELDO11', 'EURO11', 'EVBI11',
  'FAED11', 'FAMB11', 'FEXC11', 'FFCI11', 'FIGS11', 'FIIB11', 'FIIP11', 'FINF11', 'FIRF11',
  'FLCR11', 'FLMA11', 'FMOF11', 'FPAB11', 'FPNG11', 'FVBI11', 'FVPQ11', 'GALG11', 'GAME11',
  'GCFF11', 'GCRI11', 'GESE11', 'GGRC11', 'GICK11', 'GSFI11', 'GTWR11', 'HABT11', 'HBCR11',
  'HBTT11', 'HCHG11', 'HCRI11', 'HCST11', 'HCTR11', 'HFOF11', 'HGBS11', 'HGCR11', 'HGFF11',
  'HGLG11', 'HGPO11', 'HGRE11', 'HGRU11', 'HLOG11', 'HMOC11', 'HOSI11', 'HRDF11', 'HREC11',
  'HSAF11', 'HSML11', 'HTMX11', 'HUSC11', 'IBFF11', 'IFID11', 'IFIE11', 'IFIR11', 'IFIX11',
  'IFRA11', 'IGBR11', 'IRIM11', 'JBFO11', 'JFLL11', 'JGPX11', 'JRDM11', 'JSRE11', 'JTPR11',
  'KINP11', 'KISU11', 'KNCR11', 'KNHY11', 'KNIP11', 'KNRI11', 'LASC11', 'LATR11', 'LFTT11',
  'LGCP11', 'LOFT11', 'LUGG11', 'LVBI11', 'MALL11', 'MAXR11', 'MBRF11', 'MCCI11', 'MCHF11',
  'MFAI11', 'MFII11', 'MGCR11', 'MGFF11', 'MGHT11', 'MINT11', 'MMVE11', 'MNPR11', 'MORE11',
  'MXRF11', 'NAVT11', 'NEWL11', 'NPAR11', 'NSLU11', 'NVHO11', 'ONEF11', 'ORPD11', 'OUJP11',
  'PATB11', 'PATC11', 'PBLV11', 'PEMA11', 'PLCR11', 'PLOG11', 'PORD11', 'PQAG11', 'PQDP11',
  'PRSN11', 'PRSV11', 'PRTS11', 'PVBI11', 'QAGR11', 'QIFF11', 'QMFF11', 'RBCO11', 'RBDS11',
  'RBED11', 'RBFF11', 'RBGS11', 'RBHG11', 'RBHY11', 'RBIR11', 'RBLG11', 'RBRD11', 'RBRF11',
  'RBRP11', 'RBRR11', 'RBRS11', 'RBRY11', 'RBTS11', 'RBVA11', 'RBVO11', 'RCFA11', 'RCRB11',
  'RCRI11', 'RECR11', 'RECT11', 'REIT11', 'RELG11', 'RFOF11', 'RMAI11', 'RNDP11', 'RNGO11',
  'RNIP11', 'RPRI11', 'RSPD11', 'RVBI11', 'RZAK11', 'RZTR11', 'SADI11', 'SAIC11', 'SARE11',
  'SCPF11', 'SDIL11', 'SEQR11', 'SFND11', 'SHPH11', 'SNCI11', 'SNFF11', 'SPAF11', 'SPTW11',
  'STRX11', 'TGAR11', 'THRA11', 'TORD11', 'TRNT11', 'TRXF11', 'URPR11', 'VCJR11', 'VCRR11',
  'VERE11', 'VGHF11', 'VGIP11', 'VGIR11', 'VIFI11', 'VILG11', 'VINO11', 'VISC11', 'VJFD11',
  'VOTS11', 'VPSI11', 'VRTA11', 'VSHO11', 'VSJU11', 'VSLH11', 'VTLT11', 'VVPR11', 'WPLZ11',
  'WTSP11', 'XPCA11', 'XPCI11', 'XPHT11', 'XPIN11', 'XPLG11', 'XPML11', 'XPPR11', 'XPSF11',
  'YUFI11'
];

interface FundDetails {
  marketValue: number | null;
  pvp: number | null;
  lastDividend: number | null;
  lastDividendDate: Date | null;
  dividendYield: number | null;
  type: string | null;
  ticker: string;
  name: string;
  currentPrice: number | null;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para padronizar e abreviar o setor
function standardizeSector(sector: string | null): string | null {
  if (!sector) return null;

  // Remover espaços extras e converter para minúsculo
  const cleanSector = sector.trim().toLowerCase();

  // Mapeamento de setores com abreviações
  const sectorMap: { [key: string]: string } = {
    // Hospitalares
    'hospitalar': 'Hospitalar',
    'hospital': 'Hospitalar',
    'saude': 'Hospitalar',
    'saúde': 'Hospitalar',
    'healthcare': 'Hospitalar',
    'hospitalar / laboratórios / diagnósticos': 'Hospitalar',
    
    // Shoppings
    'shopping': 'Shopping',
    'shoppings': 'Shopping',
    'shopping center': 'Shopping',
    
    // Logística
    'logistica': 'Logística',
    'logística': 'Logística',
    'galpões logísticos': 'Logística',
    'galpoes': 'Logística',
    'imóveis industriais e logísticos': 'Logística',
    
    // Lajes Corporativas
    'lajes': 'Lajes Corp.',
    'lajes corporativas': 'Lajes Corp.',
    'escritórios': 'Lajes Corp.',
    'escritorios': 'Lajes Corp.',
    
    // Títulos
    'títulos e valores mobiliários': 'Recebíveis',
    'títulos e val. mob.': 'Recebíveis',
    'papel': 'Recebíveis',
    'papéis': 'Recebíveis',
    'recebíveis': 'Recebíveis',
    'recebiveis': 'Recebíveis',
    
    // Fundos de Fundos
    'fof': 'FOF',
    'fundo de fundos': 'FOF',
    'fundos de fundos': 'FOF',
    
    // Agronegócio
    'agronegócio': 'Agro',
    'agronegocio': 'Agro',
    'agro': 'Agro',
    'fiagro': 'Agro',
    
    // Outros setores comuns
    'varejo': 'Varejo',
    'educacional': 'Educacional',
    'residencial': 'Residencial',
    'híbrido': 'Híbrido',
    'hibrido': 'Híbrido',
    'misto': 'Híbrido',
    'desenvolvimento': 'Desenvolv.',
    'indefinido': 'Outros',
    'outros': 'Outros'
  };

  // Procurar match exato
  if (sectorMap[cleanSector]) {
    return sectorMap[cleanSector];
  }

  // Procurar match parcial
  for (const [key, value] of Object.entries(sectorMap)) {
    if (cleanSector.includes(key)) {
      return value;
    }
  }

  // Se não encontrou nenhum match, retorna uma versão abreviada do setor original
  if (sector.length > 15) {
    return sector.split(' ').map(word => word.substring(0, 3)).join('. ') + '.';
  }

  return sector;
}

// Função para mapear o setor para o tipo
function mapSectorToType(sector: string | null): string {
  if (!sector) return 'Outros';

  const cleanSector = sector.toLowerCase();
  
  // Mapeamento de tipos
  const typeMap: { [key: string]: string } = {
    'hospitalar': 'Hospitalar',
    'shopping': 'Tijolo',
    'logística': 'Tijolo',
    'lajes corp.': 'Tijolo',
    'recebíveis': 'Papel',
    'fof': 'FOF',
    'agro': 'Agro',
    'varejo': 'Tijolo',
    'educacional': 'Tijolo',
    'residencial': 'Tijolo',
    'híbrido': 'Híbrido',
    'desenvolv.': 'Tijolo'
  };

  // Procurar match exato
  if (typeMap[cleanSector]) {
    return typeMap[cleanSector];
  }

  // Procurar por palavras-chave
  if (cleanSector.includes('hospital') || cleanSector.includes('saude') || cleanSector.includes('saúde')) return 'Hospitalar';
  if (cleanSector.includes('shopping') || cleanSector.includes('loja')) return 'Tijolo';
  if (cleanSector.includes('logistic') || cleanSector.includes('galpão') || cleanSector.includes('galpao')) return 'Tijolo';
  if (cleanSector.includes('titulo') || cleanSector.includes('título') || cleanSector.includes('papel')) return 'Papel';
  if (cleanSector.includes('fundo')) return 'FOF';
  if (cleanSector.includes('agro')) return 'Agro';
  if (cleanSector.includes('hibrido') || cleanSector.includes('híbrido') || cleanSector.includes('misto')) return 'Híbrido';
  if (cleanSector.includes('imovel') || cleanSector.includes('imóvel') || cleanSector.includes('predio') || cleanSector.includes('prédio')) return 'Tijolo';

  return 'Outros';
}

export async function GET(request: NextRequest) {
  try {
    // Obter o token da função utilitária
    const HG_TOKEN = getHGToken();
    if (!HG_TOKEN) {
      console.error('HG_TOKEN não encontrado');
      return NextResponse.json({ error: 'Token de API não configurado' }, { status: 500 });
    }

    console.log('=== INICIANDO SINCRONIZAÇÃO ===');
    console.log('Token configurado:', HG_TOKEN ? 'Sim' : 'Não');

    const response = await fetch(`https://api.hgbrasil.com/finance/stock_price?key=${HG_TOKEN}`);
    const data = await response.json();

    console.log('=== RESPOSTA DA API ===');
    console.log('Status:', response.status);
    console.log('Dados:', JSON.stringify(data, null, 2));

    if (!data.results) {
      console.error('Erro na resposta da API:', data);
      return NextResponse.json({ error: 'Erro na resposta da API' }, { status: 500 });
    }

    const fiiCount = Object.keys(data.results).filter(ticker => ticker.endsWith('11')).length;
    console.log('Total de FIIs encontrados:', fiiCount);

    // Buscar fundos existentes
    const existingFunds = await prisma.fund.findMany();
    const existingFundsMap = new Map(existingFunds.map(fund => [fund.ticker, fund]));

    // Array para armazenar fundos atualizados
    const updatedFunds = [];

    // Processar cada fundo
    for (const [ticker, fundData] of Object.entries(data.results)) {
      try {
        // Ignorar se não for FII
        if (!ticker.endsWith('11')) {
          continue;
        }

        const existingFund = existingFundsMap.get(ticker);
        
        // Padronizar o setor
        const standardizedSector = standardizeSector(fundData.sector);
        const mappedType = mapSectorToType(standardizedSector);

        console.log(`\nProcessando ${ticker}:`);
        console.log('Setor original:', fundData.sector);
        console.log('Setor padronizado:', standardizedSector);
        console.log('Tipo mapeado:', mappedType);

        // Extrair novos valores
        const newValues = {
          currentPrice: fundData.price || null,
          dividendYield: fundData.dividend_yield || null,
          name: fundData.name || ticker,
          sector: standardizedSector,
          type: mappedType,
          marketValue: fundData.market_cap || null,
          lastDividend: fundData.last_dividend?.value || null,
          pvp: fundData.price_earnings || null,
          updatedAt: new Date()
        };

        // Verificar se algo mudou
        const hasChanges = !existingFund || Object.keys(newValues).some(
          key => newValues[key] !== existingFund[key]
        );

        if (hasChanges) {
          const result = await prisma.fund.upsert({
            where: { ticker },
            update: newValues,
            create: { ticker, ...newValues },
          });
          updatedFunds.push(ticker);
        }
      } catch (error) {
        console.error(`Erro ao processar ${ticker}:`, error);
      }
    }

    return NextResponse.json({
      message: `Sync complete: ${updatedFunds.length} of ${fiiCount} FIIs updated`,
      updated: updatedFunds
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}
