import type { ReactNode } from "react";

export default function HorizontalScroller({
  children,
  emptyLabel,
}: {
  children: ReactNode[];
  emptyLabel: string;
}) {
  if (children.length === 0) {
    return (
      <p className="text-sm text-ahmedify-text-secondary py-4">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scroll-smooth">
      {children}
    </div>
  );
}