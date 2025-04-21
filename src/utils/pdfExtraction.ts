
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
  // Simulação mais realista de uma nota de corretagem
  let textoExtraido = `
NOTA DE CORRETAGEM
MERCADO À VISTA
CORRETORA XP INVESTIMENTOS
NEGOCIAÇÃO DE VALORES MOBILIÁRIOS

C/V TIPO MERCADO ESPECIFICAÇÃO DO TÍTULO QTD PREÇO VALOR TOTAL
C VISTA PETR4 100 25.40 2540.00
V VISTA VALE3 200 70.25 14050.00
C VISTA ITUB4 150 30.15 4522.50
C VISTA MGLU3 300 2.45 735.00
V VISTA BBDC4 120 18.75 2250.00
C VISTA BOVA11 50 110.50 5525.00
C VISTA KNRI11 80 95.30 7624.00
C VISTA WINM24 5 124.75 623.75

RESUMO DAS OPERAÇÕES
VALOR OPERAÇÕES DE COMPRA: 21570.25
VALOR OPERAÇÕES DE VENDA: 16300.00
VALOR TOTAL DAS OPERAÇÕES: 37870.25

RESUMO FINANCEIRO
TAXA DE LIQUIDAÇÃO: 9.47
EMOLUMENTOS: 1.89
TAXA DE REGISTRO: 0.38
CORRETAGEM: 94.68
IMPOSTOS: 38.27
OUTROS: 0.00
LÍQUIDO DA NOTA: 37725.56
  `;
  
  // Adiciona variabilidade à extração para simular situações reais
  if (Math.random() > 0.8) {
    // Simula uma nota com formatação diferente
    textoExtraido = `
CORRETORA: XP INVESTIMENTOS CCTVM S/A
CLIENTE: NOME DO CLIENTE
DATA PREGÃO: ${new Date().toLocaleDateString('pt-BR')}
NOTA: ${Math.floor(Math.random() * 1000000)}

NEGÓCIOS REALIZADOS
----------------------------------------------------------------------------
COMPRAS             | QTDE | PREÇO(R$) | VALOR(R$)
PETR4               | 150  | 24.98     | 3.747,00
BBAS3               | 100  | 45.22     | 4.522,00
ITSA4               | 200  | 11.34     | 2.268,00
TOTAL COMPRAS:                           10.537,00
----------------------------------------------------------------------------
VENDAS              | QTDE | PREÇO(R$) | VALOR(R$)
VALE3               | 50   | 69.45     | 3.472,50
WEGE3               | 75   | 35.67     | 2.675,25
TOTAL VENDAS:                             6.147,75
----------------------------------------------------------------------------

RESUMO FINANCEIRO
VALOR DAS OPERAÇÕES                      16.684,75
(+) TAXA DE LIQUIDAÇÃO                       4,17
(+) TAXA DE REGISTRO                         0,83
(+) CORRETAGEM                              41,71
(=) VALOR LÍQUIDO                        16.729,46
    `;
  }
  
  const isImage = isPdfImage(textoExtraido);
  return {
    text: textoExtraido,
    isImage,
    method: isImage ? "ocr" : "text"
  };
};
