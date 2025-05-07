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

// Interface para resultados de extração - mais estruturada
export interface ExtracaoOperacao {
  data: string;
  tipo: 'COMPRA' | 'VENDA';
  codigo: string;
  ativoBase: string;
  strike?: string;
  quantidade: number;
  precoUnitario: number;
  valorTotal: number;
}

// Função simulada de extração de texto PDF (browser demo)
// No backend, trocaria por pdf-parse ou similar.
export const extractPdfText = async (file: File): Promise<{ 
  text: string, 
  isImage: boolean, 
  method: 'text' | 'ocr',
  operacoes?: ExtracaoOperacao[] 
}> => {
  // Simulação mais realista de uma nota de corretagem
  let textoExtraido = `
NOTA DE CORRETAGEM
MERCADO À VISTA
CORRETORA XP INVESTIMENTOS
NEGOCIAÇÃO DE VALORES MOBILIÁRIOS

31/01/2024

C/V TIPO MERCADO ESPECIFICAÇÃO DO TÍTULO QTD PREÇO VALOR TOTAL
C VISTA PETR4 100 25.40 2540.00
V VISTA VALE3 200 70.25 14050.00
C VISTA ITUB4 150 30.15 4522.50
C VISTA MGLU3 300 2.45 735.00
V VISTA BBDC4 120 18.75 2250.00
C VISTA BOVA11 50 110.50 5525.00
C VISTA KNRI11 80 95.30 7624.00

OPCAO DE COMPRA PETRB426 
ON PETR - 39,92  
2.000 0,10 200,00C

OPCAO DE VENDA VALEO195
ON VALE - 59,70
1.500 0,28 420,00D

WINJ24 FUTURO DE IBOV
5 124.75 623.75

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

15/02/2024

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

OPCAO DE COMPRA BBASA415
ON BBAS - 41,50
500 0,35 175,00D

RESUMO FINANCEIRO
VALOR DAS OPERAÇÕES                      16.684,75
(+) TAXA DE LIQUIDAÇÃO                       4,17
(+) TAXA DE REGISTRO                         0,83
(+) CORRETAGEM                              41,71
(=) VALOR LÍQUIDO                        16.729,46
    `;
  }
  
  const isImage = isPdfImage(textoExtraido);
  
  // NOVA FUNCIONALIDADE: Extrair operações detalhadas usando o método fornecido
  const operacoes = extrairOperacoesDetalhadas(textoExtraido);
  
  return {
    text: textoExtraido,
    isImage,
    method: isImage ? "ocr" : "text",
    operacoes // Adicionando as operações extraídas ao resultado
  };
};

