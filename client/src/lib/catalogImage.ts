import { MAX_CATALOG_IMAGE_BYTES } from "./uploadImage";

export const MAX_BULK_CATALOG_FILES = 20;
export const MAX_BULK_SOURCE_BYTES = 25 * 1024 * 1024;
export const CATALOG_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const MAX_IMAGE_EDGE = 1600;
const WEBP_QUALITY = 0.82;

export function productNameFromFilename(filename: string): string {
  const withoutExtension = filename.replace(/\.[^.]+$/, "");
  const words = withoutExtension
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return words
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toLocaleUpperCase("id-ID")}${word.slice(1)}`)
    .join(" ")
    .slice(0, 140);
}

function optimizedFilename(filename: string): string {
  const base = filename
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "produk";
  return `${base}.webp`;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Foto gagal dikompres.")),
      "image/webp",
      WEBP_QUALITY
    );
  });
}

/** Resizes a phone photo and returns an upload-ready WebP file. */
export async function optimizeCatalogImage(file: File): Promise<File> {
  if (!CATALOG_IMAGE_TYPES.has(file.type)) {
    throw new Error("Gunakan gambar JPG, PNG, WebP, atau AVIF.");
  }
  if (file.size > MAX_BULK_SOURCE_BYTES) {
    throw new Error("Ukuran foto sumber maksimal 25 MB.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Foto tidak dapat dibaca oleh browser ini.");
  }

  try {
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Browser tidak mendukung optimasi foto.");
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await canvasToBlob(canvas);
    if (blob.size > MAX_CATALOG_IMAGE_BYTES) {
      throw new Error("Foto masih lebih dari 5 MB setelah dioptimalkan.");
    }

    return new File([blob], optimizedFilename(file.name), {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}
