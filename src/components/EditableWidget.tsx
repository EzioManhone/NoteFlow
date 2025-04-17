
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/contexts/DashboardContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  X,
  Eye,
  EyeOff,
  Edit,
  Check,
  Maximize,
  Minimize,
  Copy,
  Plus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { WidgetConfig } from "@/models/dashboardTypes";
import { toast } from "@/components/ui/use-toast";

interface EditableWidgetProps {
  widget: WidgetConfig;
  children: React.ReactNode;
  onRemove: () => void;
}

const EditableWidget: React.FC<EditableWidgetProps> = ({
  widget,
  children,
  onRemove
}) => {
  const { toggleWidgetVisibility, duplicateWidget, updateWidgetPosition, updateWidgetTitle } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(widget.title);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleSaveTitle = () => {
    updateWidgetTitle(widget.id, title);
    setIsEditing(false);
    toast({
      title: "Título atualizado",
      description: "O título do widget foi atualizado com sucesso.",
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    try {
      setIsDragging(true);
      // Create simple data for transfer to avoid serialization issues
      e.dataTransfer.setData("widgetId", widget.id);
      e.dataTransfer.setData("action", "move");
      e.dataTransfer.effectAllowed = "move";
      
      // Use the drag image for visual feedback
      const dragElement = e.currentTarget;
      if (dragElement) {
        // Set the drag image offset to center it
        const rect = dragElement.getBoundingClientRect();
        e.dataTransfer.setDragImage(dragElement, rect.width / 2, rect.height / 2);
      }
    } catch (error) {
      console.error("Erro ao iniciar drag:", error);
      toast({
        title: "Erro ao iniciar arrasto",
        description: "Não foi possível iniciar o arrasto do widget.",
        variant: "destructive"
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`${widget.visible ? "" : "opacity-50"} ${isExpanded ? "col-span-2 row-span-2" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        layout
        className={isDragging ? "opacity-50" : ""}
      >
        <Card className="h-full shadow-md border-primary/10 bg-card relative group">
          {/* Barra de controle do widget */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
            <Button variant="ghost" size="icon" onClick={() => duplicateWidget(widget.id)}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 
                <Minimize className="h-4 w-4" /> : 
                <Maximize className="h-4 w-4" />
              }
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <Check className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => toggleWidgetVisibility(widget.id)}>
              {widget.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute top-2 left-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <CardHeader className="pb-2 pt-6">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-base font-semibold"
                  autoFocus
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                  }}
                />
                <Button size="sm" variant="ghost" onClick={handleSaveTitle}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <CardTitle className="text-lg flex items-center gap-2">
                {widget.icon || <Plus className="h-4 w-4" />}
                {title}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EditableWidget;
