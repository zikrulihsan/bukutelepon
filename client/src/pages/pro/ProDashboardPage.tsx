import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Link, Navigate } from "react-router-dom";
import {
  HiArrowTopRightOnSquare,
  HiCheckCircle,
  HiOutlineBuildingStorefront,
  HiOutlineCamera,
  HiOutlineCube,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineTrash,
  HiXMark,
} from "react-icons/hi2";
import { apiClient } from "../../lib/axios";
import { uploadCatalogImage } from "../../lib/uploadImage";
import { useAuth } from "../../hooks/useAuth";
import type {
  ApiResponse,
  BusinessStatus,
  ManagedBusiness,
  ManagedStorefrontItem,
  StorefrontItemStatus,
  StorefrontItemType,
  StorefrontPriceType,
} from "../../types";

type BusinessDraft = {
  name: string;
  slug: string;
  description: string;
  whatsapp: string;
  alternateWhatsapp: string;
  instagram: string;
  address: string;
  mapsUrl: string;
  openingHours: string;
  logoUrl: string;
  coverUrl: string;
  status: BusinessStatus;
};

type ItemDraft = {
  id?: string;
  type: StorefrontItemType;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  price: number;
  priceType: StorefrontPriceType;
  unit: string;
  imageUrl: string;
  badge: string;
  status: StorefrontItemStatus;
  sortOrder: number;
};

const emptyBusiness: BusinessDraft = {
  name: "",
  slug: "",
  description: "",
  whatsapp: "",
  alternateWhatsapp: "",
  instagram: "",
  address: "",
  mapsUrl: "",
  openingHours: "",
  logoUrl: "",
  coverUrl: "",
  status: "DRAFT",
};

const emptyItem: ItemDraft = {
  type: "PRODUCT",
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "",
  price: 0,
  priceType: "CONTACT",
  unit: "",
  imageUrl: "",
  badge: "",
  status: "ACTIVE",
  sortOrder: 0,
};

function errorMessage(error: unknown): string {
  if (error instanceof AxiosError) return error.response?.data?.message || error.message;
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}

function businessDraft(value: ManagedBusiness | null | undefined): BusinessDraft {
  if (!value) return emptyBusiness;
  return {
    name: value.name,
    slug: value.slug,
    description: value.description,
    whatsapp: value.whatsapp,
    alternateWhatsapp: value.alternateWhatsapp ?? "",
    instagram: value.instagram ?? "",
    address: value.address ?? "",
    mapsUrl: value.mapsUrl ?? "",
    openingHours: value.openingHours ?? "",
    logoUrl: value.logoUrl ?? "",
    coverUrl: value.coverUrl ?? "",
    status: value.status,
  };
}

function itemDraft(value?: ManagedStorefrontItem): ItemDraft {
  if (!value) return emptyItem;
  return {
    id: value.id,
    type: value.type,
    name: value.name,
    slug: value.slug,
    shortDescription: value.shortDescription,
    description: value.description,
    category: value.category,
    price: value.price,
    priceType: value.priceType,
    unit: value.unit ?? "",
    imageUrl: value.imageUrl ?? "",
    badge: value.badge ?? "",
    status: value.status,
    sortOrder: value.sortOrder,
  };
}

const inputClass = "mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100";
const labelClass = "block text-xs font-semibold text-gray-700";

