
import React from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, DollarSign, BadgeAlert } from "lucide-react";

interface IRWidgetProps {
  view?: string;
}

const IRWidget: React.FC<IRWidgetProps> = ({ view }) => {
  const { dashboardData } = useDashboard();
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  // Renderização condicional baseada na visualização selecionada
  if (view === "resultado-mensal") {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <DollarSign className="w-4 h-4 mr-1" /> Resultado Mensal
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Day Trade</p>
              <p className="font-medium">{formatCurrency(dashboardData.resultadoMensal.dayTrade)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Swing Trade</p>
              <p className="font-medium">{formatCurrency(dashboardData.resultadoMensal.swingTrade)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Mês de referência: {dashboardData.resultadoMensal.mes || 'N/A'}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (view === "darf-pendente") {
    return (
      <Card className="bg-amber-50 dark:bg-amber-900/20">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <BadgeAlert className="w-4 h-4 mr-1" /> DARF Pendente
          </h3>
          <p className="font-medium">
            {dashboardData.impostos.dayTrade > 0 || dashboardData.impostos.swingTrade > 0 ? (
              <span>Você possui DARF pendente para pagamento</span>
            ) : (
              <span>Nenhuma DARF pendente</span>
            )}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Visualização padrão - widget completo
  return (
    <div className="space-y-4">
      {dashboardData.notasCorretagem.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Imposto Day Trade</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(dashboardData.impostos.dayTrade)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Imposto Swing Trade</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(dashboardData.impostos.swingTrade)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Prejuízo Acumulado</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(dashboardData.impostos.prejuizoAcumulado)}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-2">Informações de DARF</h3>
              {dashboardData.impostos.dayTrade > 0 || dashboardData.impostos.swingTrade > 0 ? (
                <div className="space-y-4">
                  <p className="font-medium">
                    Você possui DARF pendente para pagamento
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.impostos.dayTrade > 0 && (
                      <div className="p-3 bg-white dark:bg-black rounded-lg shadow-sm">
                        <p className="font-medium">Day Trade</p>
                        <p className="text-lg">{formatCurrency(dashboardData.impostos.dayTrade)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vencimento: último dia útil do mês
                        </p>
                      </div>
                    )}
                    
                    {dashboardData.impostos.swingTrade > 0 && (
                      <div className="p-3 bg-white dark:bg-black rounded-lg shadow-sm">
                        <p className="font-medium">Swing Trade</p>
                        <p className="text-lg">{formatCurrency(dashboardData.impostos.swingTrade)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vencimento: último dia útil do mês
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="font-medium">
                  Não há DARF pendente para pagamento.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground">
            Carregue uma nota de corretagem para visualizar informações de IR e DARF
          </p>
        </div>
      )}
    </div>
  );
};

export default IRWidget;
