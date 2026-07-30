import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { TickerTape } from "@/components/TickerTape";
import { PriceCell } from "@/components/PriceCell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, Eyebrow } from "@/components/ui/Badge";
import {
  IconArrow,
  IconBolt,
  IconBot,
  IconCheck,
  IconSparkles,
  IconShield,
} from "@/components/icons";
import { INDICES, TICKERS } from "@/lib/mock";
import { int, pct, price, volume } from "@/lib/format";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/cn";

const FEATURES = [
  {
    icon: IconBolt,
    title: "Bảng giá ba sàn, độ trễ thấp",
    body: "HOSE, HNX và UPCOM trên cùng một màn hình, giữ đúng quy ước màu trần — tăng — tham chiếu — giảm — sàn của bảng điện.",
  },
  {
    icon: IconBot,
    title: "Trợ lý AI hiểu tiếng Việt",
    body: "Hỏi bằng tiếng Việt tự nhiên về báo cáo tài chính, định giá hay rủi ro. Mọi câu trả lời đều kèm nguồn trích dẫn.",
  },
  {
    icon: IconSparkles,
    title: "Phân tích kỹ thuật tự động",
    body: "Nhận diện mẫu hình, vùng hỗ trợ và kháng cự, cùng cảnh báo khi giá chạm ngưỡng bạn đặt.",
  },
  {
    icon: IconShield,
    title: "Dữ liệu có nguồn gốc",
    body: "Số liệu đối chiếu với công bố chính thức của doanh nghiệp và sở giao dịch, kèm thời điểm cập nhật.",
  },
];

const PLANS = [
  {
    name: "Cơ bản",
    price: "Miễn phí",
    note: "Dành cho nhà đầu tư mới bắt đầu",
    features: ["Bảng giá ba sàn", "20 câu hỏi AI mỗi tháng", "5 mã theo dõi"],
    cta: "Bắt đầu miễn phí",
    highlight: false,
  },
  {
    name: "Chủ động",
    price: "299.000₫",
    unit: "/tháng",
    note: "Dành cho nhà đầu tư giao dịch thường xuyên",
    features: [
      "Toàn bộ tính năng Cơ bản",
      "Hỏi AI không giới hạn",
      "Danh mục và cảnh báo giá",
      "Phân tích kỹ thuật nâng cao",
      "Dữ liệu khối ngoại",
    ],
    cta: "Dùng thử 14 ngày",
    highlight: true,
  },
  {
    name: "Chuyên nghiệp",
    price: "899.000₫",
    unit: "/tháng",
    note: "Dành cho môi giới và nhà đầu tư tổ chức",
    features: [
      "Toàn bộ tính năng Chủ động",
      "Truy cập API",
      "Xuất báo cáo PDF",
      "Nhiều danh mục",
      "Hỗ trợ ưu tiên",
    ],
    cta: "Liên hệ tư vấn",
    highlight: false,
  },
];

