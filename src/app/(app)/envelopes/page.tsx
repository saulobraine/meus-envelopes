"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function EnvelopesPage() {
  const [newEnvelope, setNewEnvelope] = useState("");
  const [newValueType, setNewValueType] = useState<"percentage" | "fixed">("percentage");
  const [newValue, setNewValue] = useState("");
  const [envelopes, setEnvelopes] = useState([
    { id: 1, name: "Alimentação", valueType: "percentage" as const, value: 30 },
    { id: 2, name: "Transporte", valueType: "percentage" as const, value: 15 },
    { id: 3, name: "Lazer", valueType: "fixed" as const, value: 500 },
    { id: 4, name: "Salário", valueType: "fixed" as const, value: 5000 },
  ]);
  const { toast } = useToast();

  const handleAddEnvelope = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEnvelope.trim() && newValue.trim()) {
      setEnvelopes([
        ...envelopes,
        { 
          id: envelopes.length + 1, 
          name: newEnvelope,
          valueType: newValueType,
          value: parseFloat(newValue)
        },
      ]);
      setNewEnvelope("");
      setNewValue("");
      toast({
        title: "Envelope adicionado",
        description: "O envelope foi criado com sucesso.",
      });
    }
  };

  const handleDeleteEnvelope = (id: number) => {
    setEnvelopes(envelopes.filter((env) => env.id !== id));
    toast({
      title: "Envelope removido",
      description: "O envelope foi removido com sucesso.",
    });
  };

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Envelopes</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os envelopes das suas transações com valores ou percentuais
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Adicionar Envelope</CardTitle>
            <CardDescription>
              Crie um novo envelope com valor fixo ou percentual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEnvelope} className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Nome do envelope"
                  value={newEnvelope}
                  onChange={(e) => setNewEnvelope(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="valueType">Tipo de Valor</Label>
                  <Select value={newValueType} onValueChange={(value) => setNewValueType(value as "percentage" | "fixed")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    placeholder={newValueType === "percentage" ? "30%" : "R$ 500"}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Envelope
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seus Envelopes</CardTitle>
            <CardDescription>
              Todos os envelopes disponíveis para categorizar suas transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {envelopes.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum envelope criado ainda.
                </p>
              ) : (
                envelopes.map((envelope) => (
                  <div
                    key={envelope.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium">{envelope.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {envelope.valueType === "percentage"
                          ? `${envelope.value}%`
                          : `R$ ${envelope.value.toFixed(2)}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEnvelope(envelope.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}