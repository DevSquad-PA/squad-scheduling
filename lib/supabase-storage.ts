const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET ?? "avatars";

function getSupabaseStorageConfig() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_STORAGE_BUCKET) {
    throw new Error("Supabase Storage environment variables are missing.");
  }

  return {
    bucketName: SUPABASE_STORAGE_BUCKET,
    serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: SUPABASE_URL.replace(/\/$/, ""),
  };
}

function getStorageHeaders(contentType?: string) {
  const { serviceRoleKey } = getSupabaseStorageConfig();

  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
    ...(contentType ? { "content-type": contentType } : {}),
  };
}

export async function uploadAvatarToSupabaseStorage({
  buffer,
  path,
  contentType,
}: {
  buffer: Buffer;
  path: string;
  contentType: string;
}): Promise<string> {
  const { bucketName, supabaseUrl } = getSupabaseStorageConfig();
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${path}`;
  const body = new Uint8Array(buffer.byteLength);
  body.set(buffer);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      ...getStorageHeaders(contentType),
      "cache-control": "public, max-age=31536000, immutable",
      "x-upsert": "true",
    },
    body: new Blob([body], { type: contentType }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to upload avatar to Supabase Storage: ${response.statusText}`,
    );
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;
}

export async function deleteAvatarFromSupabaseStorage(
  path: string,
): Promise<void> {
  const { bucketName, supabaseUrl } = getSupabaseStorageConfig();

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${bucketName}`,
    {
      method: "DELETE",
      headers: {
        ...getStorageHeaders("application/json"),
      },
      body: JSON.stringify({
        prefixes: [path],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to delete avatar from Supabase Storage: ${response.statusText}`,
    );
  }
}

export function getSupabaseStoragePathFromPublicUrl(
  url: string | null | undefined,
) {
  if (!url) return null;

  const { bucketName, supabaseUrl } = getSupabaseStorageConfig();
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/`;

  if (!url.startsWith(publicUrl)) return null;

  return url.slice(publicUrl.length);
}
