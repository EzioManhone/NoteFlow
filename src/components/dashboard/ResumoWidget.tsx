
import React from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const ResumoWidget: React.FC = () => {
  const { dashboardData } = useDashboard();
  
  // Preparar dados para o gráfico de ativos
  const portfolioData = dashboardData.portfolio.map(item => ({
    name: item.ativo,
    value: item.valorTotal,
  }));

  // Dados para o gráfico de operações
  const operationsData = dashboardData.notasCorretagem.flatMap(nota => 
    nota.operacoes.map(op => ({
      name: op.ativo,
      value: op.valor,
      tipo: op.tipo
    }))
  );

  // Cores para o gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {dashboardData.portfolio.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Total Investido</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(dashboardData.portfolio.reduce((acc, curr) => acc + curr.valorTotal, 0))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Ativos</h3>
                <p className="text-2xl font-bold">{dashboardData.portfolio.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Operações</h3>
                <p className="text-2xl font-bold">
                  {dashboardData.notasCorretagem.reduce((acc, nota) => acc + nota.operacoes.length, 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Composição da Carteira</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {portfolioData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Histórico de Operações</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={operationsData}>
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => 
                          new Intl.NumberFormat('pt-BR', { 
                            notation: 'compact',
                            compactDisplay: 'short'
                          }).format(value)
                        } 
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))} 
                      />
                      <Legend />
                      <Bar name="Valor" dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">
            Carregue uma nota de corretagem para visualizar o resumo da sua carteira
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumoWidget;
