import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import {
  HiArrowUpTray,
  HiCheckCircle,
  HiOutlineCamera,
  HiOutlineTrash,
  HiXMark,
} from "react-icons/hi2";
import { apiClient } from "../../lib/axios";
import {
  CATALOG_IMAGE_TYPES,
  MAX_BULK_CATALOG_FILES,
  MAX_BULK_SOURCE_BYTES,
  optimizeCatalogImage,
  productNameFromFilename,
} from "../../lib/catalogImage";
import { uploadCatalogImage } from "../../lib/uploadImage";
import type {
  ApiResponse,
  ManagedStorefrontItem,
  StorefrontItemStatus,
  StorefrontItemType,
} from "../../types";

type BulkPriceType = "CONTACT" | "FIXED";
type BulkRowStatus = "optimizing" | "ready" | "uploading" | "saving" | "error";

type BatchDefaults = {
  type: StorefrontItemType;
  category: string;
  unit: string;
  status: StorefrontItemStatus;
  priceType: BulkPriceType;
};

type BulkRow = BatchDefaults & {
  clientId: string;
  file: File;
  optimizedFile?: File;
  previewUrl: string;
  imageUrl?: string;
  name: string;
  price: number;
  shortDescription: string;
  description: string;
  sortOrder: number;
  statusMessage?: string;
  rowStatus: BulkRowStatus;
};

type BulkResult = {
  created: Array<{ clientId: string; item: ManagedStorefrontItem }>;
  failed: Array<{ clientId: string; message: string }>;
};

const initialDefaults: BatchDefaults = {
  type: "PRODUCT",
  category: "",
  unit: "",
  status: "ACTIVE",
  priceType: "CONTACT",
};

const inputClass = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100";
const labelClass = "block text-[11px] font-semibold text-gray-700";

function makeClientId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function messageFor(error: unknown): string {
  if (error instanceof AxiosError) return error.response?.data?.message || error.message;
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}

function rowError(row: BulkRow): string | null {
  if (!row.optimizedFile && !row.imageUrl) return row.statusMessage || "Foto belum siap.";
  if (row.name.trim().length < 2) return "Nama produk minimal 2 karakter.";
  if (row.category.trim().length < 2) return "Kategori minimal 2 karakter.";
  if (row.priceType === "FIXED" && (!Number.isInteger(row.price) || row.price <= 0)) {
    return "Masukkan harga lebih dari Rp0.";
  }
  return null;
}

async function runWithConcurrency<T>(
  values: T[],
  limit: number,
  worker: (value: T) => Promise<void>
): Promise<void> {
  let cursor = 0;
  async function run() {
    while (cursor < values.length) {
      const value = values[cursor];
      cursor += 1;
      await worker(value);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, run));
}

