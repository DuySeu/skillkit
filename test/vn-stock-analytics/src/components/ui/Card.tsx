import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Night Desk's elevated surface: hairline border, soft depth. */
  glass?: boolean;
}

export function Card({ className, children, glass, ...rest }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border shadow-card",
        glass ? "glass" : "bg-card",
        "text-card-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
