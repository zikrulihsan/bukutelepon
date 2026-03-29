import { useState } from "react";
import type { Contact } from "../../types";
import { CategoryIcon } from "./CategoryIcon";
import { isSaved, toggleSaved } from "../../pages/public/SavedPage";

interface ContactCardProps {
  contact: Contact;
}

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

export function ContactCard({ contact }: ContactCardProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(() => isSaved(contact.id));

  function handleCopy() {
    navigator.clipboard.writeText(contact.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    setSaved(toggleSaved(contact.id));
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/80 p-5 relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 flex flex-col gap-3">
      {/* Subtle top-right aesthetic glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-green-400/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>

      {/* Header: name + save */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-snug flex items-center gap-1.5 mb-1.5">
            {contact.name}
            {contact.isVerified && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-label="Terverifikasi">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            )}
          </h3>
          {contact.category && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-emerald-50 text-[11px] font-bold text-emerald-700 border border-emerald-100">
              <CategoryIcon slug={contact.category.slug} className="w-[11px] h-[11px]" />
              {contact.category.name}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${saved ? "bg-[#e8f6f0] text-[#0C3B2E]" : "bg-gray-50 text-gray-400 hover:bg-gray-100"
            }`}
          title={saved ? "Hapus dari tersimpan" : "Simpan kontak"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill={saved ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={saved ? 0 : 2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Description */}
      {contact.description && (
        <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 relative z-10">{contact.description}</p>
      )}

      {/* Address */}
      {contact.address && (
        <div className="flex items-start gap-2 relative z-10 pt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[14px] w-[14px] text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
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
          className="flex-1 h-10 rounded-[12px] bg-primary-700 hover:bg-primary-600 shadow-sm flex items-center justify-center gap-2.5 active:scale-[0.97] transition-colors duration-200"
        >
          <svg className="w-[16px] h-[16px] text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.01a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 0 1 2.17 12.01C2.17 6.56 6.6 2.13 12.06 2.13a9.84 9.84 0 0 1 6.982 2.894 9.84 9.84 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884v-.117zM12.05.015C5.495.015.005 5.505.005 12.06a12.01 12.01 0 0 0 1.607 6.004L0 24l6.104-1.602A12 12 0 0 0 12.05 24.03c6.556 0 11.95-5.49 11.95-12.045C24 5.43 18.607-.06 12.05.015z"/>
          </svg>
          <span className="text-[13.5px] font-medium text-white tracking-wide">WhatsApp</span>
        </a>

        {/* Secondary: Telepon */}
        <a
          href={formatTelUrl(contact.phone)}
          className="h-10 w-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
          title="Telepon"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </a>

        {/* Secondary: Copy */}
        <button
          onClick={handleCopy}
          className="h-10 w-12 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 active:scale-95 transition-all relative"
          title="Salin nomor"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] text-[#25D366]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
