"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { login } from "@/actions/auth/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type FormSchema = z.infer<typeof formSchema>;
type FormField = keyof FormSchema;

const formFields: FormField[] = ["email", "password"];

function isFormField(value: string): value is FormField {
  return formFields.includes(value as FormField);
}

function getValidationMessage(value: unknown) {
  if (Array.isArray(value)) return value.join(" ");
  if (
    value &&
    typeof value === "object" &&
    "_errors" in value &&
    Array.isArray(value._errors)
  ) {
    return value._errors.join(" ");
  }

  return undefined;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const toast = useToast();

  const { execute, status } = useAction(login, {
    onSuccess: async (result) => {
      if (result?.data?.message) {
        toast.success(result.data.message);
      }

      router.push("/dashboard");
      router.refresh();
    },
    onError: ({ error }) => {
      if (error?.validationErrors) {
        Object.entries(error.validationErrors).forEach(([key, value]) => {
          if (!isFormField(key)) return;

          form.setError(key, {
            type: "server",
            message: getValidationMessage(value),
          });
        });

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

          {form.formState.errors.email && (
            <p className="w-full text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}

          <div className="relative flex w-full flex-col">
            <div className="relative flex w-full">
              <Input
                placeholder="Senha"
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                className="text-text"
              />

              {showPassword ? (
                <Eye
                  onClick={() => setShowPassword(false)}
                  className="text-text2 absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer"
                />
              ) : (
                <EyeOff
                  onClick={() => setShowPassword(true)}
                  className="text-text2 absolute top-1/2 right-5 -translate-y-1/2 cursor-pointer"
                />
              )}
            </div>

            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
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
            disabled={status === "executing"}
          >
            {status === "executing" ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <Button variant="transparent" asChild className="border-primary">
          <Link href="/signup">Cadastrar</Link>
        </Button>
      </section>
    </main>
  );
}
