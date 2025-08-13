"use client";

import { useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChartBar,
  CreditCard,
  FolderOpen,
  Receipt,
  Repeat,
  GearSix,
  SignOut,
  ArrowsLeftRight,
} from "phosphor-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { FloatingMenu } from "@/components/ui/floating-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendUp, Users, Buildings } from "phosphor-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { icon: ChartBar, label: "Visão Geral", path: "/dashboard" },
  { icon: FolderOpen, label: "Envelopes", path: "/envelopes" },
  { icon: CreditCard, label: "Transações", path: "/transacoes" },
  { icon: Receipt, label: "Contas a Receber", path: "/contas-pendentes" },
  {
    icon: Repeat,
    label: "Pagamentos Recorrentes",
    path: "/pagamentos-recorrentes",
  },
  { icon: GearSix, label: "Configurações", path: "/configuracoes" },
];

const UserDropdown = () => {
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  const sharedAccounts = [
    { id: "1", name: "Empresa ABC Ltda", role: "Administrador", active: false },
    { id: "2", name: "Startup XYZ", role: "Colaborador", active: true },
    { id: "3", name: "Freelancer Pro", role: "Visualizador", active: false },
  ];

  if (showAccountSwitcher) {
    return (
      <div className="relative">
        <Card className="w-80 absolute right-0 top-0 z-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Trocar de Conta</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAccountSwitcher(false)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {sharedAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  account.active
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{account.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.role}
                    </p>
                  </div>
                  {account.active && (
                    <Badge variant="default" className="text-xs">
                      Ativa
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/01.png" alt="@usuario" />
            <AvatarFallback>JS</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">João Silva</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              joao@exemplo.com
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <GearSix className="mr-2 h-4 w-4" />
          <span>Configurações do perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowAccountSwitcher(true)}>
          <ArrowsLeftRight className="mr-2 h-4 w-4" />
          <span>Trocar de conta</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Receipt className="mr-2 h-4 w-4" />
          <span>Integrações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <SignOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SharedAccountSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [hasSharedAccount] = useState(true); // Simula conta compartilhada ativa

  const sharedAccountInfo = {
    name: "Startup XYZ",
    role: "Colaborador",
    members: 8,
    plan: "Pro",
  };

  const sharedMenuItems = [
    { name: "Visão Geral", path: "/shared/overview", icon: TrendUp },
    { name: "Membros", path: "/shared/members", icon: Users },
    { name: "Configurações", path: "/shared/settings", icon: GearSix },
  ];

  if (!hasSharedAccount) return null;

  return (
    <div className="border-t border-border/40 bg-muted/20">
      <div className="p-4">
        {!isCollapsed ? (
          <TooltipProvider>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Buildings className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Conta Compartilhada</span>
              </div>

              <Card className="p-3 bg-background/60">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">
                      {sharedAccountInfo.name}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {sharedAccountInfo.plan}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sharedAccountInfo.role}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {sharedAccountInfo.members} membros
                  </div>
                </div>
              </Card>

              <Separator />

              <div className="space-y-1">
                {sharedMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className="w-full justify-start text-sm"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full p-2">
                  <Buildings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="space-y-1">
                  <p className="font-medium">Conta Compartilhada</p>
                  <p className="text-xs text-muted-foreground">
                    {sharedAccountInfo.name}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

const AppSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <TooltipProvider>
      <Sidebar
        collapsible="icon"
        className={`${isCollapsed ? "w-14" : "w-60"} flex flex-col`}
      >
        <SidebarHeader className={isCollapsed ? "p-2" : "p-4"}>
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold">Meus Envelopes</h2>
            )}
            <ThemeToggle />
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1">
          <nav className="space-y-2 px-3">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              const buttonContent = (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex w-full items-center py-3 text-sm font-medium rounded-lg transition-colors ${
                    isCollapsed ? "justify-center px-2" : "px-4"
                  } ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary/10"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${isCollapsed ? "mr-0" : "mr-3"}`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return buttonContent;
            })}
          </nav>
        </SidebarContent>

        <SharedAccountSidebar />
      </Sidebar>
    </TooltipProvider>
  );
};

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <SidebarTrigger />
            <UserDropdown />
          </div>
          {children}
        </main>
        <FloatingMenu />
      </div>
    </SidebarProvider>
  );
};
