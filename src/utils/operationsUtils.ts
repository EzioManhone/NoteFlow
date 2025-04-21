
import { Operation } from "./pdfParsing";
import { ativoExisteNaB3, corrigirNomeAtivo } from "@/services/stockService";

// Cálculo de resultados DayTrade/SwingTrade
export const calcularResultadosPorTipo = (operacoes: Operation[]): {
  resultadoDayTrade: number;
  resultadoSwingTrade: number;
} => {
  const dayTrades = operacoes.filter(op => op.dayTrade);
  const swingTrades = operacoes.filter(op => !op.dayTrade);
  let resultadoDayTrade = 0;
  const dayTradesPorAtivo: Record<string, Operation[]> = {};
  dayTrades.forEach(op => {
    if (!dayTradesPorAtivo[op.ativo]) dayTradesPorAtivo[op.ativo] = [];
    dayTradesPorAtivo[op.ativo].push(op);
  });
  Object.values(dayTradesPorAtivo).forEach(opsAtivo => {
    const compras = opsAtivo.filter(op => op.tipo === 'compra');
    const vendas = opsAtivo.filter(op => op.tipo === 'venda');
    const valorCompras = compras.reduce((acc, op) => acc + op.valor, 0);
    const valorVendas = vendas.reduce((acc, op) => acc + op.valor, 0);
    resultadoDayTrade += valorVendas - valorCompras;
  });
  let resultadoSwingTrade = 0;
  const comprasSwing = swingTrades.filter(op => op.tipo === 'compra');
  const vendasSwing = swingTrades.filter(op => op.tipo === 'venda');
  const valorComprasSwing = comprasSwing.reduce((acc, op) => acc + op.valor, 0);
  const valorVendasSwing = vendasSwing.reduce((acc, op) => acc + op.valor, 0);
  resultadoSwingTrade = valorVendasSwing - valorComprasSwing;

  return {
    resultadoDayTrade: parseFloat(resultadoDayTrade.toFixed(2)),
    resultadoSwingTrade: parseFloat(resultadoSwingTrade.toFixed(2)),
  };
};

// Cálculo de impostos
export const calcularImpostos = (operacoes: Operation[]): { 
  dayTrade: number, 
  swingTrade: number,
  prejuizoAcumulado: number 
} => {
  const operacoesPorData: Record<string, { dayTrade: Operation[], swingTrade: Operation[] }> = {};
  operacoes.forEach(op => {
    if (!operacoesPorData[op.data])
      operacoesPorData[op.data] = { dayTrade: [], swingTrade: [] };
    if (op.dayTrade) operacoesPorData[op.data].dayTrade.push(op);
    else operacoesPorData[op.data].swingTrade.push(op);
  });
  let resultadoDayTrade = 0;
  let resultadoSwingTrade = 0;
  Object.entries(operacoesPorData).forEach(([_, ops]) => {
    if (ops.dayTrade.length > 0) {
      const byAtivo: Record<string, Operation[]> = {};
      ops.dayTrade.forEach(op => {
        if (!byAtivo[op.ativo]) byAtivo[op.ativo] = [];
        byAtivo[op.ativo].push(op);
      });
      Object.values(byAtivo).forEach(opsAtivo => {
        const compras = opsAtivo.filter(op => op.tipo === 'compra');
        const vendas = opsAtivo.filter(op => op.tipo === 'venda');
        const valorCompras = compras.reduce((acc, op) => acc + op.valor, 0);
        const valorVendas = vendas.reduce((acc, op) => acc + op.valor, 0);
        resultadoDayTrade += valorVendas - valorCompras;
      });
    }
    if (ops.swingTrade.length > 0) {
      const compras = ops.swingTrade.filter(op => op.tipo === 'compra');
      const vendas = ops.swingTrade.filter(op => op.tipo === 'venda');
      const valorCompras = compras.reduce((acc, op) => acc + op.valor, 0);
      const valorVendas = vendas.reduce((acc, op) => acc + op.valor, 0);
      resultadoSwingTrade += valorVendas - valorCompras;
    }
  });
  const prejuizoAcumulado = Math.max(0, -(resultadoDayTrade + resultadoSwingTrade) * 0.3);
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
  const operacoesValidas = operacoes.filter(op => op.emBlocoValido && ativoExisteNaB3(op.ativo));
  const ativosCorrigidos = operacoesValidas.map(op => corrigirNomeAtivo(op.ativo));
  return [...new Set(ativosCorrigidos)];
};
