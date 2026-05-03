"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function uploadAvatar(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autorizado.");
  }

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("Nenhum arquivo enviado.");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Configurações do Supabase ausentes no servidor.");
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

  const bucket = "avatars";
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${serviceRoleKey}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: await file.arrayBuffer(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Erro ao fazer upload no Supabase:", errorBody);
    throw new Error("Falha ao salvar a imagem no bucket.");
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: publicUrl },
  });

  return { success: true, url: publicUrl };
}
