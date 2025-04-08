
import React from "react";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Toaster />
      <Header onLogin={() => {}} />
      
      <main className="flex-grow container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2 gradient-text">
            Simplifique sua análise de investimentos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Faça upload de suas notas de corretagem em PDF e tenha acesso a insights valiosos 
            sobre seu portfólio, impostos e dividendos.
          </p>
        </motion.div>

        <FileUpload />
        <Dashboard />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
