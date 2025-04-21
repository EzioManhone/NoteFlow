
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Check, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { useDashboard } from "@/contexts/DashboardContext";
import { PdfExtractionResult } from "@/types/dashboardTypes";

const FileUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<PdfExtractionResult | null>(null);
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
        setExtractionResult(null);
        
        try {
          // Processar o arquivo usando a função do contexto e armazenar o resultado
          const result = await processPdfFile(file);
          setExtractionResult(result);
          
          if (result.success) {
            toast({
              title: "Nota de corretagem processada!",
              description: `${result.totalAtivos} ativos identificados usando ${result.method === 'text' ? 'extração de texto' : 'OCR'}.`,
            });
          } else {
            toast({
              title: "Processamento incompleto",
              description: "Alguns dados podem não ter sido extraídos corretamente.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Erro ao processar PDF:", error);
          toast({
            title: "Erro no processamento",
            description: "Não foi possível extrair os dados do PDF.",
            variant: "destructive",
          });
        }
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

  const renderResultInfo = () => {
    if (!extractionResult) return null;
    
    return (
      <div className="mt-3 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${extractionResult.success ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          <span>Método: {extractionResult.method === 'text' ? 'Extração de Texto' : 'OCR'}</span>
        </div>
        {extractionResult.blocoEncontrado ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-4 w-4" />
            <span>Blocos de negociação identificados</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-4 w-4" />
            <span>Blocos de negociação não encontrados</span>
          </div>
        )}
        <div>Ativos identificados: {extractionResult.totalAtivos}</div>
        {extractionResult.divergencias && (
          <div className="text-amber-600">
            {extractionResult.divergencias.valorTotal && <div>⚠️ Divergência no valor total</div>}
            {extractionResult.divergencias.quantidadePapeis && <div>⚠️ Divergência na quantidade de papéis</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-6 border-dashed border-2 card-hover-effect bg-card">
      <CardContent className="p-4">
        <div
          className={`rounded-lg text-center p-4 transition-colors ${
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
              <p className="text-sm text-muted-foreground mb-2">Lendo e analisando a nota de corretagem</p>
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
              <p className="text-sm text-muted-foreground mb-2">{fileName}</p>
              {renderResultInfo()}
              <Button variant="outline" size="sm" onClick={openFileSelector} className="mt-3">
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
              <p className="text-sm text-muted-foreground mb-2">
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
