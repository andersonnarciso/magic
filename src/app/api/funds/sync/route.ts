import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHGToken } from '@/lib/config';

async function fetchWithErrorHandling(url: string) {
    try {
        console.log('Fazendo requisição para:', url.replace(/key=([^&]+)/, 'key=XXXXX'));
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        
        console.log('Status:', response.status);
        console.log('Content-Type:', contentType);
        
        if (!response.ok) {
            throw new Error(`API retornou status ${response.status}`);
        }

        if (!contentType?.includes('application/json')) {
            const text = await response.text();
            console.error('Resposta não-JSON:', text);
            throw new Error(`API retornou ${contentType} em vez de JSON. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta:', JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('Erro ao fazer requisição:', error);
        throw error;
    }
}

export async function GET() {
    try {
        const HG_TOKEN = getHGToken();
        if (!HG_TOKEN) {
            console.error('Token não configurado');
            return NextResponse.json({ error: 'Token não configurado' }, { status: 500 });
        }

        // 1. Lista fixa de FIIs
        const fiiList = ["AAZQ11","ABCP11","AFHI11","AGRX11","AIEC11","AJFI11","ALMI11","ALZC11","ALZM11","ALZR11","APTO11","APXM11","ARCT11","AROA11","ARRI11","ARXD11","ASMT11","ASRF11","ATSA11","AZIN11","BARI11","BBFI11","BBFO11","BBGO11","BBIG11","BBPO11","BBRC11","BCFF11","BCIA11","BCRI11","BDIF11","BDIV11","BICE11","BICR11","BIME11","BLCA11","BLCP11","BLMC11","BLMG11","BLMO11","BLMR11","BLUR11","BMLC11","BNFS11","BPFF11","BPML11","BPRP11","BRCO11","BRCR11","BREV11","BRIM11","BRIP11","BRLA11","BROF11","BRZP11","BTAG11","BTAL11","BTCI11","BTCR11","BTHF11","BTHI11","BTLG11","BTML11","BTRA11","BTSG11","BTWR11","BTYU11","BVAR11","BZLI11","CACR11","CARE11","CBOP11","CCME11","CCRF11","CDII11","CENU11","CEOC11","CIXM11","CJCT11","CLIN11","CNES11","CPFF11","CPOF11","CPSH11","CPTI11","CPTR11","CPTS11","CRAA11","CRFF11","CSMC11","CTXT11","CVBI11","CXAG11","CXCE11","CXCI11","CXCO11","CXRI11","CXTL11","CYCR11","DAMA11","DCRA11","DEVA11","DOVL11","DPRO11","DRIT11","DVFF11","EDFO11","EDGA11","EGAF11","EGYR11","ENDD11","EQIR11","ERCR11","ERPA11","EURO11","EVBI11","EXES11","FAED11","FAMB11","FATN11","FCFL11","FGAA11","FIGS11","FIIB11","FISC11","FIVN11","FLCR11","FLEM11","FLFL11","FLMA11","FLRP11","FMOF11","FPAB11","FPNG11","FPOR11","FVPQ11","FZDA11","FZDB11","GALG11","GAME11","GARE11","GCFF11","GCOI11","GCRA11","GCRI11","GGRC11","GLOG11","GRWA11","GSFI11","GTLG11","GTWR11","GURB11","GZIT11","HAAA11","HABT11","HBCR11","HBRH11","HCHG11","HCRA11","HCRI11","HCST11","HCTR11","HDEL11","HDOF11","HFOF11","HGAG11","HGBL11","HGBS11","HGCR11","HGFF11","HGIC11","HGLG11","HGPO11","HGRE11","HGRS11","HGRU11","HILG11","HLOG11","HOFC11","HOSI11","HPDP11","HRDF11","HREC11","HSAF11","HSLG11","HSML11","HSRE11","HTMX11","HUCG11","HUSC11","HUSI11","IAAG11","IAGR11","IBCR11","IBFF11","ICNE11","ICRI11","IDFI11","IDGR11","IFRA11","INLG11","IRDM11","IRIM11","ISCJ11","ITIP11","ITIT11","ITRI11","JASC11","JBFO11","JCCJ11","JFLL11","JGPX11","JPPA11","JPPC11","JRDM11","JSAF11","JSRE11","JURO11","KCRE11","KEVE11","KFOF11","KINP11","KISU11","KIVO11","KNCA11","KNCR11","KNHF11","KNHY11","KNIP11","KNOX11","KNRE11","KNRI11","KNSC11","KNUQ11","KORE11","LASC11","LFTT11","LGCP11","LIFE11","LKDV11","LSAG11","LSPA11","LUGG11","LVBI11","MALL11","MANA11","MATV11","MAXR11","MBRF11","MCCI11","MCEM11","MCHF11","MCHY11","MFAI11","MFCR11","MFII11","MGCR11","MGFF11","MGHT11","MINT11","MMVE11","MORC11","MORE11","MXRF11","NAVT11","NCHB11","NCRA11","NCRI11","NEWL11","NEWU11","NSLU11","NVHO11","OCRE11","OGIN11","OIAG11","ONEF11","OPTM11","OUFF11","OUJP11","OULG11","OURE11","PABY11","PATC11","PATL11","PEMA11","PFIN11","PICE11","PLCA11","PLCR11","PLOG11","PLRI11","PMFO11","PMIS11","PNCR11","PNPR11","PNRC11","PORD11","PPEI11","PQAG11","PQDP11","PRSN11","PRSV11","PULV11","PVBI11","QAGR11","QAMI11","QIRI11","RBCO11","RBDS11","RBED11","RBFF11","RBHG11","RBHY11","RBIF11","RBIR11","RBLG11","RBOP11","RBRD11","RBRF11","RBRI11","RBRL11","RBRM11","RBRP11","RBRR11","RBRX11","RBRY11","RBTS11","RBVA11","RBVO11","RCFA11","RCFF11","RCRB11","RDPD11","RECR11","RECT11","RECX11","REIT11","RELG11","RFOF11","RINV11","RMAI11","RNDP11","RNGO11","ROOF11","RPRI11","RRCI11","RSPD11","RURA11","RVBI11","RZAG11","RZAK11","RZAT11","RZTR11","SADI11","SAPI11","SARE11","SCPF11","SEED11","SEQR11","SHOP11","SHPH11","SJAU11","SMRE11","SNAG11","SNCI11","SNEL11","SNFF11","SNFZ11","SNID11","SNLG11","SNME11","SOLR11","SPMO11","SPTW11","SPXS11","SRVD11","TCIN11","TEPP11","TGAR11","TJKB11","TMPS11","TOPP11","TORD11","TRBL11","TRNT11","TRXB11","TRXF11","TSER11","TSNC11","TVRI11","URPR11","VCJR11","VCRA11","VCRI11","VCRR11","VGHF11","VGIA11","VGIP11","VGIR11","VGRI11","VIFI11","VIGT11","VILG11","VINO11","VISC11","VIUR11","VLOL11","VOTS11","VRTA11","VRTM11","VSEC11","VSHO11","VSLH11","VTLT11","VVCO11","VVCR11","VVMR11","VVPR11","VVRI11","VXXV11","WHGR11","WPLZ11","WSEC11","WTSP11","XPCA11","XPCI11","XPCM11","XPHT11","XPID11","XPIE11","XPIN11","XPLG11","XPML11","XPPR11","XPSF11","XTED11","YUFI11","ZAGH11","ZAVC11","ZAVI11","ZIFI11"];
        console.log(`Total de FIIs na lista: ${fiiList.length}`);

        // 2. Dividir em grupos de 5 para consultar detalhes
        const grupos = [];
        for (let i = 0; i < fiiList.length; i += 5) {
            grupos.push(fiiList.slice(i, i + 5));
        }

        console.log(`Total de grupos: ${grupos.length}`);

        // 3. Processar cada grupo
        const atualizados = [];
        const erros = [];

        // Função para classificar o tipo do fundo baseado no setor
        const getTypeFromSector = (sector: string | null) => {
            if (!sector) return 'Outros';
            
            // Normaliza o setor para minúsculo para facilitar a comparação
            const s = sector.toLowerCase();

            // Log detalhado para debug
            console.log(`\nAnalisando setor: "${sector}"`);
            
            // Recebíveis/Papel
            if (s.includes('recebíveis') || s.includes('títulos e val') || s.includes('cri') || s.includes('papel') || s.includes('mobiliários')) {
                console.log('Classificado como: Papel');
                return 'Papel';
            }
            
            // Logística
            if (s.includes('logístico') || s.includes('industrial') || s.includes('galpão') || s.includes('logística')) {
                console.log('Classificado como: Logística');
                return 'Logística';
            }
            
            // Shopping
            if (s.includes('shopping')) {
                console.log('Classificado como: Shopping');
                return 'Shopping';
            }
            
            // Lajes Corporativas
            if (s.includes('lajes') || s.includes('escritórios') || s.includes('corporativ')) {
                console.log('Classificado como: Lajes Corporativas');
                return 'Lajes Corporativas';
            }
            
            // FiAgro
            if (s.includes('agro') || s.includes('fiagro')) {
                console.log('Classificado como: FiAgro');
                return 'FiAgro';
            }
            
            // Fundo de Fundos
            if (s.includes('fundo de fundos') || s.includes('fundos imobiliários') || s.includes('fof')) {
                console.log('Classificado como: FOF');
                return 'FOF';
            }
            
            // Hospitalar
            if (s.includes('hospital') || s.includes('saúde')) {
                console.log('Classificado como: Hospitalar');
                return 'Hospitalar';
            }
            
            // Energia
            if (s.includes('energia') || s.includes('elétric')) {
                console.log('Classificado como: Energia');
                return 'Energia';
            }
            
            // Híbrido/Misto
            if (s.includes('híbrido') || s.includes('misto') || s.includes('diversificado')) {
                console.log('Classificado como: Híbrido');
                return 'Híbrido';
            }
            
            // Educacional
            if (s.includes('educacional') || s.includes('ensino') || s.includes('escola')) {
                console.log('Classificado como: Educacional');
                return 'Educacional';
            }
            
            console.log('Classificado como: Outros');
            return 'Outros';
        };

        for (const [index, grupo] of grupos.entries()) {
            console.log(`\nProcessando grupo ${index + 1} de ${grupos.length}`);
            const symbols = grupo.join(',');
            console.log('Symbols:', symbols);

            try {
                const detailsUrl = `https://api.hgbrasil.com/finance/stock_price?key=${HG_TOKEN}&symbol=${symbols}`;
                console.log('URL:', detailsUrl);
                
                const detailsData = await fetchWithErrorHandling(detailsUrl);

                if (detailsData?.results) {
                    // Processar cada fundo do grupo
                    for (const ticker of grupo) {
                        const info = detailsData.results[ticker];
                        if (info && !info.error) {
                            // Verificar se o fundo já existe
                            const fundoExistente = await prisma.fund.findUnique({
                                where: { ticker }
                            });

                            // Log do setor para debug
                            console.log(`Ticker: ${ticker}, Setor: ${info.sector}, Tipo classificado: ${getTypeFromSector(info.sector)}`);

                            const data = {
                                name: info.name || ticker,
                                sector: info.sector || null,
                                currentPrice: info.price || null,
                                dividendYield: info.financials?.dividends?.yield_12m || null,
                                lastDividend: info.financials?.dividends?.yield_12m_sum || null,
                                marketValue: info.market_cap ? info.market_cap * 1_000_000 : null,
                                netWorth: info.financials?.equity || null,
                                pvp: info.financials?.price_to_book_ratio || null,
                                type: getTypeFromSector(info.sector),
                                updatedAt: new Date()
                            };

                            if (fundoExistente) {
                                // Atualizar fundo existente
                                await prisma.fund.update({
                                    where: { ticker },
                                    data
                                });
                                atualizados.push({
                                    ticker,
                                    tipo: 'atualizado',
                                    sector: info.sector
                                });
                            } else {
                                // Criar novo fundo
                                await prisma.fund.create({
                                    data: {
                                        ticker,
                                        ...data
                                    }
                                });
                                atualizados.push({
                                    ticker,
                                    tipo: 'criado',
                                    sector: info.sector
                                });
                            }
                            console.log(`✅ ${ticker} processado com sucesso (${info.sector})`);
                        } else {
                            erros.push({
                                ticker,
                                erro: info?.error?.message || 'Fundo não encontrado'
                            });
                            console.log(`❌ Erro ao processar ${ticker}:`, info?.error?.message || 'Fundo não encontrado');
                        }
                    }
                }

                // Esperar 1 segundo entre as requisições para não sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`Erro ao processar grupo ${index + 1}:`, error);
                erros.push({
                    grupo: index + 1,
                    tickers: grupo,
                    erro: error.message
                });
            }
        }

        // 4. Retornar resumo
        return NextResponse.json({
            success: true,
            total: fiiList.length,
            atualizados: atualizados.length,
            erros: erros.length,
            detalhes: {
                fundos: atualizados,
                erros
            }
        });

    } catch (error: any) {
        console.error('Erro na sincronização:', error);
        return NextResponse.json({ 
            error: 'Erro ao sincronizar fundos',
            details: error.message
        }, { status: 500 });
    }
}
