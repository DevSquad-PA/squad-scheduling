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
  name: string;
  email: string;
  phone: string;
  specialty: string;
  services: string[];
};
