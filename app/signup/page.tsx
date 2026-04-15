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
import { useToast } from "@/components/ui/toast";

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

  const toast = useToast();

  const { execute, status } = useAction(register, {
    onSuccess: (result) => {
      if (result?.data?.message) {
        toast.success(result.data.message);
      }

      router.push("/dashboard");
      router.refresh();
    },
    onError: ({ error }) => {
      if (error?.validationErrors) {
        Object.entries(error.validationErrors).forEach(([k, v]: any) => {
          form.setError(k as any, { type: "server", message: (v as string[]).join(" ") });
        });
        const errs = (error as any)._errors as string[] | undefined;
        if (errs && Array.isArray(errs) && errs.length) {
          toast.error(errs.join(" "));
        }
        return;
      }

      if (error?.serverError) {
        toast.error(String(error.serverError));
        return;
      }

      toast.error("Erro ao processar a requisição");
    },
  });

  const onSubmit = (data: FormSchema) => {
    execute(data);
  };

  return (
    <div className="bg-bg flex min-h-screen items-center justify-center p-4">
      <Card className="bg-surface w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-text2 mb-8 w-full px-4 py-8 text-center text-[24px] font-bold opacity-100">
            Cadastro
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div>
              <Input {...form.register("name")} placeholder="Nome completo" />
            </div>

            <div>
              <Input {...form.register("cpf")} placeholder="CPF" />
            </div>

            <div>
              <Input type="date" {...form.register("dateOfBirth")} />
            </div>

            <div>
              <PhoneInput {...form.register("phone")} />
            </div>

            <div>
              <Input
                type="email"
                {...form.register("email")}
                placeholder="Email"
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                className="pr-10"
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
                className="pr-10"
                {...form.register("confirmPassword")}
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
              <Button type="button" variant="transparent" className="w-full">
                Voltar ao login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
