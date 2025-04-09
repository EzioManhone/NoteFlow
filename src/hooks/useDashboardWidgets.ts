
import { useState, useCallback } from "react";
import { WidgetConfig, DashboardLayout } from "@/models/dashboardTypes";
import { v4 as uuidv4 } from 'uuid';
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const useDashboardWidgets = (initialLayout: DashboardLayout) => {
  const [layout, setLayout] = useState<DashboardLayout>(initialLayout);
  const [isEditMode, setIsEditMode] = useState(false);

  // Funções para gerenciar os widgets
  const toggleEditMode = useCallback(() => setIsEditMode(!isEditMode), [isEditMode]);

  const addWidget = useCallback((widgetType: string) => {
    const newWidget: WidgetConfig = {
      id: uuidv4(),
      title: `Novo ${widgetType}`,
      type: widgetType as any,
      icon: <Plus className="h-4 w-4" />,
      visible: true
    };

    setLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId)
    }));
  }, []);

  const updateWidgetPosition = useCallback((widgetId: string, position: { x: number, y: number }) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, position } : widget
      )
    }));
  }, []);

  const updateWidgetSize = useCallback((widgetId: string, size: { width: number, height: number }) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, size } : widget
      )
    }));
  }, []);

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      )
    }));
  }, []);

  const saveLayout = useCallback(() => {
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    toast({
      title: "Layout salvo",
      description: "Suas configurações de dashboard foram salvas com sucesso!",
    });
  }, [layout]);

  return {
    layout,
    setLayout,
    isEditMode,
    toggleEditMode,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetSize,
    toggleWidgetVisibility,
    saveLayout
  };
};