export function BulkItemUploadModal({
  userId,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  userId: string;
  nextSortOrder: number;
  onClose: () => void;
  onSaved: (count: number) => void;
}) {
  const [defaults, setDefaults] = useState<BatchDefaults>(initialDefaults);
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [closing, setClosing] = useState(false);
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState("");
  const previews = useRef(new Set<string>());
  const orderCursor = useRef(nextSortOrder);

  useEffect(() => () => {
    previews.current.forEach((url) => URL.revokeObjectURL(url));
    previews.current.clear();
  }, []);

  function updateRow(clientId: string, update: Partial<BulkRow>) {
    setRows((current) => current.map((row) => row.clientId === clientId ? { ...row, ...update } : row));
  }

  async function optimizeRow(row: BulkRow) {
    updateRow(row.clientId, { rowStatus: "optimizing", statusMessage: undefined });
    try {
      const optimizedFile = await optimizeCatalogImage(row.file);
      updateRow(row.clientId, { optimizedFile, rowStatus: "ready", statusMessage: undefined });
    } catch (error) {
      updateRow(row.clientId, { rowStatus: "error", statusMessage: messageFor(error) });
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    setFailure("");
    setNotice("");

    const available = MAX_BULK_CATALOG_FILES - rows.length;
    const selected = Array.from(fileList);
    if (available <= 0) {
      setFailure(`Maksimal ${MAX_BULK_CATALOG_FILES} foto dalam satu batch.`);
      return;
    }

    const accepted = selected
      .filter((file) => CATALOG_IMAGE_TYPES.has(file.type) && file.size <= MAX_BULK_SOURCE_BYTES)
      .slice(0, available);
    const rejected = selected.length - accepted.length;
    if (rejected > 0) {
      setFailure(`${rejected} foto dilewati karena format/ukuran tidak didukung atau melebihi batas batch.`);
    }

    const additions = accepted.map((file): BulkRow => {
      const previewUrl = URL.createObjectURL(file);
      previews.current.add(previewUrl);
      const sortOrder = orderCursor.current;
      orderCursor.current += 1;
      return {
        ...defaults,
        clientId: makeClientId(),
        file,
        previewUrl,
        name: productNameFromFilename(file.name),
        price: 0,
        shortDescription: "",
        description: "",
        sortOrder,
        rowStatus: "optimizing",
      };
    });
    setRows((current) => [...current, ...additions]);
    additions.forEach((row) => void optimizeRow(row));
  }

  function applyDefaults() {
    setRows((current) => current.map((row) => ({
      ...row,
      ...defaults,
      price: defaults.priceType === "CONTACT" ? 0 : row.price,
    })));
    setNotice("Default diterapkan ke semua produk dalam batch.");
    setFailure("");
  }

  async function cleanupImage(imageUrl: string) {
    try {
      await apiClient.delete("/pro/images", { data: { imageUrl } });
    } catch {
      // Cleanup is best effort; the server still verifies ownership before deletion.
    }
  }

  function removeRow(row: BulkRow) {
    if (busy) return;
    if (row.imageUrl) void cleanupImage(row.imageUrl);
    URL.revokeObjectURL(row.previewUrl);
    previews.current.delete(row.previewUrl);
    setRows((current) => current.filter((entry) => entry.clientId !== row.clientId));
  }

  async function close() {
    if (busy || closing) return;
    setClosing(true);
    await Promise.allSettled(rows.flatMap((row) => row.imageUrl ? [cleanupImage(row.imageUrl)] : []));
    rows.forEach((row) => {
      URL.revokeObjectURL(row.previewUrl);
      previews.current.delete(row.previewUrl);
    });
    onClose();
  }

  async function save() {
    if (busy || rows.length === 0) return;
    setBusy(true);
    setFailure("");
    setNotice("");

    const snapshot = rows.map((row) => ({ ...row }));
    const validRows: BulkRow[] = [];
    snapshot.forEach((row) => {
      const error = rowError(row);
      if (error) updateRow(row.clientId, { rowStatus: "error", statusMessage: error });
      else validRows.push(row);
    });

    if (validRows.length === 0) {
      setFailure("Lengkapi data produk yang ditandai sebelum menyimpan.");
      setBusy(false);
      return;
    }

    const uploadedUrls = new Map<string, string>();
    await runWithConcurrency(validRows, 3, async (row) => {
      if (row.imageUrl) {
        uploadedUrls.set(row.clientId, row.imageUrl);
        return;
      }
      updateRow(row.clientId, { rowStatus: "uploading", statusMessage: "Mengunggah foto…" });
      try {
        const imageUrl = await uploadCatalogImage(row.optimizedFile!, userId, "item");
        uploadedUrls.set(row.clientId, imageUrl);
        updateRow(row.clientId, { imageUrl, rowStatus: "saving", statusMessage: "Menyimpan produk…" });
      } catch (error) {
        updateRow(row.clientId, { rowStatus: "error", statusMessage: messageFor(error) });
      }
    });

    const readyToCreate = validRows.filter((row) => uploadedUrls.has(row.clientId));
    const localFailureCount = snapshot.length - readyToCreate.length;
    if (readyToCreate.length === 0) {
      setFailure("Tidak ada foto yang berhasil diunggah. Periksa koneksi lalu coba lagi.");
      setBusy(false);
      return;
    }

    readyToCreate.forEach((row) => updateRow(row.clientId, { rowStatus: "saving", statusMessage: "Menyimpan produk…" }));
    try {
      const response = await apiClient.post<ApiResponse<BulkResult>>("/pro/items/bulk", {
        items: readyToCreate.map((row) => ({
          clientId: row.clientId,
          type: row.type,
          name: row.name.trim(),
          category: row.category.trim(),
          shortDescription: row.shortDescription.trim(),
          description: row.description.trim(),
          priceType: row.priceType,
          price: row.priceType === "CONTACT" ? 0 : row.price,
          unit: row.unit.trim(),
          imageUrl: uploadedUrls.get(row.clientId),
          badge: "",
          status: row.status,
          sortOrder: row.sortOrder,
        })),
      });
      const result = response.data.data;
      const createdIds = new Set(result.created.map((entry) => entry.clientId));
      const failedById = new Map(result.failed.map((entry) => [entry.clientId, entry.message]));

      setRows((current) => current
        .filter((row) => {
          if (!createdIds.has(row.clientId)) return true;
          URL.revokeObjectURL(row.previewUrl);
          previews.current.delete(row.previewUrl);
          return false;
        })
        .map((row) => failedById.has(row.clientId)
          ? { ...row, imageUrl: uploadedUrls.get(row.clientId) ?? row.imageUrl, rowStatus: "error", statusMessage: failedById.get(row.clientId) }
          : row));

      if (result.created.length > 0) onSaved(result.created.length);
      const remainingFailureCount = localFailureCount + result.failed.length;
      if (remainingFailureCount > 0) {
        setFailure(`${remainingFailureCount} produk belum tersimpan. Perbaiki yang ditandai lalu coba lagi.`);
      } else {
        setNotice(`${result.created.length} produk berhasil ditambahkan.`);
      }
    } catch (error) {
      setRows((current) => current.map((row) => uploadedUrls.has(row.clientId)
        ? { ...row, imageUrl: uploadedUrls.get(row.clientId), rowStatus: "error", statusMessage: "Produk belum tersimpan. Coba lagi." }
        : row));
      setFailure(messageFor(error));
    } finally {
      setBusy(false);
    }
  }

  const preparing = rows.some((row) => row.rowStatus === "optimizing");
  const activeCount = rows.length;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-5" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-gray-950/55 backdrop-blur-sm" onClick={() => void close()} aria-label="Tutup" />
      <section className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-gray-50 shadow-2xl sm:rounded-3xl">
        <header className="flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-xl font-black text-gray-900">Upload banyak produk</h2>
            <p className="mt-1 text-xs text-gray-500">Satu foto untuk satu produk · maksimal {MAX_BULK_CATALOG_FILES} foto</p>
          </div>
          <button type="button" onClick={() => void close()} disabled={busy || closing} className="grid h-10 w-10 flex-none place-items-center rounded-full bg-gray-100 text-gray-500 disabled:opacity-40"><HiXMark className="h-5 w-5" /></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-7 sm:py-6">
          {(notice || failure) && (
            <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${failure ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>{failure || notice}</div>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h3 className="text-sm font-bold text-gray-900">Default untuk satu batch</h3><p className="mt-0.5 text-[11px] text-gray-500">Bisa diubah lagi pada masing-masing produk.</p></div>
              <button type="button" onClick={applyDefaults} disabled={rows.length === 0 || busy} className="rounded-lg border border-primary-200 px-3 py-2 text-xs font-bold text-primary-700 disabled:opacity-40">Terapkan ke semua</button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className={labelClass}>Jenis<select value={defaults.type} onChange={(event) => setDefaults({ ...defaults, type: event.target.value as StorefrontItemType })} className={inputClass}><option value="PRODUCT">Produk</option><option value="SERVICE">Jasa</option><option value="PACKAGE">Paket</option><option value="PROMO">Promo</option></select></label>
              <label className={labelClass}>Kategori<input value={defaults.category} onChange={(event) => setDefaults({ ...defaults, category: event.target.value })} className={inputClass} placeholder="Contoh: Camilan" /></label>
              <label className={labelClass}>Satuan<input value={defaults.unit} onChange={(event) => setDefaults({ ...defaults, unit: event.target.value })} className={inputClass} placeholder="pcs, box…" /></label>
              <label className={labelClass}>Status<select value={defaults.status} onChange={(event) => setDefaults({ ...defaults, status: event.target.value as StorefrontItemStatus })} className={inputClass}><option value="ACTIVE">Aktif</option><option value="HIDDEN">Disembunyikan</option><option value="SOLD_OUT">Tidak tersedia</option></select></label>
              <label className={labelClass}>Harga<select value={defaults.priceType} onChange={(event) => setDefaults({ ...defaults, priceType: event.target.value as BulkPriceType })} className={inputClass}><option value="CONTACT">Tanya harga</option><option value="FIXED">Cantumkan harga</option></select></label>
            </div>
          </section>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold text-gray-600">{activeCount}/{MAX_BULK_CATALOG_FILES} foto dipilih</p>
            <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-bold text-white ${activeCount >= MAX_BULK_CATALOG_FILES || busy ? "pointer-events-none opacity-40" : ""}`}>
              <HiArrowUpTray className="h-4 w-4" /> {activeCount ? "Tambah foto" : "Pilih banyak foto"}
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} className="hidden" />
            </label>
          </div>

          {rows.length === 0 ? (
            <label className="mt-4 grid min-h-56 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-gray-300 bg-white text-center hover:border-primary-300">
              <div><HiOutlineCamera className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-3 text-sm font-bold text-gray-700">Pilih foto produk sekaligus</p><p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP, atau AVIF · sumber maks. 25 MB/foto</p></div>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} className="hidden" />
            </label>
          ) : (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {rows.map((row, index) => (
                <article key={row.clientId} className={`rounded-2xl border bg-white p-3 shadow-sm ${row.rowStatus === "error" ? "border-red-200" : "border-gray-200"}`}>
                  <div className="flex gap-3">
                    <div className="relative h-28 w-28 flex-none overflow-hidden rounded-xl bg-gray-100">
                      <img src={row.previewUrl} alt="" className="h-full w-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-full bg-gray-950/70 px-2 py-1 text-[10px] font-bold text-white">{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <label className={`${labelClass} min-w-0 flex-1`}>Nama produk *<input value={row.name} disabled={busy} onChange={(event) => updateRow(row.clientId, { name: event.target.value, rowStatus: "ready", statusMessage: undefined })} className={inputClass} /></label>
                        <button type="button" onClick={() => removeRow(row)} disabled={busy} className="mt-5 grid h-9 w-9 flex-none place-items-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-40" aria-label={`Hapus ${row.name}`}><HiOutlineTrash className="h-4 w-4" /></button>
                      </div>
                      <label className={`${labelClass} mt-2`}>Kategori *<input value={row.category} disabled={busy} onChange={(event) => updateRow(row.clientId, { category: event.target.value, rowStatus: "ready", statusMessage: undefined })} className={inputClass} placeholder="Camilan, minuman…" /></label>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className={labelClass}>Mode harga<select value={row.priceType} disabled={busy} onChange={(event) => updateRow(row.clientId, { priceType: event.target.value as BulkPriceType, price: event.target.value === "CONTACT" ? 0 : row.price, rowStatus: "ready", statusMessage: undefined })} className={inputClass}><option value="CONTACT">Tanya harga</option><option value="FIXED">Cantumkan harga</option></select></label>
                    <label className={labelClass}>Harga (Rp)<input type="number" min={1} step={1} value={row.price || ""} disabled={busy || row.priceType === "CONTACT"} onChange={(event) => updateRow(row.clientId, { price: Number(event.target.value), rowStatus: "ready", statusMessage: undefined })} className={inputClass} placeholder={row.priceType === "CONTACT" ? "Tidak diperlukan" : "25000"} /></label>
                  </div>

                  <details className="mt-3 rounded-xl bg-gray-50 px-3 py-2">
                    <summary className="cursor-pointer text-xs font-bold text-gray-600">Detail opsional</summary>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className={labelClass}>Jenis<select value={row.type} disabled={busy} onChange={(event) => updateRow(row.clientId, { type: event.target.value as StorefrontItemType })} className={inputClass}><option value="PRODUCT">Produk</option><option value="SERVICE">Jasa</option><option value="PACKAGE">Paket</option><option value="PROMO">Promo</option></select></label>
                      <label className={labelClass}>Satuan<input value={row.unit} disabled={busy} onChange={(event) => updateRow(row.clientId, { unit: event.target.value })} className={inputClass} placeholder="pcs, box, botol…" /></label>
                      <label className={labelClass}>Status<select value={row.status} disabled={busy} onChange={(event) => updateRow(row.clientId, { status: event.target.value as StorefrontItemStatus })} className={inputClass}><option value="ACTIVE">Aktif</option><option value="HIDDEN">Disembunyikan</option><option value="SOLD_OUT">Tidak tersedia</option></select></label>
                      <label className={labelClass}>Ringkasan<input maxLength={240} value={row.shortDescription} disabled={busy} onChange={(event) => updateRow(row.clientId, { shortDescription: event.target.value })} className={inputClass} /></label>
                      <label className={`${labelClass} sm:col-span-2`}>Deskripsi<textarea maxLength={2000} value={row.description} disabled={busy} onChange={(event) => updateRow(row.clientId, { description: event.target.value })} className={`${inputClass} min-h-20 resize-y`} /></label>
                    </div>
                  </details>

                  <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${row.rowStatus === "error" ? "bg-red-50 text-red-700" : row.rowStatus === "ready" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {row.rowStatus === "ready" ? <HiCheckCircle className="h-4 w-4 flex-none" /> : <span className="h-3 w-3 flex-none animate-pulse rounded-full bg-current" />}
                    <span>{row.statusMessage || (row.rowStatus === "optimizing" ? "Mengoptimalkan foto…" : row.rowStatus === "ready" ? `Siap · ${(row.optimizedFile?.size ?? row.file.size) < 1024 * 1024 ? `${Math.round((row.optimizedFile?.size ?? row.file.size) / 1024)} KB` : `${((row.optimizedFile?.size ?? row.file.size) / 1024 / 1024).toFixed(1)} MB`}` : row.rowStatus === "uploading" ? "Mengunggah foto…" : "Menyimpan produk…")}</span>
                    {row.rowStatus === "error" && !row.optimizedFile && !row.imageUrl && <button type="button" onClick={() => void optimizeRow(row)} disabled={busy} className="ml-auto font-bold underline">Coba lagi</button>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="flex gap-3 border-t border-gray-200 bg-white px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 sm:justify-end sm:px-7">
          <button type="button" onClick={() => void close()} disabled={busy || closing} className="flex-1 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 disabled:opacity-40 sm:flex-none">Batal</button>
          <button type="button" onClick={() => void save()} disabled={busy || preparing || rows.length === 0} className="flex-1 rounded-xl bg-primary-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-40 sm:min-w-48 sm:flex-none">{busy ? "Memproses…" : preparing ? "Menyiapkan foto…" : `Simpan ${rows.length} produk`}</button>
        </footer>
      </section>
    </div>
  );
}
