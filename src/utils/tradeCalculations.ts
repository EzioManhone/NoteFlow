
import { Operation, TipoAtivo } from "./pdfParsing";

// Cálculo de resultados DayTrade/SwingTrade com suporte à classificação por tipo
export const calcularResultadosPorTipo = (operacoes: Operation[]): {
  resultadoDayTrade: number;
  resultadoSwingTrade: number;
  resultadosPorTipo: Record<TipoAtivo, {dayTrade: number, swingTrade: number}>
} => {
  const dayTrades = operacoes.filter(op => op.dayTrade);
  const swingTrades = operacoes.filter(op => !op.dayTrade);
  
  // Inicializa resultados por tipo
  const resultadosPorTipo: Record<TipoAtivo, {dayTrade: number, swingTrade: number}> = {
    acao: {dayTrade: 0, swingTrade: 0},
    fii: {dayTrade: 0, swingTrade: 0},
    etf: {dayTrade: 0, swingTrade: 0},
    opcao: {dayTrade: 0, swingTrade: 0},
    futuro: {dayTrade: 0, swingTrade: 0},
    desconhecido: {dayTrade: 0, swingTrade: 0}
  };
  
  // Calcula resultados de Day Trade
  let resultadoDayTrade = 0;
  const dayTradesPorAtivo: Record<string, Operation[]> = {};
  
  dayTrades.forEach(op => {
    if (!dayTradesPorAtivo[op.ativo]) dayTradesPorAtivo[op.ativo] = [];
    dayTradesPorAtivo[op.ativo].push(op);
  });
  
  Object.entries(dayTradesPorAtivo).forEach(([ativo, opsAtivo]) => {
    const tipoAtivo = opsAtivo[0]?.tipoAtivo || 'desconhecido';
    const compras = opsAtivo.filter(op => op.tipo === 'compra');
    const vendas = opsAtivo.filter(op => op.tipo === 'venda');
    const valorCompras = compras.reduce((acc, op) => acc + op.valor, 0);
    const valorVendas = vendas.reduce((acc, op) => acc + op.valor, 0);
    const resultadoAtivo = valorVendas - valorCompras;
    
    resultadoDayTrade += resultadoAtivo;
    resultadosPorTipo[tipoAtivo].dayTrade += resultadoAtivo;
  });
  
  // Calcula resultados de Swing Trade
  let resultadoSwingTrade = 0;
  const swingTradesPorTipo: Record<TipoAtivo, Operation[]> = {
    acao: [],
    fii: [],
    etf: [],
    opcao: [],
    futuro: [],
    desconhecido: []
  };
  
  swingTrades.forEach(op => {
    swingTradesPorTipo[op.tipoAtivo].push(op);
  });
  
  Object.entries(swingTradesPorTipo).forEach(([tipo, ops]) => {
    const tipoAtivo = tipo as TipoAtivo;
    const compras = ops.filter(op => op.tipo === 'compra');
    const vendas = ops.filter(op => op.tipo === 'venda');
    const valorCompras = compras.reduce((acc, op) => acc + op.valor, 0);
    const valorVendas = vendas.reduce((acc, op) => acc + op.valor, 0);
    const resultadoTipo = valorVendas - valorCompras;
    
    resultadoSwingTrade += resultadoTipo;
    resultadosPorTipo[tipoAtivo].swingTrade += resultadoTipo;
  });

  return {
    resultadoDayTrade: parseFloat(resultadoDayTrade.toFixed(2)),
    resultadoSwingTrade: parseFloat(resultadoSwingTrade.toFixed(2)),
    resultadosPorTipo
  };
};
