/** Vietnamese formatting + the HOSE/HNX/UPCOM price-board colour code. */

const nf = new Intl.NumberFormat("vi-VN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const nf0 = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

export const price = (n: number) => nf.format(n);
export const int = (n: number) => nf0.format(n);

export function pct(n: number) {
  const s = nf.format(Math.abs(n));
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${s}%`;
}

export function signed(n: number) {
  const s = nf.format(Math.abs(n));
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${s}`;
}

/** Volume in Vietnamese short scale: nghìn / triệu / tỷ. */
export function volume(n: number) {
  if (n >= 1e9) return `${nf.format(n / 1e9)} tỷ`;
  if (n >= 1e6) return `${nf.format(n / 1e6)} triệu`;
  if (n >= 1e3) return `${nf0.format(n / 1e3)} nghìn`;
  return nf0.format(n);
}

export function vnd(n: number) {
  if (n >= 1e9) return `${nf.format(n / 1e9)} tỷ ₫`;
  if (n >= 1e6) return `${nf.format(n / 1e6)} triệu ₫`;
  return `${nf0.format(n)} ₫`;
}

export type PxState = "ceil" | "up" | "ref" | "down" | "floor";

export interface Quote {
  ref: number;
  ceil: number;
  floor: number;
  last: number;
}

/**
 * The board's five states, in the official precedence: trần and sàn outrank
 * plain tăng/giảm, so a stock at its ceiling is purple, never green.
 */
export function pxState(q: Quote): PxState {
  if (q.last >= q.ceil) return "ceil";
  if (q.last <= q.floor) return "floor";
  if (q.last > q.ref) return "up";
  if (q.last < q.ref) return "down";
  return "ref";
}

/** Text colour for a price cell. Never uses a brand token — see index.css. */
export const PX_TEXT: Record<PxState, string> = {
  ceil: "text-ceil",
  up: "text-up",
  ref: "text-ref",
  down: "text-down",
  floor: "text-floor",
};

/** Screen-reader wording, because colour alone may not carry the meaning. */
export const PX_LABEL: Record<PxState, string> = {
  ceil: "giá trần",
  up: "tăng giá",
  ref: "giá tham chiếu",
  down: "giảm giá",
  floor: "giá sàn",
};
