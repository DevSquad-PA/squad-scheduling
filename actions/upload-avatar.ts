"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { returnValidationErrors } from "next-safe-action";
import { z } from "zod";

import { protectedActionClient } from "@/lib/action-client";
import { auth } from "@/lib/auth";
import {
  deleteAvatarFromSupabaseStorage,
  getSupabaseStoragePathFromPublicUrl,
  uploadAvatarToSupabaseStorage,
} from "@/lib/supabase-storage";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const inputSchema = z.object({
  avatar: z
    .custom<File>(
      (value) => typeof File !== "undefined" && value instanceof File,
      "Arquivo de avatar e obrigatorio.",
    )
    .refine((file) => ALLOWED_IMAGE_TYPES.has(file.type), {
      message: "Use uma imagem JPG, PNG ou WebP.",
    })
    .refine((file) => file.size <= MAX_AVATAR_SIZE, {
      message: "A imagem deve ter no maximo 2MB.",
    }),
});

export const uploadAvatar = protectedActionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { avatar }, ctx: { user } }) => {
    const extension = ALLOWED_IMAGE_TYPES.get(avatar.type);

    if (!extension) {
      returnValidationErrors(inputSchema, {
        avatar: {
          _errors: ["Use uma imagem JPG, PNG ou WebP."],
        },
      });
    }

    const buffer = Buffer.from(await avatar.arrayBuffer());
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const imageUrl = await uploadAvatarToSupabaseStorage({
      buffer,
      path,
      contentType: avatar.type,
    });

    await auth.api.updateUser({
      body: {
        image: imageUrl,
      },
      headers: await headers(),
    });

    const oldPath = getSupabaseStoragePathFromPublicUrl(user.image);
    if (oldPath && oldPath !== path) {
      await deleteAvatarFromSupabaseStorage(oldPath).catch(() => undefined);
    }

    revalidatePath("/dashboard");

    return { imageUrl };
  });
