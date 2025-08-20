import { Suspense } from "react";
import { updateUserProfile } from "@/app/_actions/user/updateUserProfile";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SettingsSkeleton } from "@/components/ui/skeletons";

export default function SettingsPageWrapper() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPageContent />
    </Suspense>
  );
}

async function SettingsPageContent() {
  const { user } = await getAuthenticatedUser();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Atualize suas informações de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateUserProfile} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.user_metadata.name ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email ?? ""}
                disabled
              />
            </div>
            <Button type="submit">Salvar Alterações</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
