"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Archive } from "phosphor-react";
import { MagnifyingGlass, CurrencyDollar } from "phosphor-react";
import { AddServiceDialog } from "./AddServiceDialog";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
}

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Consultoria Financeira",
      description: "Análise e planejamento financeiro empresarial",
      price: 2500,
      category: "Consultoria",
      isActive: true,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Desenvolvimento de Software",
      description: "Criação de aplicações web personalizadas",
      price: 5000,
      category: "Tecnologia",
      isActive: true,
      createdAt: new Date("2024-02-10"),
    },
    {
      id: "3",
      name: "Marketing Digital",
      description: "Gestão de campanhas e redes sociais",
      price: 1800,
      category: "Marketing",
      isActive: false,
      createdAt: new Date("2024-01-20"),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredServices = useMemo(() => {
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const addService = (serviceData: Omit<Service, "id" | "createdAt">) => {
    const newService: Service = {
      ...serviceData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setServices((prev) => [...prev, newService]);
  };

  const toggleServiceStatus = (id: string) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id
          ? { ...service, isActive: !service.isActive }
          : service
      )
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const activeServices = services.filter((s) => s.isActive);
  const totalValue = services.reduce((sum, service) => sum + service.price, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Serviços
            </CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Serviços Ativos
            </CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeServices.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Services List */}
      <div className="grid gap-4">
        {filteredServices.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <Badge variant={service.isActive ? "default" : "secondary"}>
                      {service.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                  <p className="text-muted-foreground">{service.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground text-lg">
                      {formatCurrency(service.price)}
                    </span>
                    <span>
                      Criado em {service.createdAt.toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleServiceStatus(service.id)}
                >
                  {service.isActive ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Archive className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm
              ? "Nenhum serviço encontrado"
              : "Nenhum serviço cadastrado"}
          </p>
        </div>
      )}

      <AddServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={addService}
      />
    </div>
  );
}