const FAQ = [
  {
    q: "Dữ liệu có phải thời gian thực không?",
    a: "Gói Chủ động và Chuyên nghiệp nhận dữ liệu với độ trễ dưới 1 giây trong phiên. Gói Cơ bản có độ trễ 15 phút, theo quy định của sở giao dịch.",
  },
  {
    q: "Trợ lý AI có đưa ra khuyến nghị mua bán không?",
    a: "Không. Trợ lý AI tổng hợp và giải thích dữ liệu, luôn kèm nguồn để bạn tự kiểm chứng. Đây không phải là lời khuyên đầu tư, và quyết định cuối cùng thuộc về bạn.",
  },
  {
    q: "Tôi có thể huỷ gói bất cứ lúc nào không?",
    a: "Có. Bạn có thể huỷ trong phần Cài đặt, hiệu lực đến hết chu kỳ thanh toán hiện tại. Chúng tôi không thu phí huỷ.",
  },
  {
    q: "VNAlpha có kết nối với tài khoản chứng khoán của tôi không?",
    a: "Hiện tại VNAlpha là nền tảng phân tích, không thực hiện lệnh. Bạn có thể nhập danh mục thủ công hoặc tải lên sao kê để theo dõi hiệu suất.",
  },
];

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-dvh">
      <Navbar />

      <main id="main">
        {/* ─────────────────────────────────────────────────────────── hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
          {/* Night Desk's ambient light: two slow blobs behind the content. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -right-16 top-32 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
              <div>
                <Badge className="mb-5">
                  <IconSparkles className="h-3.5 w-3.5 text-primary" />
                  Trợ lý AI hiểu tiếng Việt
                </Badge>

                <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                  Phân tích thị trường
                  <br />
                  <span className="text-primary">chứng khoán Việt Nam</span>
                  <br />
                  nhanh hơn mỗi phiên
                </h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Bảng giá ba sàn, phân tích kỹ thuật và một trợ lý AI trả lời
                  bằng tiếng Việt — kèm nguồn trích dẫn cho mọi con số.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={() => navigate("/auth", "mode=register")}
                  >
                    Dùng thử miễn phí 14 ngày
                    <IconArrow className="h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/chat")}
                  >
                    <IconBot className="h-4 w-4" />
                    Xem trợ lý AI
                  </Button>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Không cần thẻ tín dụng · Huỷ bất cứ lúc nào
                </p>
              </div>

              {/* index cards */}
              <div className="grid grid-cols-2 gap-3">
                {INDICES.map((idx) => {
                  const up = idx.change > 0;
                  return (
                    <Card key={idx.name} glass className="p-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        {idx.name}
                      </p>
                      <p className="num mt-2 text-2xl font-bold">
                        {price(idx.value)}
                      </p>
                      <p
                        className={cn(
                          "num mt-1 text-sm",
                          up ? "text-up" : "text-down",
                        )}
                      >
                        {up ? "▲" : "▼"} {price(Math.abs(idx.change))} (
                        {pct(idx.pct)})
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <TickerTape />

        {/* ───────────────────────────────────────────────────────── features */}
        <section id="tinh-nang" className="scroll-mt-24 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Eyebrow>Tính năng</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Công cụ cho người theo thị trường mỗi ngày
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i}>
                  <Card className="h-full p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {f.body}
                    </p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────── price board */}
        <section id="bang-gia" className="scroll-mt-24 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Eyebrow>Bảng giá</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Đúng quy ước bảng điện Việt Nam
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Năm màu, không phải hai. Trần và sàn luôn được ưu tiên hơn tăng và
              giảm — giống hệt bảng điện của sở giao dịch.
            </p>

            {/* the five-colour legend */}
            <div className="mt-6 flex flex-wrap gap-2">
              {(
                [
                  ["ceil", "Trần"],
                  ["up", "Tăng"],
                  ["ref", "Tham chiếu"],
                  ["down", "Giảm"],
                  ["floor", "Sàn"],
                ] as const
              ).map(([k, label]) => (
                <Badge key={k}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-2 w-2 rounded-full",
                      k === "ceil" && "bg-ceil",
                      k === "up" && "bg-up",
                      k === "ref" && "bg-ref",
                      k === "down" && "bg-down",
                      k === "floor" && "bg-floor",
                    )}
                  />
                  {label}
                </Badge>
              ))}
            </div>

            <Card className="mt-6 overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[38rem] text-sm">
                  <caption className="sr-only">
                    Bảng giá minh hoạ, dữ liệu mẫu
                  </caption>
                  <thead>
                    <tr className="border-b border-border bg-muted/60 text-left">
                      <th scope="col" className="px-4 py-2.5 font-semibold">Mã</th>
                      <th scope="col" className="px-4 py-2.5 font-semibold">Sàn</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">TC</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">Trần</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">Sàn</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">Khớp</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-semibold">KL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TICKERS.map((t) => (
                      <tr
                        key={t.sym}
                        className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
                      >
                        <th scope="row" className="px-4 py-2.5 text-left font-semibold">
                          {t.sym}
                          <span className="ml-2 font-normal text-muted-foreground">
                            {t.name}
                          </span>
                        </th>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {t.exchange}
                        </td>
                        <td className="num px-4 py-2.5 text-right text-ref">
                          {price(t.ref)}
                        </td>
                        <td className="num px-4 py-2.5 text-right text-ceil">
                          {price(t.ceil)}
                        </td>
                        <td className="num px-4 py-2.5 text-right text-floor">
                          {price(t.floor)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <PriceCell t={t} />
                        </td>
                        <td className="num px-4 py-2.5 text-right text-muted-foreground">
                          {volume(t.vol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="mt-3 text-xs text-muted-foreground">
              Dữ liệu mẫu, dùng để minh hoạ giao diện. Đơn vị giá: nghìn đồng.
            </p>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────── AI */}
        <section id="tro-ly-ai" className="scroll-mt-24 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Card glass className="overflow-hidden">
              <div className="grid gap-8 p-8 lg:grid-cols-2 lg:p-12">
                <div>
                  <Eyebrow>Trợ lý AI</Eyebrow>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Hỏi bằng tiếng Việt,
                    <br />
                    nhận câu trả lời kèm nguồn
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    Trợ lý đọc báo cáo tài chính, bản cáo bạch và công bố thông
                    tin, rồi trả lời đúng ngữ cảnh thị trường Việt Nam. Mỗi câu
                    trả lời đều dẫn nguồn để bạn tự kiểm chứng.
                  </p>
                  <Button className="mt-7" onClick={() => navigate("/chat")}>
                    <IconBot className="h-4 w-4" />
                    Mở trợ lý AI
                  </Button>
                </div>

                {/* a still of the chat, styled from the same tokens */}
                <div className="space-y-3">
                  <div className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    FPT và MWG, mã nào định giá hấp dẫn hơn?
                  </div>
                  <div className="max-w-[92%] rounded-xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed">
                    <p>
                      FPT giao dịch ở P/E 21,3 lần, cao hơn trung bình 3 năm
                      (17,8). MWG ở 18,6 lần nhưng biên lợi nhuận mỏng hơn…
                    </p>
                    <div className="mt-3 flex gap-2">
                      {TICKERS.slice(0, 2).map((t) => (
                        <span
                          key={t.sym}
                          className="flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs"
                        >
                          <span className="font-semibold">{t.sym}</span>
                          <PriceCell t={t} className="text-xs" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────── pricing */}
        <section className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Eyebrow>Bảng giá dịch vụ</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Chọn gói phù hợp với cách bạn đầu tư
            </h2>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {PLANS.map((p, i) => (
                <Reveal key={p.name} delay={i} className="flex">
                <Card
                  className={cn(
                    "flex w-full flex-col p-6",
                    p.highlight && "border-primary shadow-glow",
                  )}
                >
                  {p.highlight && (
                    <Badge className="mb-3 self-start border-primary/40 bg-primary/10 text-primary">
                      Phổ biến nhất
                    </Badge>
                  )}
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.note}</p>
                  <p className="mt-5">
                    <span className="num text-3xl font-bold">{p.price}</span>
                    {p.unit && (
                      <span className="text-sm text-muted-foreground">
                        {p.unit}
                      </span>
                    )}
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-sm">
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="mt-7"
                    variant={p.highlight ? "primary" : "outline"}
                    onClick={() => navigate("/auth", "mode=register")}
                  >
                    {p.cta}
                  </Button>
                </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────── FAQ */}
        <section id="cau-hoi" className="scroll-mt-24 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Câu hỏi thường gặp</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Những điều nhà đầu tư hay hỏi
            </h2>

            <div className="mt-8 space-y-2">
              {FAQ.map((f, i) => {
                const open = openFaq === i;
                return (
                  <Card key={f.q} className="overflow-hidden p-0">
                    <h3>
                      <button
                        onClick={() => setOpenFaq(open ? null : i)}
                        aria-expanded={open}
                        aria-controls={`faq-${i}`}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium transition-colors hover:bg-muted/50"
                      >
                        {f.q}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "shrink-0 text-muted-foreground transition-transform duration-300",
                            "[transition-timing-function:var(--ease-cinema)]",
                            open && "rotate-45",
                          )}
                        >
                          +
                        </span>
                      </button>
                    </h3>
                    <div
                      id={`faq-${i}`}
                      hidden={!open}
                      className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground"
                    >
                      {f.a}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────── CTA */}
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Card
              glass
              className="relative overflow-hidden px-8 py-14 text-center"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
              >
                <div className="absolute left-1/2 top-0 h-64 w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Bắt đầu phiên tới với dữ liệu đầy đủ hơn
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Miễn phí 14 ngày, đầy đủ tính năng gói Chủ động.
              </p>
              <Button
                size="lg"
                className="mt-8"
                onClick={() => navigate("/auth", "mode=register")}
              >
                Tạo tài khoản
                <IconArrow className="h-4 w-4" />
              </Button>
              <p className="mt-4 text-xs text-muted-foreground">
                {int(12400)}+ nhà đầu tư đang dùng VNAlpha · Cập nhật mỗi phiên
              </p>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
