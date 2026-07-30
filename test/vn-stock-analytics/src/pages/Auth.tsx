import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Tabs } from "@/components/ui/Tabs";
import { Logo } from "@/components/Logo";
import { IconCheck, IconEye, IconEyeOff, IconShield } from "@/components/icons";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/cn";

type Mode = "login" | "register";

const strength = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
};

const STRENGTH_LABEL = ["Rất yếu", "Yếu", "Trung bình", "Khá", "Mạnh"];

export function Auth({ query }: { query: string }) {
  const initial: Mode =
    new URLSearchParams(query).get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<Mode>(initial);
  useEffect(() => setMode(initial), [initial]);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!email) e.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Email không hợp lệ.";

    if (!pw) e.pw = "Vui lòng nhập mật khẩu.";
    else if (mode === "register" && pw.length < 8)
      e.pw = "Mật khẩu cần ít nhất 8 ký tự.";

    if (mode === "register" && !name) e.name = "Vui lòng nhập họ tên.";
    return e;
  }, [email, pw, name, mode]);

  const show = (k: string) => (touched[k] || submitted ? errors[k] : undefined);
  const s = strength(pw);

  return (
    <div className="min-h-dvh">
      <Navbar minimal />

      <main
        id="main"
        className="relative grid min-h-dvh place-items-center px-4 py-28 sm:px-6"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute left-1/2 top-16 h-80 w-[32rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mb-5 flex justify-center">
              <Logo />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === "login"
                ? "Đăng nhập vào VNAlpha"
                : "Tạo tài khoản VNAlpha"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Tiếp tục theo dõi danh mục và bảng giá của bạn."
                : "Miễn phí 14 ngày, không cần thẻ tín dụng."}
            </p>
          </div>

          <Card glass className="p-6">
            <Tabs
              label="Đăng nhập hoặc đăng ký"
              active={mode}
              onChange={(m) => {
                setMode(m);
                setSubmitted(false);
              }}
              tabs={[
                { id: "login", label: "Đăng nhập" },
                { id: "register", label: "Đăng ký" },
              ]}
            />

            <form
              id={`panel-${mode}`}
              role="tabpanel"
              aria-labelledby={`tab-${mode}`}
              className="mt-5 space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
                if (Object.keys(errors).length === 0) navigate("/chat");
              }}
            >
              {mode === "register" && (
                <Field
                  label="Họ và tên"
                  autoComplete="name"
                  placeholder="Nguyễn Văn An"
                  value={name}
                  error={show("name")}
                  onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <Field
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="ban@example.com"
                value={email}
                error={show("email")}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div>
                <Field
                  label="Mật khẩu"
                  type={showPw ? "text" : "password"}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  placeholder="••••••••"
                  value={pw}
                  error={show("pw")}
                  onBlur={() => setTouched((t) => ({ ...t, pw: true }))}
                  onChange={(e) => setPw(e.target.value)}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPw ? (
                        <IconEyeOff className="h-4 w-4" />
                      ) : (
                        <IconEye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />

                {mode === "register" && pw.length > 0 && (
                  <div className="mt-2.5">
                    <div className="flex gap-1" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors duration-300",
                            i < s
                              ? s <= 1
                                ? "bg-down"
                                : s === 2
                                  ? "bg-ref"
                                  : "bg-up"
                              : "bg-border",
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Độ mạnh mật khẩu:{" "}
                      <span className="font-medium text-foreground">
                        {STRENGTH_LABEL[s]}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-[var(--primary)]"
                    />
                    Ghi nhớ đăng nhập
                  </label>
                  <a
                    href="#/auth"
                    className="rounded text-sm text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
              )}

              {mode === "register" && (
                <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-[var(--primary)]"
                  />
                  <span>
                    Tôi đồng ý với{" "}
                    <a href="#/" className="text-primary hover:underline">
                      Điều khoản sử dụng
                    </a>{" "}
                    và{" "}
                    <a href="#/" className="text-primary hover:underline">
                      Chính sách bảo mật
                    </a>
                    .
                  </span>
                </label>
              )}

              <Button type="submit" size="lg" className="w-full">
                {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">hoặc</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={() => navigate("/chat")}>
                <span aria-hidden="true" className="text-sm font-bold text-primary">
                  G
                </span>
                Google
              </Button>
              <Button variant="outline" onClick={() => navigate("/chat")}>
                <span aria-hidden="true" className="text-sm font-bold text-primary">
                  Z
                </span>
                Zalo
              </Button>
            </div>
          </Card>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <IconShield className="h-3.5 w-3.5" />
            Bảo mật bằng mã hoá TLS 1.3
          </p>

          <ul className="mt-5 space-y-1.5">
            {[
              "Không chia sẻ dữ liệu với bên thứ ba",
              "Huỷ bất cứ lúc nào trong phần Cài đặt",
            ].map((t) => (
              <li
                key={t}
                className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
              >
                <IconCheck className="h-3.5 w-3.5 text-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
