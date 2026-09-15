import { BrandLogo } from "./BrandLogo";

interface BrandLoadingScreenProps {
  label: string;
  progress?: number;
  fixed?: boolean;
}

export function BrandLoadingScreen({ label, progress, fixed = false }: BrandLoadingScreenProps) {
  const value = progress === undefined ? undefined : Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      className={`brand-loading-screen ${fixed ? "fixed inset-0 z-[100]" : "min-h-[100dvh]"} grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_38%,rgba(211,242,224,.96),transparent_35%),#F8FAF7] px-6`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative flex flex-col items-center text-center">
        <div className="relative grid h-24 w-24 place-items-center" aria-hidden="true">
          <span className="brand-loader-orbit absolute inset-0 rounded-full border border-primary-700/15 border-t-primary-600/80" />
          <span className="absolute inset-[9px] rounded-full bg-white/75 shadow-[0_14px_34px_rgba(0,105,75,.16)] backdrop-blur" />
          <BrandLogo decorative className="brand-loader-logo relative h-[66px] w-[66px]" />
        </div>
        <p className="mt-4 text-[25px] font-extrabold tracking-[-0.055em] text-[#08234B]">CariKontak</p>
        <div
          className="mt-4 h-1.5 w-32 overflow-hidden rounded-full bg-[#DDEBE2]"
          role={value === undefined ? undefined : "progressbar"}
          aria-valuemin={value === undefined ? undefined : 0}
          aria-valuemax={value === undefined ? undefined : 100}
          aria-valuenow={value}
        >
          {value === undefined ? (
            <span className="brand-loader-indeterminate block h-full w-2/5 rounded-full bg-gradient-to-r from-primary-500 to-emerald-400" />
          ) : (
            <span
              className="block h-full rounded-full bg-gradient-to-r from-primary-700 to-emerald-400 transition-[width] duration-300 ease-out"
              style={{ width: `${Math.max(7, value)}%` }}
            />
          )}
        </div>
        <p className="mt-3 text-[13px] font-semibold text-[#71809B]">{label}</p>
      </div>
    </div>
  );
}
