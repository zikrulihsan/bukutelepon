import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import type { City, Category } from "../../types";

interface ImportedContact {
  name: string;
  phone: string;
  address?: string;
  selected: boolean;
}

// Parse vCard (.vcf) file content
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
      // Full name
      if (line.startsWith("FN:") || line.startsWith("FN;")) {
        name = line.replace(/^FN[;:].*?:?/, "").replace(/^FN:/, "").trim();
        if (!name) {
          const idx = line.indexOf(":");
          if (idx !== -1) name = line.slice(idx + 1).trim();
        }
      }
      // Fallback to N field
      if (!name && line.startsWith("N:")) {
        const parts = line.replace("N:", "").split(";");
        name = [parts[1], parts[0]].filter(Boolean).join(" ").trim();
      }
      // Phone
      if (line.startsWith("TEL") && !phone) {
        const idx = line.indexOf(":");
        if (idx !== -1) phone = line.slice(idx + 1).trim();
      }
      // Address
      if (line.startsWith("ADR") && !address) {
        const idx = line.indexOf(":");
        if (idx !== -1) {
          address = line
            .slice(idx + 1)
            .split(";")
            .filter(Boolean)
            .join(", ")
            .trim();
        }
      }
    }

    if (name && phone) {
      contacts.push({ name, phone, address: address || undefined, selected: true });
    }
  }

  return contacts;
}

