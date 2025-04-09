
import React from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent } from "@/components/ui/card";
import { BadgePlus, BadgeMinus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const HistoricoWidget: React.FC = () => {
  const { dashboardData } = useDashboard();
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  // Formatar datas
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Dados para gráfico de histórico de operações (simular tendência ao longo do tempo)
  const historicalData = [
    { data: "Jan", patrimonio: 10000, lucro: 0 },
    { data: "Fev", patrimonio: 12500, lucro: 2500 },
    { data: "Mar", patrimonio: 13800, lucro: 1300 },
    { data: "Abr", patrimonio: 15200, lucro: 1400 },
    { data: "Mai", patrimonio: 14700, lucro: -500 },
    { data: "Jun", patrimonio: 16200, lucro: 1500 },
  ];
  
  // Extrair todas as operações de todas as notas
  const todasOperacoes = dashboardData.notasCorretagem.flatMap(nota => 
    nota.operacoes.map(op => ({
      ...op,
      notaNumero: nota.numero,
      notaData: nota.data
    }))
  );

  return (
    <div className="space-y-4">
      {dashboardData.notasCorretagem.length > 0 ? (
        <>
          <Card className="bg-card">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-4">Evolução do Patrimônio</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historicalData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                    <XAxis dataKey="data" />
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
                      labelFormatter={(label) => `Mês: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="patrimonio" 
                      name="Patrimônio" 
                      stroke="#4F46E5" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lucro" 
                      name="Lucro/Prejuízo" 
                      stroke="#10B981" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-3">Histórico de Operações</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todasOperacoes.map((op, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(op.notaData)}</TableCell>
                    <TableCell>{op.ativo}</TableCell>
                    <TableCell>
                      <span className={`flex items-center ${op.tipo === 'compra' ? 'text-green-600' : 'text-red-600'}`}>
                        {op.tipo === 'compra' ? (
                          <BadgePlus className="h-4 w-4 mr-1" />
                        ) : (
                          <BadgeMinus className="h-4 w-4 mr-1" />
                        )}
                        {op.tipo === 'compra' ? 'Compra' : 'Venda'}
                      </span>
                    </TableCell>
                    <TableCell>{op.quantidade}</TableCell>
                    <TableCell className="text-right">{formatCurrency(op.preco)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(op.valor)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">
            Carregue uma nota de corretagem para visualizar o histórico de operações
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoricoWidget;
