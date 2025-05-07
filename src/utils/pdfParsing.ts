
import { ativoExisteNaB3 } from "@/services/stockService";
import { ExtracaoOperacao } from "./pdfExtraction";

// Palavras-chave para blocos corretos - ampliamos para capturar mais seções válidas
export const BLOCOS_VALIDOS = [
  "NEGOCIAÇÃO",
  "MERCADO",
  "ESPECIFICAÇÃO DO TÍTULO",
  "RESUMO DAS OPERAÇÕES",
  "TÍTULOS NEGOCIADOS",
  "COMPRAS",
  "VENDAS",
  "NOTA DE CORRETAGEM",
  "BOLSA DE VALORES",
  "OPÇÃO DE COMPRA",
  "OPÇÃO DE VENDA",
  "NEGÓCIOS REALIZADOS"
];

// Regex para diferentes tipos de ativos com padrões mais precisos
export const REGEX_ACOES = /[A-Z]{4}[3-4](?![A-Z0-9])/g;
export const REGEX_FIIS = /[A-Z]{4}11(?![A-Z0-9])/g; // FIIS terminam com 11
export const REGEX_ETFS = /BOVA11|IVVB11|SMAL11|HASH11|ECOO11|BBSD11|XINA11/g; // ETFs específicos
export const REGEX_OPCOES = /[A-Z]{4}[A-Z][0-9]{2,3}(?![A-Z0-9])/g; // Opções seguem esse padrão
export const REGEX_MINI_CONTRATOS = /WIN[FGHJKMNQUVXZ][0-9]{1,2}|WDO[FGHJKMNQUVXZ][0-9]{1,2}|IND[FGHJKMNQUVXZ][0-9]{1,2}/g;

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
  strike?: string; // Adicionando campo strike para opções
  ativoBase?: string; // Adicionando campo ativoBase para opções
}

// Determina o tipo de ativo com base no código e nos padrões refinados
export const determinarTipoAtivo = (ativo: string): TipoAtivo => {
  const ativoNormalizado = ativo.toUpperCase().trim();
  
  // FIIs terminados com 11 (exceto os ETFs que também terminam em 11)
  if (ativoNormalizado.match(/^[A-Z]{4}11$/) && 
      !["BOVA11", "IVVB11", "SMAL11", "HASH11", "ECOO11", "BBSD11", "XINA11"].includes(ativoNormalizado)) {
    return 'fii';
  }
  
  // ETFs específicos
  if (["BOVA11", "IVVB11", "SMAL11", "HASH11", "ECOO11", "BBSD11", "XINA11"].includes(ativoNormalizado)) {
    return 'etf';
  }
  
  // Opções seguem padrão específico (4 letras + letra + 2 ou 3 números)
  if (ativoNormalizado.match(/^[A-Z]{4}[A-Z][0-9]{2,3}$/)) {
    return 'opcao';
  }
  
  // Mini Contratos
  if (ativoNormalizado.match(/^WIN[FGHJKMNQUVXZ][0-9]{1,2}$|^WDO[FGHJKMNQUVXZ][0-9]{1,2}$|^IND[FGHJKMNQUVXZ][0-9]{1,2}$/)) {
    return 'futuro';
  }
  
  // Ações terminam com dígito 3 ou 4
  if (ativoNormalizado.match(/^[A-Z]{4}[3-4]$/)) {
    return 'acao';
  }
  
  return 'desconhecido';
};

