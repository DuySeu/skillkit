import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PriceCell } from "@/components/PriceCell";
import {
  IconBot,
  IconLink,
  IconPlus,
  IconSend,
  IconSparkles,
  IconUser,
} from "@/components/icons";
import { CHAT_SEED, SUGGESTED, TICKERS } from "@/lib/mock";
import type { ChatMessage } from "@/lib/mock";
import { cn } from "@/lib/cn";

const HISTORY = [
  "So sánh FPT và MWG",
  "Cổ phiếu ngân hàng quý này",
  "Phân tích kỹ thuật VN-Index",
  "Khối ngoại mua ròng tuần qua",
];

/** Canned reply — there is no backend. Keeps the screen honest about that. */
const REPLY =
  "Đây là bản demo giao diện nên trợ lý chưa kết nối tới mô hình thật. " +
  "Trong sản phẩm hoàn chỉnh, câu trả lời sẽ được tổng hợp từ báo cáo tài " +
  "chính và công bố thông tin, kèm trích dẫn nguồn cho từng con số.";

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_SEED);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || thinking) return;

    setMessages((m) => [
      ...m,
      { id: `u${m.length}`, role: "user", text: t },
    ]);
    setDraft("");
    setThinking(true);

    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: `a${m.length}`, role: "assistant", text: REPLY, cites: ["FPT"] },
      ]);
      setThinking(false);
    }, 900);
  };

  return (
    <div className="min-h-dvh">
      <Navbar minimal />

      <main id="main" className="mx-auto max-w-6xl px-3 pb-4 pt-24 sm:px-4">
        <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
          {/* ─────────────────────────────────────────────── conversations */}
          <aside className="hidden lg:block">
            <Card className="sticky top-24 p-3">
              <Button size="sm" className="w-full">
                <IconPlus className="h-4 w-4" />
                Cuộc trò chuyện mới
              </Button>

              <nav aria-label="Lịch sử trò chuyện" className="mt-4">
                <h2 className="px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Gần đây
                </h2>
                <ul className="mt-2 space-y-0.5">
                  {HISTORY.map((h, i) => (
                    <li key={h}>
                      <button
                        aria-current={i === 0 ? "true" : undefined}
                        className={cn(
                          "w-full truncate rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                          i === 0
                            ? "bg-muted font-medium text-foreground"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        )}
                      >
                        {h}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </Card>
          </aside>

          {/* ────────────────────────────────────────────────── conversation */}
          <Card className="flex h-[calc(100dvh-7.5rem)] flex-col overflow-hidden p-0">
            <header className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <IconBot className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold">
                  Trợ lý phân tích VNAlpha
                </h1>
                <p className="truncate text-xs text-muted-foreground">
                  Dữ liệu tới phiên gần nhất · Luôn kèm nguồn
                </p>
              </div>
              <Badge className="ml-auto hidden sm:inline-flex">
                <IconSparkles className="h-3 w-3 text-primary" />
                Bản demo
              </Badge>
            </header>

            {/* messages */}
            <div
              className="flex-1 space-y-5 overflow-y-auto px-4 py-5"
              role="log"
              aria-live="polite"
              aria-label="Nội dung trò chuyện"
            >
              {messages.map((m) => (
                <Message key={m.id} m={m} />
              ))}

              {thinking && (
                <div className="flex gap-3">
                  <Avatar role="assistant" />
                  <div className="flex items-center gap-1.5 rounded-xl rounded-bl-sm border border-border bg-muted px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                    <span className="sr-only">Trợ lý đang soạn câu trả lời</span>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* suggestions */}
            {messages.length <= CHAT_SEED.length && (
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* composer */}
            <form
              className="border-t border-border p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
            >
              {/* The textarea drops its own outline, so the wrapper carries a
                  real focus ring — a border tint alone is too weak a signal. */}
              <div className="flex items-end gap-2 rounded-xl border border-input bg-background p-2 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--ring)]">
                <label htmlFor="composer" className="sr-only">
                  Nhập câu hỏi cho trợ lý
                </label>
                <textarea
                  id="composer"
                  ref={taRef}
                  rows={1}
                  value={draft}
                  placeholder="Hỏi về một mã, một ngành, hay một chỉ số…"
                  onChange={(e) => {
                    setDraft(e.target.value);
                    const el = e.target;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                  }}
                  onKeyDown={(e) => {
                    /* Enter sends, Shift+Enter makes a new line. */
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(draft);
                      if (taRef.current) taRef.current.style.height = "auto";
                    }
                  }}
                  className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!draft.trim() || thinking}
                  aria-label="Gửi câu hỏi"
                  className="h-9 w-9 !px-0"
                >
                  <IconSend className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 px-1 text-[0.6875rem] leading-relaxed text-muted-foreground">
                Nội dung do AI tạo ra chỉ mang tính tham khảo, không phải lời
                khuyên đầu tư. Hãy tự kiểm chứng trước khi giao dịch.
              </p>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Avatar({ role }: { role: ChatMessage["role"] }) {
  const assistant = role === "assistant";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
        assistant
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground",
      )}
    >
      {assistant ? (
        <IconBot className="h-4 w-4" />
      ) : (
        <IconUser className="h-4 w-4" />
      )}
    </span>
  );
}

function Message({ m }: { m: ChatMessage }) {
  const user = m.role === "user";

  if (user) {
    return (
      <div className="flex justify-end gap-3">
        <div className="max-w-[85%] rounded-xl rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground">
          {m.text}
        </div>
        <Avatar role="user" />
      </div>
    );
  }

  const cited = TICKERS.filter((t) => m.cites?.includes(t.sym));

  return (
    <div className="flex gap-3">
      <Avatar role="assistant" />
      <div className="min-w-0 max-w-[92%] space-y-3">
        <div className="rounded-xl rounded-bl-sm border border-border bg-muted/60 px-4 py-3 text-sm leading-relaxed">
          {m.text.split("\n\n").map((p, i) => (
            <p key={i} className={i > 0 ? "mt-3" : undefined}>
              {p}
            </p>
          ))}
        </div>

        {cited.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cited.map((t) => (
              <div
                key={t.sym}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
              >
                <div>
                  <p className="text-xs font-semibold">{t.sym}</p>
                  <p className="text-[0.6875rem] text-muted-foreground">
                    {t.name}
                  </p>
                </div>
                <PriceCell t={t} className="text-sm" />
              </div>
            ))}
          </div>
        )}

        {m.sources && (
          <div className="rounded-lg border border-border bg-card px-3 py-2.5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Nguồn
            </p>
            <ul className="mt-1.5 space-y-1">
              {m.sources.map((s) => (
                <li key={s.note} className="flex items-center gap-2 text-xs">
                  <IconLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="font-medium">{s.label}</span>
                  <span className="text-muted-foreground">{s.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
