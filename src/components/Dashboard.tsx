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
      animate={{ opacity:
