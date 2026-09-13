import { CategoryIcon, getCategoryVisual } from "./CategoryIcon";

interface CategoryTileProps {
  slug: string;
  name: string;
  onClick: () => void;
}

function MoreIcon() {
  return (
    <span className="absolute bottom-2 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-white/70 shadow-[0_4px_10px_rgba(50,61,78,0.08)]" aria-hidden="true">
      <span className="mb-1 text-[22px] font-extrabold tracking-[0.08em] text-[#344054]">•••</span>
    </span>
  );
}

export function CategoryTile({ slug, name, onClick }: CategoryTileProps) {
  const isAll = slug === "all";
  const visual = getCategoryVisual(slug);
  const background = isAll
    ? "from-[#F8F9FA] to-[#E8EAED]"
    : visual?.tileBackground ?? "from-white to-[#F1F5F3]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-[86px] min-w-0 flex-col items-center justify-start overflow-hidden rounded-[16px] bg-gradient-to-br ${background} px-1.5 pt-2.5 shadow-[0_4px_10px_rgba(11,49,45,0.08)] ring-1 ring-white/70 transition-transform active:scale-[0.98]`}
    >
      <span className="relative z-10 block w-full truncate text-[11.5px] font-extrabold leading-4 tracking-[-0.035em] text-[#08234B]">
        {name}
      </span>
      {isAll ? (
        <MoreIcon />
      ) : (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 top-7 flex items-center justify-center overflow-hidden" aria-hidden="true">
          <CategoryIcon
            slug={slug}
            className={visual
              ? "h-16 w-[70px] translate-y-2 scale-[1.20]"
              : "mb-1 h-10 w-10 text-[#08234B]"}
          />
        </span>
      )}
    </button>
  );
}
