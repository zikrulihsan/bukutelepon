import type React from "react";
import { HiOutlineHeart, HiOutlineAcademicCap, HiOutlineCog6Tooth, HiOutlineBuildingLibrary, HiOutlineBell, HiOutlineMap, HiOutlineArchiveBox } from "react-icons/hi2";
import { HiOutlineTruck } from "react-icons/hi";
import { LuCoffee } from "react-icons/lu";

interface CategoryIconProps {
  slug: string;
  className?: string;
}

export function CategoryIcon({ slug, className = "w-7 h-7" }: CategoryIconProps) {
  const icons: Record<string, React.ReactNode> = {
    kesehatan: <HiOutlineHeart className={className} />,
    pendidikan: <HiOutlineAcademicCap className={className} />,
    kuliner: <LuCoffee className={className} />,
    jasa: <HiOutlineCog6Tooth className={className} />,
    pemerintah: <HiOutlineBuildingLibrary className={className} />,
    darurat: <HiOutlineBell className={className} />,
    transportasi: <HiOutlineTruck className={className} />,
    wisata: <HiOutlineMap className={className} />,
  };

  return (
    <span className="text-current">
      {icons[slug] ?? <HiOutlineArchiveBox className={className} />}
    </span>
  );
}
