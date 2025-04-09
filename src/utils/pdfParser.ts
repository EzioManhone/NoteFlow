
import { toast } from "@/components/ui/use-toast";
import { ativoExisteNaB3, getListaAtivosB3, corrigirNomeAtivo } from "@/services/stockService";

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
  resultadoDayTrade: number;
  resultadoSwingTrade: number;
  mes: string;
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
      
      // Gerar uma data de operação (simulada)
      const hoje = new Date();
      const dataOperacao = hoje.toISOString().split('T')[0];
      const mesOperacao = hoje.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      
      // Lista de possíveis ativos para simulação - usando ativos reais da B3
      const ativosPossiveis = getListaAtivosB3();
      
      // Gerar número aleatório entre 3 e 8 para determinar quantas operações serão geradas
      const numOperacoes = 3 + Math.floor(Math.random() * 6);
      
      // Gerar operações aleatórias
      const operacoes: Operation[] = [];
      
      // Simular algumas operações de Day Trade (mesmo ativo, compra e venda no mesmo dia)
      const numDayTrades = 1 + Math.floor(Math.random() * 2); // 1 ou 2 day trades
      for (let i = 0; i < numDayTrades; i++) {
        const ativoIndex = Math.floor(Math.random() * ativosPossiveis.length);
        const ativo = ativosPossiveis[ativoIndex];
        const quantidade = 100 * (1 + Math.floor(Math.random() * 5));
        const precoCompra = 10 + Math.random() * 90;
        const precoVenda = precoCompra * (1 + (Math.random() * 0.02 - 0.01)); // +/-1% do preço de compra
        
        // Operação de compra
        operacoes.push({
          tipo: 'compra',
          ativo,
          quantidade,
          preco: parseFloat(precoCompra.toFixed(2)),
          data: dataOperacao,
          valor: parseFloat((quantidade * precoCompra).toFixed(2)),
          corretagem: parseFloat((quantidade * precoCompra * 0.0025).toFixed(2)),
          dayTrade: true
        });
        
        // Operação de venda do mesmo ativo
        operacoes.push({
          tipo: 'venda',
          ativo,
          quantidade,
          preco: parseFloat(precoVenda.toFixed(2)),
          data: dataOperacao,
          valor: parseFloat((quantidade * precoVenda).toFixed(2)),
          corretagem: parseFloat((quantidade * precoVenda * 0.0025).toFixed(2)),
          dayTrade: true
        });
      }
      
      // Gerar operações normais (não day trade)
      for (let i = 0; i < numOperacoes - (numDayTrades * 2); i++) {
        const ativoIndex = Math.floor(Math.random() * ativosPossiveis.length);
        const ativo = ativosPossiveis[ativoIndex];
        const tipo = Math.random() > 0.5 ? 'compra' : 'venda';
        const quantidade = 100 * (1 + Math.floor(Math.random() * 5));
        const preco = 10 + Math.random() * 90;
        const valor = quantidade * preco;
        
        operacoes.push({
          tipo,
          ativo,
          quantidade,
          preco: parseFloat(preco.toFixed(2)),
          data: dataOperacao,
          valor: parseFloat(valor.toFixed(2)),
          corretagem: parseFloat((valor * 0.0025).toFixed(2)),
          dayTrade: false
        });
      }
      
      // Calcular resultados de Day Trade e Swing Trade
      const { resultadoDayTrade, resultadoSwingTrade } = calcularResultadosPorTipo(operacoes);
      
      // Calcular taxas
      const valorTotal = operacoes.reduce((acc, op) => acc + op.valor, 0);
      const corretagem = operacoes.reduce((acc, op) => acc + op.corretagem, 0);
      const liquidacao = parseFloat((valorTotal * 0.00025).toFixed(2));
      const registro = parseFloat((valorTotal * 0.00005).toFixed(2));
      
      const notaCorretagem: NotaCorretagem = {
        numero: numeroNota,
        data: dataOperacao,
        corretora: "XP Investimentos",
        valorTotal,
        operacoes,
        resultadoDayTrade,
        resultadoSwingTrade,
        mes: mesOperacao,
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

// Calcular resultados por tipo de operação (Day Trade e Swing Trade)
export const calcularResultadosPorTipo = (operacoes: Operation[]): {
  resultadoDayTrade: number;
  resultadoSwingTrade: number;
} => {
  // Separar operações por tipo
  const dayTrades = operacoes.filter(op => op.dayTrade);
  const swingTrades = operacoes.filter(op => !op.dayTrade);
  
  // Calcular resultado de Day Trade
  let resultadoDayTrade = 0;
  
  // Agrupar Day Trades por ativo
  const dayTradesPorAtivo: Record<string, Operation[]> = {};
  dayTrades.forEach(op => {
    if (!dayTradesPorAtivo[op.ativo]) {
      dayTradesPorAtivo[op.ativo] = [];
    }
    dayTradesPorAtivo[op.ativo].push(op);
  });
  
  // Calcular resultado para cada ativo
  Object.values(dayTradesPorAtivo).forEach(opsAtivo => {
    const compras = opsAtivo.filter(op => op.tipo === 'compra');
    const vendas = opsAtivo.filter(op => op.tipo === 'venda');
    
    const valorCompras = compras.reduce((acc, op) => acc + op.valor, 0);
    const valorVendas = vendas.reduce((acc, op) => acc + op.valor, 0);
    
    // Resultado é venda - compra
    resultadoDayTrade += valorVendas - valorCompras;
  });
  
  // Calcular resultado de Swing Trade
  let resultadoSwingTrade = 0;
  
  // Calcular vendas e compras
  const comprasSwing = swingTrades.filter(op => op.tipo === 'compra');
  const vendasSwing = swingTrades.filter(op => op.tipo === 'venda');
  
  const valorComprasSwing = comprasSwing.reduce((acc, op) => acc + op.valor, 0);
  const valorVendasSwing = vendasSwing.reduce((acc, op) => acc + op.valor, 0);
  
  // Resultado simples (em um sistema real, seria baseado no preço médio)
  resultadoSwingTrade = valorVendasSwing - valorComprasSwing;
  
  return {
    resultadoDayTrade: parseFloat(resultadoDayTrade.toFixed(2)),
    resultadoSwingTrade: parseFloat(resultadoSwingTrade.toFixed(2))
  };
};

// Calcular impostos conforme regras brasileiras
export const calcularImpostos = (operacoes: Operation[]): { 
  dayTrade: number, 
  swingTrade: number,
  prejuizoAcumulado: number 
} => {
  // Agrupar operações por data e tipo (day trade ou swing trade)
  const operacoesPorData: Record<string, {
    dayTrade: Operation[],
    swingTrade: Operation[]
  }> = {};
  
  // Separar operações por data e tipo
  operacoes.forEach(op => {
    if (!operacoesPorData[op.data]) {
      operacoesPorData[op.data] = {
        dayTrade: [],
        swingTrade: []
      };
    }
    
    if (op.dayTrade) {
      operacoesPorData[op.data].dayTrade.push(op);
    } else {
      operacoesPorData[op.data].swingTrade.push(op);
    }
  });
  
  // Calcular resultados de day trade e swing trade por data
  let resultadoDayTrade = 0;
  let resultadoSwingTrade = 0;
  
  // Para cada data, calcular os resultados
  Object.entries(operacoesPorData).forEach(([data, ops]) => {
    // Processar day trades (alíquota 20%)
    if (ops.dayTrade.length > 0) {
      // Agrupar por ativo
      const dayTradesPorAtivo: Record<string, Operation[]> = {};
      ops.dayTrade.forEach(op => {
        if (!dayTradesPorAtivo[op.ativo]) {
          dayTradesPorAtivo[op.ativo] = [];
        }
        dayTradesPorAtivo[op.ativo].push(op);
      });
      
      // Calcular resultado para cada ativo
      Object.values(dayTradesPorAtivo).forEach(opsAtivo => {
        const compras = opsAtivo.filter(op => op.tipo === 'compra');
        const vendas = opsAtivo.filter(op => op.tipo === 'venda');
        
        const valorCompras = compras.reduce((acc, op) => acc + op.valor, 0);
        const valorVendas = vendas.reduce((acc, op) => acc + op.valor, 0);
        
        // Resultado é a diferença entre vendas e compras
        const resultado = valorVendas - valorCompras;
        resultadoDayTrade += resultado;
      });
    }
    
    // Processar swing trades (alíquota 15%)
    if (ops.swingTrade.length > 0) {
      // Não calculamos swing trade diariamente, pois depende do preço médio acumulado
      // Este é um modelo simplificado para simulação
      const compras = ops.swingTrade.filter(op => op.tipo === 'compra');
      const vendas = ops.swingTrade.filter(op => op.tipo === 'venda');
      
      const valorCompras = compras.reduce((acc, op) => acc + op.valor, 0);
      const valorVendas = vendas.reduce((acc, op) => acc + op.valor, 0);
      
      // Em um sistema real, precisaria calcular o lucro com base no preço médio
      const resultado = valorVendas - valorCompras;
      resultadoSwingTrade += resultado;
    }
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
  // Corrigir nomes de ativos antes de extrair lista única
  const ativosCorrigidos = operacoes.map(op => corrigirNomeAtivo(op.ativo));
  return [...new Set(ativosCorrigidos)];
};
