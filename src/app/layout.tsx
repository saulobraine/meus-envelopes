import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

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
  "use server";
  const supabase = await createClient();
  return await (await supabase).auth.getUser();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {
    data: { user },
  } = await getUser();

  const signOut = async () => {
    "use server";
    const supabase = await createClient();
    await (await supabase).auth.signOut();
    return redirect("/login");
  };

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="bg-card text-card-foreground shadow-sm py-4 sticky top-0 z-10">
            <nav className="container mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">
                Meus Envelopes
              </Link>
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Painel
                    </Link>
                    <Link
                      href="/planning"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Planejamento
                    </Link>
                    <Link
                      href="/shared-accounts"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Contas Compartilhadas
                    </Link>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="text-destructive hover:text-destructive/90"
                      >
                        Sair
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Entrar
                  </Link>
                )}
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
