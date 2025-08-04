"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "phosphor-react";
import { Search, Mail, Phone } from "lucide-react";
import { AddClientDialog } from "./AddClientDialog";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  type: "pessoa_fisica" | "pessoa_juridica";
  document: string; // CPF ou CNPJ
  isActive: boolean;
  createdAt: Date;
}

export function ClientsManager() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      name: "João Silva",
      email: "joao@email.com",
      phone: "(11) 99999-9999",
      address: "Rua das Flores, 123, São Paulo - SP",
      type: "pessoa_fisica",
      document: "123.456.789-00",
      isActive: true,
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@empresa.com",
      phone: "(11) 88888-8888",
      company: "Tech Solutions Ltda",
      address: "Av. Paulista, 1000, São Paulo - SP",
      type: "pessoa_juridica",
      document: "12.345.678/0001-90",
      isActive: true,
      createdAt: new Date("2024-02-10"),
    },
    {
      id: "3",
      name: "Carlos Oliveira",
      email: "carlos@gmail.com",
      phone: "(11) 77777-7777",
      address: "Rua da Liberdade, 456, São Paulo - SP",
      type: "pessoa_fisica",
      document: "987.654.321-00",
      isActive: false,
      createdAt: new Date("2024-01-20"),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredClients = useMemo(() => {
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.document.includes(searchTerm)
    );
  }, [clients, searchTerm]);

  const addClient = (clientData: Omit<Client, "id" | "createdAt">) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setClients((prev) => [...prev, newClient]);
  };

  const toggleClientStatus = (id: string) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === id ? { ...client, isActive: !client.isActive } : client
      )
    );
  };

  const activeClients = clients.filter((c) => c.isActive);
  const juridicalClients = clients.filter((c) => c.type === "pessoa_juridica");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeClients.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pessoa Jurídica
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{juridicalClients.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Clients List */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{client.name}</h3>
                    <Badge variant={client.isActive ? "default" : "secondary"}>
                      {client.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">
                      {client.type === "pessoa_fisica"
                        ? "Pessoa Física"
                        : "Pessoa Jurídica"}
                    </Badge>
                  </div>

                  {client.company && (
                    <p className="text-muted-foreground font-medium">
                      {client.company}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong>Doc:</strong> {client.document}
                    </p>
                    <p>
                      <strong>Endereço:</strong> {client.address}
                    </p>
                    <p>
                      <strong>Cadastro:</strong>{" "}
                      {client.createdAt.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleClientStatus(client.id)}
                >
                  {client.isActive ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm
              ? "Nenhum cliente encontrado"
              : "Nenhum cliente cadastrado"}
          </p>
        </div>
      )}

      <AddClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={addClient}
      />
    </div>
  );
}
