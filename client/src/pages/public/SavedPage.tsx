import { useState, useEffect } from "react";
import { apiClient } from "../../lib/axios";
import { ContactCard } from "../../components/shared/ContactCard";
import { ContactListShimmer } from "../../components/shared/Shimmer";
import { getSavedIds, toggleSaved } from "../../lib/saved";
import type { Contact } from "../../types";
import { HiOutlineBookmark, HiXMark } from "react-icons/hi2";

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
              <HiOutlineBookmark className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Belum ada kontak tersimpan</p>
            <p className="text-xs text-gray-500">Simpan kontak dari halaman beranda untuk akses cepat</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {contacts.map((contact) => (
              <div key={contact.id} className="relative">
                <ContactCard contact={contact} hideSave />
                <button
                  onClick={() => handleRemove(contact.id)}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors z-20"
                  title="Hapus dari tersimpan"
                >
                  <HiXMark className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
