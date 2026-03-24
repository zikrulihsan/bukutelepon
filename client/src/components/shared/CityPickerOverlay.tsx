import { useEffect } from "react";
import type { City } from "../../types";

interface CityPickerOverlayProps {
  cities: City[];
  onSelect: (city: City) => void;
  onClose?: () => void;
}

export function CityPickerOverlay({ cities, onSelect, onClose }: CityPickerOverlayProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl animate-slide-up max-h-[80vh] flex flex-col shadow-2xl">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pilih Kota</h2>
            <p className="text-xs text-gray-500">Temukan kontak di kota kamu</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* City list */}
        <div className="overflow-y-auto flex-1 px-5 pb-8">
          <div className="grid grid-cols-2 gap-2.5">
            {cities.map((city) => (
              <button
                key={city.slug}
                onClick={() => onSelect(city)}
                className="flex flex-col items-start p-3.5 rounded-2xl bg-gray-50 hover:bg-primary-50 hover:ring-1 hover:ring-primary-200 transition-all text-left active:scale-[0.97]"
              >
                <span className="font-semibold text-sm text-gray-900">{city.name}</span>
                <span className="text-[11px] text-gray-400 mt-0.5">{city.province}</span>
                {city._count?.contacts !== undefined && city._count.contacts > 0 && (
                  <span className="text-[11px] text-primary-600 font-medium mt-1.5">
                    {city._count.contacts} kontak
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
