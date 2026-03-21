"use client";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import PhoneInput from "@/components/ui/phone-input";

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
    <main className="flex justify-center items-center h-screen bg-bg">
      <section className="bg-surface text-text w-90 h-auto rounded-[20px] flex flex-col gap-4 px-10 py-8">
        <h2 className="text-[24px] w-full font-bold text-center mt-4 mb-6">Cadastro</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 justify-center items-center w-full" noValidate>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Nome completo"
            required
          />

          <Input
            id="cpf"
            name="cpf"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{11}"
            placeholder="CPF"
            required
          />

          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            required
          />

          <PhoneInput
            id="phone"
            name="phone"
            required
          />

          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            required
          />

          <Button type="submit" variant="themegreen" className="mt-4">Cadastrar</Button>
          <Link href="/login">
            <Button variant="off">Voltar ao login</Button>
          </Link>
        </form>
      </section>
    </main>
  );
}
