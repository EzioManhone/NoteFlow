import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Save, XCircle } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useDashboard } from "@/contexts/DashboardContext";
import { WidgetPartial } from "@/types/dashboardTypes";
import { 
  Receipt, 
  PiggyBank,
  History,
  Briefcase,
  LayoutDashboard
} from "lucide-react";

interface DashboardControlsProps {
  isEditMode: boolean;
  onAddWidget: (partial: WidgetPartial) => void;
  widgetPartials: Record<string, WidgetPartial[]>;
}

const DashboardControls: React.FC<DashboardControlsProps> = ({
  isEditMode,
  onAddWidget,
  widgetPartials,
}) => {
  const { toggleEditMode, saveLayout, addWidget } = useDashboard();

  const handleAddPartialWidget = (partial: WidgetPartial) => {
    onAddWidget(partial);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        {isEditMode && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-1" /> Adicionar Widget
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => addWidget("resumo", "Dashboard Completo", <LayoutDashboard className="h-4 w-4 mr-1" />)}>Dashboard Completo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWidget("ir", "IR e DARF Completo", <Receipt className="h-4 w-4 mr-1" />)}>IR e DARF Completo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWidget("dividendos", "Dividendos Completo", <PiggyBank className="h-4 w-4 mr-1" />)}>Dividendos Completo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWidget("historico", "Histórico Completo", <History className="h-4 w-4 mr-1" />)}>Histórico Completo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWidget("portfolio", "Portfólio Completo", <Briefcase className="h-4 w-4 mr-1" />)}>Portfólio Completo</DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Componentes específicos</DropdownMenuLabel>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Receipt className="h-4 w-4 mr-2" />
                    <span>IR e DARF</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-0">
                    {widgetPartials.ir.map(partial => (
                      <DropdownMenuItem 
                        key={partial.id}
                        onClick={() => handleAddPartialWidget(partial)}
                      >
                        {partial.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <PiggyBank className="h-4 w-4 mr-2" />
                    <span>Dividendos</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-0">
                    {widgetPartials.dividendos.map(partial => (
                      <DropdownMenuItem 
                        key={partial.id}
                        onClick={() => handleAddPartialWidget(partial)}
                      >
                        {partial.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>Portfólio</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-0">
                    {widgetPartials.portfolio.map(partial => (
                      <DropdownMenuItem 
                        key={partial.id}
                        onClick={() => handleAddPartialWidget(partial)}
                      >
                        {partial.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <History className="h-4 w-4 mr-2" />
                    <span>Histórico</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="p-0">
                    {widgetPartials.historico.map(partial => (
                      <DropdownMenuItem 
                        key={partial.id}
                        onClick={() => handleAddPartialWidget(partial)}
                      >
                        {partial.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
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
              <Pencil className="h-4 w-4 mr-1" /> Editar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DashboardControls;
