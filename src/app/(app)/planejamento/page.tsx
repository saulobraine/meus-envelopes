import { getAuthenticatedUser } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createEnvelope,
  deleteEnvelope,
  getEnvelopes,
} from "@/app/_actions/envelope";

export default async function PlanningPage() {
  const { user } = await getAuthenticatedUser();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [envelopes] = await Promise.all([getEnvelopes()]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Planejamento</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Envelopes</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createEnvelope} className="space-y-4 mb-4">
              <div>
                <Label htmlFor="name">Nome do Envelope</Label>
                <Input type="text" name="name" id="name" required />
              </div>
              <div>
                <Label htmlFor="value">Valor</Label>
                <CurrencyInput name="value" id="value" required />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONETARY">Monetário</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Adicionar Envelope</Button>
            </form>
            <ul>
              {envelopes.map((envelope) => (
                <li
                  key={envelope.id}
                  className="flex justify-between items-center py-2 border-b last:border-b-0"
                >
                  <span>
                    {envelope.name} (
                    {envelope.type === "MONETARY"
                      ? formatCurrency(envelope.value)
                      : `${envelope.value}%`}
                    )
                  </span>
                  {(!envelope.isGlobal) && (
                    <form
                      action={async () => {
                        "use server";
                        await deleteEnvelope(envelope.id);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        disabled={!envelope.isDeletable}
                      >
                        Excluir
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
