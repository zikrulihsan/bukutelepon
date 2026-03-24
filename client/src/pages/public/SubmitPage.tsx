import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { useAuth } from "../../hooks/useAuth";
import { useCity } from "../../context/CityContext";
import type { City, Category } from "../../types";

export default function SubmitPage() {
  const { user, loading: authLoading } = useAuth();
  const { citySlug } = useCity();
  const navigate = useNavigate();

  const { data: citiesData } = useQuery<{ success: boolean; data: City[] }>({
    queryKey: ["cities"],
    queryFn: async () => (await apiClient.get("/cities")).data,
  });

  const { data: categoriesData } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await apiClient.get("/categories")).data,
  });

  // Pre-select city from context
  const defaultCityId = citiesData?.data.find((c) => c.slug === citySlug)?.id ?? "";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    website: "",
    description: "",
    cityId: "",
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Set default city once data is loaded
  if (defaultCityId && !form.cityId) {
    setForm((f) => ({ ...f, cityId: defaultCityId }));
  }

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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Kontribusi Kontak</h2>
          <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Masuk terlebih dahulu untuk menambahkan kontak ke direktori.
          </p>
          <div className="flex flex-col gap-2.5 max-w-xs mx-auto">
            <Link
              to="/login"
              className="block bg-primary-700 text-white px-5 py-3 rounded-xl text-sm font-semibold text-center active:scale-[0.98] transition-all"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="block bg-gray-100 text-gray-700 px-5 py-3 rounded-xl text-sm font-semibold text-center active:scale-[0.98] transition-all"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
        <div className="px-4 pt-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Kontak Terkirim!</h2>
          <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Terima kasih atas kontribusimu. Kontak akan ditinjau oleh admin sebelum ditampilkan.
          </p>
          <div className="flex gap-2.5 justify-center">
            <button
              onClick={() => { setSuccess(false); setForm({ name: "", phone: "", address: "", website: "", description: "", cityId: defaultCityId, categoryId: "" }); }}
              className="bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all"
            >
              Tambah Lagi
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  const inputClass = "w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Tambah Kontak</h1>
        <p className="text-xs text-gray-500 mt-0.5">Bantu lengkapi direktori kotamu</p>
      </div>

      <div className="px-4 pt-4">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nama Bisnis / Tempat *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Contoh: RS Harapan Kita"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Nomor Telepon *</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Contoh: 021-1234567"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Kota *</label>
              <select
                required
                value={form.cityId}
                onChange={(e) => update("cityId", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Pilih Kota</option>
                {citiesData?.data.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Kategori *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Pilih Kategori</option>
                {categoriesData?.data.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Alamat</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Jl. Contoh No. 123"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://contoh.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Deskripsi</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Deskripsi singkat tentang tempat ini..."
              className={`${inputClass} h-auto py-2.5 resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary-700 text-white rounded-xl text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Kirim Kontak
          </button>
        </form>
      </div>
    </div>
  );
}
