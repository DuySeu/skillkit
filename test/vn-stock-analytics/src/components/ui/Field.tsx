import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@/lib/cn";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  /** Always visible — a placeholder is not a label. */
  label: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
}

export function Field({
  label,
  hint,
  error,
  trailing,
  className,
  id,
  ...rest
}: Props) {
  const auto = useId();
  const inputId = id ?? auto;
  const hintId = `${inputId}-hint`;
  const errId = `${inputId}-err`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(hint && hintId, error && errId) || undefined}
          className={cn(
            "h-11 w-full rounded-lg border bg-card px-3 text-sm",
            "placeholder:text-muted-foreground",
            "transition-colors duration-200",
            error ? "border-destructive" : "border-input",
            trailing && "pr-11",
            className,
          )}
          {...rest}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
            {trailing}
          </div>
        )}
      </div>

      {/* Error sits next to the field it belongs to, never only at the top. */}
      {error ? (
        <p id={errId} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
