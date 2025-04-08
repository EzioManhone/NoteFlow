
import React from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";

const PortfolioWidget: React.FC = () => {
  const { dashboardData } = useDashboard();
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  // Simular dados de rentabilidade para cada ativo
  const portfolioComRentabilidade = dashboardData.portfolio.map(item => {
    const rentabilidade = (Math.random() * 20) - 10; // -10% a +10%
    return {
      ...item,
      rentabilidade,
      precoAtual: item.precoMedio * (1 + rentabilidade/100)
    };
  });
  
  // Calcular rentabilidade total da carteira
  const valorTotal = portfolioComRentabilidade.reduce((acc, item) => acc + item.valorTotal, 0);
  const valorAtualizado = portfolioComRentabilidade.reduce((acc, item) => acc + (item.quantidade * item.precoAtual), 0);
  const rentabilidadeTotal = ((valorAtualizado / valorTotal) - 1) * 100;

  return (
    <div className="space-y-4">
      {dashboardData.portfolio.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            <Card className={`${rentabilidadeTotal >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Rentabilidade da Carteira</h3>
                    <p className={`text-2xl font-bold ${rentabilidadeTotal >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {rentabilidadeTotal.toFixed(2)}%
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${rentabilidadeTotal >= 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                    {rentabilidadeTotal >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Inicial</p>
                    <p className="font-medium">{formatCurrency(valorTotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Atual</p>
                    <p className="font-medium">{formatCurrency(valorAtualizado)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
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
                    <th className="text-right py-2 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioComRentabilidade.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2 px-4 font-medium">{item.ativo}</td>
                      <td className="py-2 px-4 text-right">{item.quantidade}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(item.precoMedio)}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(item.precoAtual)}</td>
                      <td className="py-2 px-4 text-right">
                        <span className={`flex items-center justify-end ${item.rentabilidade >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.rentabilidade >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                          )}
                          {item.rentabilidade.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right">{formatCurrency(item.quantidade * item.precoAtual)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50">
                  <tr>
                    <td colSpan={5} className="py-2 px-4 text-right font-medium">
                      Total
                    </td>
                    <td className="py-2 px-4 text-right font-bold">
                      {formatCurrency(valorAtualizado)}
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
