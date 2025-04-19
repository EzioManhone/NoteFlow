
import React from "react";
import { motion } from "framer-motion";
import EditableWidget from "@/components/EditableWidget";
import { useDashboard } from "@/contexts/DashboardContext";
import { TabContent } from "@/types/dashboardTypes";

interface DashboardContentProps {
  activeTab: string;
  renderWidgetContent: (type: string) => React.ReactNode;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  activeTab,
  renderWidgetContent,
  handleDragOver,
  handleDrop,
}) => {
  const { widgets, removeWidget } = useDashboard();

  const getTabContent = (tab: string): React.ReactNode => {
    if (tab === "dashboard") {
      return (
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[300px] relative"
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
      );
    }

    return renderWidgetContent(tab);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-background rounded-lg p-4"
    >
      {getTabContent(activeTab)}
    </motion.div>
  );
};

export default DashboardContent;
