import { PX_LABEL, PX_TEXT, price, pct, pxState } from "@/lib/format";
import type { Ticker } from "@/lib/mock";
import { cn } from "@/lib/cn";

/**
 * The board's colour code is never the only carrier of meaning: the sign and
 * an sr-only word ride along with the colour, so it survives colour-blindness
 * and greyscale printing.
 */
export function PriceCell({
  t,
  className,
}: {
  t: Ticker;
  className?: string;
}) {
  const state = pxState(t);
  const delta = t.last - t.ref;
  const deltaPct = (delta / t.ref) * 100;

  return (
    <span className={cn("num tabular-nums", PX_TEXT[state], className)}>
      {price(t.last)}
      <span className="sr-only"> — {PX_LABEL[state]}, </span>
      <span aria-hidden="true"> </span>
      <span className="text-[0.8em] opacity-90">{pct(deltaPct)}</span>
    </span>
  );
}
