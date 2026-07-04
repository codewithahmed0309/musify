import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-ahmedify-green text-black hover:bg-ahmedify-green-hover active:scale-[0.97]",
  secondary:
    "bg-ahmedify-card text-ahmedify-text hover:bg-ahmedify-card-hover active:scale-[0.97]",
  ghost:
    "bg-transparent text-ahmedify-text-secondary hover:text-ahmedify-text hover:bg-ahmedify-card/60 active:scale-[0.97]",
  danger:
    "bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-[0.97]",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5 rounded-full",
  md: "text-sm px-4 py-2.5 gap-2 rounded-full",
  lg: "text-sm px-6 py-3 gap-2 rounded-full",
};

/**
 * Shared button primitive: consistent hover/focus/active micro-interactions,
 * a built-in loading state (spinner + disabled), and a small variant system
 * so buttons stop being re-invented per page.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      icon,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${
          VARIANT_CLASSES[variant]
        } ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...rest}
      >
        {isLoading ? (
          <Loader2 size={size === "sm" ? 13 : 15} className="animate-spin" />
        ) : (
          icon
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
