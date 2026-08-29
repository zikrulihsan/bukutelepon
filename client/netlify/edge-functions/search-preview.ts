/**
 * Rewrites the <head> of `/search` so a shared link previews as the search
 * itself — "Rumah Sakit di Bandung" — instead of the app's generic blurb.
 *
 * The index.html Netlify serves is a static SPA shell, so chat crawlers
 * (WhatsApp, Telegram, Facebook) never see the React-rendered page. This edge
 * function fills the gap: it reads `q`, `category`, and `city` off the shared
 * URL and writes matching Open Graph tags before the HTML leaves the CDN.
 *
 * The card is deliberately kept in the compact, single-line shape: WhatsApp
 * only blows a preview up into the big square block when the image is large,
 * so the thumbnail stays a small square (192px) and twitter:card stays
 * "summary".
 */

const SITE_NAME = "CariKontak";
const THUMB_PATH = "/og-thumb.jpg";
/** Under ~300px, chat apps render the small inline card instead of the block. */
const THUMB_SIZE = "192";

/** Indonesian connectors that read wrong when title-cased mid-phrase. */
const SMALL_WORDS = new Set(["di", "ke", "dan", "atau", "dari", "yang", "untuk", "pada"]);

interface Preview {
  title: string;
  description: string;
  url: string;
  image: string;
}

function normalize(value: string | null, max: number): string {
  if (!value) return "";
  const trimmed = value.replace(/[\s+]+/g, " ").trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word, index) =>
      index > 0 && SMALL_WORDS.has(word.toLowerCase())
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPreview(url: URL): Preview {
  const origin = url.origin;
  const keyword = titleCase(
    normalize(url.searchParams.get("q"), 60) || normalize(url.searchParams.get("category"), 40)
  );
  const region = titleCase(normalize(url.searchParams.get("city"), 40));

  let title: string;
  let description: string;

  if (keyword && region) {
    title = `${keyword} di ${region} — ${SITE_NAME}`;
    description = `Nomor telepon & alamat ${keyword} di ${region}, lengkap dengan ulasan warga. Gratis, tanpa perlu daftar.`;
  } else if (keyword) {
    title = `${keyword} — ${SITE_NAME}`;
    description = `Nomor telepon & alamat ${keyword} dari direktori kontak warga. Gratis, tanpa perlu daftar.`;
  } else if (region) {
    title = `Kontak Penting di ${region} — ${SITE_NAME}`;
    description = `Cari nomor telepon rumah sakit, pemadam, PLN, dan layanan lain di ${region}. Gratis, tanpa perlu daftar.`;
  } else {
    title = `${SITE_NAME} — Direktori Kontak Kota`;
    description = "Temukan dan bagikan kontak penting di kotamu.";
  }

  return { title, description, url: url.href, image: `${origin}${THUMB_PATH}` };
}

function renderHead(preview: Preview): string {
  const title = escapeHtml(preview.title);
  const description = escapeHtml(preview.description);
  const url = escapeHtml(preview.url);
  const image = escapeHtml(preview.image);

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="id_ID" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="${THUMB_SIZE}" />`,
    `<meta property="og:image:height" content="${THUMB_SIZE}" />`,
    `<meta property="og:image:alt" content="${SITE_NAME}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join("\n  ");
}

/** Drops the shell's static tags so crawlers never see two of anything. */
function stripStaticHead(html: string): string {
  return html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+name="description"[^>]*>\s*/gi, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*>\s*/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>\s*/gi, "");
}

export default async function searchPreview(
  request: Request,
  context: { next: () => Promise<Response> }
): Promise<Response> {
  const response = await context.next();

  if (!(response.headers.get("content-type") || "").includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const preview = buildPreview(new URL(request.url));
  const body = stripStaticHead(html).replace(
    /<\/head>/i,
    `\n  ${renderHead(preview)}\n</head>`
  );

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("etag");

  return new Response(body, { status: response.status, headers });
}

export const config = { path: "/search" };
