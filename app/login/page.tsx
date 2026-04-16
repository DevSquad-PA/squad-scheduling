"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { login } from "@/actions/auth/login";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type FormSchema = z.infer<typeof formSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { execute, status } = useAction(login, {
    onSuccess: async (result) => {
      if (result?.data?.message) {
        //trocar por toast de sucesso da página
        alert(result.data.message);
      }

      router.push("/dashboard");
      router.refresh();
    },
    onError: ({ error }) => {
      if (error.serverError) {
        //trocar por toast de erro da página
        console.log("Server error:", error.serverError);
      }
    },
  });

  const onSubmit = (data: FormSchema) => {
    execute(data);
  };

  return (
    <main className="bg-bg flex h-screen items-center justify-center">
      <section className="bg-surface flex w-full flex-col gap-3 rounded-none p-8 opacity-100 sm:w-86 sm:rounded-[20px]">
        <h2 className="text-text2 w-full pb-4 text-center text-[24px] font-bold">
          Login
        </h2>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col items-center justify-center gap-3"
        >
          <Input
            type="email"
            placeholder="Email"
            {...form.register("email")}
            className="text-text"
          />

          <div className="relative flex w-full">
            <Input
              placeholder="Senha"
              type={showPassword ? "text" : "password"}
              {...form.register("password")}
              className="text-text"
            />

            {showPassword && (
              <Eye
                onClick={() => setShowPassword(!showPassword)}
                className="text-text2 lucide lucide-eye-icon lucide-eye absolute top-1/2 right-5 -translate-y-1/2"
              />
            )}
            {!showPassword && (
              <EyeOff
                onClick={() => setShowPassword(!showPassword)}
                className="lucide lucide-eye-off-icon lucide-eye-off text-text2 absolute top-1/2 right-5 -translate-y-1/2"
              />
            )}
          </div>

          <Link
            href=""
            className="text-text2 hover:text-text flex w-full justify-center text-base"
          >
            Esqueci a senha
          </Link>

          <Button
            type="submit"
            variant="themegreen"
            disabled={status === "executing" || isLoading}
          >
            {status === "executing" || isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <Button variant="transparent" asChild className="border-primary">
          <Link href="/signup">Cadastrar</Link>
        </Button>
      </section>
    </main>
  );
}
