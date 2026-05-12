"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { register } from "@/actions/auth/register";
import { PhoneInput } from "@/app/(protected)/appointments/components/PhoneInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

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
type FormField = keyof FormSchema;

const formFields: FormField[] = [
  "name",
  "cpf",
  "dateOfBirth",
  "phone",
  "email",
  "password",
  "confirmPassword",
];

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

      router.push("/appointments");
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
        const errs = getValidationMessage(error.validationErrors);
        if (errs) {
          toast.error(errs);
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
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Input
                {...form.register("cpf")}
                placeholder="CPF"
                className="placeholder:text-primary text-text"
              />
              {form.formState.errors.cpf && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.cpf.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="date"
                {...form.register("dateOfBirth")}
                className="placeholder:text-primary text-text"
              />
              {form.formState.errors.dateOfBirth && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.dateOfBirth.message}
                </p>
              )}
            </div>

            <div>
              <PhoneInput
                {...form.register("phone")}
                className="placeholder:text-primary text-text"
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="email"
                {...form.register("email")}
                placeholder="Email"
                className="placeholder:text-primary text-text"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col">
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

              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col">
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

              {form.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.confirmPassword.message}
                </p>
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
