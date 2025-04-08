
import React from "react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-12 py-6 border-t dark:border-gray-800"
    >
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center">
          <p className="text-center text-sm text-muted-foreground mb-2">
            Versão Beta válida por 1 mês com todas as funções liberadas
          </p>
          <p className="text-xs text-muted-foreground">
            NOTEFLOW © {new Date().getFullYear()} - Todos os direitos reservados
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
