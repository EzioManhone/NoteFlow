import { Operation, NotaCorretagem, Dividendo } from "@/utils/pdfParser";
import { Cotacao } from "@/services/stockService";

export interface DashboardData {
  notasCorretagem: NotaCorretagem[];
  ativos: string[];
  impostos: {
    dayTrade: number;
    swingTrade: number;
    prejuizoAcumulado: number;
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
  type: 'resumo' | 'ir' | 'dividendos' | 'historico' | 'portfolio' | 'custom';
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
