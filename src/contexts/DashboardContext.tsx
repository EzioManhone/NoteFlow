import React, { createContext, useContext, useState, useEffect } from "react";
import { DashboardData, WidgetConfig, DashboardLayout } from "@/models/dashboardTypes";
import { initialDashboardData, initialLayout } from "@/config/dashboardConfig";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { usePdfProcessor } from "@/hooks/usePdfProcessor";
import { useCotacoes } from "@/hooks/useCotacoes";

// Criar contexto
type DashboardContextType = {
  dashboardData: DashboardData;
  widgets: WidgetConfig[];
  layout: DashboardLayout;
  activeTab: string;
  isEditMode: boolean;
  setActiveTab: (tab: string) => void;
  processPdfFile: (file: File) => Promise<void>;
  isProcessing: boolean;
  toggleEditMode: () => void;
  addWidget: (widgetType: string) => void;
  removeWidget: (widgetId: string) => void;
  updateWidgetPosition: (widgetId: string, position: { x: number, y: number }) => void;
  updateWidgetSize: (widgetId: string, size: { width: number, height: number }) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  duplicateWidget: (widgetId: string) => void;
  handleWidgetDrop: (widget: WidgetConfig) => void;
  saveLayout: () => void;
  atualizarCotacoes: () => Promise<void>;
  isLoadingCotacoes: boolean;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Hook para usar o contexto
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard deve ser usado dentro de um DashboardProvider");
  }
  return context;
};

// Provedor do contexto
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [activeTab, setActiveTab] = useState("resumo");
  
  // Usar os hooks refatorados
  const widgetsManager = useDashboardWidgets(initialLayout);
  const cotacoesManager = useCotacoes(dashboardData, setDashboardData);
  const pdfProcessor = usePdfProcessor(
    dashboardData, 
    setDashboardData, 
    cotacoesManager.atualizarCotacoes
  );

  // Efeito para carregar o layout salvo do localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      try {
        widgetsManager.setLayout(JSON.parse(savedLayout));
      } catch (error) {
        console.error('Erro ao carregar layout salvo:', error);
      }
    }
    
    // Carregar cotações iniciais
    if (dashboardData.portfolio.length > 0) {
      cotacoesManager.atualizarCotacoes();
    }
  }, []);

  // Valor do contexto
  const value = {
    dashboardData,
    widgets: widgetsManager.layout.widgets,
    layout: widgetsManager.layout,
    activeTab,
    isEditMode: widgetsManager.isEditMode,
    setActiveTab,
    processPdfFile: pdfProcessor.processPdfFile,
    isProcessing: pdfProcessor.isProcessing,
    toggleEditMode: widgetsManager.toggleEditMode,
    addWidget: widgetsManager.addWidget,
    removeWidget: widgetsManager.removeWidget,
    updateWidgetPosition: widgetsManager.updateWidgetPosition,
    updateWidgetSize: widgetsManager.updateWidgetSize,
    toggleWidgetVisibility: widgetsManager.toggleWidgetVisibility,
    duplicateWidget: widgetsManager.duplicateWidget,
    handleWidgetDrop: widgetsManager.handleWidgetDrop,
    saveLayout: widgetsManager.saveLayout,
    atualizarCotacoes: cotacoesManager.atualizarCotacoes,
    isLoadingCotacoes: cotacoesManager.isLoading,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
