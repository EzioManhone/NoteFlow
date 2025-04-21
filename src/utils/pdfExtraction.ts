
import { BLOCOS_VALIDOS } from "./pdfParsing";

// Identifica se o PDF é imagem ou texto puro
export const isPdfImage = (text: string): boolean => {
  if (text.length < 100) return true;
  const temBlocosReconheciveis = BLOCOS_VALIDOS.some(bloco => 
    text.toUpperCase().includes(bloco)
  );
  return !temBlocosReconheciveis;
};

// Função simulada de extração de texto PDF (browser demo)
// No backend, trocaria por pdf-parse ou similar.
export const extractPdfText = async (file: File): Promise<{ text: string, isImage: boolean, method: 'text' | 'ocr' }> => {
  // Simulação de extração: apenas string "dummy" para demo.
  const textoExtraido = "NOTA DE CORRETAGEM MERCADO À VISTA CORRETORA XP INVESTIMENTOS NEGOCIAÇÃO DE VALORES MOBILIÁRIOS PETR4 100 VALE3 200 ITUB4 150 RESUMO DAS OPERAÇÕES RESUMO FINANCEIRO";
  const isImage = isPdfImage(textoExtraido);
  return {
    text: textoExtraido,
    isImage,
    method: isImage ? "ocr" : "text"
  };
};
