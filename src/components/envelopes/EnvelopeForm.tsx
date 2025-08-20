"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { create } from "@/app/_actions/envelope";
import { Plus } from "phosphor-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionType } from "@prisma/client";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do envelope deve ter pelo menos 2 caracteres.",
  }),
  value: z.number().min(0, {
    message: "O valor deve ser um número positivo.",
  }),
  type: z.enum(TransactionType).refine((val) => !!val, {
    message: "Selecione um tipo de valor.",
  }),
});

interface EnvelopeFormProps {
  onSuccess: () => void;
}

export function EnvelopeForm({ onSuccess }: EnvelopeFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      value: 0,
      type: TransactionType.EXPENSE,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("value", String(data.value));
    formData.append("type", data.type);

    try {
      await create(formData);

      toast({
        title: "Envelope adicionado",
        description: "O envelope foi criado com sucesso.",
      });

      form.reset();
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro ao adicionar envelope",
        description:
          error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do envelope</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Supermercado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Tipo de Valor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentual (%)</SelectItem>
                    <SelectItem value="MONETARY">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            "Adicionando..."
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Envelope
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
