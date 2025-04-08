
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardWidget from "./DashboardWidget";
import { motion } from "framer-motion";
import { useDashboard } from "@/contexts/DashboardContext";
import ResumoWidget from "./dashboard/ResumoWidget";
import IRWidget from "./dashboard/IRWidget";
import DividendosWidget from "./dashboard/DividendosWidget";
import HistoricoWidget from "./dashboard/HistoricoWidget";
import PortfolioWidget from "./dashboard/PortfolioWidget";

const Dashboard: React.FC = () => {
  const { widgets, activeTab, setActiveTab } = useDashboard();

  // Renderizar o conteúdo correto baseado no tipo de widget
  const renderWidgetContent = (type: string) => {
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
        return <div>Widget não encontrado</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-background rounded-lg p-4"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap gap-2 mb-4 bg-transparent">
          {widgets.map((widget) => (
            <TabsTrigger 
              key={widget.id} 
              value={widget.id}
              className="data-[state=active]:bg-accent data-[state=active]:text-primary"
            >
              <div className="flex items-center gap-2">
                {widget.icon}
                {widget.title}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {widgets.map((widget) => (
          <TabsContent key={widget.id} value={widget.id}>
            <DashboardWidget
              title={widget.title}
              icon={widget.icon}
            >
              {renderWidgetContent(widget.type)}
            </DashboardWidget>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
};

export default Dashboard;
