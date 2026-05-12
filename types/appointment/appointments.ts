import type { Patient } from "../patient/patient";

export interface Appointment {
  id: string;
  clinicId?: string | null;
  professionalId?: string | null;
  patientId?: string | null;
  services: string[];
  value?: number | null;
  date: Date | string;
  time?: Date | string | null;
  createdAt?: Date | string | null;
  patient?: Patient | null;
}

export type PropsAppointment = {
  nome: string;
  data: string;
  hora: string;
  descricao: string;
  cliente: string;
  endereco: string;
  contato: string;
  cpf: string;
  email: string;
};
