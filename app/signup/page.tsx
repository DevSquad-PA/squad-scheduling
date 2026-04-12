"use client";

import Link from "next/link";
import { PhoneInput } from "@/app/components/PhoneInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { register } from "@/actions/auth/register";
import { useRouter } from "next/navigation";

import z from "zod";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z
  .object({
    name: z.string().min(3, "Nome obrigatório"),
    cpf: z.string().min(11, "CPF inválido"),
    dateOfBirth: z.string().min(1, "Data obrigatória"),
    phone: z.string().min(10, "Telefone inválido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormSchema = z.infer<typeof formSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      dateOfBirth: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { execute, status } = useAction(register, {
    onSuccess: (result) => {
      if (result?.data?.message) {
        //trocar por toast de sucesso da página
        alert(result.data.message);
      }

      router.push("/dashboard");
      router.refresh();
    },
    onError: ({ error }) => {
      //trocar por toast de erro
      console.log("Server error:", error.serverError);
    },
  });

  const onSubmit = (data: FormSchema) => {
    execute(data);
  };

  return (
    <div className="bg-bg flex min-h-screen items-center justify-center">
      <Card className="bg-surface w-full max-w-md p-4 py-8">
        <CardHeader>
          <CardTitle className="text-text2 w-full pb-4 text-center text-[24px] font-bold opacity-100">
            Cadastro
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <div>
              <Input
                {...form.register("name")}
                placeholder="Nome completo"
                className="placeholder:text-primary text-text"
              />
            </div>

            <div>
              <Input
                {...form.register("cpf")}
                placeholder="CPF"
                className="placeholder:text-primary text-text"
              />
            </div>

            <div>
              <Input
                type="date"
                {...form.register("dateOfBirth")}
                className="placeholder:text-primary text-text"
              />
            </div>

            <div>
              <PhoneInput
                {...form.register("phone")}
                className="placeholder:text-primary text-text"
              />
            </div>

            <div>
              <Input
                type="email"
                {...form.register("email")}
                placeholder="Email"
                className="placeholder:text-primary text-text"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                className="placeholder:text-primary text-text pr-10"
                {...form.register("password")}
              />

              {showPassword ? (
                <EyeOff
                  onClick={() => setShowPassword(false)}
                  className="text-text2 absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  size={18}
                />
              ) : (
                <Eye
                  onClick={() => setShowPassword(true)}
                  className="text-text2 absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  size={18}
                />
              )}
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar senha"
                {...form.register("confirmPassword")}
                className="placeholder:text-primary text-text pr-10"
              />

              {showConfirmPassword ? (
                <EyeOff
                  onClick={() => setShowConfirmPassword(false)}
                  className="text-text2 absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  size={18}
                />
              ) : (
                <Eye
                  onClick={() => setShowConfirmPassword(true)}
                  className="text-text2 absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                  size={18}
                />
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={status === "executing"}
            >
              {status === "executing" ? "Cadastrando..." : "Cadastrar"}
            </Button>
            <Link href="/login">
              <Button
                type="button"
                variant="transparent"
                className="border-primary w-full"
              >
                Voltar ao login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
