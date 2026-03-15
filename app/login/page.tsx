"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({
    login: "",
    password: ""
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    console.log(`Login: ${form.login} Senha: ${form.password}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-card">
        <CardHeader>
          <CardTitle className="text-center text-foreground">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user">Usuário</Label>
              <Input
                id="user"
                name="user"
                placeholder="usuário"
                value={form.login}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="senha"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <Link href="" className="text-sm text-center text-muted-foreground hover:text-foreground">
              Esqueci a senha
            </Link>

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/signup">
              <Button variant="outline" className="w-full">
                Cadastrar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}