import { useState, useCallback } from "react";
import { DashboardData } from "@/models/dashboardTypes";
import { parsePdfCorretagem, NotaCorretagem } from "@/utils/pdfParser";
import { calcularImpostos } from "@/utils/taxCalculations";
import { extrairAtivos } from "@/utils/assetExtraction";
import { corrigirNomeAtivo } from "@/services/stockService";
import { toast } from "@/components/ui/use-toast";
import { PdfExtractionResult } from "@/types/dashboardTypes";
import { TipoAtivo } from "@/utils/pdfParsing";

export const usePdfProcessor = (
  dashboardData: DashboardData,
  setDashboardData: React.Dispatch<React.SetStateAction<DashboardData>>,
  atualizarCotacoes: () => Promise<void>
) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPdfFile = useCallback(async (file: File): Promise<PdfExtractionResult> => {
    setIsProcessing(true);
    try {
      toast({
        title: "Processando nota de corretagem",
        description: "Analisando o formato do PDF e extraindo dados...",
      });
      
      // Processar o PDF com a nova lógica aprimorada
      const { notaCorretagem, extraInfo } = await parsePdfCorretagem(file);
      
      // Atualizar dashboard data
      setDashboardData(prev => {
        // Adicionar nova nota
        const notasAtualizadas = [...prev.notasCorretagem, notaCorretagem];
        
        // Extrair todas as operações
        const todasOperacoes = notasAtualizadas.flatMap(nota => nota.operacoes);
        
        // Corrigir nomes de ativos nas operações, apenas os que estão em blocos válidos
        todasOperacoes.forEach(op => {
          if (op.emBlocoValido) {
            op.ativo = corrigirNomeAtivo(op.ativo);
          }
        });
        
        // Filtrar apenas operações validadas (em blocos corretos)
        const operacoesValidas = todasOperacoes.filter(op => op.emBlocoValido);
        
        // Calcular impostos com a lógica aprimorada
        const impostos = calcularImpostos(operacoesValidas);
        
        // Extrair ativos estruturados com tipo sem depender da validação B3
        const ativosComTipo = extrairAtivos(operacoesValidas);
        
        // Calcular portfólio com lógica de Day Trade aprimorada
        const portfolio = ativosComTipo.map(ativo => {
          const operacoesAtivo = operacoesValidas.filter(op => op.ativo === ativo.codigo);
          
          // Agrupar operações por data para identificar day trades
          const operacoesPorData: Record<string, any[]> = {};
          operacoesAtivo.forEach(op => {
            if (!operacoesPorData[op.data]) {
              operacoesPorData[op.data] = [];
            }
            operacoesPorData[op.data].push(op);
          });
          
          let quantidade = 0;
          let valorTotal = 0;
          
          // Processar operações considerando day trade e swing trade
          Object.values(operacoesPorData).forEach(opsData => {
            const compras = opsData.filter(op => op.tipo === 'compra');
            const vendas = opsData.filter(op => op.tipo === 'venda');
            
            const qtdComprada = compras.reduce((sum, op) => sum + op.quantidade, 0);
            const qtdVendida = vendas.reduce((sum, op) => sum + op.quantidade, 0);
            
            const valorCompras = compras.reduce((sum, op) => sum + op.valor, 0);
            const valorVendas = vendas.reduce((sum, op) => sum + op.valor, 0);
            
            // Se teve compra e venda no mesmo dia (potencial day trade)
            if (compras.length > 0 && vendas.length > 0) {
              const dayTradeQtd = Math.min(qtdComprada, qtdVendida);
              
              // Calcular preço médio das compras e vendas do dia
              const precoMedioCompra = valorCompras / qtdComprada;
              const precoMedioVenda = valorVendas / qtdVendida;
              
              // Ajustar quantidade e valor total removendo a parte de day trade
              if (qtdComprada > qtdVendida) {
                // Sobrou posição comprada
                quantidade += qtdComprada - qtdVendida;
                valorTotal += precoMedioCompra * (qtdComprada - qtdVendida);
              } else if (qtdVendida > qtdComprada) {
                // Sobrou posição vendida
                quantidade -= qtdVendida - qtdComprada;
                valorTotal -= precoMedioVenda * (qtdVendida - qtdComprada);
              }
              // Se qtdComprada === qtdVendida, foi 100% day trade, não impacta o portfólio
            } else {
              // Operação normal (só compra ou só venda no dia)
              if (compras.length > 0) {
                quantidade += qtdComprada;
                valorTotal += valorCompras;
              }
              if (vendas.length > 0) {
                quantidade -= qtdVendida;
                valorTotal -= valorVendas;
              }
            }
          });
          
          const precoMedio = quantidade > 0 ? valorTotal / quantidade : 0;
          
          return {
            ativo: ativo.codigo,
            quantidade,
            precoMedio,
            valorTotal: quantidade * precoMedio
          };
        }).filter(item => item.quantidade > 0);
        
        // Atualizar resultados mensais
        const resultadoMensal = {
          dayTrade: notaCorretagem.resultadoDayTrade,
          swingTrade: notaCorretagem.resultadoSwingTrade,
          mes: notaCorretagem.mes
        };
        
        return {
          notasCorretagem: notasAtualizadas,
          ativos: ativosComTipo,
          impostos: {
            dayTrade: impostos.dayTrade,
            swingTrade: impostos.swingTrade,
            prejuizoAcumulado: impostos.prejuizoAcumulado,
            impostosPorTipo: impostos.impostosPorTipo
          },
          resultadoMensal,
          dividendos: prev.dividendos, // Manter dividendos existentes
          portfolio,
          cotacoes: prev.cotacoes
        };
      });
      
      // Depois de processar a nota, atualizar cotações
      setTimeout(() => {
        atualizarCotacoes();
      }, 500);
      
      toast({
        title: "Nota de corretagem processada",
        description: `Nota ${notaCorretagem.numero} processada com ${extraInfo.ativos.length} ativos identificados.`,
      });
      
      return extraInfo;
    } catch (error) {
      console.error("Erro ao processar PDF:", error);
      toast({
        title: "Erro ao processar PDF",
        description: error instanceof Error ? error.message : "Não foi possível ler os dados do arquivo. Tente novamente.",
        variant: "destructive",
      });
      
      return {
        success: false,
        method: "text",
        ativos: [],
        totalAtivos: 0,
        blocoEncontrado: false
      };
    } finally {
      setIsProcessing(false);
    }
  }, [dashboardData, setDashboardData, atualizarCotacoes]);

  return {
    isProcessing,
    processPdfFile
  };
};
