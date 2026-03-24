import { useState, useEffect } from "react";
import { apiClient } from "../../lib/axios";
import { ContactCard } from "../../components/shared/ContactCard";
import { ContactListShimmer } from "../../components/shared/Shimmer";
import type { Contact } from "../../types";

const STORAGE_KEY = "bukutelepon_saved";

export function getSavedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleSaved(id: string): boolean {
  const ids = getSavedIds();
  const idx = ids.indexOf(id);
  if (idx >= 0) {
    ids.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return false;
  }
  ids.unshift(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  return true;
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id);
}

export default function SavedPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      const ids = getSavedIds();
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(
          ids.map((id) =>
            apiClient
              .get(`/contacts/${id}`)
              .then((r) => r.data.data as Contact)
              .catch(() => null)
          )
        );
        setContacts(results.filter(Boolean) as Contact[]);
      } catch {
        // ignore
      }
      setLoading(false);
    }
    fetchSaved();
  }, []);

  function handleRemove(id: string) {
    toggleSaved(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Kontak Tersimpan</h1>
        <p className="text-xs text-gray-500 mt-0.5">Kontak yang kamu simpan untuk akses cepat</p>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <ContactListShimmer count={3} />
        ) : contacts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Belum ada kontak tersimpan</p>
            <p className="text-xs text-gray-500">Simpan kontak dari halaman beranda untuk akses cepat</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {contacts.map((contact) => (
              <div key={contact.id} className="relative">
                <ContactCard contact={contact} />
                <button
                  onClick={() => handleRemove(contact.id)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Hapus dari tersimpan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
