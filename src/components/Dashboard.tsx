import React, { useState } from "react";
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
import { PlusCircle, Pencil, Save, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

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

  const visibleWidgets = widgets.filter(widget => widget.visible);
  const initialLayout: Layout[] = visibleWidgets.map((widget, index) => ({
    i: widget.id,
    x: (index * 2) % 12,
    y: Math.floor(index / 6),
    w: 4,
    h: 2,
  }));

  const [layout, setLayout] = useState<Layout[]>(initialLayout);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-background rounded-lg p-4"
    >
      {/* Barra de controle */}
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
                  <DropdownMenuItem onClick={() => addWidget("resumo")}>Resumo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget("ir")}>IR e DARF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget("dividendos")}>Dividendos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget("historico")}>Histórico</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget("portfolio")}>Portfólio</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={saveLayout}>
                <Save className="h-4 w-4 mr-1" /> Salvar Layout
              </Button>
            </>
          )}

          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={toggleEditMode}
          >
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
        <div onDragOver={handleDragOver} onDrop={handleDrop}>
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={30}
            width={1200}
            onLayoutChange={(newLayout) => setLayout(newLayout)}
          >
            {visibleWidgets.map((widget) => (
              <div
                key={widget.id}
                className="bg-gray-200 rounded p-4 shadow flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{widget.title}</h3>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Remover
                  </button>
                </div>
                {renderWidgetContent(widget.type)}
              </div>
            ))}
          </GridLayout>
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
              <DashboardWidget title={widget.title} icon={widget.icon}>
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
