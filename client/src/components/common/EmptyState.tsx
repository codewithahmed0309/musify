import type { ReactNode } from "react";
import { Music2 } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}

/**
 * Friendly placeholder for lists/grids with no data yet, used instead of a
 * bare "No X yet." line so empty screens still feel on-brand.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-ahmedify-border ${
        compact ? "py-8 px-4" : "py-16 px-6"
      }`}
    >
      <div className="h-12 w-12 rounded-full bg-ahmedify-card flex items-center justify-center mb-4 text-ahmedify-text-secondary">
        {icon ?? <Music2 size={20} />}
      </div>
      <p className="text-sm font-medium text-ahmedify-text">{title}</p>
      {description && (
        <p className="text-xs text-ahmedify-text-secondary mt-1 max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
