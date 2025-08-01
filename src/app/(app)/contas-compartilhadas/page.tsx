import { getAuthenticatedUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  inviteUserToSharedAccount,
  removeUserFromSharedAccount,
} from "@/app/_actions/sharedAccount";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SharedAccountsPage() {
  const { user } = await getAuthenticatedUser();

  const ownedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { ownerId: user.id },
    include: { member: true },
  });

  const memberAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    include: { owner: true },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contas Compartilhadas</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Convidar Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={inviteUserToSharedAccount} className="flex space-x-2">
            <Input
              type="email"
              name="email"
              placeholder="E-mail do usuário para convidar"
              required
              className="grow"
            />
            <Button type="submit">Convidar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Suas Contas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {ownedAccounts.map((account) => (
              <li
                key={account.id}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <span>{account.member.name || account.member.email}</span>
                <form
                  action={async () => {
                    await removeUserFromSharedAccount(account.id);
                    revalidatePath("/shared-accounts");
                  }}
                >
                  <Button type="submit" variant="destructive" size="sm">
                    Remover
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contas que Você Participa</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {memberAccounts.map((account) => (
              <li
                key={account.id}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <span>{account.owner.name || account.owner.email}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
