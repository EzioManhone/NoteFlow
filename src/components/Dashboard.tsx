
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardWidget from "./DashboardWidget";
import { BarChart3, Receipt, PiggyBank } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardWidget {
  id: number;
  name: string;
  content: string;
  icon?: React.ReactNode;
}

const Dashboard: React.FC = () => {
  const dashboardItems: DashboardWidget[] = [
    {
      id: 1,
      name: "Resumo",
      content: "Visão geral da sua carteira com os principais indicadores e performance. Consulta rápida de ativos e operações realizadas.",
      icon: <BarChart3 className="h-4 w-4 text-noteflow-primary" />,
    },
    {
      id: 2,
      name: "IR e DARF",
      content: "Cálculo automático do Imposto de Renda sobre operações. Geração de DARFs e previsão de valores a pagar mensalmente.",
      icon: <Receipt className="h-4 w-4 text-noteflow-secondary" />,
    },
    {
      id: 3,
      name: "Dividendos",
      content: "Acompanhamento dos dividendos recebidos por ativo. Projeção de rendimentos e histórico de pagamentos.",
      icon: <PiggyBank className="h-4 w-4 text-green-500" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Tabs defaultValue="1" className="w-full">
        <TabsList className="flex flex-wrap gap-2 mb-4 bg-transparent">
          {dashboardItems.map((widget) => (
            <TabsTrigger 
              key={widget.id} 
              value={String(widget.id)}
              className="data-[state=active]:bg-accent data-[state=active]:text-noteflow-primary"
            >
              <div className="flex items-center gap-2">
                {widget.icon}
                {widget.name}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {dashboardItems.map((widget) => (
          <TabsContent key={widget.id} value={String(widget.id)}>
            <DashboardWidget widget={widget} isActive={true} />
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
};

export default Dashboard;
