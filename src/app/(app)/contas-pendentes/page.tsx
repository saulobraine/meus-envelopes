import { Suspense } from "react";
import { ReceivablesManager } from "@/components/receivables/ReceivablesManager";
import { ServicesManager } from "@/components/services/ServicesManager";
import { ClientsManager } from "@/components/clients/ClientsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContasPendentesSkeleton } from "@/components/ui/skeletons";

export default function ContasPendentesPage() {
  return (
    <Suspense fallback={<ContasPendentesSkeleton />}>
      <ContasPendentesPageContent />
    </Suspense>
  );
}

function ContasPendentesPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Contas a Receber</h1>
        <p className="text-muted-foreground">Gerencie seus valores a receber</p>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todas as Contas</TabsTrigger>
          <TabsTrigger value="services">Serviços/Produtos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <ReceivablesManager />
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <ServicesManager />
        </TabsContent>
        
        <TabsContent value="clients" className="space-y-4">
          <ClientsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}