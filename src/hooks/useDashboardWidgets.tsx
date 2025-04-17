
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

  const handleWidgetDrop = useCallback((widget: any) => {
    // Verifica se o widget já está serializado ou se precisa ser serializado
    let widgetData;
    
    try {
      // Se o widget for uma string JSON, tente analisá-lo
      if (typeof widget === 'string') {
        widgetData = JSON.parse(widget);
      } else {
        // Se for um objeto, use-o diretamente, mas crie uma nova versão simplificada
        // para evitar problemas de referência circular com elementos React
        widgetData = {
          id: widget.id || uuidv4(),
          title: widget.title || "Novo Widget",
          type: widget.type || "resumo",
          // Não clonamos diretamente o ícone, apenas o tipo
          visible: true
        };
      }
      
      // Garantir que temos um novo ID
      const newWidget: WidgetConfig = {
        ...widgetData,
        id: uuidv4(),
        title: `${widgetData.title} (cópia)`,
        // Usar um ícone padrão para evitar problemas de serialização
        icon: <Plus className="h-4 w-4" />
      };

      setLayout(prev => ({
        ...prev,
        widgets: [...prev.widgets, newWidget]
      }));

      toast({
        title: "Widget adicionado",
        description: "O widget foi adicionado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao processar o widget arrastado:", error);
      toast({
        title: "Erro ao adicionar widget",
        description: "Não foi possível adicionar o widget.",
        variant: "destructive"
      });
    }
  }, []);

  const saveLayout = useCallback(() => {
    // Preparar uma versão serializável do layout (sem elementos React)
    const serializableLayout = {
      ...layout,
      widgets: layout.widgets.map(widget => ({
        ...widget,
        // Substitui o ícone React por uma string indicando seu tipo
        icon: typeof widget.icon === 'object' ? null : widget.icon
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
    toggleWidgetVisibility,
    duplicateWidget,
    handleWidgetDrop,
    saveLayout
  };
};
