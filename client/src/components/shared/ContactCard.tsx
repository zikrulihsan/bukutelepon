import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Contact } from "../../types";
import { CategoryIcon } from "./CategoryIcon";
import { isSaved, toggleSaved } from "../../lib/saved";
import { formatWhatsAppUrl, formatTelUrl } from "../../lib/phone";
import { HiCheckBadge, HiChevronRight, HiMapPin, HiBookmark, HiCheck } from "react-icons/hi2";
import { HiOutlineBookmark, HiOutlinePhone, HiOutlineClipboardCopy } from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

interface ContactCardProps {
  contact: Contact;
  hideSave?: boolean;
}

export function ContactCard({ contact, hideSave }: ContactCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(() => isSaved(contact.id));
  const navigate = useNavigate();

  function handleCopy() {
    navigator.clipboard.writeText(contact.phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {/* clipboard not available */});
  }

  function handleSave() {
    setSaved(toggleSaved(contact.id));
  }

  function handleNavigate() {
    navigate(`/kontak/${contact.id}`);
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/80 p-5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-shadow duration-200 flex flex-col gap-3">
      {/* Subtle top-right aesthetic glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-green-400/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>

      {/* Header: name + save */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="cursor-pointer flex-1 min-w-0" onClick={handleNavigate}>
          <h3 className="font-bold text-gray-900 text-base leading-snug flex items-center gap-1.5 mb-1.5 group-hover:text-primary-700 transition-colors">
            {contact.name}
            {contact.isVerified && (
              <HiCheckBadge className="h-[18px] w-[18px] text-blue-500 flex-shrink-0" aria-label="Terverifikasi" />
            )}
            {/* Small arrow indicator */}
            <HiChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-primary-400 transition-colors flex-shrink-0" />
          </h3>
          {contact.category && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-emerald-50 text-[11px] font-bold text-emerald-700 border border-emerald-100">
              <CategoryIcon slug={contact.category.slug} className="w-[11px] h-[11px]" />
              {contact.category.name}
            </span>
          )}
        </div>
        {!hideSave && (
          <button
            onClick={handleSave}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${saved ? "bg-[#e8f6f0] text-[#0C3B2E]" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            title={saved ? "Hapus dari tersimpan" : "Simpan kontak"}
          >
            {saved ? (
              <HiBookmark className="h-4 w-4" />
            ) : (
              <HiOutlineBookmark className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Description — clickable */}
      {contact.description && (
        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 relative z-10 cursor-pointer" onClick={handleNavigate}>{contact.description}</p>
      )}

      {/* Address — clickable */}
      {contact.address && (
        <div className="flex items-start gap-2 relative z-10 pt-0.5 cursor-pointer" onClick={handleNavigate}>
          <HiMapPin className="h-[14px] w-[14px] text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-[12.5px] text-gray-500 font-medium line-clamp-1">{contact.address}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2.5 pt-2 relative z-10">
        {/* Primary: WhatsApp */}
        <a
          href={formatWhatsAppUrl(contact.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-10 rounded-[12px] bg-primary-700 hover:bg-primary-600 shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.97] transition-all"
        >
          <FaWhatsapp className="w-[16px] h-[16px] text-white" />
          <span className="text-[13.5px] font-medium text-white tracking-wide">WhatsApp</span>
        </a>

        {/* Secondary: Telepon */}
        <a
          href={formatTelUrl(contact.phone)}
          className="h-10 w-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
          title="Telepon"
        >
          <HiOutlinePhone className="h-[18px] w-[18px]" />
        </a>

        {/* Secondary: Copy */}
        <button
          onClick={handleCopy}
          className="h-10 w-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 active:scale-95 transition-all relative"
          title="Salin nomor"
        >
          {copied ? (
            <HiCheck className="h-[18px] w-[18px] text-[#25D366]" />
          ) : (
            <HiOutlineClipboardCopy className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
    </div>
  );
}
