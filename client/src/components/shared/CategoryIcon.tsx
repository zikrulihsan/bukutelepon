import type React from "react";
import { HiOutlineHeart, HiOutlineAcademicCap, HiOutlineCog6Tooth, HiOutlineBuildingLibrary, HiOutlineBell, HiOutlineMap, HiOutlineArchiveBox, HiOutlineBriefcase } from "react-icons/hi2";
import { HiOutlineTruck } from "react-icons/hi";
import { LuCoffee } from "react-icons/lu";

export interface CategoryVisual {
  src: string;
  tileBackground: string;
  imageClassName?: string;
}

const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  kuliner: {
    src: "/category-icons/kuliner.webp",
    tileBackground: "from-[#FFF8EE] to-[#FFEAD6]",
  },
  shop: {
    src: "/category-icons/shop.webp",
    tileBackground: "from-[#FFF6F3] to-[#FFE0E2]",
  },
  service: {
    src: "/category-icons/service.webp",
    tileBackground: "from-[#EEF7FF] to-[#D7E8FF]",
  },
  education: {
    src: "/category-icons/education.webp",
    tileBackground: "from-[#FAF4FF] to-[#E9DCFF]",
  },
  transport: {
    src: "/category-icons/transport.webp",
    tileBackground: "from-[#F0F7FF] to-[#D9E9FF]",
  },
  health: {
    src: "/category-icons/health.webp",
    tileBackground: "from-[#F2FFF8] to-[#DDF5E9]",
  },
  lodging: {
    src: "/category-icons/lodging.webp",
    tileBackground: "from-[#FFF8EC] to-[#FFE7BE]",
  },
  property: {
    src: "/category-icons/property.webp",
    tileBackground: "from-[#FFFAEC] to-[#FFEBC6]",
  },
  vacation: {
    src: "/category-icons/vacation.webp",
    tileBackground: "from-[#EEFFFF] to-[#D4F4F2]",
  },
  finance: {
    src: "/category-icons/finance.webp",
    tileBackground: "from-[#FFF5F5] to-[#FFDCDD]",
  },
  government: {
    src: "/category-icons/government.webp",
    tileBackground: "from-[#F6F8FF] to-[#E2E8F7]",
  },
  emergency: {
    src: "/category-icons/emergency.webp",
    tileBackground: "from-[#FFF5F5] to-[#FFDCDD]",
  },
  electronics: {
    src: "/category-icons/electronics.webp",
    tileBackground: "from-[#F3F5FF] to-[#DDE4FF]",
  },
};

const CATEGORY_VISUAL_ALIASES: Record<string, keyof typeof CATEGORY_VISUALS> = {
  makanan: "kuliner",
  minuman: "kuliner",
  kafe: "kuliner",
  cafe: "kuliner",
  restoran: "kuliner",
  toko: "shop",
  retail: "shop",
  "toko-retail": "shop",
  "toko-dan-retail": "shop",
  belanja: "shop",
  jasa: "service",
  layanan: "service",
  pendidikan: "education",
  transportasi: "transport",
  kesehatan: "health",
  penginapan: "lodging",
  properti: "property",
  wisata: "vacation",
  liburan: "vacation",
  keuangan: "finance",
  pemerintah: "government",
  darurat: "emergency",
  elektronik: "electronics",
};

export function getCategoryVisual(slug?: string | null): CategoryVisual | null {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase().trim();
  const key = CATEGORY_VISUAL_ALIASES[normalizedSlug] ?? normalizedSlug;
  return CATEGORY_VISUALS[key] ?? null;
}

interface CategoryIconProps {
  slug: string;
  className?: string;
}

export function CategoryIcon({ slug, className = "w-7 h-7" }: CategoryIconProps) {
  const visual = getCategoryVisual(slug);

  if (visual) {
    return (
      <img
        src={visual.src}
        alt=""
        aria-hidden="true"
        decoding="async"
        draggable={false}
        className={`${className} shrink-0 object-contain drop-shadow-[0_4px_5px_rgba(24,39,58,0.16)] ${visual.imageClassName ?? ""}`}
      />
    );
  }

  const icons: Record<string, React.ReactNode> = {
    kesehatan: <HiOutlineHeart className={className} />,
    pendidikan: <HiOutlineAcademicCap className={className} />,
    kuliner: <LuCoffee className={className} />,
    jasa: <HiOutlineCog6Tooth className={className} />,
    pemerintah: <HiOutlineBuildingLibrary className={className} />,
    darurat: <HiOutlineBell className={className} />,
    transportasi: <HiOutlineTruck className={className} />,
    wisata: <HiOutlineMap className={className} />,
    penginapan: <HiOutlineBriefcase className={className} />,
  };

  return (
    <span className="text-current">
      {icons[slug] ?? <HiOutlineArchiveBox className={className} />}
    </span>
  );
}
