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
      <section className="bg-surface flex h-108 w-86 flex-col gap-3 rounded-[20px] px-8 py-16 opacity-100">
        <h2 className="text-text2 mb-8 w-full text-center text-[24px] font-bold">
          Login
        </h2>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col items-center justify-center gap-3"
        >
          <Input type="email" placeholder="Email" {...form.register("email")} />

          <div className="relative flex w-full">
            <Input
              placeholder="Senha"
              type={showPassword ? "text" : "password"}
              {...form.register("password")}
            />

            {showPassword && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => setShowPassword(!showPassword)}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text2 lucide lucide-eye-icon lucide-eye absolute top-1/2 right-5 -translate-y-1/2"
              >
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}

            {!showPassword && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => setShowPassword(!showPassword)}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-eye-off-icon lucide-eye-off text-text2 absolute top-1/2 right-5 -translate-y-1/2"
              >
                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                <path d="m2 2 20 20" />
              </svg>
            )}
          </div>

          <Link
            href=""
            className="text-text2 hover:text-text flex w-full justify-center gap-2 py-1 text-base"
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

        <Button variant="transparent" asChild>
          <Link href="/signup">Cadastrar</Link>
        </Button>
      </section>
    </main>
  );
}
