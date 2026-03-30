import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContact } from "../../hooks/useContacts";
import { StarRating } from "../../components/shared/StarRating";
import { CategoryIcon } from "../../components/shared/CategoryIcon";
import { isSaved, toggleSaved } from "./SavedPage";

function formatWhatsAppUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const international = cleaned.startsWith("0") ? "62" + cleaned.slice(1) : cleaned;
  return `https://wa.me/${international}`;
}

function formatTelUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return `tel:+62${cleaned.slice(1)}`;
  return `tel:+${cleaned}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
  return `${Math.floor(diffDays / 365)} tahun lalu`;
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useContact(id!);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(() => (id ? isSaved(id) : false));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  function handleCopy() {
    if (!contact) return;
    navigator.clipboard.writeText(contact.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    if (!id) return;
    setSaved(toggleSaved(id));
  }

  function handleShare() {
    if (!contact) return;
    if (navigator.share) {
      navigator.share({
        title: contact.name,
        text: `${contact.name} - ${contact.phone}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto pb-24">
        {/* Shimmer hero */}
        <div className="bg-gradient-to-br from-primary-800 to-primary-900 px-5 pt-14 pb-16 rounded-b-[32px]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-white/10 rounded-lg w-3/4 shimmer" />
              <div className="h-3 bg-white/10 rounded w-1/2 shimmer" />
            </div>
          </div>
        </div>
        <div className="px-5 -mt-8 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="h-12 bg-gray-100 rounded-xl shimmer" />
            <div className="h-12 bg-gray-100 rounded-xl shimmer" />
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full shimmer" />
            <div className="h-4 bg-gray-100 rounded w-3/4 shimmer" />
            <div className="h-4 bg-gray-100 rounded w-2/3 shimmer" />
          </div>
        </div>
      </div>
    );
  }

  const contact = data?.data;
  if (!contact)
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Kontak tidak ditemukan</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary-600 font-semibold">
          ← Kembali
        </button>
      </div>
    );

  const reviews = contact.reviews ?? [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="max-w-md mx-auto pb-28 animate-fade-in-up">
      {/* ─── Hero Header ─── */}
      <div className="relative bg-gradient-to-br from-primary-800 via-primary-900 to-primary-950 px-5 pt-4 pb-20 rounded-b-[32px] overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-700/20 rounded-full blur-[60px] -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[40px] -ml-10 mb-4" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="relative z-10 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors mb-6 -ml-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Kembali</span>
        </button>

        {/* Profile info */}
        <div className="relative z-10 flex items-start gap-4">
          {/* Avatar */}
          <div className="w-[68px] h-[68px] rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-2xl font-bold text-white/90 tracking-wide">
              {getInitials(contact.name)}
            </span>
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white truncate">{contact.name}</h1>
              {contact.isVerified && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {contact.city && (
                <span className="text-sm text-white/60 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {contact.city.name}
                </span>
              )}
              {contact.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[11px] font-bold text-white/80 border border-white/10">
                  <CategoryIcon slug={contact.category.slug} className="w-[11px] h-[11px]" />
                  {contact.category.name}
                </span>
              )}
            </div>

            {/* Rating badge */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= Math.round(avgRating) ? "text-yellow-400" : "text-white/20"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-white/50 font-medium">
                  {avgRating.toFixed(1)} · {reviews.length} ulasan
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Action Buttons (floating over hero edge) ─── */}
      <div className="px-5 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100/60 p-4">
          <div className="flex items-center gap-2.5">
            {/* WhatsApp */}
            <a
              href={formatWhatsAppUrl(contact.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 rounded-xl bg-primary-700 hover:bg-primary-600 shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.97] transition-all"
            >
              <svg className="w-[18px] h-[18px] text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.01a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 0 1 2.17 12.01C2.17 6.56 6.6 2.13 12.06 2.13a9.84 9.84 0 0 1 6.982 2.894 9.84 9.84 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884v-.117zM12.05.015C5.495.015.005 5.505.005 12.06a12.01 12.01 0 0 0 1.607 6.004L0 24l6.104-1.602A12 12 0 0 0 12.05 24.03c6.556 0 11.95-5.49 11.95-12.045C24 5.43 18.607-.06 12.05.015z" />
              </svg>
              <span className="text-sm font-semibold text-white">WhatsApp</span>
            </a>

            {/* Telepon */}
            <a
              href={formatTelUrl(contact.phone)}
              className="h-12 w-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
              title="Telepon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </a>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="h-12 w-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all relative"
              title="Salin nomor"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              className={`h-12 w-14 rounded-xl border flex items-center justify-center active:scale-95 transition-all ${
                saved
                  ? "bg-primary-50 border-primary-200 text-primary-700"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={saved ? "Hapus dari tersimpan" : "Simpan kontak"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill={saved ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={saved ? 0 : 1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Contact Info Cards ─── */}
      <div className="px-5 mt-5 space-y-3">
        {/* Phone */}
        <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Telepon</p>
              <p className="text-[15px] font-semibold text-gray-900 tracking-wide">{contact.phone}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        {contact.address && (
          <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Alamat</p>
                <p className="text-[14px] font-medium text-gray-800 leading-relaxed">{contact.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Website */}
        {contact.website && (
          <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <a
              href={contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Website</p>
                <p className="text-[14px] font-medium text-primary-600 truncate">{contact.website}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}

        {/* Description */}
        {contact.description && (
          <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tentang</p>
            <p className="text-[14px] text-gray-700 leading-relaxed">{contact.description}</p>
          </div>
        )}

        {/* Share button */}
        <button
          onClick={handleShare}
          className="w-full bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold text-gray-700">Bagikan kontak ini</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ─── Reviews Section ─── */}
      {reviews.length > 0 && (
        <div className="px-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Ulasan
              <span className="ml-1.5 text-sm font-semibold text-gray-400">({reviews.length})</span>
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full">
                <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-bold text-yellow-700">{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {reviews.map((review, idx) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {/* Reviewer Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-700">
                      {review.author?.name ? getInitials(review.author.name) : "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {review.author?.name ?? "Anonim"}
                    </p>
                    <p className="text-[11px] text-gray-400">{timeAgo(review.createdAt)}</p>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                {review.comment && (
                  <p className="text-[13.5px] text-gray-600 leading-relaxed pl-12">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty reviews state */}
      {reviews.length === 0 && (
        <div className="px-5 mt-8">
          <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400">Belum ada ulasan</p>
            <p className="text-xs text-gray-300 mt-1">Jadilah yang pertama memberikan ulasan</p>
          </div>
        </div>
      )}
    </div>
  );
}
