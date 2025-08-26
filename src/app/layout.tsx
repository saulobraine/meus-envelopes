import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

import { Work_Sans } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NavigationProgress from "@/components/navigation-progress";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MeusEnvelopes",
  description: "Aplicativo de finanças pessoais com orçamento por envelopes.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${workSans.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <NavigationProgress />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
