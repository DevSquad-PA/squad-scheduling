// import { FaUser } from "react-icons/fa";
// import { FaLock } from "react-icons/fa";
"use client";
import Link from "next/link";
import Button from "../components/Button";
import Input from "../components/Input";
import { useState } from "react";

export default function Login() {

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
                className= "bg-surface text-text w-90 h-99 top-46 left-115 rounded-[20px] flex flex-col gap-1 opacity-100 px-10">

                    <h2 className="text-[24px] w-full font-bold text-center mt-14 mb-6">Login</h2>

                    <form onSubmit={submit} className="flex flex-col gap-2 justify-center items-center w-full">
                       
                            <Input
                                name="user"
                                placeholder="usuário"
                                value={form.login}
                                onChange={handleChange}/>
                        
                            <Input
                                placeholder="senha"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}/>
                        
                        <Link href="" className="flex gap-2 text-sm w-full justify-center mb-4 text-text-muted hover:text-text">esqueci a senha</Link>

                        <Button text="Entrar" type="submit"/>
                    </form>

                    <Button text="Cadastrar" transparent={true}/>

                </section>

        </main>
    )
}