interface SkeletonProps {
  className?: string;
}

/** Bare shimmer block — compose these into skeleton layouts per-page. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-ahmedify-card ${className}`}
    />
  );
}

/** Matches SongCard/EntityCards' footprint for horizontal scrollers. */
export function CardSkeleton({ round = false }: { round?: boolean }) {
  return (
    <div className="w-40 md:w-44 shrink-0 rounded-xl p-3 bg-ahmedify-bg-secondary">
      <Skeleton
        className={`aspect-square mb-3 ${round ? "rounded-full" : "rounded-lg"}`}
      />
      <Skeleton className="h-3.5 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/** Matches SongRow's footprint for vertical lists. */
export function RowSkeleton() {
  return (
    <div className="w-full flex items-center gap-4 px-3 py-2.5">
      <Skeleton className="h-10 w-10 rounded-md shrink-0" />
      <div className="min-w-0 flex-1 flex flex-col gap-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-3 w-10 shrink-0" />
    </div>
  );
}

/** Row of CardSkeletons, matching a HorizontalScroller while data loads. */
export function CardRowSkeleton({
  count = 5,
  round = false,
}: {
  count?: number;
  round?: boolean;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} round={round} />
      ))}
    </div>
  );
}

/** Grid of CardSkeletons, matching the Albums/Artists/Playlists page grids. */
export function GridSkeleton({
  count = 12,
  round = false,
}: {
  count?: number;
  round?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} round={round} />
      ))}
    </div>
  );
}
