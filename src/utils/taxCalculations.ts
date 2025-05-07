
import { Operation, TipoAtivo } from "./pdfParsing";

// Cálculo de impostos com suporte à classificação por tipo
export const calcularImpostos = (operacoes: Operation[]): { 
  dayTrade: number, 
  swingTrade: number,
  prejuizoAcumulado: number,
  impostosPorTipo: Record<TipoAtivo, {dayTrade: number, swingTrade: number}>
} => {
  const operacoesPorData: Record<string, { dayTrade: Operation[], swingTrade: Operation[] }> = {};
  
  operacoes.forEach(op => {
    if (!operacoesPorData[op.data])
      operacoesPorData[op.data] = { dayTrade: [], swingTrade: [] };
    if (op.dayTrade) operacoesPorData[op.data].dayTrade.push(op);
    else operacoesPorData[op.data].swingTrade.push(op);
  });
  
  // Inicializa resultados por tipo
  const resultadosPorTipo: Record<TipoAtivo, {dayTrade: number, swingTrade: number}> = {
    acao: {dayTrade: 0, swingTrade: 0},
    fii: {dayTrade: 0, swingTrade: 0},
    etf: {dayTrade: 0, swingTrade: 0},
    opcao: {dayTrade: 0, swingTrade: 0},
    futuro: {dayTrade: 0, swingTrade: 0},
    desconhecido: {dayTrade: 0, swingTrade: 0}
  };
  
  let resultadoDayTrade = 0;
  let resultadoSwingTrade = 0;
  
  // Processa operações por data
  Object.entries(operacoesPorData).forEach(([_, ops]) => {
    // Processa Day Trades
    if (ops.dayTrade.length > 0) {
      const byAtivo: Record<string, Operation[]> = {};
      ops.dayTrade.forEach(op => {
        if (!byAtivo[op.ativo]) byAtivo[op.ativo] = [];
        byAtivo[op.ativo].push(op);
      });
      
      Object.entries(byAtivo).forEach(([_, opsAtivo]) => {
        const tipoAtivo = opsAtivo[0]?.tipoAtivo || 'desconhecido';
        const compras = opsAtivo.filter(op => op.tipo === 'compra');
        const vendas = opsAtivo.filter(op => op.tipo === 'venda');
        const valorCompras = compras.reduce((acc, op) => acc + op.valor, 0);
        const valorVendas = vendas.reduce((acc, op) => acc + op.valor, 0);
        const resultadoAtivo = valorVendas - valorCompras;
        
        resultadoDayTrade += resultadoAtivo;
        resultadosPorTipo[tipoAtivo].dayTrade += resultadoAtivo;
      });
    }
    
    // Processa Swing Trades
    if (ops.swingTrade.length > 0) {
      const swingPorTipo: Record<TipoAtivo, Operation[]> = {
        acao: [],
        fii: [],
        etf: [],
        opcao: [],
        futuro: [],
        desconhecido: []
      };
      
      ops.swingTrade.forEach(op => {
        swingPorTipo[op.tipoAtivo].push(op);
      });
      
      Object.entries(swingPorTipo).forEach(([tipo, opsSwing]) => {
        const tipoAtivo = tipo as TipoAtivo;
        const compras = opsSwing.filter(op => op.tipo === 'compra');
        const vendas = opsSwing.filter(op => op.tipo === 'venda');
        const valorCompras = compras.reduce((acc, op) => acc + op.valor, 0);
        const valorVendas = vendas.reduce((acc, op) => acc + op.valor, 0);
        const resultadoTipo = valorVendas - valorCompras;
        
        resultadoSwingTrade += resultadoTipo;
        resultadosPorTipo[tipoAtivo].swingTrade += resultadoTipo;
      });
    }
  });
  
  // Calcula impostos com base nos resultados
  const prejuizoAcumulado = Math.max(0, -(resultadoDayTrade + resultadoSwingTrade) * 0.3);
  
  // Alíquotas diferentes por tipo de ativo
  const impostosPorTipo: Record<TipoAtivo, {dayTrade: number, swingTrade: number}> = {
    acao: {
      dayTrade: Math.max(0, resultadosPorTipo.acao.dayTrade * 0.20),
      swingTrade: Math.max(0, resultadosPorTipo.acao.swingTrade * 0.15)
    },
    fii: {
      dayTrade: Math.max(0, resultadosPorTipo.fii.dayTrade * 0.20),
      swingTrade: Math.max(0, resultadosPorTipo.fii.swingTrade * 0.20) // FIIs têm alíquota diferente
    },
    etf: {
      dayTrade: Math.max(0, resultadosPorTipo.etf.dayTrade * 0.20),
      swingTrade: Math.max(0, resultadosPorTipo.etf.swingTrade * 0.15)
    },
    opcao: {
      dayTrade: Math.max(0, resultadosPorTipo.opcao.dayTrade * 0.20),
      swingTrade: Math.max(0, resultadosPorTipo.opcao.swingTrade * 0.15)
    },
    futuro: {
      dayTrade: Math.max(0, resultadosPorTipo.futuro.dayTrade * 0.20),
      swingTrade: Math.max(0, resultadosPorTipo.futuro.swingTrade * 0.15)
    },
    desconhecido: {
      dayTrade: Math.max(0, resultadosPorTipo.desconhecido.dayTrade * 0.20),
      swingTrade: Math.max(0, resultadosPorTipo.desconhecido.swingTrade * 0.15)
    }
  };
  
  const impostoDayTrade = Object.values(impostosPorTipo).reduce((acc, i) => acc + i.dayTrade, 0);
  const impostoSwingTrade = Object.values(impostosPorTipo).reduce((acc, i) => acc + i.swingTrade, 0);

  return {
    dayTrade: parseFloat(impostoDayTrade.toFixed(2)),
    swingTrade: parseFloat(impostoSwingTrade.toFixed(2)),
    prejuizoAcumulado: parseFloat(prejuizoAcumulado.toFixed(2)),
    impostosPorTipo
  };
};
