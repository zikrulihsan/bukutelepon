import { supabase } from "./supabase";
import type { TranslationKey } from "../i18n/translations";

const BUCKET = "contact-images";

// Mirrors the bucket's own limits, so we fail with a clear message instead of
// letting Storage reject the upload with an opaque error.
export const MAX_IMAGE_BYTES = 1024 * 1024;

/** Upload failure carrying a translation key the caller renders with `t()`. */
export class UploadError extends Error {
  constructor(public messageKey: TranslationKey) {
    super(messageKey);
    this.name = "UploadError";
  }
}

function extensionFor(file: File): string {
  const fromName = file.name.includes(".") ? file.name.split(".").pop() : "";
  if (fromName && /^[a-z0-9]{1,5}$/i.test(fromName)) return fromName.toLowerCase();
  const fromMime = file.type.split("/")[1];
  return fromMime && /^[a-z0-9]{1,5}$/i.test(fromMime) ? fromMime.toLowerCase() : "jpg";
}

function keyForStorageError(error: unknown): TranslationKey {
  const { message = "", statusCode } = (error ?? {}) as { message?: string; statusCode?: string | number };
  const status = Number(statusCode);
  const text = message.toLowerCase();

  // Storage denies anonymous writes via RLS — in practice this means the
  // session expired or was lost, not that the bucket is misconfigured.
  if (status === 401 || status === 403 || text.includes("row-level security") || text.includes("jwt")) {
    return "error.uploadNotSignedIn";
  }
  if (status === 413 || text.includes("maximum allowed size") || text.includes("payload too large")) {
    return "error.uploadTooLarge";
  }
  if (text.includes("mime type")) return "error.uploadInvalidType";

  return "error.uploadPhoto";
}

/**
 * Upload a contact photo and return its public URL.
 * Throws `UploadError` with a translation key on any failure.
 */
export async function uploadContactImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new UploadError("error.uploadInvalidType");
  if (file.size > MAX_IMAGE_BYTES) throw new UploadError("error.uploadTooLarge");

  // Refresh a stale session up front: an expired token reaches Storage as an
  // anonymous request, which fails the bucket's RLS policy.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new UploadError("error.uploadNotSignedIn");

  const path = `contacts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionFor(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });

  if (error) throw new UploadError(keyForStorageError(error));

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
