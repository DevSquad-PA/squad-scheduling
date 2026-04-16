import { z } from "zod";

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  return true;
};

const registerSchema = z
  .object({
    name: z.string().min(3, "Nome obrigatório"),
    cpf: z.string().min(11, "CPF inválido").refine((cpf) => validateCPF(cpf), { message: "CPF inválido" }),
    dateOfBirth: z.string().min(1, "Data obrigatória").refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Data de nascimento inválida" }),
    phone: z.string().min(10, "Telefone inválido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// exemplo de input inválido
const input = {
  name: "Jo",
  cpf: "123",
  dateOfBirth: "",
  phone: "",
  email: "not-an-email",
  password: "123",
  confirmPassword: "456",
};

try {
  registerSchema.parse(input);
  console.log('VALID');
} catch (e) {
  if (e instanceof z.ZodError) {
    const formatted: Record<string, string[]> = {};
    e.issues.forEach((err) => {
      const key = (err.path && err.path[0]) ? String(err.path[0]) : '_errors';
      if (!formatted[key]) formatted[key] = [];
      formatted[key].push(err.message);
    });

    const output = {
      validationErrors: Object.fromEntries(Object.entries(formatted).filter(([k]) => k !== '_errors')) as Record<string, string[]>,
      _errors: formatted['_errors'] || [],
    };

    console.log(JSON.stringify(output, null, 2));
  } else {
    console.error(e);
  }
}
