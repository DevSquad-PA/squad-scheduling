// import { FaUser } from "react-icons/fa";
// import { FaLock } from "react-icons/fa";
"use client";
import Link from "next/link";
import {Button} from "../../components/ui/button";
import {Input} from "../../components/ui/input";
import { useState } from "react";

export default function Login() {

    const [showPassword, setShowPassword] = useState(false)

    const [form, setForm] = useState({
        login: "",
        password: ""
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setForm({...form, [name]: value})
    }

    function submit(e: React.FormEvent) {
        e.preventDefault()
        console.log(`Login: ${form.login} Senha: ${form.password}`)
    }

    return (

        <main className="flex justify-center items-center h-screen">

                <section 
                className= "bg-surface w-86 h-108 py-16 px-8 rounded-[20px] flex flex-col gap-3 opacity-100">

                    <h2 className="text-[24px] text-text2 w-full font-bold text-center mb-8">Login</h2>

                    <form onSubmit={submit} className="flex flex-col gap-3 justify-center items-center w-full">
                       
                            <Input
                                name="user"
                                placeholder="Usuário"
                                value={form.login}
                                onChange={handleChange}/>
                        
                        <div className="flex w-full relative"> 
                            <Input
                                placeholder="Senha"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}/>

                                {showPassword &&

                                <svg xmlns="http://www.w3.org/2000/svg"
                                 onClick={() => setShowPassword(!showPassword)}
                                  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-5 top-1/2 -translate-y-1/2 text-text2 lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                                }

                                
                                {!showPassword &&
                                <svg xmlns="http://www.w3.org/2000/svg"
                                onClick={() => setShowPassword(!showPassword)}
                                 width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-5 top-1/2 -translate-y-1/2 lucide lucide-eye-off-icon lucide-eye-off text-text2"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                                }
                            </div>
                        

                        <Link href="" className="flex gap-2 py-1 text-text2 hover:text-text text-base w-full justify-center ">Esqueci a senha</Link>

                        <Button type="submit" variant="themegreen"> Entrar</Button>
                    </form>

                    <Button variant="transparent">Cadastrar</Button>

                </section>

        </main>
    )
}