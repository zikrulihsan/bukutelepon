export function CategoryGridShimmer() {
  return (
    <div className="mt-4 mb-6">
      <div className="grid grid-cols-4 gap-y-4 gap-x-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-2xl shimmer" />
            <div className="h-3 w-10 rounded shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmergencyStripShimmer() {
  return (
    <div className="mt-4 mb-2">
      <div className="flex gap-2.5 overflow-hidden -mx-4 px-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center gap-2.5 bg-red-50/50 rounded-2xl px-3.5 py-2.5"
          >
            <div className="w-9 h-9 rounded-full shimmer" />
            <div>
              <div className="h-3 w-20 rounded shimmer mb-1.5" />
              <div className="h-2.5 w-16 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentContactsShimmer() {
  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-32 rounded shimmer" />
        <div className="h-3 w-20 rounded shimmer" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <ContactCardShimmer key={i} />
        ))}
      </div>
    </div>
  );
}

export function ContactCardShimmer() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4">
      <div className="flex gap-3.5">
        <div className="w-[84px] h-[84px] rounded-2xl shimmer flex-shrink-0" />
        <div className="flex-1 min-w-0 pt-1">
          <div className="h-4 w-36 rounded shimmer" />
          <div className="h-2.5 w-24 rounded shimmer mt-2.5" />
          <div className="h-3 w-full rounded shimmer mt-3" />
          <div className="h-3 w-2/3 rounded shimmer mt-1.5" />
        </div>
      </div>
      <div className="flex items-center gap-2.5 mt-4">
        <div className="flex-1 h-11 rounded-xl shimmer" />
        <div className="h-11 w-24 rounded-xl shimmer" />
        <div className="h-11 w-11 rounded-xl shimmer" />
      </div>
    </div>
  );
}

export function ContactListShimmer({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <ContactCardShimmer key={i} />
      ))}
    </div>
  );
}

export function SearchResultsShimmer({
  count = 2,
  label,
}: {
  count?: number;
  label?: string;
}) {
  return (
    <div role="status" aria-live="polite" aria-label={label}>
      {label && (
        <p className="mb-3 text-center text-[13px] font-semibold text-[#71809B]">
          {label}
        </p>
      )}
      <div className="space-y-2.5" aria-hidden="true">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-3">
            <div className="h-14 w-14 shrink-0 rounded-xl shimmer" />
            <div className="min-w-0 flex-1">
              <div className="h-3.5 w-3/5 rounded shimmer" />
              <div className="mt-2 h-2.5 w-2/5 rounded shimmer" />
              <div className="mt-2 h-2.5 w-4/5 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryChipsShimmer({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-7 w-24 rounded-full shimmer flex-shrink-0" />
      ))}
    </div>
  );
}
