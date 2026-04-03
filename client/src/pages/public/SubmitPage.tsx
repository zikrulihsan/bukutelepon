import { useState, useEffect, useRef, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { useAuth } from "../../hooks/useAuth";
import { useCity } from "../../context/CityContext";
import { Badge } from "../../components/ui/Badge";
import type { City, Category, Contact } from "../../types";
import { HiOutlinePlusCircle, HiXMark, HiCheck, HiOutlineUsers, HiOutlineCloudArrowUp } from "react-icons/hi2";
import { ImSpinner2 } from "react-icons/im";

interface ImportedContact {
  name: string;
  phone: string;
  address?: string;
  selected: boolean;
}

function parseVcf(text: string): ImportedContact[] {
  const contacts: ImportedContact[] = [];
  const cards = text.split("BEGIN:VCARD");

  for (const card of cards) {
    if (!card.includes("END:VCARD")) continue;

    let name = "";
    let phone = "";
    let address = "";

    const lines = card.split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith("FN:") || line.startsWith("FN;")) {
        const idx = line.indexOf(":");
        if (idx !== -1) name = line.slice(idx + 1).trim();
      }
      if (!name && line.startsWith("N:")) {
        const parts = line.replace("N:", "").split(";");
        name = [parts[1], parts[0]].filter(Boolean).join(" ").trim();
      }
      if (line.startsWith("TEL") && !phone) {
        const idx = line.indexOf(":");
        if (idx !== -1) phone = line.slice(idx + 1).trim();
      }
      if (line.startsWith("ADR") && !address) {
        const idx = line.indexOf(":");
        if (idx !== -1) {
          address = line.slice(idx + 1).split(";").filter(Boolean).join(", ").trim();
        }
      }
    }

    if (name && phone) {
      contacts.push({ name, phone, address: address || undefined, selected: true });
    }
  }
  return contacts;
}

function parseCsv(text: string): ImportedContact[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes("name") || header.includes("nama") || header.includes("phone");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const results: ImportedContact[] = [];
  for (const line of dataLines) {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length >= 2 && cols[0].length > 0 && cols[1].length > 0) {
      results.push({ name: cols[0], phone: cols[1], address: cols[2] || undefined, selected: true });
    }
  }
  return results;
}

function hasContactPicker(): boolean {
  return "contacts" in navigator && "ContactsManager" in window;
}

type Tab = "riwayat" | "manual" | "import";

