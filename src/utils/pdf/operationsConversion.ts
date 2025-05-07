
import { Operation, TipoAtivo } from "./types";
import { ativoExisteNaB3 } from "@/services/stockService";
import { determinarTipoAtivo } from "./assetTypeDetermination";
import { ExtracaoOperacao } from "../pdfExtraction";

// Converts extracted operations directly to Operation format
export const converterParaOperations = (
  operacoesExtraidas: ExtracaoOperacao[], 
  corretora: string = "XP Investimentos"
): Operation[] => {
  const operations: Operation[] = [];
  
  for (const op of operacoesExtraidas) {
    // Validate if asset exists in B3
    if (!ativoExisteNaB3(op.codigo)) {
      console.warn(`[pdfParsing] Asset ${op.codigo} not found in B3 list - ignored`);
      continue;
    }
    
    const tipoAtivo = determinarTipoAtivo(op.codigo);
    const tipoBaixado = op.tipo === 'COMPRA' ? 'compra' : 'venda';
    
    // Format date to ISO standard (YYYY-MM-DD)
    let dataFormatada = op.data;
    if (op.data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dia, mes, ano] = op.data.split('/');
      dataFormatada = `${ano}-${mes}-${dia}`;
    }
    
    // Simulated brokerage fee (0.25% or minimum value of R$ 5.00)
    const taxaCorretagem = Math.max(5, op.valorTotal * 0.0025);
    
    operations.push({
      tipo: tipoBaixado,
      ativo: op.codigo,
      tipoAtivo,
      quantidade: op.quantidade,
      preco: op.precoUnitario,
      data: dataFormatada,
      valor: op.valorTotal,
      corretagem: parseFloat(taxaCorretagem.toFixed(2)),
      dayTrade: false, // Will be calculated later
      emBlocoValido: true, // Extracted operations are considered valid
      strike: op.strike,
      ativoBase: op.ativoBase
    });
  }
  
  // Identify day trade operations
  const operacoesPorDiaAtivo: Record<string, Operation[]> = {};
  
  // Group operations by day and asset
  operations.forEach(op => {
    const chave = `${op.data}-${op.ativo}`;
    if (!operacoesPorDiaAtivo[chave]) {
      operacoesPorDiaAtivo[chave] = [];
    }
    operacoesPorDiaAtivo[chave].push(op);
  });
  
  // Mark operations as day trade when there are buys and sells of the same asset on the same day
  Object.values(operacoesPorDiaAtivo).forEach(ops => {
    if (ops.length >= 2) {
      const temCompra = ops.some(op => op.tipo === 'compra');
      const temVenda = ops.some(op => op.tipo === 'venda');
      
      if (temCompra && temVenda) {
        ops.forEach(op => {
          op.dayTrade = true;
        });
      }
    }
  });
  
  return operations;
};
