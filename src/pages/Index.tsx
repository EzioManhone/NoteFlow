
import React from "react";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { 
  Receipt, 
  PiggyBank,
  History,
  Briefcase,
  LayoutDashboard,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const Index: React.FC = () => {
  const { setActiveTab } = useDashboard();
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster />
      <Header onLogin={() => {}} />
      
      <main className="flex-grow container mx-auto px-4">
        <div className="flex flex-col gap-6 mt-4">
          {/* Compact File Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 border rounded-lg bg-card shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold mb-1">Importar Notas de Corretagem</h3>
                <p className="text-muted-foreground text-sm">
                  Faça upload de suas notas de corretagem em PDF para análise
                </p>
              </div>
              <FileUpload />
            </div>
          </motion.div>
          
          {/* Navigation Menu */}
          <NavigationMenu className="max-w-full w-full justify-start mb-4">
            <NavigationMenuList className="flex gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle(), "bg-primary text-primary-foreground")}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  onClick={() => setActiveTab("ir")}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  IR e DARF
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  onClick={() => setActiveTab("dividendos")}
                >
                  <PiggyBank className="h-4 w-4 mr-2" />
                  Dividendos
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  onClick={() => setActiveTab("historico")}
                >
                  <History className="h-4 w-4 mr-2" />
                  Histórico
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle()}
                  onClick={() => setActiveTab("portfolio")}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Portfólio
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          
          {/* Dashboard Area */}
          <Dashboard />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
