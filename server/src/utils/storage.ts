import { supabaseAdmin } from "./supabaseAdmin";
import { logger } from "./logger";

export const CONTACT_IMAGE_BUCKET = "contact-images";

const PUBLIC_PREFIX = `/storage/v1/object/public/${CONTACT_IMAGE_BUCKET}/`;

/**
 * Extract the object path from a public Storage URL, e.g.
 * `https://<ref>.supabase.co/storage/v1/object/public/contact-images/contacts/1.png`
 * → `contacts/1.png`. Returns null for URLs that don't belong to our bucket.
 */
export function contactImagePath(url: string | null | undefined): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  // Only ever touch objects in our own project's bucket.
  const projectUrl = process.env.SUPABASE_URL;
  if (projectUrl && parsed.origin !== new URL(projectUrl).origin) return null;
  if (!parsed.pathname.startsWith(PUBLIC_PREFIX)) return null;

  const path = decodeURIComponent(parsed.pathname.slice(PUBLIC_PREFIX.length));
  return path.length > 0 ? path : null;
}

/**
 * Best-effort removal of a contact photo that is no longer referenced.
 * Never throws: losing the cleanup is preferable to failing the user's request.
 */
export async function deleteContactImage(url: string | null | undefined): Promise<void> {
  const path = contactImagePath(url);
  if (!path) return;

  try {
    const { error } = await supabaseAdmin.storage.from(CONTACT_IMAGE_BUCKET).remove([path]);
    if (error) {
      logger.warn(`Failed to delete orphaned image ${path}: ${error.message}`);
    }
  } catch (err) {
    logger.warn(`Failed to delete orphaned image ${path}: ${(err as Error).message}`);
  }
}
