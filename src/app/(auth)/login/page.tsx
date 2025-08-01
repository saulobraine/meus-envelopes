"use client"

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error signing in with Google:', error)
      // Handle error, e.g., display a message to the user
    } else if (data.url) {
      router.push(data.url)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acesse sua conta
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full"
          >
            Entrar com Google
          </Button>
        </div>
      </div>
    </div>
  )
}
