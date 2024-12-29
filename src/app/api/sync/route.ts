import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

// FunÃ§Ã£o para mapear o setor para o tipo de fundo
function mapSectorToType(sector: string): string {
  const sectorMap: { [key: string]: string } = {
    'Shoppings': 'Tijolo',
    'Shopping': 'Tijolo',
    'Lajes Corporativas': 'Tijolo',
    'LogÃ­stica': 'Tijolo',
    'ImÃ³veis Industriais e LogÃ­sticos': 'Tijolo',
    'TÃ­tulos e Val. Mob.': 'Papel',
    'TÃ­tulos e Valores MobiliÃ¡rios': 'Papel',
    'PapÃ©is': 'Papel',
    'Fundos de Fundos': 'FOF',
    'Fundo de Fundos': 'FOF',
    'FOF': 'FOF',
    'AgronegÃ³cio': 'Agro',
    'AgÃªncias de Bancos': 'Tijolo',
    'Varejo': 'Tijolo',
    'Educacional': 'Tijolo',
    'Energia': 'Energia',
    'HÃ­brido': 'HÃ­brido',
    'Misto': 'HÃ­brido',
    'Indefinido': 'FOF',
    'Financeiro e Outros/Fundos/Fundos ImobiliÃ¡rios': 'FOF'
  };

  return sectorMap[sector] || 'FOF';
}

export async function GET(request: NextRequest) {
  try {
    const HG_TOKEN = process.env.HG_TOKEN;
    console.log('Starting sync with token:', HG_TOKEN);

    const fiiChunks = chunkArray(FIIS, 5);
    console.log('FII chunks:', fiiChunks);

    const allFiiDetails: FundDetails[] = [];

    for (const chunk of fiiChunks) {
      try {
        const symbols = chunk.join(',');
        const url = `https://api.hgbrasil.com/finance/stock_price?key=${HG_TOKEN}&symbol=${symbols}`;
        console.log('Fetching URL:', url);
        
        const response = await fetch(url, { 
          cache: 'no-store',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('API response not ok:', {
            status: response.status,
            statusText: response.statusText
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));
        
        for (const ticker of chunk) {
          try {
            // A resposta da API agora vem direto em results[ticker]
            const fundData = data.results?.[ticker];
            if (!fundData) {
              console.error(`No data found for ticker ${ticker}`);
              continue;
            }

            // Extrai e converte os valores da API
            const currentPrice = fundData.price ? parseFloat(fundData.price) : null;
            const pvp = fundData.financials?.price_to_book_ratio ? parseFloat(fundData.financials.price_to_book_ratio) : null;
            
            // MXRF11 tem dividendo fixo de 0.10
            const lastDividend = ticker === 'MXRF11' ? 0.10 : (fundData.financials?.dividends?.last ? parseFloat(fundData.financials.dividends.last) : null);
            
            // Calcula o dividend yield baseado no Ãºltimo dividendo e preÃ§o atual
            const dividendYield = lastDividend && currentPrice ? ((lastDividend * 12) / currentPrice) * 100 : null;

            console.log(`Processing ${ticker}:`, {
              currentPrice,
              pvp,
              lastDividend,
              dividendYield,
              raw: {
                price: fundData.price,
                price_to_book_ratio: fundData.financials?.price_to_book_ratio,
                yield_12m_sum: fundData.financials?.dividends?.yield_12m_sum,
                yield_12m: fundData.financials?.dividends?.yield_12m
              }
            });

            // Salva no banco
            const result = await prisma.fund.upsert({
              where: { ticker },
              update: {
                name: fundData.name,
                currentPrice,
                marketValue: currentPrice,
                pvp,
                lastDividend,
                dividendYield,
                type: mapSectorToType(fundData.sector || 'FOF')
              },
              create: {
                ticker,
                name: fundData.name,
                currentPrice,
                marketValue: currentPrice,
                pvp,
                lastDividend,
                dividendYield,
                type: mapSectorToType(fundData.sector || 'FOF')
              }
            });

            console.log(`Saved ${ticker}:`, result);
            allFiiDetails.push(result);
          } catch (error) {
            console.error(`Error processing ${ticker}:`, error);
          }
        }

        // Aguarda 1 segundo entre as chamadas
        await sleep(1000);
      } catch (error) {
        console.error(`Error fetching chunk ${chunk.join(',')}:`, error);
      }
    }

    return NextResponse.json({
      message: `Database synchronized with ${allFiiDetails.length} FIIs`,
      fiis: allFiiDetails
    });
  } catch (error) {
    console.error('Error synchronizing database:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}









