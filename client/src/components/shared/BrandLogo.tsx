interface BrandLogoProps {
  className?: string;
  decorative?: boolean;
  alt?: string;
}

export function BrandLogo({ className = "", decorative = false, alt = "CariKontak" }: BrandLogoProps) {
  return (
    <img
      src="/brand-logo.png"
      alt={decorative ? "" : alt}
      aria-hidden={decorative || undefined}
      width={512}
      height={512}
      draggable={false}
      decoding="async"
      className={`select-none object-contain ${className}`}
    />
  );
}