export default function SubmitPage() {
  const { user, loading: authLoading } = useAuth();
  const { citySlug } = useCity();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: citiesData } = useQuery<{ success: boolean; data: City[] }>({
    queryKey: ["cities"],
    queryFn: async () => (await apiClient.get("/cities")).data,
  });

  const { data: categoriesData } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await apiClient.get("/categories")).data,
  });

  const { data: contributionsData, isLoading: contributionsLoading } = useQuery<{ success: boolean; data: Contact[] }>({
    queryKey: ["my-contributions"],
    queryFn: async () => (await apiClient.get("/auth/my-contributions")).data,
    enabled: !!user,
  });

  const defaultCityId = citiesData?.data.find((c) => c.slug === citySlug)?.id ?? "";

  const [tab, setTab] = useState<Tab>("riwayat");

  // Manual form
  const [form, setForm] = useState({
    name: "", phone: "", address: "", website: "", mapsUrl: "", description: "", cityId: "", categoryId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Import state
  const [imported, setImported] = useState<ImportedContact[]>([]);
  const [importCityId, setImportCityId] = useState("");
  const [importCategoryId, setImportCategoryId] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");

  // Sync defaultCityId into form once cities data loads
  useEffect(() => {
    if (defaultCityId) {
      setForm((f) => (f.cityId ? f : { ...f, cityId: defaultCityId }));
      setImportCityId((prev) => prev || defaultCityId);
    }
  }, [defaultCityId]);

  // ── Auth states ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
        <div className="px-4 pt-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 rounded shimmer mb-2" />
              <div className="h-11 rounded-xl shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
        <div className="px-4 pt-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <HiOutlinePlusCircle className="h-7 w-7 text-primary-700" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Kontribusi Kontak</h2>
          <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Masuk terlebih dahulu untuk menambahkan kontak ke direktori.
          </p>
          <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
            <Link to="/login" className="block bg-primary-700 text-white px-5 py-3 rounded-xl text-sm font-semibold text-center active:scale-[0.98] transition-all">
              Masuk
            </Link>
            <Link to="/register" className="block bg-gray-100 text-gray-700 px-5 py-3 rounded-xl text-sm font-semibold text-center active:scale-[0.98] transition-all">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state (manual) ──
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
        <div className="px-4 pt-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <HiCheck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Kontak Terkirim!</h2>
          <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Terima kasih atas kontribusimu. Kontak akan ditinjau oleh admin sebelum ditampilkan.
          </p>
          <div className="flex gap-2.5 justify-center">
            <button
              onClick={() => { setSuccess(false); setForm({ name: "", phone: "", address: "", website: "", mapsUrl: "", description: "", cityId: defaultCityId, categoryId: "" }); }}
              className="bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all"
            >
              Tambah Lagi
            </button>
            <button
              onClick={() => { setSuccess(false); setTab("riwayat"); }}
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all"
            >
              Lihat Riwayat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Handlers ──
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiClient.post("/contacts", form);
      setSuccess(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Gagal mengirim kontak");
    } finally {
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePickContacts() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      const results = await nav.contacts.select(["name", "tel", "address"], { multiple: true });
      const contacts: ImportedContact[] = results
        .filter((r: { name?: string[]; tel?: string[] }) => r.name?.[0] && r.tel?.[0])
        .map((r: { name?: string[]; tel?: string[]; address?: { street?: string; city?: string }[] }) => ({
          name: r.name![0],
          phone: r.tel![0],
          address: r.address?.[0] ? [r.address[0].street, r.address[0].city].filter(Boolean).join(", ") : undefined,
          selected: true,
        }));
      if (contacts.length > 0) setImported((prev) => [...prev, ...contacts]);
    } catch {
      // cancelled
    }
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      let contacts: ImportedContact[] = [];
      if (file.name.endsWith(".vcf") || file.name.endsWith(".vcard")) contacts = parseVcf(text);
      else if (file.name.endsWith(".csv")) contacts = parseCsv(text);
      if (contacts.length > 0) setImported((prev) => [...prev, ...contacts]);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function toggleContact(index: number) {
    setImported((prev) => prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c)));
  }

  function toggleAll(selected: boolean) {
    setImported((prev) => prev.map((c) => ({ ...c, selected })));
  }

  function removeContact(index: number) {
    setImported((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleBulkSubmit() {
    const selected = imported.filter((c) => c.selected);
    if (selected.length === 0 || !importCityId || !importCategoryId) return;
    setBulkLoading(true);
    setBulkError("");
    try {
      const { data } = await apiClient.post("/contacts/bulk", {
        contacts: selected.map(({ name, phone, address }) => ({ name, phone, address })),
        cityId: importCityId,
        categoryId: importCategoryId,
      });
      setBulkSuccess(`${data.data.count} kontak berhasil dikirim untuk ditinjau!`);
      setImported([]);
      setTimeout(() => setBulkSuccess(""), 4000);
    } catch {
      setBulkError("Gagal mengirim kontak. Coba lagi.");
    } finally {
      setBulkLoading(false);
    }
  }

  const selectedCount = imported.filter((c) => c.selected).length;
  const contributions = contributionsData?.data ?? [];
  const approvedCount = contributions.filter((c) => c.status === "APPROVED").length;
  const pendingCount = contributions.filter((c) => c.status === "PENDING").length;

  const inputClass = "w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Kontribusi</h1>
        <p className="text-xs text-gray-500 mt-0.5">Bantu lengkapi direktori kotamu</p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4 flex gap-1">
        {([
          { key: "riwayat" as Tab, label: "Riwayat" },
          { key: "manual" as Tab, label: "Tambah" },
          { key: "import" as Tab, label: "Impor" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? "border-primary-600 text-primary-700" : "border-transparent text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {/* ── Riwayat Tab ── */}
        {tab === "riwayat" && (
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{contributions.length}</p>
                <p className="text-[10px] text-gray-500 font-medium">Total</p>
              </div>
              <div className="bg-green-50 rounded-xl border border-green-200 p-3 text-center">
                <p className="text-xl font-bold text-green-700">{approvedCount}</p>
                <p className="text-[10px] text-green-600 font-medium">Approved</p>
              </div>
              <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-3 text-center">
                <p className="text-xl font-bold text-yellow-700">{pendingCount}</p>
                <p className="text-[10px] text-yellow-600 font-medium">Pending</p>
              </div>
            </div>

            {contributionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : contributions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <HiOutlinePlusCircle className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">Belum ada kontribusi</p>
                <p className="text-xs text-gray-400 mt-1">Mulai tambahkan kontak untuk kotamu</p>
                <button
                  onClick={() => setTab("manual")}
                  className="mt-4 bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all"
                >
                  Tambah Kontak
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {contributions.map((contact) => (
                  <div key={contact.id} className="bg-white rounded-xl border border-gray-200 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{contact.phone}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {contact.city?.name} &middot; {contact.category?.name}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant={contact.status === "APPROVED" ? "success" : contact.status === "REJECTED" ? "danger" : "warning"}>
                          {contact.status === "APPROVED" ? "Disetujui" : contact.status === "REJECTED" ? "Ditolak" : "Menunggu"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(contact.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Manual Tab ── */}
        {tab === "manual" && (
          <>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Nama Bisnis / Tempat *</label>
                <input type="text" required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Contoh: RS Harapan Kita" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Nomor Telepon *</label>
                <input type="tel" required value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Contoh: 021-1234567" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Kota *</label>
                  <select required value={form.cityId} onChange={(e) => update("cityId", e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="">Pilih Kota</option>
                    {citiesData?.data.map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Kategori *</label>
                  <select required value={form.categoryId} onChange={(e) => update("categoryId", e.target.value)} className={`${inputClass} appearance-none`}>
                    <option value="">Pilih Kategori</option>
                    {categoriesData?.data.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Alamat</label>
                <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Jl. Contoh No. 123" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input type="url" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://contoh.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Link Google Maps</label>
                <input type="url" value={form.mapsUrl} onChange={(e) => update("mapsUrl", e.target.value)} placeholder="https://maps.google.com/..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Deskripsi</label>
                <textarea rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Deskripsi singkat tentang tempat ini..." className={`${inputClass} h-auto py-2.5 resize-none`} />
              </div>
              <button type="submit" disabled={loading} className="w-full h-12 bg-primary-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <ImSpinner2 className="animate-spin h-4 w-4" />}
                Kirim Kontak
              </button>
            </form>
          </>
        )}

        {/* ── Import Tab ── */}
        {tab === "import" && (
          <>
            {bulkSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                {bulkSuccess}
              </div>
            )}
            {bulkError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-medium">
                {bulkError}
              </div>
            )}

            {/* Import buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {hasContactPicker() && (
                <button
                  type="button"
                  onClick={handlePickContacts}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white text-sm font-medium rounded-xl active:scale-[0.98] transition-all"
                >
                  <HiOutlineUsers className="h-4 w-4" />
                  Pilih dari Kontak HP
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl active:scale-[0.98] transition-all"
              >
                <HiOutlineCloudArrowUp className="h-4 w-4" />
                Upload .vcf / .csv
              </button>
              <input ref={fileInputRef} type="file" accept=".vcf,.vcard,.csv" className="hidden" onChange={handleFileImport} />
            </div>

            {/* Imported list */}
            {imported.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCount === imported.length}
                      onChange={(e) => toggleAll(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700 font-medium">{selectedCount}/{imported.length} dipilih</span>
                  </label>
                  <button type="button" onClick={() => setImported([])} className="text-xs text-red-600 font-medium">
                    Hapus Semua
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                  {imported.map((contact, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={contact.selected}
                        onChange={() => toggleContact(i)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.phone}</p>
                      </div>
                      <button type="button" onClick={() => removeContact(i)} className="text-gray-400 active:text-red-500 flex-shrink-0">
                        <HiXMark className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={importCityId}
                      onChange={(e) => setImportCityId(e.target.value)}
                      className={`${inputClass} h-10 text-xs`}
                    >
                      <option value="">Pilih kota *</option>
                      {citiesData?.data.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      value={importCategoryId}
                      onChange={(e) => setImportCategoryId(e.target.value)}
                      className={`${inputClass} h-10 text-xs`}
                    >
                      <option value="">Pilih kategori *</option>
                      {categoriesData?.data.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleBulkSubmit}
                    disabled={selectedCount === 0 || !importCityId || !importCategoryId || bulkLoading}
                    className="w-full h-11 bg-primary-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bulkLoading && <ImSpinner2 className="animate-spin h-4 w-4" />}
                    Kirim {selectedCount} Kontak
                  </button>
                  <p className="text-[11px] text-gray-400 text-center">Kontak akan ditinjau admin sebelum ditampilkan</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
                <HiOutlineUsers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Belum ada kontak diimpor</p>
                <p className="text-xs text-gray-400 mt-1">
                  {hasContactPicker()
                    ? "Pilih dari kontak HP atau upload file VCF/CSV"
                    : "Upload file VCF/CSV yang diekspor dari kontak HP"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
