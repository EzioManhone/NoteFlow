
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
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Pencil, 
  Save, 
  XCircle,
  MoveHorizontal, 
  Eye, 
  EyeOff
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import EditableWidget from "./EditableWidget";

const Dashboard: React.FC = () => {
  const { 
    widgets, 
    activeTab, 
    setActiveTab, 
    isEditMode, 
    toggleEditMode, 
    addWidget,
    removeWidget, 
    saveLayout,
    handleWidgetDrop
  } = useDashboard();

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
        return <div>Widget personalizado</div>;
    }
  };

  const visibleWidgets = widgets.filter(widget => widget.visible);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const widgetData = e.dataTransfer.getData("widget");
    if (widgetData) {
      handleWidgetDrop(JSON.parse(widgetData));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-background rounded-lg p-4"
    >
      {/* Barra de controle do dashboard */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="flex gap-2">
          {isEditMode && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-1" /> Adicionar Widget
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => addWidget('resumo')}>Resumo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget('ir')}>IR e DARF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget('dividendos')}>Dividendos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget('historico')}>Histórico</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget('portfolio')}>Portfólio</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" onClick={saveLayout}>
                <Save className="h-4 w-4 mr-1" /> Salvar Layout
              </Button>
            </>
          )}
          
          <Button variant={isEditMode ? "default" : "outline"} size="sm" onClick={toggleEditMode}>
            {isEditMode ? (
              <>
                <XCircle className="h-4 w-4 mr-1" /> Sair da Edição
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-1" /> Personalizar
              </>
            )}
          </Button>
        </div>
      </div>

      {isEditMode ? (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {widgets.map((widget) => (
            <EditableWidget
              key={widget.id}
              widget={widget}
              onRemove={() => removeWidget(widget.id)}
            >
              {renderWidgetContent(widget.type)}
            </EditableWidget>
          ))}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap gap-2 mb-4 bg-transparent">
            {visibleWidgets.map((widget) => (
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

          {visibleWidgets.map((widget) => (
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
      )}
    </motion.div>
  );
};

export default Dashboard;
