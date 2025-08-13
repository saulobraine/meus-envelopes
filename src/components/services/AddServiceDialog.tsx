"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Service } from "./ServicesManager";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (service: Omit<Service, "id" | "createdAt">) => void;
}

export function AddServiceDialog({
  open,
  onOpenChange,
  onAdd,
}: AddServiceDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    envelope: "",
    isActive: true,
  });

  const envelopes = [
    "Consultoria",
    "Tecnologia",
    "Marketing",
    "Design",
    "Educação",
    "Saúde",
    "Outros",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.envelope) {
      return;
    }

    onAdd({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price.replace(/\D/g, "")) / 100,
      envelope: formData.envelope,
      isActive: formData.isActive,
    });

    setFormData({
      name: "",
      description: "",
      price: "",
      envelope: "",
      isActive: true,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Serviço</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Serviço</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ex: Consultoria Financeira"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Descreva o serviço oferecido"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <CurrencyInput
                id="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0,00"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="envelope">Envelope</Label>
              <Select
                value={formData.envelope}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, envelope: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {envelopes.map((envelope) => (
                    <SelectItem key={envelope} value={envelope}>
                      {envelope}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked: boolean) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive">Serviço ativo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Adicionar Serviço</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
