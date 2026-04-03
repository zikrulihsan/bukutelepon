import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContact } from "../../hooks/useContacts";
import { StarRating } from "../../components/shared/StarRating";
import { CategoryIcon } from "../../components/shared/CategoryIcon";
import { isSaved, toggleSaved } from "../../lib/saved";
import { formatWhatsAppUrl, formatTelUrl } from "../../lib/phone";
import { HiChevronLeft, HiCheckBadge, HiMapPin, HiStar, HiBookmark, HiChevronRight, HiCheck, HiOutlineUser, HiOutlineGlobeAlt, HiArrowTopRightOnSquare, HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { HiOutlineBookmark, HiOutlinePhone, HiOutlineClipboardCopy, HiOutlineShare } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

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
    navigator.clipboard.writeText(contact.phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {/* clipboard not available */});
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
      navigator.clipboard.writeText(window.location.href).catch(() => {/* clipboard not available */});
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
          <HiOutlineUser className="h-8 w-8 text-gray-300" />
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
          <HiChevronLeft className="h-5 w-5" />
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
                <HiCheckBadge className="h-5 w-5 text-blue-400 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {contact.city && (
                <span className="text-sm text-white/60 flex items-center gap-1">
                  <HiMapPin className="h-3.5 w-3.5" />
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
                    <HiStar
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= Math.round(avgRating) ? "text-yellow-400" : "text-white/20"}`}
                    />
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
              <FaWhatsapp className="w-[18px] h-[18px] text-white" />
              <span className="text-sm font-semibold text-white">WhatsApp</span>
            </a>

            {/* Telepon */}
            <a
              href={formatTelUrl(contact.phone)}
              className="h-12 w-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
              title="Telepon"
            >
              <HiOutlinePhone className="h-5 w-5" />
            </a>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="h-12 w-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all relative"
              title="Salin nomor"
            >
              {copied ? (
                <HiCheck className="h-5 w-5 text-emerald-500" />
              ) : (
                <HiOutlineClipboardCopy className="h-5 w-5" />
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
              {saved ? (
                <HiBookmark className="h-5 w-5" />
              ) : (
                <HiOutlineBookmark className="h-5 w-5" />
              )}
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
              <HiOutlinePhone className="h-5 w-5 text-primary-600" />
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
                <HiMapPin className="h-5 w-5 text-orange-500" />
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
                <HiOutlineGlobeAlt className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Website</p>
                <p className="text-[14px] font-medium text-primary-600 truncate">{contact.website}</p>
              </div>
              <HiArrowTopRightOnSquare className="h-4 w-4 text-gray-300 flex-shrink-0" />
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
            <HiOutlineShare className="h-5 w-5 text-violet-500" />
          </div>
          <span className="text-[14px] font-semibold text-gray-700">Bagikan kontak ini</span>
          <HiChevronRight className="h-4 w-4 text-gray-300 ml-auto flex-shrink-0" />
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
                <HiStar className="w-3.5 h-3.5 text-yellow-400" />
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
              <HiOutlineChatBubbleOvalLeft className="h-6 w-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">Belum ada ulasan</p>
            <p className="text-xs text-gray-300 mt-1">Jadilah yang pertama memberikan ulasan</p>
          </div>
        </div>
      )}
    </div>
  );
}
