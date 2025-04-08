
import React from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, AlertTriangle, ArrowDown } from "lucide-react";

const IRWidget: React.FC = () => {
  const { dashboardData } = useDashboard();
  const { impostos } = dashboardData;

  // Calcular valor total devido
  const totalDevido = impostos.dayTrade + impostos.swingTrade;
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const vencimentoDARF = new Date();
  vencimentoDARF.setDate(vencimentoDARF.getDate() + 10); // Simulação de data de vencimento
  
  const formattedDate = vencimentoDARF.toLocaleDateString('pt-BR');
  
  // Verificar limite de isenção para swing trade (R$ 20.000,00)
  const isento = dashboardData.notasCorretagem.flatMap(n => n.operacoes).reduce((acc, op) => 
    !op.dayTrade ? acc + op.valor : acc, 0) < 20000;

  return (
    <div className="space-y-4">
      {dashboardData.notasCorretagem.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Receipt className="w-4 h-4 mr-1" /> DARF Day Trade
                </h3>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(impostos.dayTrade)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Alíquota: 20%
                </p>
              </CardContent>
            </Card>
            
            <Card className={isento ? "bg-green-50 dark:bg-green-900/20" : "bg-orange-50 dark:bg-orange-900/20"}>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Receipt className="w-4 h-4 mr-1" /> DARF Swing Trade
                </h3>
                {isento ? (
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ISENTO
                  </p>
                ) : (
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(impostos.swingTrade)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {isento ? "Vendas abaixo de R$ 20.000,00" : "Alíquota: 15%"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <ArrowDown className="w-4 h-4 mr-1" /> Prejuízo Acumulado
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(impostos.prejuizoAcumulado)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pode ser compensado em operações futuras
                </p>
              </CardContent>
            </Card>
          </div>
          
          {totalDevido > 0 && (
            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800 dark:text-amber-300">
                      Prazo para pagamento do DARF
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                      O DARF referente às operações realizadas deve ser pago até o último dia útil do mês subsequente.
                      Data estimada: <strong>{formattedDate}</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-3">Suas Notas de Corretagem</h3>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-2 px-4">Nota</th>
                    <th className="text-left py-2 px-4">Data</th>
                    <th className="text-left py-2 px-4">Corretora</th>
                    <th className="text-right py-2 px-4">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.notasCorretagem.map((nota, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2 px-4">{nota.numero}</td>
                      <td className="py-2 px-4">{nota.data}</td>
                      <td className="py-2 px-4">{nota.corretora}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(nota.valorTotal)}</td>
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
            Carregue uma nota de corretagem para calcular o IR
          </p>
        </div>
      )}
    </div>
  );
};

export default IRWidget;
