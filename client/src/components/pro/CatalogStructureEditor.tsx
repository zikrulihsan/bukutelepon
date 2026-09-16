import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  HiArrowDown,
  HiArrowUp,
  HiCheckCircle,
  HiOutlineCamera,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineSquares2X2,
  HiOutlineTrash,
  HiXMark,
} from "react-icons/hi2";
import { apiClient } from "../../lib/axios";
import { uploadCatalogImage } from "../../lib/uploadImage";
import type {
  ApiResponse,
  CatalogLayout,
  CatalogPreset,
  CatalogSectionStatus,
  CatalogSectionType,
  CatalogTheme,
  ManagedBusiness,
  ManagedCatalogSection,
} from "../../types";

type SectionDraft = {
  id?: string;
  type: CatalogSectionType;
  title: string;
  subtitle: string;
  category: string;
  layout: CatalogLayout;
  imageUrl: string;
  badge: string;
  ctaLabel: string;
  ctaUrl: string;
  scheduleLabel: string;
  startsAt: string;
  endsAt: string;
  status: CatalogSectionStatus;
  sortOrder: number;
};

const presetOptions: Array<{ value: CatalogPreset; title: string; copy: string; icon: string }> = [
  { value: "RESTAURANT", title: "Restoran", copy: "Menu padat dan cepat dipindai", icon: "☕" },
  { value: "SERVICE", title: "Jasa", copy: "Layanan, paket, dan konsultasi", icon: "✂️" },
  { value: "RETAIL", title: "Retail", copy: "Produk visual dan koleksi", icon: "🛍️" },
  { value: "ACTIVITY", title: "Aktivitas", copy: "Jadwal, kapasitas, dan reservasi", icon: "🎟️" },
];

const themeOptions: Array<{ value: CatalogTheme; title: string; copy: string; colors: string[] }> = [
  { value: "MODERN", title: "Modern", copy: "Sans-serif, bersih, dan kontras", colors: ["#0B1220", "#0F766E", "#ECFEFF"] },
  { value: "WARM", title: "Warm", copy: "Organik, ramah, dan editorial", colors: ["#18392D", "#B56D3C", "#F5EFE4"] },
  { value: "MINIMAL", title: "Minimal", copy: "Monokrom dan fokus pada isi", colors: ["#111111", "#6B7280", "#FFFFFF"] },
  { value: "BOLD", title: "Bold", copy: "Ekspresif, gelap, dan penuh energi", colors: ["#22113D", "#F05A28", "#FFF2D8"] },
];

const sectionTypeLabels: Record<CatalogSectionType, string> = {
  ITEM_GROUP: "Grup item",
  PROMOTION: "Promosi",
  ACTIVITY: "Aktivitas",
  INFORMATION: "Informasi",
};

const inputClass = "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100";
const labelClass = "block text-xs font-semibold text-gray-700";

function errorMessage(error: unknown): string {
  if (error instanceof AxiosError) return error.response?.data?.message || error.message;
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}

function toLocalDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function sectionDraft(value: ManagedCatalogSection | undefined, business: ManagedBusiness): SectionDraft {
  if (!value) return {
    type: "ITEM_GROUP",
    title: "",
    subtitle: "",
    category: business.items[0]?.category ?? "",
    layout: business.defaultItemLayout,
    imageUrl: "",
    badge: "",
    ctaLabel: "",
    ctaUrl: "",
    scheduleLabel: "",
    startsAt: "",
    endsAt: "",
    status: "ACTIVE",
    sortOrder: business.sections.length,
  };
  return {
    id: value.id,
    type: value.type,
    title: value.title,
    subtitle: value.subtitle ?? "",
    category: value.category ?? "",
    layout: value.layout,
    imageUrl: value.imageUrl ?? "",
    badge: value.badge ?? "",
    ctaLabel: value.ctaLabel ?? "",
    ctaUrl: value.ctaUrl ?? "",
    scheduleLabel: value.scheduleLabel ?? "",
    startsAt: toLocalDate(value.startsAt),
    endsAt: toLocalDate(value.endsAt),
    status: value.status,
    sortOrder: value.sortOrder,
  };
}

