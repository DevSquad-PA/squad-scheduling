import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHora(value: Date | string | null | undefined): string {
  if (!value) return "";

  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

export function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }

  if (digits.length > 2) {
    digits = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length > 10) {
    digits = `${digits.slice(0, 10)}-${digits.slice(10, 14)}`;
  }

  return digits;
}
