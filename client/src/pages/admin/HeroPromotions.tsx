import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import {
  HERO_IMAGE_MIME_TYPES,
  MAX_HERO_IMAGE_BYTES,
  uploadHeroImage,
} from "../../lib/uploadImage";
import { useAuth } from "../../hooks/useAuth";
import { useI18n } from "../../i18n/LanguageContext";
import type { ApiResponse, HeroPromotion } from "../../types";

type PromotionForm = Omit<HeroPromotion, "id" | "sortOrder" | "createdAt" | "updatedAt">;

const EMPTY_FORM: PromotionForm = {
  title: "",
  titleEn: "",
  highlight: "",
  highlightEn: "",
  description: "",
  descriptionEn: "",
  imageUrl: "",
  href: "",
  isActive: true,
};

function apiError(error: unknown, fallback: string): string {
  const value = error as { response?: { data?: { message?: string } }; message?: string } | null;
  return value?.response?.data?.message || value?.message || fallback;
}

export default function AdminHeroPromotions() {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<PromotionForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const promotionsQuery = useQuery<ApiResponse<HeroPromotion[]>>({
    queryKey: ["admin", "hero-promotions"],
    queryFn: async () => (await apiClient.get("/admin/hero-promotions")).data,
  });
  const promotions = promotionsQuery.data?.data ?? [];

  const invalidatePromotions = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "hero-promotions"] });
    queryClient.invalidateQueries({ queryKey: ["hero-promotions"] });
  };

  function clearPreview() {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  function resetForm() {
    clearPreview();
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setError("");
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sesi login berakhir. Silakan masuk kembali.");
      let imageUrl = form.imageUrl;
      if (imageFile) imageUrl = await uploadHeroImage(imageFile, user.id);
      const payload = { ...form, imageUrl };
      return editingId
        ? (await apiClient.put(`/admin/hero-promotions/${editingId}`, payload)).data
        : (await apiClient.post("/admin/hero-promotions", payload)).data;
    },
    onSuccess: () => {
      invalidatePromotions();
      resetForm();
      setNotice(t("admin.heroPromoSaved"));
    },
    onError: (reason) => setError(apiError(reason, t("admin.heroPromoError"))),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch(`/admin/hero-promotions/${id}/toggle`, { isActive }),
    onSuccess: invalidatePromotions,
    onError: (reason) => setError(apiError(reason, t("admin.heroPromoError"))),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/hero-promotions/${id}`),
    onSuccess: () => {
      invalidatePromotions();
      setNotice(t("admin.heroPromoDeleted"));
    },
    onError: (reason) => setError(apiError(reason, t("admin.heroPromoError"))),
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => apiClient.put("/admin/hero-promotions/reorder", { orderedIds }),
    onSuccess: invalidatePromotions,
    onError: (reason) => setError(apiError(reason, t("admin.heroPromoError"))),
  });

  function startCreate() {
    clearPreview();
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
    setNotice("");
    setError("");
  }

  function startEdit(promotion: HeroPromotion) {
    clearPreview();
    setForm({
      title: promotion.title,
      titleEn: promotion.titleEn ?? "",
      highlight: promotion.highlight ?? "",
      highlightEn: promotion.highlightEn ?? "",
      description: promotion.description,
      descriptionEn: promotion.descriptionEn ?? "",
      imageUrl: promotion.imageUrl,
      href: promotion.href,
      isActive: promotion.isActive,
    });
    setImagePreview(promotion.imageUrl);
    setEditingId(promotion.id);
    setShowForm(true);
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!HERO_IMAGE_MIME_TYPES.has(file.type)) {
      setError("Gunakan gambar JPG, PNG, WebP, atau AVIF.");
      return;
    }
    if (file.size > MAX_HERO_IMAGE_BYTES) {
      setError("Ukuran gambar maksimal 5 MB.");
      return;
    }
    clearPreview();
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= promotions.length) return;
    const ordered = [...promotions];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    reorderMutation.mutate(ordered.map((promotion) => promotion.id));
  }

  const inputClass = "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500";
  const canSave = Boolean(form.title.trim() && form.description.trim() && form.href.trim() && (form.imageUrl || imageFile));

  return <div>
    <div className="mb-6 flex items-start justify-between gap-4">
      <div><h1 className="text-xl font-bold text-gray-900">{t("admin.heroPromoHeading")}</h1><p className="mt-1 text-sm text-gray-500">{t("admin.heroPromoIntro")}</p></div>
      {!showForm && <button type="button" onClick={startCreate} className="shrink-0 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-800">{t("admin.heroPromoAdd")}</button>}
    </div>

    {notice && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{notice}</div>}
    {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

    {showForm && <form onSubmit={(event) => { event.preventDefault(); setError(""); saveMutation.mutate(); }} className="mb-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">{editingId ? t("admin.heroPromoEdit") : t("admin.heroPromoAdd")}</h2>
      <p className="mt-1 text-xs text-gray-500">{t("admin.heroPromoTokenHint")}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-gray-700">{t("admin.heroPromoTitle")}<input required maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
        <label className="text-sm font-medium text-gray-700">{t("admin.heroPromoHighlight")}<input maxLength={160} value={form.highlight ?? ""} onChange={(e) => setForm({ ...form, highlight: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
        <label className="text-sm font-medium text-gray-700 md:col-span-2">{t("admin.heroPromoDescription")}<textarea required maxLength={500} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} mt-1.5 resize-y`} /></label>
        <label className="text-sm font-medium text-gray-700 md:col-span-2">{t("admin.heroPromoDestination")}<input required maxLength={2048} placeholder="/search atau https://..." value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} className={`${inputClass} mt-1.5`} /><span className="mt-1 block text-xs font-normal text-gray-400">{t("admin.heroPromoDestinationHint")}</span></label>
      </div>

      <fieldset className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <legend className="px-2 text-sm font-bold text-gray-700">{t("admin.heroPromoEnglish")}</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">{t("admin.heroPromoTitle")}<input maxLength={160} value={form.titleEn ?? ""} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
          <label className="text-sm font-medium text-gray-700">{t("admin.heroPromoHighlight")}<input maxLength={160} value={form.highlightEn ?? ""} onChange={(e) => setForm({ ...form, highlightEn: e.target.value })} className={`${inputClass} mt-1.5`} /></label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">{t("admin.heroPromoDescription")}<textarea maxLength={500} rows={3} value={form.descriptionEn ?? ""} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className={`${inputClass} mt-1.5 resize-y`} /></label>
        </div>
      </fieldset>

      <div className="mt-5 grid gap-5 md:grid-cols-[220px_1fr]">
        <div><p className="text-sm font-medium text-gray-700">{t("admin.heroPromoImage")}</p><div className="mt-1.5 aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">{imagePreview ? <img src={imagePreview} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-gray-400">JPG · PNG · WebP · AVIF</div>}</div></div>
        <div className="flex flex-col justify-center gap-3"><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseImage} className="hidden" /><button type="button" onClick={() => fileInputRef.current?.click()} className="w-fit rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">{t("admin.heroPromoChooseImage")}</button><label className="flex items-center gap-2 text-sm font-medium text-gray-700"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-700" />{t("admin.heroPromoActive")}</label></div>
      </div>

      <div className="mt-6 flex gap-2"><button type="submit" disabled={!canSave || saveMutation.isPending} className="rounded-xl bg-primary-700 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saveMutation.isPending ? t("admin.saving") : t("common.save")}</button><button type="button" onClick={resetForm} className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700">{t("common.cancel")}</button></div>
    </form>}

    {promotionsQuery.isLoading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-gray-200" />)}</div> : promotions.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">{t("admin.heroPromoEmpty")}</div> : <div className="space-y-3">{promotions.map((promotion, index) => <article key={promotion.id} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
      <img src={promotion.imageUrl} alt="" className="h-28 w-full rounded-xl object-cover sm:w-44" />
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-gray-900">{promotion.title} {promotion.highlight && <span className="text-primary-700">{promotion.highlight}</span>}</h2><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${promotion.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{promotion.isActive ? t("admin.heroPromoActive") : t("admin.heroPromoInactive")}</span></div><p className="mt-1 line-clamp-2 text-sm text-gray-500">{promotion.description}</p><p className="mt-2 truncate text-xs text-gray-400">{promotion.href}</p></div>
      <div className="flex shrink-0 flex-wrap content-start gap-2 sm:w-40"><button type="button" disabled={index === 0 || reorderMutation.isPending} onClick={() => move(index, -1)} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-gray-600 disabled:opacity-35">↑ {t("admin.heroPromoMoveUp")}</button><button type="button" disabled={index === promotions.length - 1 || reorderMutation.isPending} onClick={() => move(index, 1)} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-gray-600 disabled:opacity-35">↓ {t("admin.heroPromoMoveDown")}</button><button type="button" onClick={() => toggleMutation.mutate({ id: promotion.id, isActive: !promotion.isActive })} className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-bold text-gray-600">{promotion.isActive ? t("admin.heroPromoInactive") : t("admin.heroPromoActive")}</button><button type="button" onClick={() => startEdit(promotion)} className="rounded-lg border border-primary-200 px-2.5 py-1.5 text-xs font-bold text-primary-700">{t("common.edit")}</button><button type="button" onClick={() => { if (window.confirm(t("admin.heroPromoDeleteConfirm"))) deleteMutation.mutate(promotion.id); }} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600">{t("admin.heroPromoDelete")}</button></div>
    </article>)}</div>}
  </div>;
}
