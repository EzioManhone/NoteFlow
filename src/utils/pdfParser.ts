
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
      
      // Dados de exemplo baseados no nome do arquivo
      const notaCorretagem: NotaCorretagem = {
        numero: numeroNota,
        data: new Date().toISOString().split('T')[0],
        corretora: "XP Investimentos",
        valorTotal: 10000 + Math.random() * 5000,
        operacoes: [
          {
            tipo: 'compra',
            ativo: 'PETR4',
            quantidade: 100,
            preco: 28.76,
            data: new Date().toISOString().split('T')[0],
            valor: 2876,
            corretagem: 10,
            dayTrade: false
          },
          {
            tipo: 'venda',
            ativo: 'VALE3',
            quantidade: 50,
            preco: 68.90,
            data: new Date().toISOString().split('T')[0],
            valor: 3445,
            corretagem: 10,
            dayTrade: false
          },
          {
            tipo: 'compra',
            ativo: 'ITUB4',
            quantidade: 200,
            preco: 30.45,
            data: new Date().toISOString().split('T')[0],
            valor: 6090,
            corretagem: 10,
            dayTrade: true
          }
        ],
        taxas: {
          corretagem: 30,
          liquidacao: 10.42,
          registro: 5.21,
          total: 45.63
        }
      };
      
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
  // Simular cálculo de impostos
  const dayTradeOps = operacoes.filter(op => op.dayTrade);
  const swingTradeOps = operacoes.filter(op => !op.dayTrade);
  
  // Valores simulados
  return {
    dayTrade: dayTradeOps.reduce((acc, op) => 
      op.tipo === 'venda' ? acc + (op.valor * 0.20) : acc, 0),
    swingTrade: swingTradeOps.reduce((acc, op) => 
      op.tipo === 'venda' ? acc + (op.valor * 0.15) : acc, 0),
    prejuizoAcumulado: Math.random() * 1000
  };
};

// Extrair lista de ativos únicos das operações
export const extrairAtivos = (operacoes: Operation[]): string[] => {
  return [...new Set(operacoes.map(op => op.ativo))];
};
