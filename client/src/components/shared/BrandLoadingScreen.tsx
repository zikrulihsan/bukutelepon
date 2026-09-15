import { BrandLogo } from "./BrandLogo";

interface BrandLoadingScreenProps {
  label: string;
  fixed?: boolean;
}

export function BrandLoadingScreen({ label, fixed = false }: BrandLoadingScreenProps) {
  return (
    <div
      className={`brand-loading-screen ${fixed ? "fixed inset-0 z-[100]" : "min-h-[100dvh]"} grid place-items-center bg-[#F8FAF7] px-6`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex max-w-[280px] flex-col items-center text-center">
        <BrandLogo decorative className="h-14 w-14" />
        <p className="mt-5 text-[16px] font-bold leading-6 tracking-[-0.025em] text-[#08234B]">
          {label}
        </p>
        <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-700/35" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-700/60 [animation-delay:160ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-700/35 [animation-delay:320ms]" />
        </div>
      </div>
    </div>
  );
}
