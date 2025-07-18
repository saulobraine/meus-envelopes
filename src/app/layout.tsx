import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainNav from "@/components/main-nav";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";


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
          <MainNav user={user} signOut={signOut} />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
