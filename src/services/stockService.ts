
// Serviço para obter cotações de ativos da B3
import { toast } from "@/components/ui/use-toast";

export interface Cotacao {
  ativo: string;
  preco: number;
  variacao: number;
  dataAtualizacao: string;
}

// Lista de ativos da B3 (simulação - em produção seria consumido de uma API)
const ativosB3 = [
  // Ações principais
  'ABEV3', 'ALPA4', 'AMER3', 'ASAI3', 'AZUL4', 'B3SA3', 'BBAS3', 'BBDC3', 'BBDC4', 'BBSE3',
  'BEEF3', 'BPAC11', 'BRAP4', 'BRFS3', 'BRKM5', 'BRML3', 'CASH3', 'CCRO3', 'CIEL3', 'CMIG4',
  'CMIN3', 'COGN3', 'CPFE3', 'CPLE6', 'CRFB3', 'CSAN3', 'CSNA3', 'CVCB3', 'CYRE3', 'DXCO3',
  'EGIE3', 'ELET3', 'ELET6', 'EMBR3', 'ENBR3', 'ENEV3', 'ENGI11', 'EQTL3', 'EZTC3', 'FLRY3',
  'GGBR4', 'GOAU4', 'GOLL4', 'HAPV3', 'HYPE3', 'IGTI11', 'IRBR3', 'ITSA4', 'ITUB4', 'JBSS3',
  'JHSF3', 'KLBN11', 'LCAM3', 'LWSA3', 'MGLU3', 'MRFG3', 'MRVE3', 'MULT3', 'NTCO3', 'PCAR3',
  'PETR3', 'PETR4', 'PETZ3', 'POSI3', 'PRIO3', 'QUAL3', 'RADL3', 'RAIL3', 'RAIZ4', 'RDOR3',
  'RENT3', 'RRRP3', 'SANB11', 'SBSP3', 'SLCE3', 'SMTO3', 'SOMA3', 'SUZB3', 'TAEE11', 'TIMS3',
  'TOTS3', 'UGPA3', 'USIM5', 'VALE3', 'VBBR3', 'VIIA3', 'VIVT3', 'WEGE3', 'YDUQ3',
  // ETFs
  'BOVA11', 'IVVB11', 'SMAL11', 'SPXI11', 'HASH11', 'ECOO11',
  // FIIs
  'KNRI11', 'HGLG11', 'MXRF11', 'XPLG11', 'XPML11', 'VISC11', 'HFOF11',
  // Opções mais comuns (exemplos)
  'PETRJ23', 'PETRK23', 'VALEJ23', 'VALEK23', 'BBDCJ23', 'BBDCK23', 'ITUBJ23', 'ITUBK23'
];

// Mapa de correção para papéis comumente mal identificados
const correcoesPapeis: Record<string, string> = {
  'PETROBRAS': 'PETR4',
  'PETROBRAS ON': 'PETR3',
  'PETROBRAS PN': 'PETR4',
  'VALE': 'VALE3',
  'VALE ON': 'VALE3',
  'ITAU': 'ITUB4',
  'ITAÚ': 'ITUB4',
  'ITAUUNIBANCO': 'ITUB4',
  'BRADESCO': 'BBDC4',
  'BRADESCO PN': 'BBDC4',
  'BRADESCO ON': 'BBDC3',
  'BANCO DO BRASIL': 'BBAS3',
  'BB': 'BBAS3',
  'AMBEV': 'ABEV3',
  'MAGAZ LUIZA': 'MGLU3',
  'GERDAU': 'GGBR4',
  'GERDAU PN': 'GGBR4',
  'GERDAU MET': 'GOAU4',
  'B3': 'B3SA3',
  'B3 ON': 'B3SA3',
  'LOJAS RENNER': 'LREN3',
  'RENNER': 'LREN3',
  'PETROBRAS BR': 'BRDT3',
  'CSN': 'CSNA3',
  'JBS': 'JBSS3',
  'SUZANO': 'SUZB3',
  'WEG': 'WEGE3',
  'TIM': 'TIMS3',
  'SABESP': 'SBSP3',
  'RUMO': 'RAIL3',
  'PETROBRAS BR': 'BRDT3',
  'VIBRA': 'VBBR3'
};

// Função para buscar cotações de ativos da B3
export const buscarCotacoes = async (ativos: string[]): Promise<Cotacao[]> => {
  // Em um ambiente real, aqui seria feita uma chamada para uma API de cotações
  // Como é uma simulação, vamos gerar dados fictícios
  
  try {
    console.log('Buscando cotações para:', ativos);
    
    // Filtramos apenas os ativos válidos da B3
    const ativosValidos = ativos.filter(ativo => 
      ativoExisteNaB3(ativo.toUpperCase())
    );
    
    if (ativosValidos.length === 0) {
      console.warn('Nenhum ativo válido encontrado na lista fornecida');
      return [];
    }
    
    // Simular atraso da API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Gerar cotações aleatórias simuladas
    return ativosValidos.map(ativo => {
      const precoBase = 10 + Math.random() * 90;
      const variacao = (Math.random() * 10) - 5; // Entre -5% e +5%
      
      return {
        ativo: ativo.toUpperCase(),
        preco: parseFloat(precoBase.toFixed(2)),
        variacao: parseFloat(variacao.toFixed(2)),
        dataAtualizacao: new Date().toISOString()
      };
    });
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    toast({
      title: "Erro ao atualizar cotações",
      description: "Não foi possível buscar as cotações atualizadas.",
      variant: "destructive",
    });
    return [];
  }
};

// Verifica se o ativo existe na B3
export const ativoExisteNaB3 = (ativo: string): boolean => {
  // Verificar na lista principal
  if (ativosB3.includes(ativo.toUpperCase())) {
    return true;
  }
  
  // Verificar se é uma opção (padrão: código de 5 ou 6 caracteres terminando com letras e números)
  // Exemplo: PETR4C45 (Opção de PETR4, série C, strike 45)
  const opcaoPattern = /^[A-Z]{4}[0-9]{1}[A-Z][0-9]{1,2}$/;
  if (opcaoPattern.test(ativo.toUpperCase())) {
    // Verificar se o ativo base existe
    const ativoBase = ativo.substring(0, 5);
    return ativosB3.some(a => a.startsWith(ativoBase));
  }
  
  return false;
};

// Corrige o nome do ativo com base no mapa de correções
export const corrigirNomeAtivo = (ativo: string): string => {
  const normalizado = ativo.trim().toUpperCase();
  
  // Verificar se já é um ativo válido
  if (ativoExisteNaB3(normalizado)) {
    return normalizado;
  }
  
  // Verificar no mapa de correções
  if (correcoesPapeis[normalizado]) {
    return correcoesPapeis[normalizado];
  }
  
  // Verificar similaridade com ativos conhecidos
  for (const [nome, codigo] of Object.entries(correcoesPapeis)) {
    if (normalizado.includes(nome)) {
      return codigo;
    }
  }
  
  // Tentar encontrar no catálogo de ações
  for (const ativoCatalogado of ativosB3) {
    // Se o ativo contém o código, retornar o código completo
    if (normalizado.includes(ativoCatalogado.slice(0, 4))) {
      return ativoCatalogado;
    }
  }
  
  console.warn(`Ativo não reconhecido: ${ativo}`);
  return normalizado; // Retornar o ativo original normalizado
};

// Retorna a lista completa de ativos da B3
export const getListaAtivosB3 = (): string[] => {
  return [...ativosB3];
};
