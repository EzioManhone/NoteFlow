import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DashboardData, WidgetConfig, DashboardLayout } from "@/models/dashboardTypes";
import { NotaCorretagem, Operation, parsePdfCorretagem, calcularImpostos, extrairAtivos } from "@/utils/pdfParser";
import { BarChart3, Receipt, PiggyBank, History, Briefcase, Plus, Move } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { buscarCotacoes, Cotacao, ativoExisteNaB3 } from "@/services/stockService";

// Contexto inicial
const initialDashboardData: DashboardData = {
  notasCorretagem: [],
  ativos: [],
  impostos: {
    dayTrade: 0,
    swingTrade: 0,
    prejuizoAcumulado: 0
  },
  dividendos: [],
  portfolio: [],
  cotacoes: []
};

// Configuração inicial de widgets
const initialWidgets: WidgetConfig[] = [
  {
    id: "resumo",
    title: "Resumo da Carteira",
    type: "resumo",
    icon: <BarChart3 className="h-4 w-4 text-noteflow-primary" />,
    visible: true
  },
  {
    id: "ir",
    title: "IR e DARF",
    type: "ir",
    icon: <Receipt className="h-4 w-4 text-noteflow-secondary" />,
    visible: true
  },
  {
    id: "dividendos",
    title: "Dividendos",
    type: "dividendos",
    icon: <PiggyBank className="h-4 w-4 text-green-500" />,
    visible: true
  },
  {
    id: "historico",
    title: "Histórico",
    type: "historico",
    icon: <History className="h-4 w-4 text-blue-500" />,
    visible: true
  },
  {
    id: "portfolio",
    title: "Portfólio",
    type: "portfolio",
    icon: <Briefcase className="h-4 w-4 text-purple-500" />,
    visible: true
  }
];

// Layout inicial
const initialLayout: DashboardLayout = {
  widgets: initialWidgets,
  columns: 2
};

// Criar contexto
type DashboardContextType = {
  dashboardData: DashboardData;
  widgets: WidgetConfig[];
  layout: DashboardLayout;
  activeTab: string;
  isEditMode: boolean;
  setActiveTab: (tab: string) => void;
  processPdfFile: (file: File) => Promise<void>;
  isProcessing: boolean;
  toggleEditMode: () => void;
  addWidget: (widgetType: string) => void;
  removeWidget: (widgetId: string) => void;
  updateWidgetPosition: (widgetId: string, position: { x: number, y: number }) => void;
  updateWidgetSize: (widgetId: string, size: { width: number, height: number }) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  saveLayout: () => void;
  atualizarCotacoes: () => Promise<void>;
  isLoadingCotacoes: boolean;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Hook para usar o contexto
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard deve ser usado dentro de um DashboardProvider");
  }
  return context;
};

