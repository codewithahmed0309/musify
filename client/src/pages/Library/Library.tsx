import { useMemo, useState } from "react";
import { useSongs } from "@/hooks/useMusicData";
import SongRow from "@/components/common/SongRow";
import { RowSkeleton } from "@/components/common/loader";
import EmptyState from "@/components/common/EmptyState";

type SortKey = "recent" | "title" | "artist";

export default function Library() {
  const { data: songs, loading } = useSongs();
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  const sorted = useMemo(() => {
    const copy = [...songs];
    if (sortKey === "title") {
      copy.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortKey === "artist") {
      copy.sort((a, b) => a.artist_name.localeCompare(b.artist_name));
    } else {
      copy.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return copy;
  }, [songs, sortKey]);

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mt-1 mb-4 gap-3 flex-wrap">
        <h1 className="text-xl font-bold tracking-tight">Your Library</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-ahmedify-card rounded-full p-1">
            {(
              [
                { key: "recent", label: "Recently added" },
                { key: "title", label: "Title" },
                { key: "artist", label: "Artist" },
              ] as { key: SortKey; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-150 ${
                  sortKey === key
                    ? "bg-ahmedify-green text-black"
                    : "text-ahmedify-text-secondary hover:text-ahmedify-text"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <EmptyState
          title="Your library is empty"
          description="Songs added on the Add Song page will appear here automatically."
        />
      )}

      <div className="flex flex-col">
        {sorted.map((song, idx) => (
          <SongRow key={song.id} song={song} index={idx} queue={sorted} />
        ))}
      </div>
    </div>
  );
}
