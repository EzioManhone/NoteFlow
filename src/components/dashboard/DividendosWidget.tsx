
import React from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank, TrendingUp, Calendar } from "lucide-react";

const DividendosWidget: React.FC = () => {
  const { dashboardData } = useDashboard();
  
  // Dados simulados para dividendos (para demonstração)
  const dividendosSimulados = [
    { ativo: 'ITSA4', data: '2025-05-15', valor: 0.75, tipo: 'dividendo' },
    { ativo: 'PETR4', data: '2025-04-30', valor: 1.25, tipo: 'dividendo' },
    { ativo: 'BBAS3', data: '2025-05-20', valor: 2.10, tipo: 'jcp' },
    { ativo: 'BBDC4', data: '2025-06-05', valor: 0.89, tipo: 'dividendo' },
    { ativo: 'TAEE11', data: '2025-05-10', valor: 1.45, tipo: 'dividendo' },
  ];
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Calcular total de dividendos
  const totalDividendos = dividendosSimulados.reduce((acc, div) => acc + div.valor, 0);
  
  // Calcular média mensal
  const mediaMensal = totalDividendos / 3; // Supondo 3 meses de histórico
  
  // Calcular próximo pagamento
  const proximoPagamento = dividendosSimulados
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .find(div => new Date(div.data) > new Date());

  return (
    <div className="space-y-4">
      {dashboardData.portfolio.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <PiggyBank className="w-4 h-4 mr-1" /> Total Recebido
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalDividendos)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Últimos 3 meses
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" /> Média Mensal
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(mediaMensal)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado nos últimos 3 meses
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 dark:bg-purple-900/20">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" /> Próximo Pagamento
                </h3>
                {proximoPagamento ? (
                  <>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {proximoPagamento.ativo}: {formatCurrency(proximoPagamento.valor)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Previsto para {formatDate(proximoPagamento.data)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
                    Nenhum pagamento previsto
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-3">Histórico de Dividendos</h3>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-2 px-4">Ativo</th>
                    <th className="text-left py-2 px-4">Data</th>
                    <th className="text-left py-2 px-4">Tipo</th>
                    <th className="text-right py-2 px-4">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {dividendosSimulados.map((div, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2 px-4">{div.ativo}</td>
                      <td className="py-2 px-4">{formatDate(div.data)}</td>
                      <td className="py-2 px-4 capitalize">{div.tipo}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(div.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">
            Carregue uma nota de corretagem para visualizar dividendos
          </p>
        </div>
      )}
    </div>
  );
};

export default DividendosWidget;
