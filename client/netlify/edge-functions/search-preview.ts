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

/** Used only when the shell lacks og:site_name; the real name comes from the region config at build time. */
const DEFAULT_SITE_NAME = "Direktori Kontak";
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

/** Reads a `<meta>` value the Vite build wrote into the SPA shell. */
function metaContent(html: string, attr: "name" | "property", key: string): string {
  const match = html.match(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`, "i"));
  if (!match) return "";
  return match[1]
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface Site {
  name: string;
  /** The single city this deployment serves, from the shell's app:region meta. */
  region: string;
}

function buildPreview(url: URL, site: Site): Preview {
  const origin = url.origin;
  const keyword = titleCase(
    normalize(url.searchParams.get("q"), 60) || normalize(url.searchParams.get("category"), 40)
  );
  const region = site.region || titleCase(normalize(url.searchParams.get("city"), 40));

  let title: string;
  let description: string;

  if (keyword && region) {
    title = `${keyword} di ${region} — ${site.name}`;
    description = `Nomor telepon & alamat ${keyword} di ${region}, lengkap dengan ulasan warga. Gratis, tanpa perlu daftar.`;
  } else if (keyword) {
    title = `${keyword} — ${site.name}`;
    description = `Nomor telepon & alamat ${keyword} dari direktori kontak warga. Gratis, tanpa perlu daftar.`;
  } else if (region) {
    title = `Kontak Penting di ${region} — ${site.name}`;
    description = `Cari nomor telepon rumah sakit, pemadam, PLN, dan layanan lain di ${region}. Gratis, tanpa perlu daftar.`;
  } else {
    title = `${site.name} — Direktori Kontak Kota`;
    description = "Temukan dan bagikan kontak penting di kotamu.";
  }

  return { title, description, url: url.href, image: `${origin}${THUMB_PATH}` };
}

function renderHead(preview: Preview, siteName: string): string {
  const site = escapeHtml(siteName);
  const title = escapeHtml(preview.title);
  const description = escapeHtml(preview.description);
  const url = escapeHtml(preview.url);
  const image = escapeHtml(preview.image);

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${site}" />`,
    `<meta property="og:locale" content="id_ID" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="${THUMB_SIZE}" />`,
    `<meta property="og:image:height" content="${THUMB_SIZE}" />`,
    `<meta property="og:image:alt" content="${site}" />`,
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
  const site: Site = {
    name: metaContent(html, "property", "og:site_name") || DEFAULT_SITE_NAME,
    region: metaContent(html, "name", "app:region"),
  };
  const preview = buildPreview(new URL(request.url), site);
  const body = stripStaticHead(html).replace(
    /<\/head>/i,
    `\n  ${renderHead(preview, site.name)}\n</head>`
  );

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("etag");

  return new Response(body, { status: response.status, headers });
}

export const config = { path: "/search" };
