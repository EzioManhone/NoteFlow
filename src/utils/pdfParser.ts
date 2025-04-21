/**
 * Barrel file: exporta utilitários específicos do parser de PDFs financeiros.
 */
export * from "./pdfExtraction";
export * from "./pdfParsing";
export * from "./operationsUtils";

// Função principal que prepara dados simulados da nota de corretagem PDF
import { extractPdfText } from "./pdfExtraction";
import { extrairAtivosDoTexto, Operation, TipoAtivo } from "./pdfParsing";
import { calcularResultadosPorTipo } from "./operationsUtils";
import { PdfExtractionResult } from "@/types/dashboardTypes";

export interface NotaCorretagem {
  numero: string;
  data: string;
  corretora: string;
  valorTotal: number;
  operacoes: Operation[];
  resultadoDayTrade: number;
  resultadoSwingTrade: number;
  resultadosPorTipo: Record<TipoAtivo, {dayTrade: number, swingTrade: number}>;
  mes: string;
  taxas: {
    corretagem: number;
    liquidacao: number;
    registro: number;
    total: number;
  };
}

export const parsePdfCorretagem = async (file: File): Promise<{ notaCorretagem: NotaCorretagem, extraInfo: PdfExtractionResult }> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const numeroNota = file.name.replace(".pdf", "");
      const hoje = new Date();
      const dataOperacao = hoje.toISOString().split('T')[0];
      const mesOperacao = hoje.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

      const { text: textoExtraido, isImage, method: metodoExtracao } = await extractPdfText(file);

      const { ativos, emBlocoValido, indicesBlocos } = extrairAtivosDoTexto(textoExtraido);

      if (ativos.length === 0) {
        throw new Error("Nenhum ativo encontrado no PDF! A nota pode estar ilegível ou o layout é diferente.");
      }

      const ativosExtraidos = ativos;

      const numOperacoes = 3 + Math.floor(Math.random() * 6);
      const operacoes: Operation[] = [];
      const numDayTrades = 1 + Math.floor(Math.random() * 2);

      for (let i = 0; i < numDayTrades; i++) {
        const ativoIndex = Math.floor(Math.random() * ativosExtraidos.length);
        const { codigo: ativo, tipo: tipoAtivo } = ativosExtraidos[ativoIndex];
        const quantidade = 100 * (1 + Math.floor(Math.random() * 5));
        const precoCompra = 10 + Math.random() * 90;
        const precoVenda = precoCompra * (1 + (Math.random() * 0.02 - 0.01));

        operacoes.push({
          tipo: 'compra',
          ativo,
          tipoAtivo,
          quantidade,
          preco: parseFloat(precoCompra.toFixed(2)),
          data: dataOperacao,
          valor: parseFloat((quantidade * precoCompra).toFixed(2)),
          corretagem: parseFloat((quantidade * precoCompra * 0.0025).toFixed(2)),
          dayTrade: true,
          emBlocoValido
        });

        operacoes.push({
          tipo: 'venda',
          ativo,
          tipoAtivo,
          quantidade,
          preco: parseFloat(precoVenda.toFixed(2)),
          data: dataOperacao,
          valor: parseFloat((quantidade * precoVenda).toFixed(2)),
          corretagem: parseFloat((quantidade * precoVenda * 0.0025).toFixed(2)),
          dayTrade: true,
          emBlocoValido
        });
      }

      for (let i = 0; i < numOperacoes - (numDayTrades * 2); i++) {
        const ativoIndex = Math.floor(Math.random() * ativosExtraidos.length);
        const { codigo: ativo, tipo: tipoAtivo } = ativosExtraidos[ativoIndex];
        const tipo = Math.random() > 0.5 ? 'compra' : 'venda';
        const quantidade = 100 * (1 + Math.floor(Math.random() * 5));
        const preco = 10 + Math.random() * 90;
        const valor = quantidade * preco;

        operacoes.push({
          tipo,
          ativo,
          tipoAtivo,
          quantidade,
          preco: parseFloat(preco.toFixed(2)),
          data: dataOperacao,
          valor: parseFloat(valor.toFixed(2)),
          corretagem: parseFloat((valor * 0.0025).toFixed(2)),
          dayTrade: false,
          emBlocoValido
        });
      }

      const operacoesValidas = operacoes.filter(op => op.emBlocoValido);
      const { resultadoDayTrade, resultadoSwingTrade, resultadosPorTipo } = calcularResultadosPorTipo(operacoesValidas);
      const valorTotal = operacoesValidas.reduce((acc, op) => acc + op.valor, 0);
      const corretagem = operacoesValidas.reduce((acc, op) => acc + op.corretagem, 0);
      const liquidacao = parseFloat((valorTotal * 0.00025).toFixed(2));
      const registro = parseFloat((valorTotal * 0.00005).toFixed(2));
      const temDivergenciaValor = Math.random() > 0.8;
      const temDivergenciaQuantidade = Math.random() > 0.9;

      const notaCorretagem: NotaCorretagem = {
        numero: numeroNota,
        data: dataOperacao,
        corretora: "XP Investimentos",
        valorTotal,
        operacoes: operacoesValidas,
        resultadoDayTrade,
        resultadoSwingTrade,
        resultadosPorTipo,
        mes: mesOperacao,
        taxas: {
          corretagem,
          liquidacao,
          registro,
          total: parseFloat((corretagem + liquidacao + registro).toFixed(2))
        }
      };

      const extraInfo: PdfExtractionResult = {
        success: emBlocoValido && operacoesValidas.length > 0,
        method: metodoExtracao,
        ativos: ativos.map(a => a.codigo),
        tiposAtivos: Object.entries(operacoesValidas.reduce((acc, op) => {
          if (!acc[op.tipoAtivo]) acc[op.tipoAtivo] = 0;
          acc[op.tipoAtivo]++;
          return acc;
        }, {} as Record<TipoAtivo, number>)).map(([tipo, qtd]) => ({
          tipo: tipo as TipoAtivo,
          quantidade: qtd
        })),
        totalAtivos: operacoesValidas.length,
        blocoEncontrado: emBlocoValido,
        divergencias: (temDivergenciaValor || temDivergenciaQuantidade) ? {
          valorTotal: temDivergenciaValor,
          quantidadePapeis: temDivergenciaQuantidade
        } : undefined
      };

      console.log(`[pdfParser] Ativos lidos: ${ativos.length} | Operações válidas: ${operacoesValidas.length}`);
      console.log(`[pdfParser] Tipos de ativos detectados:`, extraInfo.tiposAtivos);

      if (extraInfo.divergencias) {
        console.warn(`[pdfParser] Divergências detectadas`, extraInfo.divergencias);
      }

      resolve({ notaCorretagem, extraInfo });
    }, 1500);
  });
};
