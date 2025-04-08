
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { useDashboard } from "@/contexts/DashboardContext";

const FileUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processPdfFile, isProcessing } = useDashboard();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setFileName(file.name);
        
        // Processar o arquivo usando a função do contexto
        await processPdfFile(file);
        
        toast({
          title: "Nota de corretagem enviada!",
          description: "Processando os dados do seu arquivo PDF...",
        });
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, envie apenas arquivos PDF.",
          variant: "destructive",
        });
      }
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className="mb-6 border-dashed border-2 card-hover-effect bg-card">
      <CardContent className="p-6">
        <div
          className={`rounded-lg text-center p-6 transition-colors ${
            isDragging ? "bg-accent" : "bg-background"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="bg-primary/10 rounded-full p-3 mb-3">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <p className="text-lg font-medium mb-1">Processando arquivo...</p>
              <p className="text-sm text-muted-foreground mb-3">Lendo e analisando a nota de corretagem</p>
            </motion.div>
          ) : fileName ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="bg-green-100 rounded-full p-3 mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-lg font-medium mb-1">Arquivo enviado com sucesso!</p>
              <p className="text-sm text-muted-foreground mb-3">{fileName}</p>
              <Button variant="outline" size="sm" onClick={openFileSelector}>
                Enviar outro arquivo
              </Button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-accent rounded-full p-3 mb-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-lg font-medium mb-1">
                Arraste e solte sua nota de corretagem
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                ou clique para selecionar um arquivo PDF
              </p>
              <Button onClick={openFileSelector}>
                Selecionar PDF
              </Button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            onChange={handleFileInput}
            className="hidden"
            aria-label="Selecionar arquivo PDF"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
