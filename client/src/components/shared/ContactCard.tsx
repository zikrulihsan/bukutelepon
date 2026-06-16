import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Contact } from "../../types";
import { isSaved, toggleSaved } from "../../lib/saved";
import { formatWhatsAppUrl, formatTelUrl } from "../../lib/phone";
import { HiCheckBadge, HiBookmark } from "react-icons/hi2";
import { HiOutlineBookmark, HiOutlinePhone } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

interface ContactCardProps {
  contact: Contact;
  hideSave?: boolean;
}

const PHOTO_STRIPES =
  "repeating-linear-gradient(135deg, #eef1f3 0px, #eef1f3 7px, #e4e8eb 7px, #e4e8eb 14px)";

export function ContactCard({ contact, hideSave }: ContactCardProps) {
  const [saved, setSaved] = useState(() => isSaved(contact.id));
  const navigate = useNavigate();

  function handleSave() {
    setSaved(toggleSaved(contact.id));
  }

  function handleNavigate() {
    navigate(`/kontak/${contact.id}`);
  }

  const location = contact.address || contact.city?.name || "";

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4">
      {/* Top: photo + info */}
      <div className="flex gap-3.5">
        {/* Photo */}
        <button
          onClick={handleNavigate}
          className="flex-shrink-0 w-[84px] h-[84px] rounded-2xl overflow-hidden flex items-center justify-center active:scale-95 transition-transform"
          style={contact.imageUrl ? undefined : { background: PHOTO_STRIPES }}
          aria-label={`Lihat ${contact.name}`}
        >
          {contact.imageUrl ? (
            <img src={contact.imageUrl} alt={contact.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[11px] font-medium text-gray-400">foto</span>
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleNavigate}>
          <h3 className="font-extrabold text-gray-900 text-[17px] leading-snug flex items-center gap-1.5 tracking-tight">
            <span className="truncate">{contact.name}</span>
            {contact.isVerified && (
              <HiCheckBadge
                className="h-[18px] w-[18px] text-blue-500 flex-shrink-0"
                aria-label="Terverifikasi"
              />
            )}
          </h3>

          {(contact.category || location) && (
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary-600 mt-1 truncate">
              {contact.category?.name}
              {contact.category && location && (
                <span className="text-primary-300"> &middot; </span>
              )}
              {location}
            </p>
          )}

          {contact.description && (
            <p className="text-[13.5px] text-gray-600 leading-relaxed line-clamp-2 mt-1.5">
              {contact.description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 mt-4">
        {/* Primary: WhatsApp */}
        <a
          href={formatWhatsAppUrl(contact.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-11 rounded-xl bg-primary-700 hover:bg-primary-600 flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
        >
          <FaWhatsapp className="w-[17px] h-[17px] text-white" />
          <span className="text-[13.5px] font-semibold text-white">WhatsApp</span>
        </a>

        {/* Secondary: Telepon */}
        <a
          href={formatTelUrl(contact.phone)}
          className="h-11 px-4 rounded-xl border border-gray-200 flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          title="Telepon"
        >
          <HiOutlinePhone className="h-[18px] w-[18px]" />
          <span className="text-[13.5px] font-semibold">Telepon</span>
        </a>

        {/* Save */}
        {!hideSave && (
          <button
            onClick={handleSave}
            className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
              saved
                ? "bg-[#e8f6f0] border-primary-100 text-primary-700"
                : "border-gray-200 text-gray-400 hover:bg-gray-50"
            }`}
            title={saved ? "Hapus dari tersimpan" : "Simpan kontak"}
          >
            {saved ? (
              <HiBookmark className="h-[18px] w-[18px]" />
            ) : (
              <HiOutlineBookmark className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
