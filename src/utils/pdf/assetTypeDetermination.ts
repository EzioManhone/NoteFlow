
import { TipoAtivo } from "./types";

// Determines the asset type based on the code and refined patterns
export const determinarTipoAtivo = (ativo: string): TipoAtivo => {
  const ativoNormalizado = ativo.toUpperCase().trim();
  
  // FIIs ending with 11 (except ETFs that also end with 11)
  if (ativoNormalizado.match(/^[A-Z]{4}11$/) && 
      !["BOVA11", "IVVB11", "SMAL11", "HASH11", "ECOO11", "BBSD11", "XINA11"].includes(ativoNormalizado)) {
    return 'fii';
  }
  
  // Specific ETFs
  if (["BOVA11", "IVVB11", "SMAL11", "HASH11", "ECOO11", "BBSD11", "XINA11"].includes(ativoNormalizado)) {
    return 'etf';
  }
  
  // Options follow specific pattern - atualizados para incluir 5 letras
  if (ativoNormalizado.match(/^[A-Z]{4,5}[A-Z0-9][0-9]{1,3}$/)) {
    return 'opcao';
  }
  
  // Mini Contracts
  if (ativoNormalizado.match(/^WIN[FGHJKMNQUVXZ][0-9]{1,2}$|^WDO[FGHJKMNQUVXZ][0-9]{1,2}$|^IND[FGHJKMNQUVXZ][0-9]{1,2}$/)) {
    return 'futuro';
  }
  
  // Stocks end with digit 3 or 4
  if (ativoNormalizado.match(/^[A-Z]{4}[3-4]$/)) {
    return 'acao';
  }
  
  return 'desconhecido';
};
