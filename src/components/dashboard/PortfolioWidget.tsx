
import React, { useEffect } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PortfolioWidget: React.FC = () => {
  const { dashboardData, atualizarCotacoes, isLoadingCotacoes } = useDashboard();
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  // Formatar data e hora local
  const formatarDataHora = (isoString?: string) => {
    if (!isoString) return "-";
    const data = new Date(isoString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calcular rentabilidade total da carteira
  const valorInvestido = dashboardData.portfolio.reduce((acc, item) => acc + (item.quantidade * item.precoMedio), 0);
  const valorAtual = dashboardData.portfolio.reduce((acc, item) => {
    const cotacaoAtual = item.cotacaoAtual || item.precoMedio;
    return acc + (item.quantidade * cotacaoAtual);
  }, 0);
  const rentabilidadeTotal = valorInvestido > 0 ? ((valorAtual / valorInvestido) - 1) * 100 : 0;

  return (
    <div className="space-y-4">
      {dashboardData.portfolio.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Resumo do Portfólio</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={atualizarCotacoes}
              disabled={isLoadingCotacoes}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingCotacoes ? 'animate-spin' : ''}`} />
              Atualizar Cotações
            </Button>
          </div>
          
          <Card className={`${rentabilidadeTotal >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium mb-2">Rentabilidade da Carteira</h3>
                  <p className={`text-2xl font-bold ${rentabilidadeTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {rentabilidadeTotal.toFixed(2)}%
                  </p>
                </div>
                <div className={`p-2 rounded-full ${rentabilidadeTotal >= 0 ? 'bg-green-200 dark:bg-green-800' : 'bg-red-200 dark:bg-red-800'}`}>
                  {rentabilidadeTotal >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Valor Investido</p>
                  <p className="font-medium">{formatCurrency(valorInvestido)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor Atual</p>
                  <p className="font-medium">{formatCurrency(valorAtual)}</p>
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground text-right">
                Última atualização: {formatarDataHora(dashboardData.ultimaAtualizacaoCotacoes)}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-3">Composição do Portfólio</h3>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-2 px-4">Ativo</th>
                    <th className="text-right py-2 px-4">Quantidade</th>
                    <th className="text-right py-2 px-4">Preço Médio</th>
                    <th className="text-right py-2 px-4">Preço Atual</th>
                    <th className="text-right py-2 px-4">Variação</th>
                    <th className="text-right py-2 px-4">Rentabilidade</th>
                    <th className="text-right py-2 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.portfolio.map((item, index) => {
                    const cotacaoAtual = item.cotacaoAtual || item.precoMedio;
                    const rentabilidade = item.rentabilidade !== undefined 
                      ? item.rentabilidade 
                      : ((cotacaoAtual / item.precoMedio) - 1) * 100;
                    const valorTotal = item.quantidade * cotacaoAtual;
                    
                    return (
                      <tr key={index} className="border-t">
                        <td className="py-2 px-4 font-medium">{item.ativo}</td>
                        <td className="py-2 px-4 text-right">{item.quantidade}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(item.precoMedio)}</td>
                        <td className="py-2 px-4 text-right">{formatCurrency(cotacaoAtual)}</td>
                        <td className="py-2 px-4 text-right">
                          {item.variacao !== undefined ? (
                            <span className={`flex items-center justify-end ${item.variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.variacao >= 0 ? (
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDownRight className="h-4 w-4 mr-1" />
                              )}
                              {item.variacao.toFixed(2)}%
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="py-2 px-4 text-right">
                          <span className={`flex items-center justify-end ${rentabilidade >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {rentabilidade >= 0 ? (
                              <ArrowUpRight className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 mr-1" />
                            )}
                            {rentabilidade.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right">{formatCurrency(valorTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/50">
                  <tr>
                    <td colSpan={6} className="py-2 px-4 text-right font-medium">
                      Total
                    </td>
                    <td className="py-2 px-4 text-right font-bold">
                      {formatCurrency(valorAtual)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">
            Carregue uma nota de corretagem para visualizar seu portfólio
          </p>
        </div>
      )}
    </div>
  );
};

export default PortfolioWidget;