export default function ProDashboardPage() {
  const { user, profile, loading } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"business" | "items">("business");
  const [businessForm, setBusinessForm] = useState<BusinessDraft>(emptyBusiness);
  const [itemForm, setItemForm] = useState<ItemDraft | null>(null);
  const [uploading, setUploading] = useState<"logo" | "cover" | "item" | null>(null);
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState("");

  const canManage = profile?.plan === "PRO" || profile?.role === "ADMIN";
  const businessQuery = useQuery<ApiResponse<ManagedBusiness | null>>({
    queryKey: ["pro", "business"],
    queryFn: async () => (await apiClient.get("/pro/business")).data,
    enabled: Boolean(user && canManage),
  });
  const managedBusiness = businessQuery.data?.data ?? null;

  useEffect(() => setBusinessForm(businessDraft(managedBusiness)), [managedBusiness]);

  const saveBusiness = useMutation({
    mutationFn: async (draft: BusinessDraft) => (await apiClient.put("/pro/business", draft)).data,
    onSuccess: (response: ApiResponse<ManagedBusiness>) => {
      queryClient.setQueryData(["pro", "business"], response);
      setNotice("Profil bisnis tersimpan.");
      setFailure("");
    },
    onError: (error) => setFailure(errorMessage(error)),
  });

  const saveItem = useMutation({
    mutationFn: async (draft: ItemDraft) => draft.id
      ? (await apiClient.put(`/pro/items/${draft.id}`, draft)).data
      : (await apiClient.post("/pro/items", draft)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pro", "business"] });
      setItemForm(null);
      setNotice("Item etalase tersimpan.");
      setFailure("");
    },
    onError: (error) => setFailure(errorMessage(error)),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/pro/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pro", "business"] });
      setNotice("Item dihapus dari etalase.");
    },
    onError: (error) => setFailure(errorMessage(error)),
  });

  async function upload(file: File | undefined, kind: "logo" | "cover" | "item") {
    if (!file || !user) return;
    setUploading(kind);
    setFailure("");
    try {
      const url = await uploadCatalogImage(file, user.id, kind);
      if (kind === "item") setItemForm((current) => current ? { ...current, imageUrl: url } : current);
      else setBusinessForm((current) => ({ ...current, [kind === "logo" ? "logoUrl" : "coverUrl"]: url }));
      setNotice("Foto selesai diunggah. Simpan formulir untuk menerapkan perubahan.");
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setUploading(null);
    }
  }

  function submitBusiness(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    saveBusiness.mutate(businessForm);
  }

  function submitItem(event: FormEvent) {
    event.preventDefault();
    if (!managedBusiness) {
      setFailure("Simpan profil bisnis terlebih dahulu sebelum menambah item.");
      return;
    }
    if (itemForm) saveItem.mutate(itemForm);
  }

  if (loading) return <div className="mx-auto min-h-screen max-w-5xl px-4 py-12"><div className="h-40 animate-pulse rounded-3xl bg-gray-100" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  if (!canManage) {
    return (
      <div className="mx-auto min-h-screen max-w-lg px-5 pb-28 pt-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-700"><HiOutlineBuildingStorefront className="h-8 w-8" /></div>
        <h1 className="mt-5 text-2xl font-bold text-gray-900">Fitur khusus Akun Pro</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">Admin perlu mengaktifkan paket Pro pada akun Anda sebelum profil bisnis, produk, dan foto dapat dikelola.</p>
        <Link to="/account" className="mt-6 inline-flex rounded-xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white">Kembali ke akun</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-9">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#173f30] to-[#287456] px-5 py-6 text-white shadow-lg sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950">Akun Pro</span>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">Kelola etalase bisnis</h1>
              <p className="mt-1 max-w-xl text-sm text-emerald-50/80">Perbarui informasi bisnis dan produk tanpa mengubah kode website.</p>
            </div>
            {managedBusiness?.status === "ACTIVE" && (
              <a href={`/catalog?store=${encodeURIComponent(managedBusiness.slug)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold ring-1 ring-white/20 hover:bg-white/20">
                Lihat etalase <HiArrowTopRightOnSquare className="h-4 w-4" />
              </a>
            )}
          </div>
        </header>

        <div className="mt-5 flex gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
          <button onClick={() => setTab("business")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${tab === "business" ? "bg-primary-700 text-white" : "text-gray-500 hover:bg-gray-50"}`}>Profil bisnis</button>
          <button onClick={() => setTab("items")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold ${tab === "items" ? "bg-primary-700 text-white" : "text-gray-500 hover:bg-gray-50"}`}>Produk & jasa ({managedBusiness?.items.length ?? 0})</button>
        </div>

        {(notice || failure) && (
          <div className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${failure ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
            {failure ? <HiXMark className="mt-0.5 h-4 w-4 flex-none" /> : <HiCheckCircle className="mt-0.5 h-4 w-4 flex-none" />}
            <span>{failure || notice}</span>
          </div>
        )}

        {tab === "business" ? (
          <form onSubmit={submitBusiness} className="mt-5 space-y-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>Nama bisnis *<input required minLength={2} value={businessForm.name} onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })} className={inputClass} placeholder="Contoh: Toko Evi" /></label>
              <label className={labelClass}>Alamat pendek etalase<input value={businessForm.slug} onChange={(e) => setBusinessForm({ ...businessForm, slug: e.target.value })} className={inputClass} placeholder="toko-evi" /><span className="mt-1 block text-[10px] font-normal text-gray-400">Otomatis dibuat dari nama jika dikosongkan.</span></label>
            </div>
            <label className={labelClass}>Deskripsi bisnis *<textarea required minLength={10} maxLength={1000} value={businessForm.description} onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })} className={`${inputClass} min-h-28 resize-y`} placeholder="Ceritakan produk atau layanan utama bisnis Anda." /></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>WhatsApp utama *<input required value={businessForm.whatsapp} onChange={(e) => setBusinessForm({ ...businessForm, whatsapp: e.target.value })} className={inputClass} placeholder="081909020111" /></label>
              <label className={labelClass}>WhatsApp alternatif<input value={businessForm.alternateWhatsapp} onChange={(e) => setBusinessForm({ ...businessForm, alternateWhatsapp: e.target.value })} className={inputClass} /></label>
              <label className={labelClass}>Instagram<input value={businessForm.instagram} onChange={(e) => setBusinessForm({ ...businessForm, instagram: e.target.value })} className={inputClass} placeholder="oleh_oleh.sumbawa" /></label>
              <label className={labelClass}>Jam operasional<input value={businessForm.openingHours} onChange={(e) => setBusinessForm({ ...businessForm, openingHours: e.target.value })} className={inputClass} placeholder="Senin–Minggu, 08.00–21.00" /></label>
            </div>
            <label className={labelClass}>Alamat toko<textarea maxLength={500} value={businessForm.address} onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })} className={`${inputClass} min-h-20 resize-y`} /></label>
            <label className={labelClass}>Link Google Maps<input type="url" value={businessForm.mapsUrl} onChange={(e) => setBusinessForm({ ...businessForm, mapsUrl: e.target.value })} className={inputClass} placeholder="https://maps.google.com/..." /></label>

            <div className="grid gap-4 sm:grid-cols-2">
              <PhotoField label="Logo bisnis" value={businessForm.logoUrl} busy={uploading === "logo"} onFile={(file) => upload(file, "logo")} onClear={() => setBusinessForm({ ...businessForm, logoUrl: "" })} />
              <PhotoField label="Foto sampul" value={businessForm.coverUrl} busy={uploading === "cover"} onFile={(file) => upload(file, "cover")} onClear={() => setBusinessForm({ ...businessForm, coverUrl: "" })} wide />
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-end sm:justify-between">
              <label className={`${labelClass} sm:w-64`}>Status etalase<select value={businessForm.status} onChange={(e) => setBusinessForm({ ...businessForm, status: e.target.value as BusinessStatus })} className={inputClass}><option value="DRAFT">Draf (belum publik)</option><option value="ACTIVE">Terbitkan</option><option value="HIDDEN">Sembunyikan sementara</option></select></label>
              <button disabled={saveBusiness.isPending || Boolean(uploading)} className="rounded-xl bg-primary-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-800 disabled:opacity-50">{saveBusiness.isPending ? "Menyimpan…" : managedBusiness ? "Simpan perubahan" : "Buat etalase"}</button>
            </div>
          </form>
        ) : (
          <section className="mt-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><h2 className="text-lg font-bold text-gray-900">Isi etalase</h2><p className="text-xs text-gray-500">Produk, jasa, paket, atau promo.</p></div>
              <button onClick={() => setItemForm(itemDraft())} disabled={!managedBusiness} className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"><HiOutlinePlus className="h-4 w-4" /> Tambah item</button>
            </div>
            {!managedBusiness ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center text-sm text-gray-500">Simpan profil bisnis lebih dulu, lalu tambahkan isi etalase.</div>
            ) : managedBusiness.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center"><HiOutlineCube className="mx-auto h-8 w-8 text-gray-300" /><p className="mt-3 text-sm font-semibold text-gray-700">Belum ada item</p><p className="mt-1 text-xs text-gray-500">Tambahkan produk unggulan pertama Anda.</p></div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {managedBusiness.items.map((item) => (
                  <article key={item.id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="h-24 w-24 flex-none overflow-hidden rounded-xl bg-gray-100">{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-gray-300"><HiOutlineCamera className="h-7 w-7" /></div>}</div>
                    <div className="min-w-0 flex-1 py-0.5"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-bold text-gray-900">{item.name}</p><p className="mt-0.5 text-[11px] text-gray-500">{item.category} · {item.type}</p></div>{item.status === "ACTIVE" ? <HiOutlineEye className="h-4 w-4 flex-none text-green-600" /> : <HiOutlineEyeSlash className="h-4 w-4 flex-none text-gray-400" />}</div><p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">{item.shortDescription}</p><div className="mt-2 flex gap-2"><button onClick={() => setItemForm(itemDraft(item))} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700"><HiOutlinePencilSquare className="h-4 w-4" /> Edit</button><button onClick={() => window.confirm(`Hapus ${item.name}?`) && deleteItem.mutate(item.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><HiOutlineTrash className="h-4 w-4" /> Hapus</button></div></div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {itemForm && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-5" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-gray-950/50 backdrop-blur-sm" onClick={() => setItemForm(null)} aria-label="Tutup" />
          <form onSubmit={submitItem} className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-7">
            <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold text-gray-900">{itemForm.id ? "Edit item" : "Tambah item"}</h2><p className="text-xs text-gray-500">Informasi yang tampil di etalase publik.</p></div><button type="button" onClick={() => setItemForm(null)} className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-500"><HiXMark className="h-5 w-5" /></button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>Jenis<select value={itemForm.type} onChange={(e) => setItemForm({ ...itemForm, type: e.target.value as StorefrontItemType })} className={inputClass}><option value="PRODUCT">Produk</option><option value="SERVICE">Jasa</option><option value="PACKAGE">Paket</option><option value="PROMO">Promo</option></select></label>
              <label className={labelClass}>Nama *<input required minLength={2} value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} className={inputClass} /></label>
              <label className={labelClass}>Slug<input value={itemForm.slug} onChange={(e) => setItemForm({ ...itemForm, slug: e.target.value })} className={inputClass} placeholder="otomatis-dari-nama" /></label>
              <label className={labelClass}>Kategori *<input required value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} className={inputClass} placeholder="Madu, Camilan, Jasa…" /></label>
            </div>
            <label className={`${labelClass} mt-4`}>Ringkasan *<input required maxLength={240} value={itemForm.shortDescription} onChange={(e) => setItemForm({ ...itemForm, shortDescription: e.target.value })} className={inputClass} /></label>
            <label className={`${labelClass} mt-4`}>Deskripsi *<textarea required maxLength={2000} value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} className={`${inputClass} min-h-24 resize-y`} /></label>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <label className={labelClass}>Tipe harga<select value={itemForm.priceType} onChange={(e) => setItemForm({ ...itemForm, priceType: e.target.value as StorefrontPriceType })} className={inputClass}><option value="CONTACT">Tanya harga</option><option value="FIXED">Harga tetap</option><option value="STARTING_FROM">Mulai dari</option><option value="FREE">Gratis</option></select></label>
              <label className={labelClass}>Harga (Rp)<input type="number" min={0} value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })} disabled={itemForm.priceType === "CONTACT" || itemForm.priceType === "FREE"} className={inputClass} /></label>
              <label className={labelClass}>Satuan<input value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} className={inputClass} placeholder="box, botol, sesi" /></label>
              <label className={labelClass}>Badge<input value={itemForm.badge} onChange={(e) => setItemForm({ ...itemForm, badge: e.target.value })} className={inputClass} placeholder="Best Seller" /></label>
              <label className={labelClass}>Status<select value={itemForm.status} onChange={(e) => setItemForm({ ...itemForm, status: e.target.value as StorefrontItemStatus })} className={inputClass}><option value="ACTIVE">Aktif</option><option value="SOLD_OUT">Stok habis</option><option value="HIDDEN">Disembunyikan</option></select></label>
              <label className={labelClass}>Urutan<input type="number" min={0} value={itemForm.sortOrder} onChange={(e) => setItemForm({ ...itemForm, sortOrder: Number(e.target.value) })} className={inputClass} /></label>
            </div>
            <div className="mt-4"><PhotoField label="Foto item" value={itemForm.imageUrl} busy={uploading === "item"} onFile={(file) => upload(file, "item")} onClear={() => setItemForm({ ...itemForm, imageUrl: "" })} wide /></div>
            <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5"><button type="button" onClick={() => setItemForm(null)} className="flex-1 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600">Batal</button><button disabled={saveItem.isPending || Boolean(uploading)} className="flex-1 rounded-xl bg-primary-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saveItem.isPending ? "Menyimpan…" : "Simpan item"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

function PhotoField({ label, value, busy, onFile, onClear, wide = false }: { label: string; value: string; busy: boolean; onFile: (file?: File) => void; onClear: () => void; wide?: boolean }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className={`mt-1.5 overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50 ${wide ? "aspect-[2.3]" : "aspect-square max-h-52"}`}>
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-center text-gray-400"><div><HiOutlineCamera className="mx-auto h-7 w-7" /><p className="mt-2 text-xs">Belum ada foto</p></div></div>}
      </div>
      <div className="mt-2 flex gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-primary-300"><HiOutlineCamera className="h-4 w-4" />{busy ? "Mengunggah…" : value ? "Ganti foto" : "Upload foto"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={(event) => { onFile(event.target.files?.[0]); event.target.value = ""; }} className="hidden" /></label>
        {value && <button type="button" onClick={onClear} className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600">Hapus</button>}
      </div>
      <p className="mt-1 text-[10px] text-gray-400">JPG, PNG, WebP, atau AVIF. Maks. 5 MB.</p>
    </div>
  );
}
