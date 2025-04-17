
import { useState, useCallback } from "react";
import { WidgetConfig, DashboardLayout } from "@/models/dashboardTypes";
import { v4 as uuidv4 } from 'uuid';
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const useDashboardWidgets = (initialLayout: DashboardLayout) => {
  const [layout, setLayout] = useState<DashboardLayout>(initialLayout);
  const [isEditMode, setIsEditMode] = useState(false);
  const [gridPositions, setGridPositions] = useState<Record<string, { row: number, col: number }>>({});

  // Funções para gerenciar os widgets
  const toggleEditMode = useCallback(() => setIsEditMode(!isEditMode), [isEditMode]);

  const addWidget = useCallback((widgetType: string, customTitle?: string, customIcon?: React.ReactNode) => {
    const title = customTitle || `Novo ${widgetType}`;
    const icon = customIcon || <Plus className="h-4 w-4" />;
    
    const newWidget: WidgetConfig = {
      id: uuidv4(),
      title: title,
      type: widgetType,
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
    console.log(`Updating position for widget ${widgetId} to:`, position);
    
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, position } : widget
      )
    }));
    
    toast({
      title: "Posição atualizada",
      description: "A posição do widget foi atualizada.",
    });
  }, []);

  const updateWidgetTitle = useCallback((widgetId: string, title: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, title } : widget
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

  const handleWidgetDrop = useCallback((e: React.DragEvent<HTMLDivElement>, targetPosition?: { row: number, col: number }) => {
    try {
      e.preventDefault();
      
      const widgetId = e.dataTransfer.getData("widgetId");
      const action = e.dataTransfer.getData("action");
      
      if (!widgetId || !action) {
        console.error("Dados incompletos de arrasto");
        return;
      }
      
      if (action === "move") {
        // Get the drop position from the event
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Calculate the position based on the grid
        const position = targetPosition || {
          x: Math.floor(x / 100) * 100,
          y: Math.floor(y / 100) * 100
        };
        
        console.log(`Moving widget ${widgetId} to position:`, position);
        
        // Update widget position
        updateWidgetPosition(widgetId, { x: position.x, y: position.y });
        
        toast({
          title: "Widget movido",
          description: "O widget foi movido para a nova posição."
        });
      }
    } catch (error) {
      console.error("Erro ao processar o drop:", error);
      toast({
        title: "Erro ao mover widget",
        description: "Não foi possível mover o widget.",
        variant: "destructive"
      });
    }
  }, [updateWidgetPosition]);

  const saveLayout = useCallback(() => {
    // Prepare a serializable version of the layout (without React elements)
    const serializableLayout = {
      ...layout,
      widgets: layout.widgets.map(widget => ({
        ...widget,
        // Replace React icon with null to avoid serialization issues
        icon: null
      }))
    };
    
    try {
      localStorage.setItem('dashboardLayout', JSON.stringify(serializableLayout));
      toast({
        title: "Layout salvo",
        description: "Suas configurações de dashboard foram salvas com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar layout:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o layout.",
        variant: "destructive"
      });
    }
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
    updateWidgetTitle,
    toggleWidgetVisibility,
    duplicateWidget,
    handleWidgetDrop,
    saveLayout
  };
};
