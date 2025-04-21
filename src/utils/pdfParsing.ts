
import { ativoExisteNaB3 } from "@/services/stockService";

// Palavras-chave para blocos corretos - ampliamos para capturar mais seções válidas
export const BLOCOS_VALIDOS = [
  "NEGOCIAÇÃO",
  "MERCADO",
  "ESPECIFICAÇÃO DO TÍTULO",
  "RESUMO DAS OPERAÇÕES",
  "TÍTULOS NEGOCIADOS",
  "COMPRAS",
  "VENDAS",
  "NOTA DE CORRETAGEM",
  "BOLSA DE VALORES",
];

// Regex para diferentes tipos de ativos
export const REGEX_ATIVOS_BR = /[A-Z]{4}[0-9]{1,2}/g;
export const REGEX_OPCOES = /[A-Z]{4}[A-Z][0-9]{3}/g;
export const REGEX_MINI_CONTRATOS = /WIN[A-Z][0-9]{2}|WDO[A-Z][0-9]{2}|IND[A-Z][0-9]{2}/g;

export type TipoAtivo = 'acao' | 'fii' | 'etf' | 'opcao' | 'futuro' | 'desconhecido';

export interface Operation {
  tipo: 'compra' | 'venda';
  ativo: string;
  tipoAtivo: TipoAtivo;
  quantidade: number;
  preco: number;
  data: string;
  valor: number;
  corretagem: number;
  dayTrade: boolean;
  emBlocoValido: boolean;
}

// Determina o tipo de ativo com base no código
export const determinarTipoAtivo = (ativo: string): TipoAtivo => {
  if (ativo.match(/^[A-Z]{4}11$/)) return 'fii';
  if (ativo.match(/^BOVA11$|^IVVB11$|^SMAL11$/)) return 'etf';
  if (ativo.match(/^[A-Z]{4}[A-Z][0-9]{3}$/)) return 'opcao';
  if (ativo.match(/^WIN[A-Z][0-9]{2}$|^WDO[A-Z][0-9]{2}$|^IND[A-Z][0-9]{2}$/)) return 'futuro';
  if (ativo.match(/^[A-Z]{4}[0-9]{1,2}$/)) return 'acao';
  return 'desconhecido';
};

// Extrai ativos de todos os tipos dentro de blocos válidos
export const extrairAtivosDoTexto = (text: string): { 
  ativos: Array<{codigo: string, tipo: TipoAtivo}>, 
  emBlocoValido: boolean, 
  indicesBlocos: number[] 
} => {
  const textUpperCase = text.toUpperCase();
  const ativos: Array<{codigo: string, tipo: TipoAtivo}> = [];
  let emBlocoValido = false;
  const indicesBlocos: number[] = [];

  // Encontra todos os blocos válidos no texto
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

  // Para cada bloco, extrai os ativos
  for (let i = 0; i < indicesBlocos.length; i++) {
    const inicio = indicesBlocos[i];
    const fim = i < indicesBlocos.length - 1 ? indicesBlocos[i + 1] : textUpperCase.length;
    const blocoTexto = textUpperCase.substring(inicio, fim);
    
    // Extrai ativos regulares (ações, FIIs, ETFs)
    const matchesAtivos = [...blocoTexto.matchAll(REGEX_ATIVOS_BR)];
    // Extrai opções
    const matchesOpcoes = [...blocoTexto.matchAll(REGEX_OPCOES)];
    // Extrai mini contratos
    const matchesMini = [...blocoTexto.matchAll(REGEX_MINI_CONTRATOS)];
    
    const todosMatches = [
      ...matchesAtivos.map(m => ({ match: m[0], tipo: determinarTipoAtivo(m[0]) })),
      ...matchesOpcoes.map(m => ({ match: m[0], tipo: 'opcao' as TipoAtivo })),
      ...matchesMini.map(m => ({ match: m[0], tipo: 'futuro' as TipoAtivo }))
    ];
    
    if (todosMatches.length > 0) {
      emBlocoValido = true;
      todosMatches.forEach(match => {
        const ativo = match.match;
        const tipo = match.tipo;
        
        // Verifica se o ativo existe na B3 e não está duplicado
        if (ativoExisteNaB3(ativo) && !ativos.some(a => a.codigo === ativo)) {
          ativos.push({ codigo: ativo, tipo });
        }
      });
    }
  }
  
  return { ativos, emBlocoValido, indicesBlocos };
};
