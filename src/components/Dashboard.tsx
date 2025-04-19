import React from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import DashboardWidget from "./DashboardWidget";
import DashboardControls from "./dashboard/DashboardControls";
import DashboardContent from "./dashboard/DashboardContent";
import { WidgetPartial } from "@/types/dashboardTypes";
import { Receipt, PiggyBank, History, Briefcase, LayoutDashboard } from "lucide-react";
import ResumoWidget from "./dashboard/ResumoWidget";
import IRWidget from "./dashboard/IRWidget";
import DividendosWidget from "./dashboard/DividendosWidget";
import HistoricoWidget from "./dashboard/HistoricoWidget";
import PortfolioWidget from "./dashboard/PortfolioWidget";

const Dashboard: React.FC = () => {
  const { activeTab, isEditMode, addWidget, handleWidgetDrop } = useDashboard();

  const widgetPartials: Record<string, WidgetPartial[]> = {
    ir: [
      { 
        id: "resultado-mensal", 
        title: "Resultado Mensal", 
        type: "ir-resultado-mensal",
        component: <IRWidget view="resultado-mensal" />,
        icon: <Receipt className="h-4 w-4 mr-1" />
      },
      { 
        id: "darf-pendente", 
        title: "DARF Pendente", 
        type: "ir-darf-pendente",
        component: <IRWidget view="darf-pendente" />,
        icon: <Receipt className="h-4 w-4 mr-1" />
      }
    ],
    dividendos: [
      { 
        id: "proventos-recentes", 
        title: "Proventos Recentes", 
        type: "dividendos-recentes",
        component: <DividendosWidget view="recentes" />,
        icon: <PiggyBank className="h-4 w-4 mr-1" />
      },
      { 
        id: "proventos-previstos", 
        title: "Proventos Previstos", 
        type: "dividendos-previstos",
        component: <DividendosWidget view="previstos" />,
        icon: <PiggyBank className="h-4 w-4 mr-1" />
      }
    ],
    portfolio: [
      { 
        id: "ativos-rentabilidade", 
        title: "Rentabilidade", 
        type: "portfolio-rentabilidade",
        component: <PortfolioWidget view="rentabilidade" />,
        icon: <Briefcase className="h-4 w-4 mr-1" />
      },
      { 
        id: "ativos-distribuicao", 
        title: "Distribuição", 
        type: "portfolio-distribuicao",
        component: <PortfolioWidget view="distribuicao" />,
        icon: <Briefcase className="h-4 w-4 mr-1" />
      }
    ],
    historico: [
      { 
        id: "operacoes-recentes", 
        title: "Operações Recentes", 
        type: "historico-recentes",
        component: <HistoricoWidget view="recentes" />,
        icon: <History className="h-4 w-4 mr-1" />
      },
      { 
        id: "operacoes-mensais", 
        title: "Resumo Mensal", 
        type: "historico-mensal",
        component: <HistoricoWidget view="mensal" />,
        icon: <History className="h-4 w-4 mr-1" />
      }
    ]
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleWidgetDrop(e);
  };

  const renderWidgetContent = (type: string) => {
    for (const category in widgetPartials) {
      const partial = widgetPartials[category].find(p => p.type === type);
      if (partial) {
        return partial.component;
      }
    }

    switch (type) {
      case "resumo":
        return <ResumoWidget />;
      case "ir":
        return <IRWidget />;
      case "dividendos":
        return <DividendosWidget />;
      case "historico":
        return <HistoricoWidget />;
      case "portfolio":
        return <PortfolioWidget />;
      default:
        return <div>Widget personalizado</div>;
    }
  };

  const handleAddPartialWidget = (partial: WidgetPartial) => {
    const widgetType = partial.type;
    const widgetTitle = partial.title;
    const widgetIcon = partial.icon;
    addWidget(widgetType, widgetTitle, widgetIcon);
  };

  return (
    <>
      {activeTab === "dashboard" && (
        <DashboardControls
          isEditMode={isEditMode}
          onAddWidget={handleAddPartialWidget}
          widgetPartials={widgetPartials}
        />
      )}
      
      <DashboardContent
        activeTab={activeTab}
        renderWidgetContent={renderWidgetContent}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
      />
    </>
  );
};

export default Dashboard;
