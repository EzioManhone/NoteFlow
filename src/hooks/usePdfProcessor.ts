
import { useState, useCallback } from "react";
import { DashboardData } from "@/models/dashboardTypes";
import { parsePdfCorretagem, calcularImpostos, extrairAtivos } from "@/utils/pdfParser";
import { ativoExisteNaB3 } from "@/services/stockService";
import { toast } from "@/components/ui/use-toast";

export const usePdfProcessor = (
  dashboardData: DashboardData,
  setDashboardData: React.Dispatch<React.SetStateAction<DashboardData>>,
  atualizarCotacoes: () => Promise<void>
) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPdfFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      toast({
        title: "Processando nota de corretagem",
        description: "Lendo e processando os dados do PDF...",
      });
      
      // Processar o PDF
      const notaCorretagem = await parsePdfCorretagem(file);
      
      // Atualizar dashboard data
      setDashboardData(prev => {
        // Adicionar nova nota
        const notasAtualizadas = [...prev.notasCorretagem, notaCorretagem];
        
        // Extrair todas as operações
        const todasOperacoes = notasAtualizadas.flatMap(nota => nota.operacoes);
        
        // Identificar operações de day trade (mesma data, mesmo ativo, compra e venda)
        todasOperacoes.forEach(op => {
          // Verificar se o ativo existe na B3
          if (!ativoExisteNaB3(op.ativo)) {
            console.warn(`Ativo não reconhecido na B3: ${op.ativo}`);
            // Corrigir o nome do ativo se possível
            // Esta lógica poderia ser mais sofisticada em um sistema real
          }
        });
        
        // Calcular impostos com a lógica aprimorada
        const impostos = calcularImpostos(todasOperacoes);
        
        // Extrair ativos
        const ativos = extrairAtivos(todasOperacoes);
        
        // Calcular portfólio com lógica de Day Trade aprimorada
        const portfolio = ativos.map(ativo => {
          const operacoesAtivo = todasOperacoes.filter(op => op.ativo === ativo);
          
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
            ativo,
            quantidade,
            precoMedio,
            valorTotal: quantidade * precoMedio
          };
        }).filter(item => item.quantidade > 0);
        
        return {
          notasCorretagem: notasAtualizadas,
          ativos,
          impostos,
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
        description: `Nota ${notaCorretagem.numero} processada com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro ao processar PDF",
        description: "Não foi possível ler os dados do arquivo. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao processar PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [dashboardData, setDashboardData, atualizarCotacoes]);

  return {
    isProcessing,
    processPdfFile
  };
};
