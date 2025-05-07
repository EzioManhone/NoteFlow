
import { TipoAtivo } from "./types";
import { ativoExisteNaB3 } from "@/services/stockService";
import { BLOCOS_VALIDOS, REGEX_ACOES, REGEX_FIIS, REGEX_ETFS, REGEX_OPCOES, REGEX_MINI_CONTRATOS } from "./constants";

// Extracts assets of all types within valid blocks with stricter validation
export const extrairAtivosDoTexto = (text: string): { 
  ativos: Array<{codigo: string, tipo: TipoAtivo}>, 
  emBlocoValido: boolean, 
  indicesBlocos: number[] 
} => {
  const textUpperCase = text.toUpperCase();
  const ativos: Array<{codigo: string, tipo: TipoAtivo}> = [];
  let emBlocoValido = false;
  const indicesBlocos: number[] = [];

  // Find all valid blocks in the text
  BLOCOS_VALIDOS.forEach(bloco => {
    let idx = textUpperCase.indexOf(bloco);
    while (idx !== -1) {
      indicesBlocos.push(idx);
      idx = textUpperCase.indexOf(bloco, idx + 1);
    }
  });
  
  if (indicesBlocos.length === 0) {
    return { ativos: [], emBlocoValido: false, indicesBlocos: [] };
  }
  
  indicesBlocos.sort((a, b) => a - b);

  // For each block, extract assets using refined patterns
  for (let i = 0; i < indicesBlocos.length; i++) {
    const inicio = indicesBlocos[i];
    const fim = i < indicesBlocos.length - 1 ? indicesBlocos[i + 1] : textUpperCase.length;
    const blocoTexto = textUpperCase.substring(inicio, fim);
    
    // Extract stocks
    const matchesAcoes = [...blocoTexto.matchAll(REGEX_ACOES)];
    // Extract FIIs
    const matchesFIIs = [...blocoTexto.matchAll(REGEX_FIIS)];
    // Extract ETFs
    const matchesETFs = [...blocoTexto.matchAll(REGEX_ETFS)];
    // Extract options
    const matchesOpcoes = [...blocoTexto.matchAll(REGEX_OPCOES)];
    // Extract mini contracts
    const matchesMini = [...blocoTexto.matchAll(REGEX_MINI_CONTRATOS)];
    
    const todosMatches = [
      ...matchesAcoes.map(m => ({ match: m[0], tipo: 'acao' as TipoAtivo })),
      ...matchesFIIs.map(m => ({ match: m[0], tipo: 'fii' as TipoAtivo })),
      ...matchesETFs.map(m => ({ match: m[0], tipo: 'etf' as TipoAtivo })),
      ...matchesOpcoes.map(m => ({ match: m[0], tipo: 'opcao' as TipoAtivo })),
      ...matchesMini.map(m => ({ match: m[0], tipo: 'futuro' as TipoAtivo }))
    ];
    
    if (todosMatches.length > 0) {
      emBlocoValido = true;
      todosMatches.forEach(match => {
        const ativo = match.match;
        const tipo = match.tipo;
        
        // Strict verification if the asset exists in B3 and is not duplicated
        if (ativoExisteNaB3(ativo) && !ativos.some(a => a.codigo === ativo)) {
          ativos.push({ codigo: ativo, tipo });
        }
      });
    }
  }
  
  console.log(`[pdfParsing] Assets found after validation: ${ativos.length}`, ativos);
  
  return { ativos, emBlocoValido, indicesBlocos };
};