// Provedor do contexto
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [layout, setLayout] = useState<DashboardLayout>(initialLayout);
  const [activeTab, setActiveTab] = useState("resumo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingCotacoes, setIsLoadingCotacoes] = useState(false);

  // Efeito para carregar o layout salvo do localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      try {
        setLayout(JSON.parse(savedLayout));
      } catch (error) {
        console.error('Erro ao carregar layout salvo:', error);
      }
    }
    
    // Carregar cotações iniciais
    if (dashboardData.portfolio.length > 0) {
      atualizarCotacoes();
    }
  }, []);

  // Função para atualizar cotações
  const atualizarCotacoes = useCallback(async () => {
    if (dashboardData.portfolio.length === 0) return;
    
    setIsLoadingCotacoes(true);
    try {
      const ativos = dashboardData.portfolio.map(item => item.ativo);
      const cotacoes = await buscarCotacoes(ativos);
      
      setDashboardData(prev => {
        // Atualizar portfolio com cotações
        const portfolioAtualizado = prev.portfolio.map(item => {
          const cotacaoItem = cotacoes.find(c => c.ativo === item.ativo);
          if (cotacaoItem) {
            const rentabilidade = ((cotacaoItem.preco / item.precoMedio) - 1) * 100;
            return {
              ...item,
              cotacaoAtual: cotacaoItem.preco,
              variacao: cotacaoItem.variacao,
              rentabilidade,
              ultimaAtualizacao: new Date().toISOString()
            };
          }
          return item;
        });
        
        return {
          ...prev,
          portfolio: portfolioAtualizado,
          cotacoes,
          ultimaAtualizacaoCotacoes: new Date().toISOString()
        };
      });
      
      toast({
        title: "Cotações atualizadas",
        description: "As cotações da carteira foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar cotações:", error);
      toast({
        title: "Erro ao atualizar cotações",
        description: "Não foi possível buscar as cotações atualizadas.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCotacoes(false);
    }
  }, [dashboardData.portfolio]);

  // Função para processar um arquivo PDF
  const processPdfFile = async (file: File) => {
    setIsProcessing(true);
    try {
      toast({
        title: "Processando nota de corretagem",
        description: "Lendo e processando os dados do PDF...",
      });
      
      // Processar o PDF
      const notaCorretagem = await parsePdfCorretagem(file);
      
      // Atualizar dashboard data
      setDashboardData(prev => {
        // Adicionar nova nota
        const notasAtualizadas = [...prev.notasCorretagem, notaCorretagem];
        
        // Extrair todas as operações
        const todasOperacoes = notasAtualizadas.flatMap(nota => nota.operacoes);
        
        // Identificar operações de day trade (mesma data, mesmo ativo, compra e venda)
        todasOperacoes.forEach(op => {
          // Verificar se o ativo existe na B3
          if (!ativoExisteNaB3(op.ativo)) {
            console.warn(`Ativo não reconhecido na B3: ${op.ativo}`);
            // Corrigir o nome do ativo se possível
            // Esta lógica poderia ser mais sofisticada em um sistema real
          }
        });
        
        // Calcular impostos com a lógica aprimorada
        const impostos = calcularImpostos(todasOperacoes);
        
        // Extrair ativos
        const ativos = extrairAtivos(todasOperacoes);
        
        // Calcular portfólio com lógica de Day Trade aprimorada
        const portfolio = ativos.map(ativo => {
          const operacoesAtivo = todasOperacoes.filter(op => op.ativo === ativo);
          
          // Agrupar operações por data para identificar day trades
          const operacoesPorData: Record<string, Operation[]> = {};
          operacoesAtivo.forEach(op => {
            if (!operacoesPorData[op.data]) {
              operacoesPorData[op.data] = [];
            }
            operacoesPorData[op.data].push(op);
          });
          
          let quantidade = 0;
          let valorTotal = 0;
          
          // Processar operações considerando day trade e swing trade
          Object.values(operacoesPorData).forEach(opsData => {
            const compras = opsData.filter(op => op.tipo === 'compra');
            const vendas = opsData.filter(op => op.tipo === 'venda');
            
            const qtdComprada = compras.reduce((sum, op) => sum + op.quantidade, 0);
            const qtdVendida = vendas.reduce((sum, op) => sum + op.quantidade, 0);
            
            const valorCompras = compras.reduce((sum, op) => sum + op.valor, 0);
            const valorVendas = vendas.reduce((sum, op) => sum + op.valor, 0);
            
            // Se teve compra e venda no mesmo dia (potencial day trade)
            if (compras.length > 0 && vendas.length > 0) {
              const dayTradeQtd = Math.min(qtdComprada, qtdVendida);
              
              // Calcular preço médio das compras e vendas do dia
              const precoMedioCompra = valorCompras / qtdComprada;
              const precoMedioVenda = valorVendas / qtdVendida;
              
              // Ajustar quantidade e valor total removendo a parte de day trade
              if (qtdComprada > qtdVendida) {
                // Sobrou posição comprada
                quantidade += qtdComprada - qtdVendida;
                valorTotal += precoMedioCompra * (qtdComprada - qtdVendida);
              } else if (qtdVendida > qtdComprada) {
                // Sobrou posição vendida
                quantidade -= qtdVendida - qtdComprada;
                valorTotal -= precoMedioVenda * (qtdVendida - qtdComprada);
              }
              // Se qtdComprada === qtdVendida, foi 100% day trade, não impacta o portfólio
            } else {
              // Operação normal (só compra ou só venda no dia)
              if (compras.length > 0) {
                quantidade += qtdComprada;
                valorTotal += valorCompras;
              }
              if (vendas.length > 0) {
                quantidade -= qtdVendida;
                valorTotal -= valorVendas;
              }
            }
          });
          
          const precoMedio = quantidade > 0 ? valorTotal / quantidade : 0;
          
          return {
            ativo,
            quantidade,
            precoMedio,
            valorTotal: quantidade * precoMedio
          };
        }).filter(item => item.quantidade > 0);
        
        return {
          notasCorretagem: notasAtualizadas,
          ativos,
          impostos,
          dividendos: prev.dividendos, // Manter dividendos existentes
          portfolio,
          cotacoes: prev.cotacoes
        };
      });
      
      // Depois de processar a nota, atualizar cotações
      setTimeout(() => {
        atualizarCotacoes();
      }, 500);
      
      toast({
        title: "Nota de corretagem processada",
        description: `Nota ${notaCorretagem.numero} processada com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro ao processar PDF",
        description: "Não foi possível ler os dados do arquivo. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao processar PDF:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Funções para gerenciar os widgets
  const toggleEditMode = () => setIsEditMode(!isEditMode);

  const addWidget = (widgetType: string) => {
    const newWidget: WidgetConfig = {
      id: uuidv4(),
      title: `Novo ${widgetType}`,
      type: widgetType as any,
      icon: <Plus className="h-4 w-4" />,
      visible: true
    };

    setLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
  };

  const removeWidget = (widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId)
    }));
  };

  const updateWidgetPosition = (widgetId: string, position: { x: number, y: number }) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, position } : widget
      )
    }));
  };

  const updateWidgetSize = (widgetId: string, size: { width: number, height: number }) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, size } : widget
      )
    }));
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget => 
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      )
    }));
  };

  const saveLayout = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(layout));
    toast({
      title: "Layout salvo",
      description: "Suas configurações de dashboard foram salvas com sucesso!",
    });
  };

  // Valor do contexto
  const value = {
    dashboardData,
    widgets: layout.widgets,
    layout,
    activeTab,
    isEditMode,
    setActiveTab,
    processPdfFile,
    isProcessing,
    toggleEditMode,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetSize,
    toggleWidgetVisibility,
    saveLayout,
    atualizarCotacoes,
    isLoadingCotacoes
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
