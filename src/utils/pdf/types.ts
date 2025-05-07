
import { BLOCOS_VALIDOS } from "./constants";

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
  strike?: string; // Adding strike field for options
  ativoBase?: string; // Adding ativoBase field for options
}

