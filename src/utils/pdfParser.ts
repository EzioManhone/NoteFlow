
import { toast } from "@/components/ui/use-toast";

// Tipos de dados para operações e ativos
export interface Operation {
  tipo: 'compra' | 'venda';
  ativo: string;
  quantidade: number;
  preco: number;
  data: string;
  valor: number;
  corretagem: number;
  dayTrade: boolean;
}

export interface Dividendo {
  ativo: string;
  data: string;
  valor: number;
  tipo: 'dividendo' | 'jcp' | 'rendimento';
}

export interface NotaCorretagem {
  numero: string;
  data: string;
  corretora: string;
  valorTotal: number;
  operacoes: Operation[];
  taxas: {
    corretagem: number;
    liquidacao: number;
    registro: number;
    total: number;
  };
}

/**
 * Função para extrair dados de uma nota de corretagem em PDF
 * Esta é uma implementação simulada - em um ambiente real, 
 * você usaria uma biblioteca como pdf.js para extrair texto
 * e algoritmos mais avançados para parsing estruturado
 */
export const parsePdfCorretagem = async (file: File): Promise<NotaCorretagem> => {
  // Simulação de processamento de PDF (em produção, usar biblioteca como pdf.js)
  return new Promise((resolve) => {
    // Simular tempo de processamento
    setTimeout(() => {
      // Extrair nome do arquivo para simular número da nota
      const numeroNota = file.name.replace(".pdf", "");
      
      // Lista de possíveis ativos para simulação
      const ativosPossiveis = [
        'PETR4', 'VALE3', 'ITUB4', 'BBAS3', 'BBDC4', 'ABEV3', 'WEGE3', 
        'MGLU3', 'VVAR3', 'BPAC11', 'RADL3', 'B3SA3', 'RENT3', 'LREN3',
        'JBSS3', 'VIVT4', 'ITSA4', 'COGN3', 'BRDT3', 'EGIE3', 'PRIO3',
        'SUZB3', 'CMIG4', 'BRFS3', 'CSAN3', 'SBSP3', 'KLBN11', 'TAEE11',
        'ELET3', 'ELET6', 'ENBR3', 'FLRY3', 'GGBR4', 'GOAU4'
      ];
      
      // Gerar número aleatório entre 3 e 8 para determinar quantas operações serão geradas
      const numOperacoes = 3 + Math.floor(Math.random() * 6);
      
      // Gerar operações aleatórias
      const operacoes: Operation[] = [];
      
      for (let i = 0; i < numOperacoes; i++) {
        const ativoIndex = Math.floor(Math.random() * ativosPossiveis.length);
        const ativo = ativosPossiveis[ativoIndex];
        const tipo = Math.random() > 0.5 ? 'compra' : 'venda';
        const quantidade = 100 * (1 + Math.floor(Math.random() * 5));
        const preco = 10 + Math.random() * 90;
        const valor = quantidade * preco;
        const dayTrade = Math.random() > 0.7; // 30% de chance de ser day trade
        
        operacoes.push({
          tipo,
          ativo,
          quantidade,
          preco: parseFloat(preco.toFixed(2)),
          data: new Date().toISOString().split('T')[0],
          valor: parseFloat(valor.toFixed(2)),
          corretagem: parseFloat((valor * 0.0025).toFixed(2)),
          dayTrade
        });
      }
      
      // Calcular taxas
      const valorTotal = operacoes.reduce((acc, op) => acc + op.valor, 0);
      const corretagem = operacoes.reduce((acc, op) => acc + op.corretagem, 0);
      const liquidacao = parseFloat((valorTotal * 0.00025).toFixed(2));
      const registro = parseFloat((valorTotal * 0.00005).toFixed(2));
      
      const notaCorretagem: NotaCorretagem = {
        numero: numeroNota,
        data: new Date().toISOString().split('T')[0],
        corretora: "XP Investimentos",
        valorTotal,
        operacoes,
        taxas: {
          corretagem,
          liquidacao,
          registro,
          total: parseFloat((corretagem + liquidacao + registro).toFixed(2))
        }
      };
      
      console.log("Nota de corretagem processada:", notaCorretagem);
      resolve(notaCorretagem);
    }, 1500); // Simular 1.5 segundos de processamento
  });
};

// Calcular impostos conforme regras brasileiras
export const calcularImpostos = (operacoes: Operation[]): { 
  dayTrade: number, 
  swingTrade: number,
  prejuizoAcumulado: number 
} => {
  // Separar operações por tipo
  const dayTradeOps = operacoes.filter(op => op.dayTrade);
  const swingTradeOps = operacoes.filter(op => !op.dayTrade);
  
  // Calcular resultado de day trade (alíquota 20%)
  let resultadoDayTrade = 0;
  dayTradeOps.forEach(op => {
    if (op.tipo === 'venda') {
      // Assumindo que para cada venda há uma compra correspondente (simplificação)
      const compraCorrespondente = dayTradeOps.find(
        c => c.tipo === 'compra' && c.ativo === op.ativo && c.data === op.data
      );
      
      if (compraCorrespondente) {
        const lucro = op.valor - compraCorrespondente.valor;
        resultadoDayTrade += lucro;
      }
    }
  });
  
  // Calcular resultado de swing trade (alíquota 15%)
  let resultadoSwingTrade = 0;
  
  // Agrupar operações swing trade por ativo
  const ativosSwing = [...new Set(swingTradeOps.map(op => op.ativo))];
  
  ativosSwing.forEach(ativo => {
    const opsAtivo = swingTradeOps.filter(op => op.ativo === ativo);
    const vendas = opsAtivo.filter(op => op.tipo === 'venda');
    const compras = opsAtivo.filter(op => op.tipo === 'compra');
    
    let qtdComprada = compras.reduce((acc, curr) => acc + curr.quantidade, 0);
    let valorComprado = compras.reduce((acc, curr) => acc + curr.valor, 0);
    let precoMedioCompra = qtdComprada > 0 ? valorComprado / qtdComprada : 0;
    
    vendas.forEach(venda => {
      if (qtdComprada >= venda.quantidade) {
        const custoCompra = venda.quantidade * precoMedioCompra;
        const lucro = venda.valor - custoCompra;
        resultadoSwingTrade += lucro;
      }
    });
  });
  
  // Simular prejuízo acumulado (para fins de demonstração)
  const prejuizoAcumulado = Math.max(0, -(resultadoDayTrade + resultadoSwingTrade) * 0.3);
  
  // Calcular imposto a pagar (simplificado)
  const impostoDayTrade = Math.max(0, resultadoDayTrade * 0.20);
  const impostoSwingTrade = Math.max(0, resultadoSwingTrade * 0.15);
  
  return {
    dayTrade: parseFloat(impostoDayTrade.toFixed(2)),
    swingTrade: parseFloat(impostoSwingTrade.toFixed(2)),
    prejuizoAcumulado: parseFloat(prejuizoAcumulado.toFixed(2))
  };
};

// Extrair lista de ativos únicos das operações
export const extrairAtivos = (operacoes: Operation[]): string[] => {
  return [...new Set(operacoes.map(op => op.ativo))];
};
