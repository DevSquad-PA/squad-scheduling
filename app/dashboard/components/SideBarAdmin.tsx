"use client"

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
import { Bolt, Calendar, CalendarPlus, ChevronLeft, ChevronRight, CircleUser, LogOut, Newspaper, UserRoundPlus } from "lucide-react"

import { useRef, useState } from "react"
import { useSidebar } from "@/components/ui/sidebar/sidebar"
import Link from "next/link"

function TriggerCollapsed() {
    const { state } = useSidebar()

    if (state !== "collapsed") {
        return (<SidebarTrigger>
            <ChevronLeft className="w-8 h-8" />
            </SidebarTrigger>)
    }

    else {
    return (
        <SidebarTrigger>
            <ChevronRight className="w-8 h-8" />
        </SidebarTrigger>
    )}
}

type Props = {
    children: React.ReactNode;
    user?: any
}

export default function SideBarAdmin({ children, user }: Props) {


    const inputRef = useRef<HTMLInputElement>(null)
    const [image, setImage] = useState<string | null>(null)

    function handleClick() {
        inputRef.current?.click()
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const url = URL.createObjectURL(file)
        setImage(url)
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

                        {/* <SidebarMenuItem>
                            <Link href="">
                                <SidebarMenuButton>

                                    <CalendarPlus />
                                    Agendar

                                </SidebarMenuButton>
                            </Link>
                        </SidebarMenuItem> */}

                        <SidebarMenuItem>
                            <Link href="">
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
                <SidebarFooter className="flex flex-row items-center gap-3 my-6">

                    <input
                        type="file"
                        accept="image/*"
                        ref={inputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />


                    <div
                        onClick={handleClick}
                        className="cursor-pointer w-12.5 h-12.5 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {image ? (
                            <img
                                src={image}
                                alt="avatar"
                                className="w-full h-full object-cover" />
                        ) : (
                            <CircleUser size={50} />
                        )}
                    </div>

                    <div>
                        <p>Bem vindo</p>
                        <p>Nome
                            {/* {user.name ?? user.email} */}
                        </p>
                    </div>
                </SidebarFooter>

            </Sidebar>

            
            <SidebarInset>
                <div className="p-4 border-b flex justify-between items-center gap-2">
                    <div className="flex items-center gap-4">
                        <TriggerCollapsed />
                        <h1 className="text-xl font-semibold">Administração</h1>
                    </div>
                    <button className="flex gap-4 font-bold text-xl cursor-pointer hover:text-primary">
                        Sair
                        <LogOut />
                    </button>
                </div>
                <hr />

                {children}

            </SidebarInset>



        </SidebarProvider>
    )
}