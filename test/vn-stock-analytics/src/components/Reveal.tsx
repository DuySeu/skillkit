import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Motion tier 5 → the database's "Subtle" presets:
 *   Scroll Reveal  — opacity 0, y 12px, 350ms, power1.out, trigger at top 90%
 *   Stagger List   — 30ms per item, capped so long lists never crawl
 *
 * Done in CSS + IntersectionObserver rather than GSAP: two subtle effects do
 * not justify a ~70KB animation dependency on a stack the user deliberately
 * kept minimal. power1.out ≈ cubic-bezier(0.25, 0.46, 0.45, 0.94).
 *
 * Content is visible by default and only *armed* (hidden) once JS confirms
 * motion is wanted — in a layout effect, before paint, so there is no flash
 * and no JS-off content that never appears.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  /** Stagger index × 30ms, applied as a transition-delay. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
  }, []);

  useEffect(() => {
    if (!armed || shown) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [armed, shown]);

  const hidden = armed && !shown;

  return (
    <Tag
      ref={ref as never}
      style={hidden ? undefined : { transitionDelay: `${delay * 30}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-[350ms]",
        "[transition-timing-function:cubic-bezier(0.25,0.46,0.45,0.94)]",
        "motion-reduce:transition-none",
        hidden ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
