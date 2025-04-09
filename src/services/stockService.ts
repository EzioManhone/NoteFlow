
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
  'ABEV3', 'ALPA4', 'AMER3', 'ASAI3', 'AZUL4', 'B3SA3', 'BBAS3', 'BBDC3', 'BBDC4', 'BBSE3',
  'BEEF3', 'BPAC11', 'BRAP4', 'BRFS3', 'BRKM5', 'BRML3', 'CASH3', 'CCRO3', 'CIEL3', 'CMIG4',
  'CMIN3', 'COGN3', 'CPFE3', 'CPLE6', 'CRFB3', 'CSAN3', 'CSNA3', 'CVCB3', 'CYRE3', 'DXCO3',
  'EGIE3', 'ELET3', 'ELET6', 'EMBR3', 'ENBR3', 'ENEV3', 'ENGI11', 'EQTL3', 'EZTC3', 'FLRY3',
  'GGBR4', 'GOAU4', 'GOLL4', 'HAPV3', 'HYPE3', 'IGTI11', 'IRBR3', 'ITSA4', 'ITUB4', 'JBSS3',
  'JHSF3', 'KLBN11', 'LCAM3', 'LWSA3', 'MGLU3', 'MRFG3', 'MRVE3', 'MULT3', 'NTCO3', 'PCAR3',
  'PETR3', 'PETR4', 'PETZ3', 'POSI3', 'PRIO3', 'QUAL3', 'RADL3', 'RAIL3', 'RAIZ4', 'RDOR3',
  'RENT3', 'RRRP3', 'SANB11', 'SBSP3', 'SLCE3', 'SMTO3', 'SOMA3', 'SUZB3', 'TAEE11', 'TIMS3',
  'TOTS3', 'UGPA3', 'USIM5', 'VALE3', 'VBBR3', 'VIIA3', 'VIVT3', 'WEGE3', 'YDUQ3'
];

// Função para buscar cotações de ativos da B3
export const buscarCotacoes = async (ativos: string[]): Promise<Cotacao[]> => {
  // Em um ambiente real, aqui seria feita uma chamada para uma API de cotações
  // Como é uma simulação, vamos gerar dados fictícios
  
  try {
    console.log('Buscando cotações para:', ativos);
    
    // Filtramos apenas os ativos válidos da B3
    const ativosValidos = ativos.filter(ativo => 
      ativosB3.includes(ativo.toUpperCase())
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
  return ativosB3.includes(ativo.toUpperCase());
};

// Retorna a lista completa de ativos da B3
export const getListaAtivosB3 = (): string[] => {
  return [...ativosB3];
};
