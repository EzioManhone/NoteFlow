
import React from "react";
import { motion } from "framer-motion";
import { Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  onLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogin }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-4 border-b mb-6 dark:border-gray-800"
    >
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <motion.div
            whileHover={{ rotate: 5 }}
            className="relative"
          >
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M50 10 L90 90 L10 90 Z" fill="url(#gradient)" fillOpacity="0.9" />
              </g>
              <defs>
                <linearGradient id="gradient" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3DEB91" />
                  <stop offset="1" stopColor="#3DEB9155" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight dark:text-white">NOTEFLOW</h1>
            <p className="text-xs text-muted-foreground">Beta • Válido por 1 mês</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button 
            onClick={onLogin} 
            variant="outline" 
            className="flex items-center gap-2 bg-white hover:bg-blue-50 text-blue-600 border-blue-200 dark:bg-gray-800 dark:border-gray-700 dark:text-blue-400 dark:hover:bg-gray-700"
          >
            <Facebook size={18} />
            <span>Entrar com Facebook</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