export function CatalogStructureEditor({ business, userId }: { business: ManagedBusiness; userId: string }) {
  const queryClient = useQueryClient();
  const [preset, setPreset] = useState<CatalogPreset>(business.catalogPreset);
  const [defaultLayout, setDefaultLayout] = useState<CatalogLayout>(business.defaultItemLayout);
  const [theme, setTheme] = useState<CatalogTheme>(business.catalogTheme);
  const [accent, setAccent] = useState(business.catalogAccent);
  const [draft, setDraft] = useState<SectionDraft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState("");
  const categories = useMemo(() => [...new Set(business.items.map((item) => item.category))], [business.items]);
  const validAccent = /^#[0-9A-F]{6}$/.test(accent);

  useEffect(() => {
    setPreset(business.catalogPreset);
    setDefaultLayout(business.defaultItemLayout);
    setTheme(business.catalogTheme);
    setAccent(business.catalogAccent);
  }, [business.catalogAccent, business.catalogPreset, business.catalogTheme, business.defaultItemLayout]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["pro", "business"] });

  const savePresentation = useMutation({
    mutationFn: async () => (await apiClient.put("/pro/business/presentation", { catalogPreset: preset, defaultItemLayout: defaultLayout, catalogTheme: theme, catalogAccent: accent })).data,
    onSuccess: (response: ApiResponse<ManagedBusiness>) => {
      queryClient.setQueryData(["pro", "business"], response);
      setNotice("Preset dan tampilan default tersimpan."); setFailure("");
    },
    onError: (error) => setFailure(errorMessage(error)),
  });

  const saveSection = useMutation({
    mutationFn: async (value: SectionDraft) => {
      const payload = {
        ...value,
        startsAt: value.startsAt ? new Date(value.startsAt).toISOString() : "",
        endsAt: value.endsAt ? new Date(value.endsAt).toISOString() : "",
      };
      return value.id ? apiClient.put(`/pro/sections/${value.id}`, payload) : apiClient.post("/pro/sections", payload);
    },
    onSuccess: () => { refresh(); setDraft(null); setNotice("Section katalog tersimpan."); setFailure(""); },
    onError: (error) => setFailure(errorMessage(error)),
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/pro/sections/${id}`),
    onSuccess: () => { refresh(); setNotice("Section dihapus."); setFailure(""); },
    onError: (error) => setFailure(errorMessage(error)),
  });

  const reorder = useMutation({
    mutationFn: async (orderedIds: string[]) => apiClient.put("/pro/sections/reorder", { orderedIds }),
    onSuccess: () => refresh(),
    onError: (error) => setFailure(errorMessage(error)),
  });

  function move(index: number, delta: number) {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= business.sections.length) return;
    const ordered = [...business.sections];
    [ordered[index], ordered[nextIndex]] = [ordered[nextIndex], ordered[index]];
    reorder.mutate(ordered.map((section) => section.id));
  }

  async function uploadSectionImage(file?: File) {
    if (!file || !draft) return;
    setUploading(true); setFailure("");
    try {
      const imageUrl = await uploadCatalogImage(file, userId, "section");
      setDraft((current) => current ? { ...current, imageUrl } : current);
    } catch (error) { setFailure(errorMessage(error)); }
    finally { setUploading(false); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (draft) saveSection.mutate(draft);
  }

  return (
    <section className="mt-5 space-y-5">
      {(notice || failure) && <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${failure ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{failure ? <HiXMark className="mt-0.5 h-4 w-4" /> : <HiCheckCircle className="mt-0.5 h-4 w-4" />}<span>{failure || notice}</span></div>}

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary-700">Preset usaha</p><h2 className="mt-1 text-lg font-bold text-gray-900">Pilih pola awal katalog</h2><p className="mt-1 text-xs text-gray-500">Preset menentukan bahasa dan tampilan default; setiap grup tetap dapat memakai row atau card.</p></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {presetOptions.map((option) => <button key={option.value} type="button" onClick={() => setPreset(option.value)} className={`rounded-2xl border p-3 text-left transition ${preset === option.value ? "border-primary-500 bg-primary-50 ring-2 ring-primary-100" : "border-gray-200 hover:border-gray-300"}`}><span className="text-xl">{option.icon}</span><strong className="mt-2 block text-sm text-gray-900">{option.title}</strong><span className="mt-1 block text-[10px] leading-4 text-gray-500">{option.copy}</span></button>)}
        </div>
        <div className="mt-6 border-t border-gray-100 pt-5"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary-700">Tema visual</p><h3 className="mt-1 text-base font-bold text-gray-900">Pilih karakter desain</h3><p className="mt-1 text-xs text-gray-500">Tema mengubah tipografi, bentuk komponen, kepadatan, dan treatment warna.</p></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {themeOptions.map((option) => <button key={option.value} type="button" onClick={() => { setTheme(option.value); setAccent(option.colors[1]); }} className={`rounded-2xl border p-3 text-left transition ${theme === option.value ? "border-primary-500 bg-primary-50 ring-2 ring-primary-100" : "border-gray-200 hover:border-gray-300"}`}><span className="flex overflow-hidden rounded-full">{option.colors.map((color) => <span key={color} className="h-5 flex-1" style={{ backgroundColor: color }} />)}</span><strong className="mt-3 block text-sm text-gray-900">{option.title}</strong><span className="mt-1 block text-[10px] leading-4 text-gray-500">{option.copy}</span></button>)}
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2"><label className={labelClass}>Tampilan grup baru<select value={defaultLayout} onChange={(event) => setDefaultLayout(event.target.value as CatalogLayout)} className={inputClass}><option value="ROW">Row / daftar</option><option value="CARD">Card / grid</option></select></label><label className={labelClass}>Warna aksen<div className="mt-1.5 flex h-[46px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-2"><input type="color" value={accent} onChange={(event) => setAccent(event.target.value.toUpperCase())} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" /><input value={accent} onChange={(event) => setAccent(event.target.value.toUpperCase())} pattern="#[0-9A-Fa-f]{6}" className="min-w-0 flex-1 bg-transparent text-sm font-semibold uppercase text-gray-700 outline-none" /></div></label></div>
          <button type="button" onClick={() => savePresentation.mutate()} disabled={savePresentation.isPending || !validAccent} className="rounded-xl bg-primary-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{savePresentation.isPending ? "Menyimpan…" : validAccent ? "Simpan tampilan" : "Cek warna aksen"}</button>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary-700">Susunan halaman</p><h2 className="mt-1 text-lg font-bold text-gray-900">Section katalog</h2><p className="mt-1 text-xs text-gray-500">Urutkan grup item, promosi, aktivitas, dan informasi.</p></div><button type="button" onClick={() => setDraft(sectionDraft(undefined, business))} className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-bold text-white"><HiOutlinePlus className="h-4 w-4" />Tambah section</button></div>

        {business.sections.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-gray-300 px-5 py-10 text-center"><HiOutlineSquares2X2 className="mx-auto h-8 w-8 text-gray-300" /><p className="mt-3 text-sm font-semibold text-gray-700">Belum ada section khusus</p><p className="mt-1 text-xs text-gray-500">Katalog publik sementara mengelompokkan item berdasarkan kategori.</p></div> : <div className="mt-5 space-y-2">{business.sections.map((section, index) => <article key={section.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3"><div className="grid h-12 w-12 flex-none place-items-center overflow-hidden rounded-xl bg-gray-100 text-lg">{section.imageUrl ? <img src={section.imageUrl} alt="" className="h-full w-full object-cover" /> : section.type === "PROMOTION" ? "%" : section.type === "ACTIVITY" ? "◷" : section.type === "INFORMATION" ? "i" : "☷"}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-bold text-gray-900">{section.title}</p>{section.status === "ACTIVE" ? <HiOutlineEye className="h-4 w-4 flex-none text-green-600" /> : <HiOutlineEyeSlash className="h-4 w-4 flex-none text-gray-400" />}</div><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{sectionTypeLabels[section.type]}{section.type === "ITEM_GROUP" ? ` · ${section.layout}` : ""}</p></div><div className="flex flex-none items-center gap-1"><button type="button" onClick={() => move(index, -1)} disabled={index === 0 || reorder.isPending} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-25" aria-label="Naikkan"><HiArrowUp className="h-4 w-4" /></button><button type="button" onClick={() => move(index, 1)} disabled={index === business.sections.length - 1 || reorder.isPending} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-25" aria-label="Turunkan"><HiArrowDown className="h-4 w-4" /></button><button type="button" onClick={() => setDraft(sectionDraft(section, business))} className="grid h-8 w-8 place-items-center rounded-lg text-primary-700 hover:bg-primary-50" aria-label="Edit"><HiOutlinePencilSquare className="h-4 w-4" /></button><button type="button" onClick={() => window.confirm(`Hapus section ${section.title}?`) && deleteSection.mutate(section.id)} className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-red-50" aria-label="Hapus"><HiOutlineTrash className="h-4 w-4" /></button></div></article>)}</div>}
      </div>

      {draft && <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-5" role="dialog" aria-modal="true"><button type="button" className="absolute inset-0 bg-gray-950/55 backdrop-blur-sm" onClick={() => setDraft(null)} aria-label="Tutup" /><form onSubmit={submit} className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-gray-900">{draft.id ? "Edit section" : "Tambah section"}</h2><p className="text-xs text-gray-500">Komponen ini akan tampil di katalog publik.</p></div><button type="button" onClick={() => setDraft(null)} className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-500"><HiXMark className="h-5 w-5" /></button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className={labelClass}>Jenis section<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as CatalogSectionType })} className={inputClass}><option value="ITEM_GROUP">Grup item</option><option value="PROMOTION">Promosi</option><option value="ACTIVITY">Aktivitas</option><option value="INFORMATION">Informasi</option></select></label><label className={labelClass}>Judul *<input required minLength={2} maxLength={160} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className={inputClass} placeholder={draft.type === "ITEM_GROUP" ? "Coffee" : "Promo sarapan"} /></label></div>
        <label className={`${labelClass} mt-4`}>Deskripsi<textarea maxLength={500} value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} className={`${inputClass} min-h-20 resize-y`} /></label>
        {draft.type === "ITEM_GROUP" && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className={labelClass}>Kategori item *{categories.length > 0 ? <select required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className={inputClass}>{categories.map((category) => <option key={category}>{category}</option>)}</select> : <input required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className={inputClass} placeholder="Coffee" />}</label><label className={labelClass}>Layout<select value={draft.layout} onChange={(event) => setDraft({ ...draft, layout: event.target.value as CatalogLayout })} className={inputClass}><option value="ROW">Row / daftar</option><option value="CARD">Card / grid</option></select></label></div>}
        {(draft.type === "PROMOTION" || draft.type === "ACTIVITY" || draft.type === "INFORMATION") && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className={labelClass}>Badge<input maxLength={40} value={draft.badge} onChange={(event) => setDraft({ ...draft, badge: event.target.value })} className={inputClass} placeholder={draft.type === "ACTIVITY" ? "JUMAT" : "PROMO"} /></label><label className={labelClass}>Label tombol<input maxLength={80} value={draft.ctaLabel} onChange={(event) => setDraft({ ...draft, ctaLabel: event.target.value })} className={inputClass} placeholder="Reservasi" /></label><label className={labelClass}>Tujuan tombol<input type="url" value={draft.ctaUrl} onChange={(event) => setDraft({ ...draft, ctaUrl: event.target.value })} className={inputClass} placeholder="Kosongkan untuk WhatsApp" /></label>{draft.type === "ACTIVITY" && <label className={labelClass}>Jadwal / kapasitas<input maxLength={120} value={draft.scheduleLabel} onChange={(event) => setDraft({ ...draft, scheduleLabel: event.target.value })} className={inputClass} placeholder="Jumat, 16.00 · 12 kursi" /></label>}</div>}
        {(draft.type === "PROMOTION" || draft.type === "ACTIVITY") && <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className={labelClass}>Mulai tampil<input type="datetime-local" value={draft.startsAt} onChange={(event) => setDraft({ ...draft, startsAt: event.target.value })} className={inputClass} /></label><label className={labelClass}>Selesai tampil<input type="datetime-local" value={draft.endsAt} onChange={(event) => setDraft({ ...draft, endsAt: event.target.value })} className={inputClass} /></label></div>}
        <div className="mt-4"><p className={labelClass}>Gambar section</p><div className="mt-1.5 aspect-[2.4] overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">{draft.imageUrl ? <img src={draft.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-gray-400"><HiOutlineCamera className="h-7 w-7" /></div>}</div><div className="mt-2 flex gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"><HiOutlineCamera className="h-4 w-4" />{uploading ? "Mengunggah…" : "Upload gambar"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading} onChange={(event) => { uploadSectionImage(event.target.files?.[0]); event.target.value = ""; }} className="hidden" /></label>{draft.imageUrl && <button type="button" onClick={() => setDraft({ ...draft, imageUrl: "" })} className="px-3 py-2 text-xs font-semibold text-red-600">Hapus</button>}</div></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className={labelClass}>Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as CatalogSectionStatus })} className={inputClass}><option value="ACTIVE">Aktif</option><option value="HIDDEN">Disembunyikan</option></select></label><label className={labelClass}>Urutan<input type="number" min={0} value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} className={inputClass} /></label></div>
        <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5"><button type="button" onClick={() => setDraft(null)} className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600">Batal</button><button disabled={saveSection.isPending || uploading} className="flex-1 rounded-xl bg-primary-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{saveSection.isPending ? "Menyimpan…" : "Simpan section"}</button></div>
      </form></div>}
    </section>
  );
}
