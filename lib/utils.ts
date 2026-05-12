import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { PropsAppointment } from "@/types/appointment/appointments";

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

export function getSingleParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function formatInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseInputDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function parseAppointmentDate(value: string): Date {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day);
}

export function isSameDate(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function filterAppointments(
  appointments: PropsAppointment[],
  search: string,
  selectedDate: Date,
): PropsAppointment[] {
  const normalizedSearch = search.trim().toLowerCase();

  return appointments.filter((appointment) => {
    const matchesDate = isSameDate(
      parseAppointmentDate(appointment.data),
      selectedDate,
    );

    const matchesSearch =
      !normalizedSearch ||
      appointment.nome.toLowerCase().includes(normalizedSearch) ||
      appointment.descricao.toLowerCase().includes(normalizedSearch) ||
      appointment.cliente.toLowerCase().includes(normalizedSearch) ||
      appointment.contato.toLowerCase().includes(normalizedSearch) ||
      appointment.cpf.toLowerCase().includes(normalizedSearch);

    return matchesDate && matchesSearch;
  });
}
