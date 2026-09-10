import { HiMinus, HiPlus, HiShoppingBag, HiTrash, HiXMark } from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import { useInquiry, trackStorefrontEvent } from "./InquiryContext";
import { formatPrice } from "./storefrontData";
import { StorefrontImage } from "./StorefrontImage";

interface InquiryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function InquiryDrawer({ open, onClose }: InquiryDrawerProps) {
  const { quantities, totalCount, totalPrice, hasUnpriced, setQuantity, clear, whatsappUrl, catalogItems } = useInquiry();
  const selectedItems = catalogItems.filter((item) => (quantities[item.id] ?? 0) > 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-[#15271F]/55 backdrop-blur-[2px]" onClick={onClose} aria-label="Tutup daftar pilihan" />
      <section className="relative w-full max-w-lg max-h-[88vh] overflow-hidden rounded-t-[28px] bg-[#FFFEFA] shadow-2xl sm:rounded-[28px]">
        <div className="flex items-center justify-between border-b border-[#E9E4D8] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#E7F0EA] text-[#245843]">
              <HiShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-[#19362A]">Daftar Pilihan</h2>
              <p className="text-xs text-[#718078]">{totalCount} item siap ditanyakan</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[#F1EEE7] text-[#526159] hover:bg-[#E9E4D8]" aria-label="Tutup">
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[52vh] space-y-3 overflow-y-auto px-5 py-4">
          {selectedItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-[#F1EEE7] text-[#829087]">
                <HiShoppingBag className="h-6 w-6" />
              </div>
              <p className="font-bold text-[#294437]">Belum ada pilihan</p>
              <p className="mt-1 text-sm text-[#7B877F]">Tambahkan produk yang ingin Anda tanyakan.</p>
            </div>
          ) : (
            selectedItems.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-2xl border border-[#EAE5D9] bg-white p-3">
                <StorefrontImage item={item} loading="lazy" className="h-20 w-20 flex-none rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#20382D]">{item.name}</p>
                  <p className="mt-0.5 text-xs font-semibold text-[#A3622A]">{formatPrice(item)}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-[#DBD6CB] bg-[#FAF8F3] p-0.5">
                      <button onClick={() => setQuantity(item.id, quantities[item.id] - 1)} className="grid h-7 w-7 place-items-center rounded-full text-[#53665C] hover:bg-white" aria-label={`Kurangi ${item.name}`}>
                        <HiMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-extrabold text-[#20382D]">{quantities[item.id]}</span>
                      <button onClick={() => setQuantity(item.id, quantities[item.id] + 1)} className="grid h-7 w-7 place-items-center rounded-full text-[#53665C] hover:bg-white" aria-label={`Tambah ${item.name}`}>
                        <HiPlus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button onClick={() => setQuantity(item.id, 0)} className="grid h-8 w-8 place-items-center rounded-full text-[#A8A29A] hover:bg-red-50 hover:text-red-500" aria-label={`Hapus ${item.name}`}>
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-[#E9E4D8] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4">
          {selectedItems.length > 0 && (
            <div className="mb-3 flex items-center justify-between text-sm">
              <button onClick={clear} className="font-semibold text-[#8B8175] hover:text-red-600">Hapus semua</button>
              <div className="text-right">
                <span className="mr-2 text-xs text-[#8B8175]">{hasUnpriced ? "Harga" : "Estimasi total"}</span>
                <span className="font-extrabold text-[#1C3C2F]">
                  {hasUnpriced
                    ? "Dikonfirmasi admin"
                    : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalPrice)}
                </span>
              </div>
            </div>
          )}
          <a
            href={selectedItems.length > 0 ? whatsappUrl : undefined}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => {
              if (selectedItems.length === 0) event.preventDefault();
              else trackStorefrontEvent("cart_whatsapp_click");
            }}
            className={`flex h-13 w-full items-center justify-center gap-2.5 rounded-full px-5 py-3.5 text-sm font-extrabold transition ${
              selectedItems.length > 0
                ? "bg-[#167C52] text-white shadow-[0_10px_24px_rgba(22,124,82,0.25)] hover:bg-[#116642] active:scale-[0.98]"
                : "cursor-not-allowed bg-[#E5E3DD] text-[#9A9A95]"
            }`}
          >
            <FaWhatsapp className="h-5 w-5" />
            Pesan via WhatsApp
          </a>
          <p className="mt-2 text-center text-[10px] leading-relaxed text-[#98A098]">Belum termasuk ongkir. Ketersediaan akan dikonfirmasi penjual.</p>
        </div>
      </section>
    </div>
  );
}
