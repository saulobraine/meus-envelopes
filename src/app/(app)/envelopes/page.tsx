"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash } from "phosphor-react";
import { useToast } from "@/hooks/use-toast";
import { Envelope } from "@prisma/client";
import { get, remove } from "@/app/_actions/envelope";
import { useEffect, useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EnvelopeForm } from "@/components/envelopes/EnvelopeForm";

export default function EnvelopesPage() {
  const { toast } = useToast();
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);

  const fetchEnvelopes = useCallback(async () => {
    const fetchedEnvelopes = await get();
    setEnvelopes(fetchedEnvelopes);
  }, []);

  useEffect(() => {
    fetchEnvelopes();
  }, [fetchEnvelopes]);

  const handleDeleteEnvelope = async (id: string) => {
    await remove(id);
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
          <EnvelopeForm onSuccess={fetchEnvelopes} />
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
                      {envelope.type === "PERCENTAGE"
                        ? `${envelope.value}%`
                        : `R$ ${envelope.value.toFixed(2)}`}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!envelope.isDeletable}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Você tem certeza absoluta?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita. Isso vai remover
                          permanentemente o envelope.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteEnvelope(envelope.id)}
                        >
                          Continuar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
