import { Logo } from "./Logo";

const COLS = [
  {
    title: "Sản phẩm",
    links: ["Bảng giá thời gian thực", "Phân tích kỹ thuật", "Trợ lý AI", "Danh mục đầu tư"],
  },
  {
    title: "Công ty",
    links: ["Về chúng tôi", "Tuyển dụng", "Liên hệ", "Blog"],
  },
  {
    title: "Pháp lý",
    links: ["Điều khoản sử dụng", "Chính sách bảo mật", "Chính sách cookie"],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Nền tảng phân tích thị trường chứng khoán Việt Nam, dành cho nhà
              đầu tư chủ động.
            </p>
          </div>

          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h3 className="text-sm font-semibold">{c.title}</h3>
              <ul className="mt-3 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#/"
                      className="rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Required for anything that discusses securities in Vietnam. */}
        <div className="mt-12 border-t border-border pt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="font-semibold text-foreground">
              Miễn trừ trách nhiệm:
            </strong>{" "}
            Mọi thông tin, phân tích và nội dung do trợ lý AI tạo ra trên
            VNAlpha chỉ mang tính chất tham khảo, không phải là lời khuyên đầu
            tư, chào mua hay chào bán bất kỳ chứng khoán nào. Dữ liệu có thể có
            độ trễ so với sở giao dịch. Nhà đầu tư chịu trách nhiệm với quyết
            định của mình. Đầu tư chứng khoán có rủi ro mất vốn.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} VNAlpha. Dữ liệu tham chiếu từ HOSE,
            HNX và UPCOM.
          </p>
        </div>
      </div>
    </footer>
  );
}
