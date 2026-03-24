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
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-40 rounded shimmer" />
        <div className="h-5 w-5 rounded shimmer" />
      </div>
      <div className="h-3 w-56 rounded shimmer" />
      <div className="h-5 w-16 rounded-full shimmer" />
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 h-9 rounded-xl shimmer" />
        <div className="h-9 w-9 rounded-xl shimmer" />
        <div className="h-9 w-9 rounded-xl shimmer" />
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
