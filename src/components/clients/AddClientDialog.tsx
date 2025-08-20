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
import { Client } from "./ClientsManager";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (client: Omit<Client, "id" | "createdAt">) => void;
}

export function AddClientDialog({
  open,
  onOpenChange,
  onAdd,
}: AddClientDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    type: "pessoa_fisica" as "pessoa_fisica" | "pessoa_juridica",
    document: "",
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.document) {
      return;
    }

    onAdd({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || undefined,
      address: formData.address,
      type: formData.type,
      document: formData.document,
      isActive: formData.isActive,
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      type: "pessoa_fisica",
      document: "",
      isActive: true,
    });

    onOpenChange(false);
  };

  const formatDocument = (
    value: string,
    type: "pessoa_fisica" | "pessoa_juridica"
  ) => {
    const numbers = value.replace(/\D/g, "");

    if (type === "pessoa_fisica") {
      // CPF: 123.456.789-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      // CNPJ: 12.345.678/0001-90
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
  };

  const handleDocumentChange = (value: string) => {
    const formatted = formatDocument(value, formData.type);
    setFormData((prev) => ({ ...prev, document: formatted }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "pessoa_fisica" | "pessoa_juridica") => {
                  setFormData((prev) => ({
                    ...prev,
                    type: value,
                    document: "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                  <SelectItem value="pessoa_juridica">
                    Pessoa Jurídica
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="document">
                {formData.type === "pessoa_fisica" ? "CPF" : "CNPJ"}
              </Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => handleDocumentChange(e.target.value)}
                placeholder={
                  formData.type === "pessoa_fisica"
                    ? "123.456.789-00"
                    : "12.345.678/0001-90"
                }
                maxLength={formData.type === "pessoa_fisica" ? 14 : 18}
                required
              />
            </div>

            {formData.type === "pessoa_juridica" && (
              <div className="grid gap-2">
                <Label htmlFor="company">Nome da Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  placeholder="Razão social"
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Endereço completo"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked: boolean) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive">Cliente ativo</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Adicionar Cliente</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
