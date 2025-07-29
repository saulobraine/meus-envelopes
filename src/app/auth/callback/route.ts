import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/app/_actions/email/sendWelcomeEmail'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (user) {
      const userName = user.user_metadata?.full_name || user.email;
      await sendWelcomeEmail({ to: user.email!, userName });
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
