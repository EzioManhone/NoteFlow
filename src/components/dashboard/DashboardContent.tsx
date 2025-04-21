
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
          {widgets.length === 0 ? (
            <div className="col-span-3 flex items-center justify-center h-64 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Arraste widgets da barra lateral para começar a personalizar seu dashboard
                </p>
              </div>
            </div>
          ) : (
            widgets.map((widget) => (
              <EditableWidget
                key={widget.id}
                widget={widget}
                onRemove={() => removeWidget(widget.id)}
              >
                {renderWidgetContent(widget.type)}
              </EditableWidget>
            ))
          )}
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
