-- CreateTable
CREATE TABLE "usr_users" (
    "id_user" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "photo_url" TEXT,
    "cpf" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usr_users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "usr_sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "usr_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usr_accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usr_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usr_verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usr_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_clinics" (
    "id_clinic" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_clinics_pkey" PRIMARY KEY ("id_clinic")
);

-- CreateTable
CREATE TABLE "usr_roles" (
    "id_role" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usr_roles_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "usr_clinic_members" (
    "id_member" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usr_clinic_members_pkey" PRIMARY KEY ("id_member")
);

-- CreateTable
CREATE TABLE "med_professionals" (
    "id_professional" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "speciality" TEXT,
    "services" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "med_professionals_pkey" PRIMARY KEY ("id_professional")
);

-- CreateTable
CREATE TABLE "pat_patients" (
    "id_patient" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pat_patients_pkey" PRIMARY KEY ("id_patient")
);

-- CreateTable
CREATE TABLE "sch_appointments" (
    "id_appointment" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_date" DATE NOT NULL,
    "appointment_time" TIME NOT NULL,
    "services" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sch_appointments_pkey" PRIMARY KEY ("id_appointment")
);

-- CreateTable
CREATE TABLE "aud_logs" (
    "id_log" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "changed_by" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aud_logs_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE UNIQUE INDEX "usr_users_email_key" ON "usr_users"("email");

-- CreateIndex
CREATE INDEX "usr_sessions_user_id_idx" ON "usr_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "usr_sessions_token_key" ON "usr_sessions"("token");

-- CreateIndex
CREATE INDEX "usr_accounts_user_id_idx" ON "usr_accounts"("user_id");

-- CreateIndex
CREATE INDEX "usr_verifications_identifier_idx" ON "usr_verifications"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "usr_roles_description_key" ON "usr_roles"("description");

-- AddForeignKey
ALTER TABLE "usr_sessions" ADD CONSTRAINT "usr_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr_users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usr_accounts" ADD CONSTRAINT "usr_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr_users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usr_clinic_members" ADD CONSTRAINT "usr_clinic_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr_users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usr_clinic_members" ADD CONSTRAINT "usr_clinic_members_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "org_clinics"("id_clinic") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usr_clinic_members" ADD CONSTRAINT "usr_clinic_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "usr_roles"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "med_professionals" ADD CONSTRAINT "med_professionals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr_users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "med_professionals" ADD CONSTRAINT "med_professionals_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "org_clinics"("id_clinic") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pat_patients" ADD CONSTRAINT "pat_patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr_users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pat_patients" ADD CONSTRAINT "pat_patients_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "org_clinics"("id_clinic") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sch_appointments" ADD CONSTRAINT "sch_appointments_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "org_clinics"("id_clinic") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sch_appointments" ADD CONSTRAINT "sch_appointments_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "med_professionals"("id_professional") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sch_appointments" ADD CONSTRAINT "sch_appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "pat_patients"("id_patient") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aud_logs" ADD CONSTRAINT "aud_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "usr_users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
