"use client";
import React from "react";
import Link from "next/link";
import { PhoneInput } from "@/app/components/PhoneInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") || ""),
      cpf: String(fd.get("cpf") || ""),
      birthDate: String(fd.get("birthDate") || ""),
      phone: String(fd.get("phone") || ""),
      email: String(fd.get("email") || ""),
    };
    console.log("client submit:", payload);
    // TODO: enviar payload para API
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-card">
        <CardHeader>
          <CardTitle className="text-center text-foreground">Cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{11}"
                placeholder="CPF"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <PhoneInput
                id="phone"
                name="phone"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
              />
            </div>

            <div className="flex flex-col gap-4 mt-4">
              <Button type="submit" className="w-full">
                Cadastrar
              </Button>
              <Link href="/login">
                <Button type="button" variant="outline" className="w-full">
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}