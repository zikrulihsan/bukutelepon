/**
 * Server-renders Open Graph metadata for contact and storefront links.
 * Social crawlers do not execute the React SPA, so the preview has to be
 * written into the HTML response at the edge.
 */

const SITE_NAME = "CariKontak";

interface Preview {
  title: string;
  description: string;
  url: string;
  image?: string;
  imageAlt?: string;
  type?: "profile" | "website" | "product";
}

interface ContactPayload {
  name?: string;
  phone?: string;
  address?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  city?: { name?: string } | null;
  category?: { name?: string } | null;
}

interface StorefrontItemPayload {
  slug?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string | null;
}

interface StorefrontPayload {
  name?: string;
  slug?: string;
  description?: string;
  coverUrl?: string | null;
  logoUrl?: string | null;
  items?: StorefrontItemPayload[];
}

const FALLBACK_STOREFRONT: StorefrontPayload = {
  name: "Toko Evi",
  slug: "toko-evi",
  description: "Pusat oleh-oleh khas Sumbawa: madu, permen susu, susu kuda liar, manjareal, kacang mete, dan pilihan khas lainnya.",
  coverUrl: "/storefront/store-cover.jpg",
};

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(value: string | null | undefined, origin: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

async function fetchData<T>(url: URL): Promise<T | null> {
  try {
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) return null;
    const payload = await response.json() as { success?: boolean; data?: T };
    return payload.success && payload.data ? payload.data : null;
  } catch {
    return null;
  }
}

function contactDescription(contact: ContactPayload): string {
  const supplied = clean(contact.description, 180);
  if (supplied) return supplied;

  const category = clean(contact.category?.name, 50);
  const city = clean(contact.city?.name, 60);
  const address = clean(contact.address, 100);
  const phone = clean(contact.phone, 30);
  const context = [category, city].filter(Boolean).join(" di ");
  return [context, address, phone].filter(Boolean).join(" · ") || "Informasi kontak dan nomor yang dapat dihubungi.";
}

async function buildContactPreview(url: URL): Promise<Preview> {
  const id = decodeURIComponent(url.pathname.slice("/kontak/".length)).split("/")[0];
  const contact = id
    ? await fetchData<ContactPayload>(new URL(`/api/contacts/${encodeURIComponent(id)}`, url.origin))
    : null;

  return {
    title: clean(contact?.name, 90) || "Detail kontak",
    description: contact ? contactDescription(contact) : "Informasi kontak dan nomor yang dapat dihubungi.",
    url: url.href,
    image: absoluteUrl(contact?.imageUrl, url.origin),
    imageAlt: clean(contact?.name, 90) || "Foto kontak",
    type: "profile",
  };
}

async function buildStorefrontPreview(url: URL): Promise<Preview> {
  const requestedSlug = clean(url.searchParams.get("store"), 100) || FALLBACK_STOREFRONT.slug!;
  const remote = await fetchData<StorefrontPayload>(
    new URL(`/api/storefront/${encodeURIComponent(requestedSlug)}`, url.origin),
  );
  const business = remote ?? (requestedSlug === FALLBACK_STOREFRONT.slug ? FALLBACK_STOREFRONT : null);
  const itemSlug = url.pathname.startsWith("/catalog/")
    ? decodeURIComponent(url.pathname.slice("/catalog/".length)).split("/")[0]
    : "";
  const item = itemSlug ? business?.items?.find((entry) => entry.slug === itemSlug) : undefined;
  const businessName = clean(business?.name, 90) || "Katalog bisnis";
  const title = item
    ? `${clean(item.name, 80)} — ${businessName}`
    : businessName;
  const description = clean(item?.shortDescription || item?.description || business?.description, 180)
    || "Lihat produk, layanan, dan informasi bisnis ini.";
  const image = absoluteUrl(
    item?.imageUrl || business?.coverUrl || business?.logoUrl,
    url.origin,
  );

  return {
    title,
    description,
    url: url.href,
    image,
    imageAlt: item ? clean(item.name, 90) : businessName,
    type: item ? "product" : "website",
  };
}

export async function buildPreview(url: URL): Promise<Preview> {
  return url.pathname.startsWith("/kontak/")
    ? buildContactPreview(url)
    : buildStorefrontPreview(url);
}

function renderHead(preview: Preview): string {
  const title = escapeHtml(preview.title);
  const description = escapeHtml(preview.description);
  const url = escapeHtml(preview.url);
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${preview.type ?? "website"}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="id_ID" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  ];

  if (preview.image) {
    const image = escapeHtml(preview.image);
    const imageAlt = escapeHtml(preview.imageAlt || preview.title);
    tags.push(
      `<meta property="og:image" content="${image}" />`,
      `<meta property="og:image:secure_url" content="${image}" />`,
      `<meta property="og:image:alt" content="${imageAlt}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:image" content="${image}" />`,
      `<meta name="twitter:image:alt" content="${imageAlt}" />`,
    );
  } else {
    tags.push(`<meta name="twitter:card" content="summary" />`);
  }

  return tags.join("\n  ");
}

function stripStaticHead(html: string): string {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+name="description"[^>]*>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>\s*/gi, "");
}

export default async function detailPreview(
  request: Request,
  context: { next: () => Promise<Response> },
): Promise<Response> {
  const response = await context.next();
  if (!(response.headers.get("content-type") || "").includes("text/html")) return response;

  const preview = await buildPreview(new URL(request.url));
  const html = await response.text();
  const body = stripStaticHead(html).replace(/<\/head>/i, `\n  ${renderHead(preview)}\n</head>`);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("etag");

  return new Response(body, { status: response.status, headers });
}