// Converte as operações extraídas diretamente para o formato Operation
export const converterParaOperations = (
  operacoesExtraidas: ExtracaoOperacao[], 
  corretora: string = "XP Investimentos"
): Operation[] => {
  const operations: Operation[] = [];
  
  for (const op of operacoesExtraidas) {
    // Validar se o ativo existe na B3
    if (!ativoExisteNaB3(op.codigo)) {
      console.warn(`[pdfParsing] Ativo ${op.codigo} não encontrado na lista da B3 - ignorado`);
      continue;
    }
    
    const tipoAtivo = determinarTipoAtivo(op.codigo);
    const tipoBaixado = op.tipo === 'COMPRA' ? 'compra' : 'venda';
    
    // Formata a data para o padrão ISO (YYYY-MM-DD)
    let dataFormatada = op.data;
    if (op.data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dia, mes, ano] = op.data.split('/');
      dataFormatada = `${ano}-${mes}-${dia}`;
    }
    
    // Taxa de corretagem simulada (0.25% ou valor mínimo de R$ 5,00)
    const taxaCorretagem = Math.max(5, op.valorTotal * 0.0025);
    
    operations.push({
      tipo: tipoBaixado,
      ativo: op.codigo,
      tipoAtivo,
      quantidade: op.quantidade,
      preco: op.precoUnitario,
      data: dataFormatada,
      valor: op.valorTotal,
      corretagem: parseFloat(taxaCorretagem.toFixed(2)),
      dayTrade: false, // Será calculado posteriormente
      emBlocoValido: true, // As operações extraídas são consideradas válidas
      strike: op.strike,
      ativoBase: op.ativoBase
    });
  }
  
  // Identificar operações de day trade
  const operacoesPorDiaAtivo: Record<string, Operation[]> = {};
  
  // Agrupar operações pelo dia e ativo
  operations.forEach(op => {
    const chave = `${op.data}-${op.ativo}`;
    if (!operacoesPorDiaAtivo[chave]) {
      operacoesPorDiaAtivo[chave] = [];
    }
    operacoesPorDiaAtivo[chave].push(op);
  });
  
  // Marcar operações como day trade quando há compra e venda do mesmo ativo no mesmo dia
  Object.values(operacoesPorDiaAtivo).forEach(ops => {
    if (ops.length >= 2) {
      const temCompra = ops.some(op => op.tipo === 'compra');
      const temVenda = ops.some(op => op.tipo === 'venda');
      
      if (temCompra && temVenda) {
        ops.forEach(op => {
          op.dayTrade = true;
        });
      }
    }
  });
  
  return operations;
};

// Extrai ativos de todos os tipos dentro de blocos válidos com validação mais rigorosa
export const extrairAtivosDoTexto = (text: string): { 
  ativos: Array<{codigo: string, tipo: TipoAtivo}>, 
  emBlocoValido: boolean, 
  indicesBlocos: number[] 
} => {
  const textUpperCase = text.toUpperCase();
  const ativos: Array<{codigo: string, tipo: TipoAtivo}> = [];
  let emBlocoValido = false;
  const indicesBlocos: number[] = [];

  // Encontra todos os blocos válidos no texto
  BLOCOS_VALIDOS.forEach(bloco => {
    let idx = textUpperCase.indexOf(bloco);
    while (idx !== -1) {
      indicesBlocos.push(idx);
      idx = textUpperCase.indexOf(bloco, idx + 1);
    }
  });
  
  if (indicesBlocos.length === 0) {
    return { ativos: [], emBlocoValido: false, indicesBlocos: [] };
  }
  
  indicesBlocos.sort((a, b) => a - b);

  // Para cada bloco, extrai os ativos usando os padrões refinados
  for (let i = 0; i < indicesBlocos.length; i++) {
    const inicio = indicesBlocos[i];
    const fim = i < indicesBlocos.length - 1 ? indicesBlocos[i + 1] : textUpperCase.length;
    const blocoTexto = textUpperCase.substring(inicio, fim);
    
    // Extrai ações
    const matchesAcoes = [...blocoTexto.matchAll(REGEX_ACOES)];
    // Extrai FIIs
    const matchesFIIs = [...blocoTexto.matchAll(REGEX_FIIS)];
    // Extrai ETFs
    const matchesETFs = [...blocoTexto.matchAll(REGEX_ETFS)];
    // Extrai opções
    const matchesOpcoes = [...blocoTexto.matchAll(REGEX_OPCOES)];
    // Extrai mini contratos
    const matchesMini = [...blocoTexto.matchAll(REGEX_MINI_CONTRATOS)];
    
    const todosMatches = [
      ...matchesAcoes.map(m => ({ match: m[0], tipo: 'acao' as TipoAtivo })),
      ...matchesFIIs.map(m => ({ match: m[0], tipo: 'fii' as TipoAtivo })),
      ...matchesETFs.map(m => ({ match: m[0], tipo: 'etf' as TipoAtivo })),
      ...matchesOpcoes.map(m => ({ match: m[0], tipo: 'opcao' as TipoAtivo })),
      ...matchesMini.map(m => ({ match: m[0], tipo: 'futuro' as TipoAtivo }))
    ];
    
    if (todosMatches.length > 0) {
      emBlocoValido = true;
      todosMatches.forEach(match => {
        const ativo = match.match;
        const tipo = match.tipo;
        
        // Verificação rigorosa se o ativo existe na B3 e não está duplicado
        if (ativoExisteNaB3(ativo) && !ativos.some(a => a.codigo === ativo)) {
          ativos.push({ codigo: ativo, tipo });
        }
      });
    }
  }
  
  console.log(`[pdfParsing] Ativos encontrados após validação: ${ativos.length}`, ativos);
  
  return { ativos, emBlocoValido, indicesBlocos };
};
