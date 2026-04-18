"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar/sidebar";
import {
  Bolt,
  Calendar,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  CircleUser,
  LogOut,
  Newspaper,
  UserRoundPlus,
} from "lucide-react";

import { useRef, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar/sidebar";
import Link from "next/link";

function TriggerCollapsed() {
  const { state } = useSidebar();

  if (state !== "collapsed") {
    return (
      <SidebarTrigger>
        <ChevronLeft className="h-8 w-8" />
      </SidebarTrigger>
    );
  } else {
    return (
      <SidebarTrigger>
        <ChevronRight className="h-8 w-8" />
      </SidebarTrigger>
    );
  }
}

type Props = {
  children: React.ReactNode;
  user?: any;
};

export default function SideBarAdmin({ children, user }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);

  function handleClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImage(url);
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-lg font-bold">Clinica</h2>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton>
                  <Calendar />
                  Agendamentos
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href="/dashboard/professionals">
                <SidebarMenuButton>
                  <UserRoundPlus />
                  Profissionais
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href="">
                <SidebarMenuButton>
                  <Newspaper />
                  Relatórios
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href="/dashboard/settings">
                <SidebarMenuButton>
                  <Bolt />
                  Configurações
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="my-6 flex flex-row items-center gap-3">
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={handleClick}
            className="bg-muted flex h-12.5 w-12.5 cursor-pointer items-center justify-center overflow-hidden rounded-full"
          >
            {image ? (
              <img
                src={image}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <CircleUser size={50} />
            )}
          </div>

          <div>
            <p>Bem vindo</p>
            <p>
              Nome
              {/* {user.name ?? user.email} */}
            </p>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="flex items-center justify-between gap-2 border-b p-4">
          <div className="flex items-center gap-4">
            <TriggerCollapsed />
            <h1 className="text-xl font-semibold">Administração</h1>
          </div>
          <button className="hover:text-primary flex cursor-pointer gap-4 text-xl font-bold">
            Sair
            <LogOut />
          </button>
        </div>
        <hr />

        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
