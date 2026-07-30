/** Deterministic mock data — no backend, and every reload renders identically.
 *  Seeded so all five board states actually appear in the ticker tape. */

import type { Quote } from "./format";

export interface Ticker extends Quote {
  sym: string;
  name: string;
  exchange: "HOSE" | "HNX" | "UPCOM";
  vol: number;
}

const t = (
  sym: string,
  name: string,
  exchange: Ticker["exchange"],
  ref: number,
  last: number,
  vol: number,
): Ticker => ({
  sym,
  name,
  exchange,
  ref,
  last,
  vol,
  // HOSE bands are ±7%; close enough for a prototype and it makes trần/sàn real.
  ceil: Math.round(ref * 1.07 * 100) / 100,
  floor: Math.round(ref * 0.93 * 100) / 100,
});

export const TICKERS: Ticker[] = [
  t("FPT", "CTCP FPT", "HOSE", 118.5, 126.8, 4_120_000), // trần
  t("VNM", "Vinamilk", "HOSE", 68.2, 70.1, 2_840_000), // tăng
  t("HPG", "Hòa Phát", "HOSE", 27.35, 27.35, 18_600_000), // TC
  t("VCB", "Vietcombank", "HOSE", 91.4, 89.2, 1_960_000), // giảm
  t("SSI", "Chứng khoán SSI", "HOSE", 34.8, 32.37, 12_400_000), // sàn
  t("MWG", "Thế Giới Di Động", "HOSE", 61.9, 63.4, 3_310_000),
  t("VIC", "Vingroup", "HOSE", 42.15, 41.3, 5_700_000),
  t("SHS", "Chứng khoán SHS", "HNX", 15.6, 16.2, 8_950_000),
];

export const INDICES = [
  { name: "VN-Index", value: 1284.63, change: 8.42, pct: 0.66 },
  { name: "VN30", value: 1341.08, change: 11.27, pct: 0.85 },
  { name: "HNX-Index", value: 238.94, change: -1.16, pct: -0.48 },
  { name: "UPCOM", value: 93.71, change: 0.22, pct: 0.24 },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Ticker symbols the assistant cited, rendered as cards under the message. */
  cites?: string[];
  sources?: { label: string; note: string }[];
}

export const CHAT_SEED: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    text: "So sánh FPT và MWG trong quý vừa rồi giúp tôi.",
  },
  {
    id: "m2",
    role: "assistant",
    text:
      "Trong quý gần nhất, FPT tăng trưởng doanh thu 21,4% so với cùng kỳ, dẫn dắt bởi mảng " +
      "công nghệ nước ngoài. MWG phục hồi chậm hơn với mức tăng 8,1%, chủ yếu nhờ chuỗi Bách " +
      "Hoá Xanh đạt điểm hoà vốn.\n\nVề định giá, FPT đang giao dịch ở P/E 21,3 lần — cao hơn " +
      "trung bình 3 năm là 17,8 lần. MWG ở mức 18,6 lần.",
    cites: ["FPT", "MWG"],
    sources: [
      { label: "BCTC hợp nhất Q3", note: "FPT — công bố 28/10" },
      { label: "BCTC hợp nhất Q3", note: "MWG — công bố 30/10" },
    ],
  },
  {
    id: "m3",
    role: "user",
    text: "Rủi ro chính của FPT là gì?",
  },
  {
    id: "m4",
    role: "assistant",
    text:
      "Ba rủi ro đáng chú ý:\n\n1. Tỷ trọng doanh thu từ thị trường Nhật Bản cao, nên biến động " +
      "tỷ giá JPY/VND ảnh hưởng trực tiếp tới biên lợi nhuận.\n2. Chi phí nhân sự công nghệ tăng " +
      "nhanh hơn doanh thu trong hai quý liên tiếp.\n3. Định giá đã phản ánh phần lớn kỳ vọng " +
      "tăng trưởng — dư địa cho bất ngờ tích cực bị thu hẹp.",
    cites: ["FPT"],
  },
];

export const SUGGESTED = [
  "Phân tích kỹ thuật VN-Index tuần này",
  "Cổ phiếu ngân hàng nào có P/B thấp nhất?",
  "Khối ngoại đang mua ròng mã nào?",
  "Giải thích chỉ số RSI cho người mới",
];
