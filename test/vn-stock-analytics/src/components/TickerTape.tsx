import { TICKERS } from "@/lib/mock";
import { PX_TEXT, pct, price, pxState } from "@/lib/format";
import { cn } from "@/lib/cn";

/** Marquee of live-ish quotes. Decorative motion, so it is hidden from
 *  assistive tech and stops entirely under prefers-reduced-motion. */
export function TickerTape() {
  const row = [...TICKERS, ...TICKERS];

  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden border-y border-border bg-card/50 py-2.5"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

      <div className="flex w-max animate-[tape_44s_linear_infinite] gap-8 motion-reduce:animate-none">
        {row.map((t, i) => {
          const state = pxState(t);
          const d = ((t.last - t.ref) / t.ref) * 100;
          return (
            <span key={`${t.sym}-${i}`} className="flex items-center gap-2 text-sm">
              <span className="font-semibold">{t.sym}</span>
              <span className={cn("num", PX_TEXT[state])}>{price(t.last)}</span>
              <span className={cn("num text-xs", PX_TEXT[state])}>{pct(d)}</span>
            </span>
          );
        })}
      </div>

      <style>{`@keyframes tape { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
