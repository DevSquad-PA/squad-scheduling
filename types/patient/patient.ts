import type { Appointment } from "../appointment/appointments";

export interface Patient {
  id: string;
  clinicId?: string | null;
  firstName: string;
  lastName: string;
  cpf?: string | null;
  dateOfBirth?: Date | string | null;
  gender?: string | null;
  phone?: string | null;
  secondPhone?: string | null;
  email?: string | null;
  zipCode?: string | null;
  street?: string | null;
  addressNumber?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  createdAt?: Date | string | null;
  appointments?: Appointment[];
}

export type PatientWithBookings = Pick<Patient,
  "id" | "firstName" | "lastName" | "cpf" | "phone" | "addressNumber">;
