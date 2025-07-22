import { updateUser } from '@/app/_actions/user'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

async function getUser() {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    return <p>Por favor, faça login para ver suas configurações.</p>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Atualize suas informações de perfil.</CardDescription>
        </CardHeader>
        <CardContent>
                    <form action={updateUser} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
                            <Input id="name" name="name" defaultValue={user.user_metadata.name ?? ''} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email ?? ''} disabled />
            </div>
            <Button type="submit">Salvar Alterações</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}