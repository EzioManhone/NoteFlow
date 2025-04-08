
import { Operation, NotaCorretagem, Dividendo } from "@/utils/pdfParser";

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
  }[];
}

export interface WidgetConfig {
  id: string;
  title: string;
  type: 'resumo' | 'ir' | 'dividendos' | 'historico' | 'portfolio';
  content?: React.ReactNode;
  icon?: React.ReactNode;
}
