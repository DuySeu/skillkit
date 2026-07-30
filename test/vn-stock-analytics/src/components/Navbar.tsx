import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/Button";
import { IconClose, IconMenu } from "./icons";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "#tinh-nang", label: "Tính năng" },
  { href: "#bang-gia", label: "Bảng giá" },
  { href: "#tro-ly-ai", label: "Trợ lý AI" },
  { href: "#cau-hoi", label: "Câu hỏi" },
];

export function Navbar({ minimal = false }: { minimal?: boolean }) {
  const [open, setOpen] = useState(false);

  /* Escape closes the mobile sheet, and the body must not scroll behind it. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-3 top-3 z-50 mx-auto max-w-6xl sm:inset-x-4 sm:top-4">
      <nav
        aria-label="Điều hướng chính"
        className="glass flex h-16 items-center gap-3 rounded-xl border border-border px-3 shadow-card sm:px-4"
      >
        <a
          href="#/"
          aria-label="VNAlpha — trang chủ"
          onClick={() => setOpen(false)}
          className="rounded-lg"
        >
          <Logo />
        </a>

        {!minimal && (
          <ul className="ml-4 hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />

          <div className="hidden items-center gap-1.5 sm:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
            >
              Đăng nhập
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/auth", "mode=register")}
            >
              Dùng thử miễn phí
            </Button>
          </div>

          {!minimal && (
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Đóng menu" : "Mở menu"}
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground lg:hidden"
            >
              {open ? (
                <IconClose className="h-5 w-5" />
              ) : (
                <IconMenu className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={cn(
          "glass mt-2 overflow-hidden rounded-xl border border-border shadow-card lg:hidden",
          "transition-[max-height,opacity] duration-300 [transition-timing-function:var(--ease-cinema)]",
          open ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0",
        )}
      >
        <ul className="p-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li className="mt-1 flex gap-2 border-t border-border p-2 pt-3 sm:hidden">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setOpen(false);
                navigate("/auth");
              }}
            >
              Đăng nhập
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                setOpen(false);
                navigate("/auth", "mode=register");
              }}
            >
              Dùng thử
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
}
