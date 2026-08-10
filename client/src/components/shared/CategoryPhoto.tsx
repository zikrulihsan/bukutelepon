import type React from "react";
import {
  HiHeart,
  HiAcademicCap,
  HiWrenchScrewdriver,
  HiBuildingLibrary,
  HiExclamationTriangle,
  HiTruck,
  HiMap,
  HiBuildingOffice2,
  HiArchiveBox,
} from "react-icons/hi2";
import { LuUtensils } from "react-icons/lu";

interface PhotoStyle {
  bg: string;
  fg: string;
  Icon: React.ComponentType<{ className?: string }>;
}

/** Fallback visual per kategori — dipakai saat kontak belum punya foto. */
const STYLES: Record<string, PhotoStyle> = {
  kesehatan:    { bg: "from-rose-50 to-rose-100",     fg: "text-rose-400",   Icon: HiHeart },
  pendidikan:   { bg: "from-amber-50 to-amber-100",   fg: "text-amber-400",  Icon: HiAcademicCap },
  kuliner:      { bg: "from-orange-50 to-orange-100", fg: "text-orange-400", Icon: LuUtensils },
  jasa:         { bg: "from-slate-50 to-slate-200",   fg: "text-slate-400",  Icon: HiWrenchScrewdriver },
  pemerintah:   { bg: "from-indigo-50 to-indigo-100", fg: "text-indigo-400", Icon: HiBuildingLibrary },
  darurat:      { bg: "from-red-50 to-red-100",       fg: "text-red-400",    Icon: HiExclamationTriangle },
  transportasi: { bg: "from-sky-50 to-sky-100",       fg: "text-sky-400",    Icon: HiTruck },
  wisata:       { bg: "from-teal-50 to-teal-100",     fg: "text-teal-400",   Icon: HiMap },
  penginapan:   { bg: "from-violet-50 to-violet-100", fg: "text-violet-400", Icon: HiBuildingOffice2 },
};

const FALLBACK: PhotoStyle = {
  bg: "from-neutral-50 to-neutral-150",
  fg: "text-neutral-300",
  Icon: HiArchiveBox,
};

interface CategoryPhotoProps {
  slug?: string | null;
  /** Kelas untuk kotaknya (ukuran, radius). */
  className?: string;
  /** Kelas untuk ikon di tengah. */
  iconClassName?: string;
}

export function CategoryPhoto({
  slug,
  className = "w-full h-full",
  iconClassName = "w-1/2 h-1/2",
}: CategoryPhotoProps) {
  const style = (slug && STYLES[slug]) || FALLBACK;
  const { Icon } = style;

  return (
    <div
      className={`${className} ${style.bg} bg-gradient-to-br flex items-center justify-center`}
      aria-hidden="true"
    >
      <Icon className={`${style.fg} ${iconClassName}`} />
    </div>
  );
}
