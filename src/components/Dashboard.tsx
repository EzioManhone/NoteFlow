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
  Receipt,
  PiggyBank,
  History as HistoryIcon,
  Briefcase
} from "lucide-react";
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
import EditableWidget from "./EditableWidget";

// Interface para componentes de widgets parciais
interface WidgetPartial {
  id: string;
  title: string;
  type: string;
  component: React.ReactNode;
  icon?: React.ReactNode;
}

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

  // Definição de componentes parciais que podem ser adicionados ao dashboard
  const widgetPartials: Record<string, WidgetPartial[]> = {
    ir: [
      { 
        id: "resultado-mensal", 
        title: "Resultado Mensal", 
        type: "ir-resultado-mensal",
        component: <IRWidget view="resultado-mensal" />
      },
      { 
        id: "darf-pendente", 
        title: "DARF Pendente", 
        type: "ir-darf-pendente",
        component: <IRWidget view="darf-pendente" />
      }
    ],
    dividendos: [
      { 
        id: "proventos-recentes", 
        title: "Proventos Recentes", 
        type: "dividendos-recentes",
        component: <DividendosWidget view="recentes" />
      },
      { 
        id: "proventos-previstos", 
        title: "Proventos Previstos", 
        type: "dividendos-previstos",
        component: <DividendosWidget view="previstos" />
      }
    ],
    portfolio: [
      { 
        id: "ativos-rentabilidade", 
        title: "Rentabilidade", 
        type: "portfolio-rentabilidade",
        component: <PortfolioWidget view="rentabilidade" />
      },
      { 
        id: "ativos-distribuicao", 
        title: "Distribuição", 
        type: "portfolio-distribuicao",
        component: <PortfolioWidget view="distribuicao" />
      }
    ],
    historico: [
      { 
        id: "operacoes-recentes", 
        title: "Operações Recentes", 
        type: "historico-recentes",
        component: <HistoricoWidget view="recentes" />
      },
      { 
        id: "operacoes-mensais", 
        title: "Resumo Mensal", 
        type: "historico-mensal",
        component: <HistoricoWidget view="mensal" />
      }
    ]
  };

  // Renderizar o conteúdo correto baseado no tipo de widget
  const renderWidgetContent = (type: string) => {
    // Verificar primeiro se é um widget parcial
    for (const category in widgetPartials) {
      const partial = widgetPartials[category].find(p => p.type === type);
      if (partial) {
        return partial.component;
      }
    }

    // Se não for parcial, usa os widgets completos padrão
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const widgetData = e.dataTransfer.getData("widget");
    if (widgetData) {
      handleWidgetDrop(JSON.parse(widgetData));
    }
  };

  // Adicionar widget parcial
  const handleAddPartialWidget = (category: string, partial: WidgetPartial) => {
    addWidget(partial.type, partial.title, partial.icon);
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
                  <DropdownMenuItem onClick={() => addWidget('resumo')}>Dashboard Completo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget('ir')}>IR e DARF Completo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget('dividendos')}>Dividendos Completo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget('historico')}>Histórico Completo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addWidget('portfolio')}>Portfólio Completo</DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Componentes específicos</DropdownMenuLabel>
                  
                  {/* IR e DARF parciais */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Receipt className="h-4 w-4 mr-2" />
                      <span>IR e DARF</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-0">
                      {widgetPartials.ir.map(partial => (
                        <DropdownMenuItem 
                          key={partial.id}
                          onClick={() => handleAddPartialWidget('ir', partial)}
                        >
                          {partial.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  {/* Dividendos parciais */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <PiggyBank className="h-4 w-4 mr-2" />
                      <span>Dividendos</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-0">
                      {widgetPartials.dividendos.map(partial => (
                        <DropdownMenuItem 
                          key={partial.id}
                          onClick={() => handleAddPartialWidget('dividendos', partial)}
                        >
                          {partial.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  {/* Portfolio parciais */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>Portfólio</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-0">
                      {widgetPartials.portfolio.map(partial => (
                        <DropdownMenuItem 
                          key={partial.id}
                          onClick={() => handleAddPartialWidget('portfolio', partial)}
                        >
                          {partial.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  {/* Histórico parciais */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <HistoryIcon className="h-4 w-4 mr-2" />
                      <span>Histórico</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="p-0">
                      {widgetPartials.historico.map(partial => (
                        <DropdownMenuItem 
                          key={partial.id}
                          onClick={() => handleAddPartialWidget('historico', partial)}
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