// Parse CSV content (name,phone,address)
function parseCsv(text: string): ImportedContact[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes("name") || header.includes("nama") || header.includes("phone") || header.includes("telepon");
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

// Check if Contact Picker API is available
function hasContactPicker(): boolean {
  return "contacts" in navigator && "ContactsManager" in window;
}

export default function AdminAddContact() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single form
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    website: "",
    description: "",
    cityId: "",
    categoryId: "",
  });
  const [success, setSuccess] = useState(false);

  // Import state
  const [imported, setImported] = useState<ImportedContact[]>([]);
  const [importCityId, setImportCityId] = useState("");
  const [importCategoryId, setImportCategoryId] = useState("");
  const [bulkSuccess, setBulkSuccess] = useState("");

  const { data: citiesData } = useQuery<{ success: boolean; data: City[] }>({
    queryKey: ["cities"],
    queryFn: async () => (await apiClient.get("/cities")).data,
  });

  const { data: categoriesData } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await apiClient.get("/categories")).data,
  });

  const cities = citiesData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  // Single create mutation
  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload = {
        ...data,
        website: data.website || undefined,
        address: data.address || undefined,
        description: data.description || undefined,
      };
      return (await apiClient.post("/admin/contacts", payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setSuccess(true);
      setForm({ name: "", phone: "", address: "", website: "", description: "", cityId: form.cityId, categoryId: form.categoryId });
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  // Bulk import mutation
  const bulkMutation = useMutation({
    mutationFn: async (data: { contacts: { name: string; phone: string; address?: string }[]; cityId: string; categoryId: string }) => {
      return (await apiClient.post("/admin/contacts/bulk", data)).data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      setBulkSuccess(`${data.data.count} kontak berhasil diimpor!`);
      setImported([]);
      setTimeout(() => setBulkSuccess(""), 4000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  // Contact Picker API (mobile browsers)
  async function handlePickContacts() {
    try {
      const props = ["name", "tel", "address"];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      const results = await nav.contacts.select(props, { multiple: true });

      const contacts: ImportedContact[] = results
        .filter((r: { name?: string[]; tel?: string[] }) => r.name?.[0] && r.tel?.[0])
        .map((r: { name?: string[]; tel?: string[]; address?: { street?: string; city?: string }[] }) => ({
          name: r.name![0],
          phone: r.tel![0],
          address: r.address?.[0]
            ? [r.address[0].street, r.address[0].city].filter(Boolean).join(", ")
            : undefined,
          selected: true,
        }));

      if (contacts.length > 0) {
        setImported((prev) => [...prev, ...contacts]);
      }
    } catch {
      // User cancelled or API not supported
    }
  }

  // File import (VCF/CSV)
  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      let contacts: ImportedContact[] = [];

      if (file.name.endsWith(".vcf") || file.name.endsWith(".vcard")) {
        contacts = parseVcf(text);
      } else if (file.name.endsWith(".csv")) {
        contacts = parseCsv(text);
      }

      if (contacts.length > 0) {
        setImported((prev) => [...prev, ...contacts]);
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  function toggleContact(index: number) {
    setImported((prev) =>
      prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c))
    );
  }

  function toggleAll(selected: boolean) {
    setImported((prev) => prev.map((c) => ({ ...c, selected })));
  }

  function removeContact(index: number) {
    setImported((prev) => prev.filter((_, i) => i !== index));
  }

  function handleBulkSubmit() {
    const selected = imported.filter((c) => c.selected);
    if (selected.length === 0 || !importCityId || !importCategoryId) return;

    bulkMutation.mutate({
      contacts: selected.map(({ name, phone, address }) => ({ name, phone, address })),
      cityId: importCityId,
      categoryId: importCategoryId,
    });
  }

  const selectedCount = imported.filter((c) => c.selected).length;

  return (
    <div className="space-y-8">
      {/* ── Section 1: Import from contacts ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Impor Kontak</h1>
        <p className="text-sm text-gray-500 mb-4">Impor dari kontak HP atau file VCF/CSV, langsung approved.</p>

        {bulkSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            {bulkSuccess}
          </div>
        )}

        {bulkMutation.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Gagal mengimpor kontak.
          </div>
        )}

        {/* Import buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {hasContactPicker() && (
            <button
              type="button"
              onClick={handlePickContacts}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Pilih dari Kontak HP
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload File (.vcf / .csv)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".vcf,.vcard,.csv"
            className="hidden"
            onChange={handleFileImport}
          />
        </div>

        {/* Imported contacts list */}
        {imported.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedCount === imported.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700 font-medium">{selectedCount} dari {imported.length} dipilih</span>
                </label>
              </div>
              <button
                type="button"
                onClick={() => setImported([])}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Hapus Semua
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {imported.map((contact, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
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
                  <button
                    type="button"
                    onClick={() => removeContact(i)}
                    className="text-gray-400 hover:text-red-500 flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Bulk submit */}
            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={importCityId}
                  onChange={(e) => setImportCityId(e.target.value)}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                >
                  <option value="">Pilih kota *</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={importCategoryId}
                  onChange={(e) => setImportCategoryId(e.target.value)}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                >
                  <option value="">Pilih kategori *</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleBulkSubmit}
                disabled={selectedCount === 0 || !importCityId || !importCategoryId || bulkMutation.isPending}
                className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {bulkMutation.isPending
                  ? "Mengimpor..."
                  : `Impor ${selectedCount} Kontak`}
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {imported.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-500">Belum ada kontak diimpor</p>
            <p className="text-xs text-gray-400 mt-1">
              {hasContactPicker()
                ? "Pilih dari kontak HP atau upload file VCF/CSV"
                : "Upload file VCF/CSV dari kontak HP kamu"}
            </p>
          </div>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-gray-200" />

      {/* ── Section 2: Manual add ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Tambah Manual</h2>
        <p className="text-sm text-gray-500 mb-4">Input satu kontak, langsung approved.</p>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            Kontak berhasil ditambahkan!
          </div>
        )}

        {mutation.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            Gagal menambahkan kontak. Periksa kembali data yang diisi.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="Nama kontak / tempat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telepon *</label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="08123456789"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota *</label>
              <select
                required
                value={form.cityId}
                onChange={(e) => setForm({ ...form, cityId: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              >
                <option value="">Pilih kota</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
              >
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="Jl. Contoh No. 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              placeholder="Deskripsi singkat..."
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? "Menyimpan..." : "Tambah Kontak"}
          </button>
        </form>
      </div>
    </div>
  );
}
