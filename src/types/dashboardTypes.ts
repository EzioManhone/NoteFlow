
import { ReactNode } from "react";
import { TipoAtivo } from "@/utils/pdfParsing";

export interface WidgetPartial {
  id: string;
  title: string;
  type: string;
  component: ReactNode;
  icon?: ReactNode;
}

export interface TabContent {
  title: string;
  icon: ReactNode;
  content: ReactNode;
}

export interface PdfExtractionResult {
  success: boolean;
  method: "text" | "ocr";
  ativos: string[];
  tiposAtivos?: Array<{ tipo: TipoAtivo, quantidade: number }>;
  totalAtivos: number;
  blocoEncontrado: boolean;
  divergencias?: {
    valorTotal?: boolean;
    quantidadePapeis?: boolean;
  };
}