// Função aprimorada para extrair operações detalhadas
export function extrairOperacoesDetalhadas(texto: string): ExtracaoOperacao[] {
  const operacoes: ExtracaoOperacao[] = [];
  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l !== '');

  let dataNotaAtual = 'Data não encontrada';
  const regexData = /^\d{2}\/\d{2}\/\d{4}$/;
  
  // Regex melhorada para lidar com diferentes formatos de números
  const regexQuantidadePrecoValor = /^([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)/;
  const regexCodigoAcao = /([A-Z]{4}[3-4])/;
  const regexCodigoFII = /([A-Z]{4}11)(?![A-Z0-9])/;
  const regexCodigoOpcao = /([A-Z]{4,5}[A-Z0-9][0-9]{1,3})(?![A-Z0-9])/; // Regex melhorado
  const regexCodigoMini = /(WIN[FGHJKMNQUVXZ][0-9]{1,2}|WDO[FGHJKMNQUVXZ][0-9]{1,2}|IND[FGHJKMNQUVXZ][0-9]{1,2})/;

  // Detectar a data da nota
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    
    // Atualiza a data atual se encontrou uma data válida
    if (regexData.test(linha)) {
      dataNotaAtual = linha;
      continue;
    }
    
    // EXTRAÇÃO DE OPÇÕES (lógica aprimorada do código fornecido pelo usuário)
    if (linha.includes('OPCAO DE COMPRA') || linha.includes('OPCAO DE VENDA') || 
        linha.includes('OPÇÃO DE COMPRA') || linha.includes('OPÇÃO DE VENDA')) {
      const tipo = (linha.includes('COMPRA')) ? 'COMPRA' : 'VENDA';
      
      // Padrão melhorado para encontrar códigos de opção
      const codigoMatch = linha.match(/([A-Z]{4,5}[A-Z0-9][0-9]{1,3})/);
      const codigo = codigoMatch ? codigoMatch[1] : '';
      const ativoBase = codigo.slice(0, 4);
      
      // Tenta encontrar o strike na linha seguinte (melhorado com suporte para diferentes formatos)
      const strikeMatch = linhas[i + 1]?.match(/([\d]{1,3}[,\.]\d{2})/);
      const strike = strikeMatch ? strikeMatch[1] : '';
      
      // Melhorado para encontrar valores em vários formatos e com mais precisão
      let encontrouValores = false;
      for (let j = 1; j <= 3; j++) {
        if (i + j >= linhas.length) break;
        
        const linhaValores = linhas[i + j];
        
        // Regex específico para o formato diferente (suporte para o formato mencionado pelo usuário)
        const formatoEspecifico = linhaValores.replace(/\s+/g, '').match(/^([\d.]+)(\d,\d{2})(\d{1,3},\d{2})[CD]$/);
        if (formatoEspecifico) {
          const quantidade = parseFloat(formatoEspecifico[1].replace(/\./g, '').replace(',', '.'));
          const precoUnitario = parseFloat(formatoEspecifico[2].replace(',', '.'));
          const valorTotal = parseFloat(formatoEspecifico[3].replace(/\./g, '').replace(',', '.'));
          
          operacoes.push({
            data: dataNotaAtual,
            tipo,
            codigo,
            ativoBase,
            strike,
            quantidade,
            precoUnitario,
            valorTotal
          });
          
          encontrouValores = true;
          break;
        }
        
        // Tentativa com o formato padrão
        const match = linhaValores.match(regexQuantidadePrecoValor);
        if (match) {
          // Normaliza os formatos de número
          const quantidade = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
          const precoUnitario = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
          const valorTotal = parseFloat(match[3].replace(/\./g, '').replace(',', '.'));
          
          operacoes.push({
            data: dataNotaAtual,
            tipo,
            codigo,
            ativoBase,
            strike,
            quantidade,
            precoUnitario,
            valorTotal
          });
          
          encontrouValores = true;
          break;
        }
      }
      
      if (encontrouValores) continue;
    }
    
    // EXTRAÇÃO DE AÇÕES, FIIs E OUTROS (mantidos da versão anterior)
    // Detectar padrões de mercado à vista
    if (linha.includes('C VISTA') || linha.includes('V VISTA') || 
        linha.startsWith('C ') || linha.startsWith('V ') || 
        linha.includes('COMPRAS') || linha.includes('VENDAS')) {
      
      const tipo = linha.includes('C ') || linha.includes('COMPRA') ? 'COMPRA' : 'VENDA';
      
      // Tentar extrair código de ação
      let codigo = '';
      let ativoBase = '';
      let acaoMatch = linha.match(regexCodigoAcao);
      let fiiMatch = linha.match(regexCodigoFII);
      let miniMatch = linha.match(regexCodigoMini);
      
      if (acaoMatch) {
        codigo = acaoMatch[1];
        ativoBase = codigo.slice(0, 4);
      } else if (fiiMatch) {
        codigo = fiiMatch[1];
        ativoBase = codigo.slice(0, 4);
      } else if (miniMatch) {
        codigo = miniMatch[1];
        ativoBase = codigo.slice(0, 3);
      } else {
        continue; // Não encontrou código válido
      }
      
      // Tentar extrair valores na mesma linha ou nas próximas
      const valoresMatch = linha.match(regexQuantidadePrecoValor);
      
      if (valoresMatch) {
        // Normaliza os formatos de número
        const quantidade = parseFloat(valoresMatch[1].replace(/\./g, '').replace(',', '.'));
        const precoUnitario = parseFloat(valoresMatch[2].replace(/\./g, '').replace(',', '.'));
        const valorTotal = parseFloat(valoresMatch[3].replace(/\./g, '').replace(',', '.'));
        
        operacoes.push({
          data: dataNotaAtual,
          tipo,
          codigo,
          ativoBase,
          quantidade,
          precoUnitario,
          valorTotal
        });
      } else {
        // Procurar valores nas próximas linhas
        for (let j = 1; j <= 2; j++) {
          if (i + j >= linhas.length) break;
          
          const proximaLinha = linhas[i + j];
          const proximosValores = proximaLinha.match(regexQuantidadePrecoValor);
          
          if (proximosValores) {
            const quantidade = parseFloat(proximosValores[1].replace(/\./g, '').replace(',', '.'));
            const precoUnitario = parseFloat(proximosValores[2].replace(/\./g, '').replace(',', '.'));
            const valorTotal = parseFloat(proximosValores[3].replace(/\./g, '').replace(',', '.'));
            
            operacoes.push({
              data: dataNotaAtual,
              tipo,
              codigo,
              ativoBase,
              quantidade,
              precoUnitario,
              valorTotal
            });
            break;
          }
        }
      }
    }
  }

  // Log para debugging
  if (operacoes.length > 0) {
    console.log(`[pdfExtraction] Encontradas ${operacoes.length} operações do PDF:`, 
      operacoes.map(op => `${op.tipo} ${op.codigo} (${op.ativoBase}) ${op.quantidade} x ${op.precoUnitario}`));
  } else {
    console.log("[pdfExtraction] Nenhuma operação encontrada no PDF");
  }

  return operacoes;
}
