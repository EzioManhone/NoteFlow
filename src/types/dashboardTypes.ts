
import { ReactNode } from "react";

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
  totalAtivos: number;
  blocoEncontrado: boolean;
  divergencias?: {
    valorTotal?: boolean;
    quantidadePapeis?: boolean;
  };
}
