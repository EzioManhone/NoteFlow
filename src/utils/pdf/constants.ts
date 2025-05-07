
// Constants for PDF parsing and extraction
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

// Regex for different asset types
export const REGEX_ACOES = /[A-Z]{4}[3-4](?![A-Z0-9])/g;
export const REGEX_FIIS = /[A-Z]{4}11(?![A-Z0-9])/g; // FIIS end with 11
export const REGEX_ETFS = /BOVA11|IVVB11|SMAL11|HASH11|ECOO11|BBSD11|XINA11/g; // Specific ETFs
export const REGEX_OPCOES = /[A-Z]{4}[A-Z][0-9]{2,3}(?![A-Z0-9])/g; // Options follow this pattern
export const REGEX_MINI_CONTRATOS = /WIN[FGHJKMNQUVXZ][0-9]{1,2}|WDO[FGHJKMNQUVXZ][0-9]{1,2}|IND[FGHJKMNQUVXZ][0-9]{1,2}/g;

