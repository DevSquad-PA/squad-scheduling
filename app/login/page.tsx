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
        senha: ""
    })

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target

        setForm({
            ...form,
            [name]: value
        })
    }

    function entrar(e: React.FormEvent) {
        e.preventDefault()

        console.log(`Login: ${form.login} Senha: ${form.senha}`)
    }

    return (

        <main className="flex justify-center items-center h-screen">

            <section className="bg-bg h-fit w-fit m-4 flex lg:flex-row flex-col justify-center items-center mx-auto ">

                <header className="bg-primary lg:min-h-96 h-fit w-fit flex p-8 flex-col justify-center items-center text-white">
                    <h1 className="font-extrabold  text-2xl">AGENDAMENTO</h1>
                    <p>Projeto avançado 1 - DevSquad</p>
                </header>

                <section className="flex flex-col gap-2 justify-center items-center p-8 text-text">

                    <h2 className="text-xl font-bold">Faça o login</h2>

                    <form onSubmit={entrar} className="flex flex-col gap-2 justify-center items-center">

                        <label className="flex items-center gap-2">
                            {/* <FaUser />  */}
                            <Input
                                name="login"
                                placeholder="Usuário"
                                value={form.login}
                                onChange={handleChange} />
                        </label>

                        <label className="flex items-center gap-2">
                            {/* <FaLock /> */}
                            <Input
                                placeholder="Senha"
                                type="password"
                                name="senha"
                                value={form.senha}
                                onChange={handleChange} />
                        </label>

                        <Link href="" className="flex gap-2 text-sm w-full justify-end">Esqueceu a senha?</Link>

                        <Button text="Entrar" type="submit" />

                    </form>

                    <Link href="">Criar Conta</Link>

                </section>
            </section>
        </main>
    )
}