
import { useState, useCallback } from "react";
import { DashboardData } from "@/models/dashboardTypes";
import { buscarCotacoes } from "@/services/stockService";
import { toast } from "@/components/ui/use-toast";

export const useCotacoes = (
  dashboardData: DashboardData,
  setDashboardData: React.Dispatch<React.SetStateAction<DashboardData>>
) => {
  const [isLoadingCotacoes, setIsLoadingCotacoes] = useState(false);

  const atualizarCotacoes = useCallback(async () => {
    if (dashboardData.portfolio.length === 0) return;
    
    setIsLoadingCotacoes(true);
    try {
      const ativos = dashboardData.portfolio.map(item => item.ativo);
      const cotacoes = await buscarCotacoes(ativos);
      
      setDashboardData(prev => {
        // Atualizar portfolio com cotações
        const portfolioAtualizado = prev.portfolio.map(item => {
          const cotacaoItem = cotacoes.find(c => c.ativo === item.ativo);
          if (cotacaoItem) {
            const rentabilidade = ((cotacaoItem.preco / item.precoMedio) - 1) * 100;
            return {
              ...item,
              cotacaoAtual: cotacaoItem.preco,
              variacao: cotacaoItem.variacao,
              rentabilidade,
              ultimaAtualizacao: new Date().toISOString()
            };
          }
          return item;
        });
        
        return {
          ...prev,
          portfolio: portfolioAtualizado,
          cotacoes,
          ultimaAtualizacaoCotacoes: new Date().toISOString()
        };
      });
      
      toast({
        title: "Cotações atualizadas",
        description: "As cotações da carteira foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar cotações:", error);
      toast({
        title: "Erro ao atualizar cotações",
        description: "Não foi possível buscar as cotações atualizadas.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCotacoes(false);
    }
  }, [dashboardData.portfolio, setDashboardData]);

  return {
    isLoadingCotacoes,
    atualizarCotacoes
  };
};
