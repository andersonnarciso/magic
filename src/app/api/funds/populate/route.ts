import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getFundDetails } from '@/services/scraping'

const FUND_TICKERS = [
  'ABCP11', 'AFHI11', 'AFOF11', 'AIEC11', 'ALZR11', 'APTO11', 'ARCT11', 'ARRI11',
  'ATSA11', 'BARI11', 'BBFI11', 'BBFO11', 'BBPO11', 'BBRC11', 'BCFF11', 'BCIA11',
  'BCRI11', 'BTAL11', 'BTLG11', 'BTWR11', 'BTRA11', 'CACR11', 'CARE11', 'CBOP11',
  'CEOC11', 'CNES11', 'CPFF11', 'CPTS11', 'CVBI11', 'DEVA11', 'DOVL11', 'DRIT11B',
  'EDGA11', 'EGAF11', 'ELDO11', 'EURO11', 'EVBI11', 'FAED11', 'FAMB11B', 'FEXC11',
  'FFHO11', 'FGAA11', 'FIIB11', 'FIIP11B', 'FINF11', 'FLCR11', 'FLRP11', 'FMOF11',
  'FPAB11', 'FPNG11', 'FVBI11', 'FVPQ11', 'GALG11', 'GCFF11', 'GCRI11', 'GESE11B',
  'GGRC11', 'GSFI11', 'GTWR11', 'HAAA11', 'HABT11', 'HBCR11', 'HBRH11', 'HCTR11',
  'HFOF11', 'HGBS11', 'HGCR11', 'HGFF11', 'HGLG11', 'HGPO11', 'HGRE11', 'HGRU11',
  'HLOG11', 'HMOC11', 'HOSI11', 'HPDP11', 'HRDF11', 'HREC11', 'HSAF11', 'HSML11',
  'HTMX11', 'HUSC11', 'IBFF11', 'IFID11', 'IFIE11', 'IRDM11', 'JFLL11', 'JGPX11',
  'JRDM11', 'JSRE11', 'JTPR11', 'KEVE11', 'KINP11', 'KISU11', 'KNCR11', 'KNHY11',
  'KNIP11', 'KNRE11', 'KNSC11', 'LASC11', 'LATR11B', 'LFTT11', 'LGCP11', 'LOFT11B',
  'LUGG11', 'LVBI11', 'MALL11', 'MAXR11', 'MBRF11', 'MCCI11', 'MCHF11', 'MFAI11',
  'MFII11', 'MGCR11', 'MGFF11', 'MGHT11', 'MGLG11', 'MGRE11', 'MORE11', 'MXRF11',
  'NAVT11', 'NEWL11', 'NPAR11', 'NSLU11', 'NVHO11', 'OUJP11', 'OURF11', 'OURE11',
  'PATB11', 'PATC11', 'PLOG11', 'PLRI11', 'PORD11', 'PQAG11', 'PRSV11', 'PRSN11',
  'PVBI11', 'QAGR11', 'QIFF11', 'RBCO11', 'RBDS11', 'RBED11', 'RBFF11', 'RBGS11',
  'RBHG11', 'RBHY11', 'RBIV11', 'RBLG11', 'RBRD11', 'RBRF11', 'RBRP11', 'RBRR11',
  'RBRS11', 'RBRY11', 'RBTS11', 'RBVA11', 'RBVO11', 'RCFA11', 'RCFF11', 'RCRB11',
  'RECR11', 'RECT11', 'RECX11', 'REIT11', 'RELG11', 'RFOF11', 'RNDP11', 'RNGO11',
  'RVBI11', 'RVRS11', 'RZAK11', 'RZTR11', 'SADI11', 'SARE11', 'SCPF11', 'SDIL11',
  'SFND11', 'SHPH11', 'SNCI11', 'SNFF11', 'SPTW11', 'STRX11', 'TGAR11', 'TORM11',
  'TRNT11', 'TRXF11', 'URPR11', 'VCJR11', 'VCRR11', 'VERE11', 'VGIP11', 'VGIR11',
  'VGHF11', 'VGIA11', 'VIFI11', 'VILG11', 'VINO11', 'VISC11', 'VJFD11', 'VOTS11',
  'VPSI11', 'VSHO11', 'VSLH11', 'VSXP11', 'VTLT11', 'VVPR11', 'VXXV11', 'WPLZ11',
  'XPCA11', 'XPCI11', 'XPCM11', 'XPHT11', 'XPIN11', 'XPLG11', 'XPML11', 'XPPR11',
  'XPSF11', 'XTED11', 'YCHY11', 'YUFI11'
]

export async function GET(request: NextRequest) {
  try {
    console.log('Starting database population...')
    
    // Limpa o banco de dados
    await prisma.fund.deleteMany()
    console.log('Database cleared')

    // Cria os fundos com dados básicos
    const funds = await Promise.all(
      FUND_TICKERS.map(async (ticker) => {
        try {
          const details = await getFundDetails(ticker)
          return prisma.fund.create({
            data: {
              ticker,
              name: ticker,  // Será atualizado depois
              marketValue: details.marketValue,
              pvp: details.pvp,
              dividendYield: details.dividendYield,
              lastDividend: details.lastDividendValue,
              lastDividendDate: details.lastDividendDate ? new Date(details.lastDividendDate) : null,
              currentPrice: details.marketValue,
              type: details.type
            }
          })
        } catch (error) {
          console.error(`Error creating fund ${ticker}:`, error)
          return null
        }
      })
    )

    const successfulFunds = funds.filter(fund => fund !== null)
    console.log(`Created ${successfulFunds.length} funds`)

    return NextResponse.json({
      message: `Database populated with ${successfulFunds.length} funds`,
      funds: successfulFunds
    })
  } catch (error) {
    console.error('Error populating database:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
