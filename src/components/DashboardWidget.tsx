
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface WidgetData {
  id: number;
  name: string;
  content: string;
  icon?: React.ReactNode;
}

const DashboardWidget: React.FC<{ widget: WidgetData; isActive: boolean }> = ({
  widget,
  isActive,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className={`h-full ${isActive ? "shadow-lg border-primary/20" : ""}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {widget.icon}
            {widget.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-700">{widget.content}</div>
          {isActive && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-muted-foreground">
                Essa área será personalizável na versão completa
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardWidget;
