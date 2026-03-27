"use client"

import { ReactNode } from "react"

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
} from "@/components/ui/sidebar/sidebar"
import { Bolt, Calendar, CalendarPlus, ChevronLeft, ChevronRight, LogOut, Newspaper, UserRoundPlus } from "lucide-react"

import { useSidebar } from "@/components/ui/sidebar/sidebar"
import Link from "next/link"

function TriggerCollapsed() {
  const { state } = useSidebar()

  if (state !== "collapsed") return null

  return (
    <SidebarTrigger>
      <ChevronRight className="w-8 h-8" />
    </SidebarTrigger>
  )
}

type Props = {
  children: React.ReactNode
}

export default function SideBarAdmin({children}:Props) {
    return (
        <SidebarProvider>

            {/* SIDEBAR */}
            <Sidebar>
                <SidebarHeader>
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold">Clinica</h2>
                        <SidebarTrigger>

                            <ChevronLeft className="w-8 h-8"/>
                            
                        </SidebarTrigger>
                    </div>

                </SidebarHeader>

                <SidebarContent>
                    <SidebarMenu>

                        <SidebarMenuItem>
                            <Link href="">
                            <SidebarMenuButton>
                                
                                <Calendar/>
                                Agendamentos
                                
                            </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link href="">
                            <SidebarMenuButton>
                                
                                <CalendarPlus/>
                                Agendar
                               
                            </SidebarMenuButton> 
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link href="">
                            <SidebarMenuButton>
                                
                                <UserRoundPlus/>
                                Cadastrar
                                
                            </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                            <Link href="">
                            <SidebarMenuButton>
                            
                                <Newspaper/>
                                Relatórios
                                
                            </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>



                        <SidebarMenuItem>
                            <Link href="">
                            <SidebarMenuButton>
                                
                                <Bolt/>
                                Configurações
                                
                            </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem>



                    </SidebarMenu>
                </SidebarContent>

                 <SidebarFooter className="flex flex-col justify-center items-start p-4 mx-auto gap-0">
                           <p>Bem vindo,</p>
                           <p>Nome</p>
                        </SidebarFooter>

            </Sidebar>

            {/* CONTEÚDO PRINCIPAL */}
            <SidebarInset>

                {/* topo */}
                <div className="p-4 border-b flex justify-between items-center gap-2">
                    <div className="flex items-center gap-4">
                    <TriggerCollapsed />
                    <h1 className="text-xl font-semibold">Administração</h1>
                    </div>
                    <button className="flex gap-4 font-bold text-xl cursor-pointer hover:text-primary">
                        Sair
                    <LogOut/>
                    </button>
                </div>
                <hr/>

                {children}

            </SidebarInset>

                                   

        </SidebarProvider>
    )
}