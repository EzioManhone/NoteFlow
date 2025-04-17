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

  const addWidget = useCallback((widgetType: string, customTitle?: string, customIcon?: React.ReactNode) => {
    const title = customTitle || `Novo ${widgetType}`;
    const icon = customIcon || <Plus className="h-4 w-4" />;
    
    const newWidget: WidgetConfig = {
      id: uuidv4(),
      title: title,
      type: widgetType as any,
      icon: icon,
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

  const duplicateWidget = useCallback((widgetId: string) => {
    setLayout(prev => {
      const widgetToDuplicate = prev.widgets.find(widget => widget.id === widgetId);
      if (!widgetToDuplicate) return prev;

      const duplicatedWidget: WidgetConfig = {
        ...widgetToDuplicate,
        id: uuidv4(),
        title: `${widgetToDuplicate.title} (cópia)`
      };

      return {
        ...prev,
        widgets: [...prev.widgets, duplicatedWidget]
      };
    });
    
    toast({
      title: "Widget duplicado",
      description: "O widget foi duplicado com sucesso!",
    });
  }, []);

  const handleWidgetDrop = useCallback((widget: WidgetConfig) => {
    // Create a new copy of the widget with a new ID
    const newWidget: WidgetConfig = {
      ...widget,
      id: uuidv4(),
      title: `${widget.title} (cópia)`
    };

    setLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));

    toast({
      title: "Widget adicionado",
      description: "O widget foi adicionado com sucesso!",
    });
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
    duplicateWidget,
    handleWidgetDrop,
    saveLayout
  };
};
