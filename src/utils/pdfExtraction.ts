
import { BLOCOS_VALIDOS } from "./pdfParsing";

// Identifica se o PDF é imagem ou texto puro com verificação mais precisa
export const isPdfImage = (text: string): boolean => {
  if (text.length < 100) return true;
  
  // Verifica se o texto contém blocos reconhecíveis com maior precisão
  const temBlocosReconheciveis = BLOCOS_VALIDOS.some(bloco => 
    text.toUpperCase().includes(bloco)
  );
  
  // Quantidade mínima de caracteres por página para considerar como texto
  const densidadeTexto = text.length / (text.split('\n').length || 1);
  const baixaDensidade = densidadeTexto < 40; // Textos de OCR geralmente têm baixa densidade
  
  return !temBlocosReconheciveis || baixaDensidade;
};

// Função simulada de extração de texto PDF (browser demo)
// No backend, trocaria por pdf-parse ou similar.
export const extractPdfText = async (file: File): Promise<{ text: string, isImage: boolean, method: 'text' | 'ocr' }> => {
  // Simulação de extração: apenas string "dummy" para demo.
  let textoExtraido = "NOTA DE CORRETAGEM MERCADO À VISTA CORRETORA XP INVESTIMENTOS NEGOCIAÇÃO DE VALORES MOBILIÁRIOS PETR4 100 VALE3 200 ITUB4 150 RESUMO DAS OPERAÇÕES RESUMO FINANCEIRO";
  
  // Adiciona mais tipos de ativos para simular uma nota mais completa
  if (Math.random() > 0.5) {
    textoExtraido += " MGLU3 300 BBDC4 120 BOVA11 50 IVVB11 20 KNRI11 80 WINM23 5 PETRB170 10";
  }
  
  const isImage = isPdfImage(textoExtraido);
  return {
    text: textoExtraido,
    isImage,
    method: isImage ? "ocr" : "text"
  };
};
