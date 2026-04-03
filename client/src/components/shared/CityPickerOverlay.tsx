import { useState, useEffect } from "react";
import type { City, Kecamatan } from "../../types";
import { HiXMark, HiArrowLeft } from "react-icons/hi2";
import { useKecamatans } from "../../hooks/useContacts";

interface CityPickerOverlayProps {
  cities: City[];
  onSelect: (city: City, kecamatan: Kecamatan | null) => void;
  onClose?: () => void;
}

export function CityPickerOverlay({ cities, onSelect, onClose }: CityPickerOverlayProps) {
  const [step, setStep] = useState<"city" | "kecamatan">("city");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const { data: kecamatanData, isLoading: loadingKecamatans } = useKecamatans(
    step === "kecamatan" ? selectedCity?.slug ?? null : null
  );
  const kecamatans = kecamatanData?.data ?? [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleCitySelect(city: City) {
    setSelectedCity(city);
    setStep("kecamatan");
  }

  function handleKecamatanSelect(kecamatan: Kecamatan | null) {
    if (!selectedCity) return;
    onSelect(selectedCity, kecamatan);
  }

  function handleBack() {
    setStep("city");
    setSelectedCity(null);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
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
          <div className="flex items-center gap-2">
            {step === "kecamatan" && (
              <button
                onClick={handleBack}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
              >
                <HiArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              {step === "city" ? (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Pilih Kota</h2>
                  <p className="text-xs text-gray-500">Temukan kontak di kota kamu</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Pilih Kecamatan</h2>
                  <p className="text-xs text-gray-500">{selectedCity?.name}</p>
                </>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-5 pb-8">
          {step === "city" ? (
            <div className="grid grid-cols-2 gap-2.5">
              {cities.map((city) => (
                <button
                  key={city.slug}
                  onClick={() => handleCitySelect(city)}
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
          ) : (
            <div className="flex flex-col gap-2">
              {/* Skip kecamatan — show all contacts in city */}
              <button
                onClick={() => handleKecamatanSelect(null)}
                className="flex items-center p-3.5 rounded-2xl bg-primary-50 ring-1 ring-primary-200 hover:bg-primary-100 transition-all text-left active:scale-[0.97]"
              >
                <span className="font-semibold text-sm text-primary-700">Semua Kecamatan</span>
              </button>

              {loadingKecamatans ? (
                <div className="grid grid-cols-2 gap-2.5 mt-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 mt-1">
                  {kecamatans.map((kec) => (
                    <button
                      key={kec.slug}
                      onClick={() => handleKecamatanSelect(kec)}
                      className="flex flex-col items-start p-3.5 rounded-2xl bg-gray-50 hover:bg-primary-50 hover:ring-1 hover:ring-primary-200 transition-all text-left active:scale-[0.97]"
                    >
                      <span className="font-semibold text-sm text-gray-900 capitalize">
                        {kec.name.toLowerCase()}
                      </span>
                      {kec._count?.contacts !== undefined && kec._count.contacts > 0 && (
                        <span className="text-[11px] text-primary-600 font-medium mt-1.5">
                          {kec._count.contacts} kontak
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
