import { useEffect } from "react";
import { createPortal } from "react-dom";
import { HiEllipsisHorizontal, HiXMark } from "react-icons/hi2";
import { useI18n } from "../../i18n/LanguageContext";
import { CategoryIcon, getCategoryVisual, preloadCategoryIcon } from "./CategoryIcon";

interface AllCategoriesSheetProps {
  open: boolean;
  onClose: () => void;
  onSelect: (slug: string) => void;
}

const CATEGORY_GROUPS = [
  {
    titleKey: "categories.groupPlaces" as const,
    items: [
      { slug: "kuliner", name: "Kuliner" },
      { slug: "toko-retail", name: "Toko & Retail" },
      { slug: "penginapan", name: "Penginapan" },
      { slug: "wisata", name: "Wisata" },
    ],
  },
  {
    titleKey: "categories.groupServices" as const,
    items: [
      { slug: "jasa", name: "Jasa" },
      { slug: "kesehatan", name: "Kesehatan" },
      { slug: "pendidikan", name: "Pendidikan" },
      { slug: "transportasi", name: "Transportasi" },
    ],
  },
  {
    titleKey: "categories.groupBusiness" as const,
    items: [
      { slug: "properti", name: "Properti" },
      { slug: "keuangan", name: "Keuangan" },
      { slug: "elektronik", name: "Elektronik" },
    ],
  },
  {
    titleKey: "categories.groupPublic" as const,
    items: [
      { slug: "pemerintah", name: "Pemerintah" },
      { slug: "darurat", name: "Darurat" },
      { slug: "lainnya", name: "Lainnya" },
    ],
  },
];

export function AllCategoriesSheet({ open, onClose, onSelect }: AllCategoriesSheetProps) {
  const { categoryName, t } = useI18n();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-labelledby="all-categories-title">
      <button type="button" className="absolute inset-0 h-full w-full bg-[#071C33]/45 backdrop-blur-[2px]" onClick={onClose} aria-label={t("common.close")} />
      <div className="animate-slide-up absolute inset-x-0 bottom-0 mx-auto flex max-h-[84dvh] max-w-[425px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-[0_-18px_45px_rgba(7,28,51,.18)]">
        <div className="shrink-0 px-5 pb-3 pt-2.5">
          <span className="mx-auto block h-1 w-10 rounded-full bg-[#AEB7C4]" aria-hidden="true" />
          <div className="mt-3 flex items-center justify-between">
            <div>
              <h2 id="all-categories-title" className="text-[20px] font-extrabold tracking-[-.045em] text-[#08234B]">{t("categories.allTitle")}</h2>
              <p className="mt-0.5 text-[12px] font-medium text-[#7B899F]">{t("categories.allSubtitle")}</p>
            </div>
            <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#F1F4F6] text-[#60708A] active:scale-95" aria-label={t("common.close")}>
              <HiXMark className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="scrollbar-hide overflow-y-auto px-5 pb-[calc(22px+env(safe-area-inset-bottom))]">
          {CATEGORY_GROUPS.map((group) => (
            <section key={group.titleKey} className="mt-4 first:mt-2">
              <h3 className="text-[15px] font-extrabold tracking-[-.025em] text-[#344054]">{t(group.titleKey)}</h3>
              <div className="mt-3 grid grid-cols-4 gap-x-3 gap-y-4">
                {group.items.map((category) => {
                  const visual = getCategoryVisual(category.slug);
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      onPointerEnter={() => { void preloadCategoryIcon(category.slug); }}
                      onPointerDown={() => { void preloadCategoryIcon(category.slug); }}
                      onFocus={() => { void preloadCategoryIcon(category.slug); }}
                      onClick={() => onSelect(category.slug)}
                      className="flex min-w-0 flex-col items-center gap-1.5 text-center active:scale-[.97]"
                    >
                      <span className={`grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-gradient-to-br ${visual?.tileBackground ?? "from-[#F6F7F9] to-[#E8EBEF]"}`}>
                        {category.slug === "lainnya" ? (
                          <HiEllipsisHorizontal className="h-7 w-7 text-[#344054]" aria-hidden="true" />
                        ) : (
                          <CategoryIcon slug={category.slug} className="h-[68px] w-[68px] scale-[1.08]" />
                        )}
                      </span>
                      <span className="line-clamp-2 min-h-8 w-full text-[10.5px] font-bold leading-4 text-[#26364D]">{categoryName(category)}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
