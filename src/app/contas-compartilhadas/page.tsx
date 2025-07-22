import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { inviteUserToSharedAccount, removeUserFromSharedAccount } from '@/app/_actions/shared-account'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function SharedAccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <p>Por favor, faça login para ver contas compartilhadas.</p>
  }

  const ownedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { ownerId: user.id },
    include: { member: true },
  })

  const memberAccounts = await prisma.sharedAccountAccess.findMany({
    where: { memberId: user.id },
    include: { owner: true },
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contas Compartilhadas</h1>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-2">Convidar Usuário</h2>
        <form action={inviteUserToSharedAccount} className="flex space-x-2">
          <Input type="email" name="email" placeholder="E-mail do usuário para convidar" required className="flex-grow" />
          <Button type="submit">Convidar</Button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-2">Suas Contas</h2>
        <ul>
          {ownedAccounts.map(account => (
            <li key={account.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <span>{account.member.name || account.member.email}</span>
              <form action={async () => {
                await removeUserFromSharedAccount(account.id)
                revalidatePath('/shared-accounts')
              }}>
                <Button type="submit" variant="destructive" size="sm">Remover</Button>
              </form>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Contas que Você Participa</h2>
        <ul>
          {memberAccounts.map(account => (
            <li key={account.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <span>{account.owner.name || account.owner.email}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
