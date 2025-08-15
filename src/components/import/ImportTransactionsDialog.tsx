"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  FileXls,
  Check,
  X,
  ArrowRight,
  Eye,
} from "phosphor-react";
import { formatCurrency } from "@/lib/currency";
import { parseBrazilianDate } from "@/lib/utils";

interface ImportTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportStarted: (jobId: string) => void;
}

interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
  envelope: string;
}

interface PreviewRow {
  date: string;
  description: string;
  amount: number;
  envelope?: string;
  isValid: boolean;
  errors: string[];
}

export function ImportTransactionsDialog({
  open,
  onOpenChange,
  onImportStarted,
}: ImportTransactionsDialogProps) {
  const [step, setStep] = useState<
    "upload" | "mapping" | "preview" | "confirm"
  >("upload");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: "",
    description: "",
    amount: "",
    envelope: "",
  });
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // Função para fazer parse correto de CSV com aspas (mesma da API)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    // Adicionar o último campo
    result.push(current.trim());

    // Remover aspas externas de cada campo
    const cleanedResult = result.map((field) => {
      if (field.startsWith('"') && field.endsWith('"')) {
        return field.slice(1, -1);
      }
      return field;
    });

    console.log(`[parseCSVLine] Linha original: "${line}"`);
    console.log(`[parseCSVLine] Campos extraídos:`, cleanedResult);

    return cleanedResult;
  };

  const processFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split("\n").map((line) => parseCSVLine(line));
      setFilePreview(lines); // Todas as linhas para preview

      // Auto-detect column mapping
      if (lines.length > 0 && lines[0].length > 0) {
        const headers = lines[0].filter(
          (header) => header && header.trim() !== ""
        );

        if (headers.length === 0) {
          throw new Error("Arquivo não contém cabeçalhos válidos");
        }

        const autoMapping: ColumnMapping = {
          date: "",
          description: "",
          amount: "",
          envelope: "",
        };

        console.log(`[AutoMapping] Headers disponíveis:`, headers);

        headers.forEach((header, index) => {
          const lowerHeader = header.toLowerCase();
          console.log(
            `[AutoMapping] Analisando header "${header}" (${lowerHeader})`
          );

          if (lowerHeader.includes("data") || lowerHeader.includes("date")) {
            autoMapping.date = header;
            console.log(`[AutoMapping] ✅ Data mapeada: "${header}"`);
          } else if (
            lowerHeader.includes("desc") ||
            lowerHeader.includes("descrição")
          ) {
            autoMapping.description = header;
            console.log(`[AutoMapping] ✅ Descrição mapeada: "${header}"`);
          } else if (
            lowerHeader.includes("valor") ||
            lowerHeader.includes("amount")
          ) {
            autoMapping.amount = header;
            console.log(`[AutoMapping] ✅ Valor mapeado: "${header}"`);
          } else if (
            lowerHeader.includes("categoria") ||
            lowerHeader.includes("category") ||
            lowerHeader.includes("envelope") ||
            lowerHeader.includes("categ")
          ) {
            autoMapping.envelope = header;
            console.log(`[AutoMapping] ✅ Envelope mapeado: "${header}"`);
          }
        });

        console.log(`[AutoMapping] Mapeamento final:`, autoMapping);

        setColumnMapping(autoMapping);
      } else {
        throw new Error("Arquivo vazio ou sem cabeçalhos");
      }

      setStep("mapping");
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      // Resetar estado em caso de erro
      setFile(null);
      setFilePreview([]);
      setStep("upload");
      // Aqui você pode mostrar um toast de erro
    }
  };

  const generatePreview = () => {
    if (
      !filePreview.length ||
      !columnMapping.date ||
      !columnMapping.description ||
      !columnMapping.amount ||
      !columnMapping.envelope
    ) {
      return;
    }

    // Verificar se os headers mapeados existem no arquivo
    const headers = filePreview[0];
    const dateIndex = headers.indexOf(columnMapping.date);
    const descIndex = headers.indexOf(columnMapping.description);
    const amountIndex = headers.indexOf(columnMapping.amount);

    if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
      console.error("Headers mapeados não encontrados no arquivo:", {
        date: columnMapping.date,
        description: columnMapping.description,
        amount: columnMapping.amount,
        availableHeaders: headers,
      });
      return;
    }

    const preview: PreviewRow[] = filePreview.slice(1).map((row, index) => {
      const date = row[dateIndex] || "";
      const description = row[descIndex] || "";
      const amountStr = row[amountIndex] || "0";

      console.log(
        `[Frontend] Linha ${index + 1}: data="${date}", descrição="${description}", valor="${amountStr}"`
      );

      // Parser robusto de valor monetário brasileiro
      let cleanAmountStr = amountStr.trim();

      // Verificar se é negativo
      const isNegative = cleanAmountStr.startsWith("-");
      if (isNegative) {
        cleanAmountStr = cleanAmountStr.substring(1);
      }

      // Remover símbolos de moeda e espaços
      cleanAmountStr = cleanAmountStr
        .replace(/R\$/g, "") // Remove R$
        .replace(/R/g, "") // Remove R (sem $)
        .replace(/\s/g, ""); // Remove espaços

      // Tratar separadores de milhares e decimais
      if (cleanAmountStr.includes(",") && cleanAmountStr.includes(".")) {
        // Formato: 1.200,50 (ponto como milhares, vírgula como decimal)
        cleanAmountStr = cleanAmountStr
          .replace(/\./g, "") // Remove pontos (separador de milhares)
          .replace(/,/g, "."); // Substitui vírgula por ponto (separador decimal)
      } else if (
        cleanAmountStr.includes(",") &&
        !cleanAmountStr.includes(".")
      ) {
        // Formato: 1200,50 (apenas vírgula como decimal)
        cleanAmountStr = cleanAmountStr.replace(/,/g, ".");
      } else if (
        cleanAmountStr.includes(".") &&
        !cleanAmountStr.includes(",")
      ) {
        // Formato: 1200.50 (apenas ponto como decimal)
        // Manter como está
      }

      console.log(
        `[Frontend] Valor limpo: "${amountStr}" -> "${cleanAmountStr}"`
      );

      const amount = parseFloat(cleanAmountStr);
      // Converter para centavos para compatibilidade com formatCurrency
      const finalAmount = isNegative ? -(amount * 100) : amount * 100;

      console.log(
        `[Frontend] Valor final: ${finalAmount} (negativo: ${isNegative})`
      );

      // Validar data usando a função brasileira
      let dateValid = false;
      let dateError = "";
      if (date) {
        try {
          const parsedDate = parseBrazilianDate(date);
          console.log(
            `[Frontend] Data parseada com sucesso: "${date}" -> ${parsedDate.toISOString()}`
          );
          dateValid = true;
        } catch (error) {
          dateError = error instanceof Error ? error.message : "Data inválida";
          console.error(`[Frontend] Erro ao parsear data "${date}":`, error);
        }
      }

      const isValid = Boolean(dateValid && description && !isNaN(finalAmount));
      const errors: string[] = [];

      console.log(
        `[Frontend] Validação: dataValid=${dateValid}, description="${description}", finalAmount=${finalAmount}, isValid=${isValid}`
      );

      if (!date) {
        errors.push("Data não encontrada");
        console.log(`[Frontend] Erro: Data não encontrada`);
      } else if (!dateValid) {
        errors.push(dateError);
        console.log(`[Frontend] Erro: Data inválida - ${dateError}`);
      }
      if (!description) {
        errors.push("Descrição não encontrada");
        console.log(`[Frontend] Erro: Descrição não encontrada`);
      }
      if (isNaN(finalAmount)) {
        errors.push("Valor inválido");
        console.log(`[Frontend] Erro: Valor inválido`);
      }

      console.log(`[Frontend] Linha ${index + 1} - Erros:`, errors);

      return {
        date,
        description,
        amount: finalAmount,
        envelope: columnMapping.envelope
          ? row[headers.indexOf(columnMapping.envelope)] || undefined
          : undefined,

        isValid,
        errors,
      };
    });

    setPreviewRows(preview);
    setStep("preview");
  };

  const startImport = async () => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Passo 1: Inicializar o job
      const initResponse = await fetch("/api/imports/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file?.name,
          mimeType: file?.type,
          size: file?.size,
        }),
      });

      if (!initResponse.ok) {
        throw new Error("Erro ao inicializar importação");
      }

      const { jobId } = await initResponse.json();

      // Passo 2: Confirmar e processar
      // Limpar mapeamento - envelope é obrigatório
      const cleanColumnMapping = {
        date: columnMapping.date,
        description: columnMapping.description,
        amount: columnMapping.amount,
        envelope: columnMapping.envelope,
      };

      const confirmResponse = await fetch(`/api/imports/${jobId}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          columnMapping: cleanColumnMapping,
          fileContent: await file?.text(),
        }),
      });

      if (!confirmResponse.ok) {
        throw new Error("Erro ao processar importação");
      }

      const { status, totalRows } = await confirmResponse.json();

      // Simular progresso baseado no status
      if (status === "RUNNING") {
        const progressInterval = setInterval(async () => {
          try {
            const jobResponse = await fetch(`/api/imports/${jobId}`);
            if (jobResponse.ok) {
              const jobData = await jobResponse.json();
              const progress =
                (jobData.processedRows / jobData.totalRows) * 100;
              setUploadProgress(progress);

              if (
                jobData.status === "COMPLETED" ||
                jobData.status === "FAILED"
              ) {
                clearInterval(progressInterval);
                setIsProcessing(false);
                setUploadProgress(100);
                onImportStarted(jobId);
              }
            }
          } catch (error) {
            console.error("Erro ao buscar progresso:", error);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Erro na importação:", error);
      setIsProcessing(false);
      setUploadProgress(0);
      // Aqui você pode mostrar um toast de erro
    }
  };

  const resetDialog = () => {
    setStep("upload");
    setFile(null);
    setFilePreview([]);
    setPreviewRows([]);
    setUploadProgress(0);
    setIsProcessing(false);
    setColumnMapping({
      date: "",
      description: "",
      amount: "",
      envelope: "",
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Transações</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV ou Excel para importar suas transações
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">
                {isDragActive
                  ? "Solte o arquivo aqui"
                  : "Arraste e solte um arquivo aqui"}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou clique para selecionar um arquivo
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  CSV
                </div>
                <div className="flex items-center gap-1">
                  <FileXls className="w-4 h-4" />
                  Excel
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Máximo 50MB</p>
            </div>

            {file && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Arquivo Selecionado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === "mapping" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Mapeamento de Colunas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date-column">Coluna de Data *</Label>
                    <Select
                      value={columnMapping.date}
                      onValueChange={(value) =>
                        setColumnMapping((prev) => ({ ...prev, date: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a coluna" />
                      </SelectTrigger>
                      <SelectContent>
                        {filePreview[0]
                          ?.filter((header) => header && header.trim() !== "")
                          .map((header, index) => (
                            <SelectItem key={index} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description-column">
                      Coluna de Descrição *
                    </Label>
                    <Select
                      value={columnMapping.description}
                      onValueChange={(value) =>
                        setColumnMapping((prev) => ({
                          ...prev,
                          description: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a coluna" />
                      </SelectTrigger>
                      <SelectContent>
                        {filePreview[0]
                          ?.filter((header) => header && header.trim() !== "")
                          .map((header, index) => (
                            <SelectItem key={index} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount-column">Coluna de Valor *</Label>
                    <Select
                      value={columnMapping.amount}
                      onValueChange={(value) =>
                        setColumnMapping((prev) => ({ ...prev, amount: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a coluna" />
                      </SelectTrigger>
                      <SelectContent>
                        {filePreview[0]
                          ?.filter((header) => header && header.trim() !== "")
                          .map((header, index) => (
                            <SelectItem key={index} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="envelope-column">
                      Coluna de Envelope *
                    </Label>
                    <Select
                      value={columnMapping.envelope}
                      onValueChange={(value) =>
                        setColumnMapping((prev) => ({
                          ...prev,
                          envelope: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a coluna para envelope" />
                      </SelectTrigger>
                      <SelectContent>
                        {filePreview[0]
                          ?.filter((header) => header && header.trim() !== "")
                          .map((header, index) => (
                            <SelectItem key={index} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={generatePreview}
                    disabled={
                      !columnMapping.date ||
                      !columnMapping.description ||
                      !columnMapping.amount ||
                      !columnMapping.envelope
                    }
                    className="w-full"
                  >
                    Gerar Pré-visualização
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Pré-visualização do Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {filePreview[0]
                          ?.filter((header) => header && header.trim() !== "")
                          .map((header, index) => (
                            <TableHead key={index}>{header}</TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filePreview.slice(1).map((row, rowIndex) => {
                        const validHeaders =
                          filePreview[0]?.filter(
                            (header) => header && header.trim() !== ""
                          ) || [];

                        return (
                          <TableRow key={rowIndex}>
                            {validHeaders.map((header, headerIndex) => {
                              const originalIndex =
                                filePreview[0]?.indexOf(header) || 0;
                              const cell = row[originalIndex] || "";
                              return (
                                <TableCell key={headerIndex}>
                                  {cell || "-"}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Pré-visualização das Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10 border-b border-gray-200 dark:border-gray-700">
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Envelope</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.length > 0 ? (
                        previewRows.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {row.isValid ? (
                                <Badge variant="default">
                                  <Check className="w-3 h-3 mr-1" />
                                  Válida
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <X className="w-3 h-3 mr-1" />
                                  Inválida
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{row.date || "-"}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {row.description || "-"}
                            </TableCell>
                            <TableCell>
                              {!isNaN(row.amount)
                                ? formatCurrency(row.amount)
                                : "-"}
                            </TableCell>
                            <TableCell>{row.envelope || "-"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-gray-500 dark:text-gray-400 py-8"
                          >
                            Nenhuma transação para pré-visualizar
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Resumo da Validação:
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Total:</span>{" "}
                      {previewRows?.length || 0}
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                      <span className="font-medium">Válidas:</span>{" "}
                      {previewRows?.filter((r) => r && r.isValid)?.length || 0}
                    </div>
                    <div className="text-red-600 dark:text-red-400">
                      <span className="font-medium">Com Erro:</span>{" "}
                      {previewRows?.filter((r) => r && !r.isValid)?.length || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">
                Processando Importação
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Aguarde enquanto processamos seu arquivo...
              </p>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {uploadProgress}% concluído
            </p>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && file && (
            <Button onClick={() => setStep("mapping")}>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {step === "mapping" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Voltar
              </Button>
              <Button
                onClick={generatePreview}
                disabled={
                  !columnMapping.date ||
                  !columnMapping.description ||
                  !columnMapping.amount ||
                  !columnMapping.envelope
                }
              >
                Gerar Pré-visualização
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === "preview" && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Voltar
              </Button>
              <Button onClick={startImport} disabled={isProcessing}>
                {isProcessing ? "Processando..." : "Iniciar Importação"}
              </Button>
            </div>
          )}

          {!isProcessing && step !== "preview" && (
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
