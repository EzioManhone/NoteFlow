
import { Operation, TipoAtivo } from "./pdfParsing";
import { ativoExisteNaB3, corrigirNomeAtivo } from "@/services/stockService";

// Extrair lista de ativos únicos das operações com seus tipos
export const extrairAtivos = (operacoes: Operation[]): { codigo: string, tipo: TipoAtivo }[] => {
  const operacoesValidas = operacoes.filter(op => op.emBlocoValido && ativoExisteNaB3(op.ativo));
  const ativosMapeados = operacoesValidas.map(op => ({ 
    codigo: corrigirNomeAtivo(op.ativo), 
    tipo: op.tipoAtivo 
  }));
  
  // Remove duplicatas
  const ativosUnicos: { codigo: string, tipo: TipoAtivo }[] = [];
  ativosMapeados.forEach(ativo => {
    if (!ativosUnicos.some(a => a.codigo === ativo.codigo)) {
      ativosUnicos.push(ativo);
    }
  });
  
  return ativosUnicos;
};
