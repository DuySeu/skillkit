import { useRef } from "react";
import { cn } from "@/lib/cn";

interface Props<T extends string> {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  label: string;
}

/** Hand-built because there's no component library: full ARIA tab semantics
 *  plus the arrow/Home/End keyboard behaviour the pattern requires. */
export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  label,
}: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (from: number, delta: number) => {
    const next = (from + delta + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 rounded-lg border border-border bg-muted p-1"
    >
      {tabs.map((t, i) => {
        const selected = t.id === active;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`panel-${t.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") move(i, 1);
              else if (e.key === "ArrowLeft") move(i, -1);
              else if (e.key === "Home") move(i, -i);
              else if (e.key === "End") move(i, tabs.length - 1 - i);
              else return;
              e.preventDefault();
            }}
            className={cn(
              "h-9 flex-1 rounded-md px-3 text-sm font-medium",
              "transition-colors duration-200",
              selected
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
