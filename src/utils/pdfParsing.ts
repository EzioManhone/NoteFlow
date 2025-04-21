
import { ativoExisteNaB3 } from "@/services/stockService";

// Palavras-chave para blocos corretos
export const BLOCOS_VALIDOS = [
  "NEGOCIAÇÃO",
  "MERCADO",
  "ESPECIFICAÇÃO DO TÍTULO",
  "RESUMO DAS OPERAÇÕES",
];

export const REGEX_ATIVOS_BR = /[A-Z]{4}[0-9]{1,2}/g;

export interface Operation {
  tipo: 'compra' | 'venda';
  ativo: string;
  quantidade: number;
  preco: number;
  data: string;
  valor: number;
  corretagem: number;
  dayTrade: boolean;
  emBlocoValido: boolean;
}

// Extrai ativos dentro de blocos válidos simulados
export const extrairAtivosDoTexto = (text: string): { ativos: string[], emBlocoValido: boolean, indicesBlocos: number[] } => {
  const textUpperCase = text.toUpperCase();
  const ativos: string[] = [];
  let emBlocoValido = false;
  const indicesBlocos: number[] = [];

  BLOCOS_VALIDOS.forEach(bloco => {
    let idx = textUpperCase.indexOf(bloco);
    while (idx !== -1) {
      indicesBlocos.push(idx);
      idx = textUpperCase.indexOf(bloco, idx + 1);
    }
  });
  if (indicesBlocos.length === 0) return { ativos: [], emBlocoValido: false, indicesBlocos: [] };
  indicesBlocos.sort((a, b) => a - b);

  for (let i = 0; i < indicesBlocos.length; i++) {
    const inicio = indicesBlocos[i];
    const fim = i < indicesBlocos.length - 1 ? indicesBlocos[i + 1] : textUpperCase.length;
    const blocoTexto = textUpperCase.substring(inicio, fim);
    const matches = [...blocoTexto.matchAll(REGEX_ATIVOS_BR)];
    if (matches.length > 0) {
      emBlocoValido = true;
      matches.forEach(match => {
        const ativo = match[0];
        if (ativoExisteNaB3(ativo) && !ativos.includes(ativo)) {
          ativos.push(ativo);
        }
      });
    }
  }
  return { ativos, emBlocoValido, indicesBlocos };
};
