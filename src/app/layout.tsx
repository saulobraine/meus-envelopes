import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeusEnvelopes",
  description: "Personal finance app with envelope budgeting.",
};

async function getUser() {
  'use server';
  const supabase = await createClient();
  return await (await supabase).auth.getUser();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: { user } } = await getUser();

  const signOut = async () => {
    'use server';
    const supabase = await createClient();
    await (await supabase).auth.signOut();
    return redirect('/login');
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        <header className="bg-white shadow-sm py-4">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">Meus Envelopes</Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">Painel</Link>
                  <Link href="/planning" className="text-gray-600 hover:text-gray-900">Planejamento</Link>
                  <Link href="/shared-accounts" className="text-gray-600 hover:text-gray-900">Contas Compartilhadas</Link>
                  <form action={signOut}>
                    <button type="submit" className="text-red-600 hover:text-red-900">Sair</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="text-gray-600 hover:text-gray-900">Entrar</Link>
              )}
            </div>
          </nav>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
