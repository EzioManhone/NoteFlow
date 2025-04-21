
import { Operation, NotaCorretagem, Dividendo } from "@/utils/pdfParser";
import { Cotacao } from "@/services/stockService";
import { TipoAtivo } from "@/utils/pdfParsing";

export interface DashboardData {
  notasCorretagem: NotaCorretagem[];
  ativos: { codigo: string; tipo: TipoAtivo }[];
  impostos: {
    dayTrade: number;
    swingTrade: number;
    prejuizoAcumulado: number;
    impostosPorTipo?: Record<TipoAtivo, {dayTrade: number, swingTrade: number}>;
  };
  resultadoMensal: {
    dayTrade: number;
    swingTrade: number;
    mes: string;
  };
  dividendos: Dividendo[];
  portfolio: {
    ativo: string;
    quantidade: number;
    precoMedio: number;
    valorTotal: number;
    cotacaoAtual?: number;
    variacao?: number;
    rentabilidade?: number;
    ultimaAtualizacao?: string;
  }[];
  cotacoes: Cotacao[];
  ultimaAtualizacaoCotacoes?: string;
}

export interface WidgetConfig {
  id: string;
  title: string;
  type: string;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  position?: { x: number, y: number };
  size?: { width: number, height: number };
  visible?: boolean;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  columns?: number;
}
