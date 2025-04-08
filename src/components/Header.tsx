
import React from "react";
import { motion } from "framer-motion";
import { Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogin }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-4 border-b mb-6"
    >
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="bg-gradient-to-br from-noteflow-primary to-noteflow-secondary p-2 rounded-lg text-white font-bold"
          >
            NF
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">NoteFlow</h1>
            <p className="text-xs text-muted-foreground">Beta • Válido por 1 mês</p>
          </div>
        </div>
        <Button 
          onClick={onLogin} 
          variant="outline" 
          className="flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-600 border-blue-200"
        >
          <Facebook size={18} />
          <span>Entrar com Facebook</span>
        </Button>
      </div>
    </motion.header>
  );
};

export default Header;
