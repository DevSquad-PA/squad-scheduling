export type Professional = {
  id: string;
  userId: string | null;
  clinicId: string | null;
  specialty: string | null;
  services: string[];
  createdAt: Date | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
};

export type CreateProfessionalInput = {
  userId: string;
  specialty: string;
  services: string[];
};

export type AvailableDoctor = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
};
