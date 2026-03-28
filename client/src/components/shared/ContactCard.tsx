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
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2.5">
      {/* Header: name + save */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-[15px] leading-snug flex items-center gap-1">
          {contact.name}
          {contact.isVerified && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-label="Terverifikasi">
              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          )}
        </h3>
        <button
          onClick={handleSave}
          className="flex-shrink-0 p-0.5 active:scale-90 transition-transform"
          title={saved ? "Hapus dari tersimpan" : "Simpan kontak"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${saved ? "text-primary-700" : "text-gray-300"}`}
            fill={saved ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={saved ? 0 : 1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Description */}
      {contact.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{contact.description}</p>
      )}

      {/* Category tag */}
      {contact.category && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium text-gray-600">
          <CategoryIcon slug={contact.category.slug} className="w-3 h-3" />
          {contact.category.name}
        </span>
      )}

      {/* Address */}
      {contact.address && (
        <div className="flex items-start gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-gray-500 line-clamp-1">{contact.address}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {/* Primary: WhatsApp */}
        <a
          href={formatWhatsAppUrl(contact.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-9 rounded-xl bg-primary-600 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="text-xs font-semibold text-white">WhatsApp</span>
        </a>

        {/* Secondary: Telepon */}
        <a
          href={formatTelUrl(contact.phone)}
          className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 active:scale-95 active:bg-gray-50 transition-all"
          title="Telepon"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </a>

        {/* Secondary: Copy */}
        <button
          onClick={handleCopy}
          className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 active:scale-95 active:bg-gray-50 transition-all relative"
          title="Salin nomor"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
