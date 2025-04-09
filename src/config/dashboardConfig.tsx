
import React from "react";
import { WidgetConfig, DashboardData, DashboardLayout } from "@/models/dashboardTypes";
import { BarChart3, Receipt, PiggyBank, History, Briefcase } from "lucide-react";

// Dados iniciais do dashboard
export const initialDashboardData: DashboardData = {
  notasCorretagem: [],
  ativos: [],
  impostos: {
    dayTrade: 0,
    swingTrade: 0,
    prejuizoAcumulado: 0
  },
  resultadoMensal: {
    dayTrade: 0,
    swingTrade: 0,
    mes: ""
  },
  dividendos: [],
  portfolio: [],
  cotacoes: []
};

// Configuração inicial de widgets
export const initialWidgets: WidgetConfig[] = [
  {
    id: "resumo",
    title: "Resumo da Carteira",
    type: "resumo",
    icon: <BarChart3 className="h-4 w-4 text-noteflow-primary" />,
    visible: true
  },
  {
    id: "ir",
    title: "IR e DARF",
    type: "ir",
    icon: <Receipt className="h-4 w-4 text-noteflow-secondary" />,
    visible: true
  },
  {
    id: "dividendos",
    title: "Dividendos",
    type: "dividendos",
    icon: <PiggyBank className="h-4 w-4 text-green-500" />,
    visible: true
  },
  {
    id: "historico",
    title: "Histórico",
    type: "historico",
    icon: <History className="h-4 w-4 text-blue-500" />,
    visible: true
  },
  {
    id: "portfolio",
    title: "Portfólio",
    type: "portfolio",
    icon: <Briefcase className="h-4 w-4 text-purple-500" />,
    visible: true
  }
];

// Layout inicial
export const initialLayout: DashboardLayout = {
  widgets: initialWidgets,
  columns: 2
};
