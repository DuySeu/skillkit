# Skills Kit: My usefull Agentic Skills for Claude Code, Gemini CLI, Cursor, Copilot & More

**The Ultimate Collection of high-performance agentic skills for AI coding assistants — Claude Code, Kiro CLI, Gemini CLI, Codex CLI, Cursor, Copilot & more.**

## Cài nhanh (khuyên dùng)

Không cần clone repo — dùng [`skills` CLI](https://github.com/vercel-labs/skills), hỗ trợ 75+ coding agent (Claude Code, Cursor, Codex, Copilot, Kiro CLI, Gemini CLI…):

```bash
npx skills add https://github.com/DuySeu/skillkit                       # chọn skill + agent tương tác
npx skills add https://github.com/DuySeu/skillkit --skill ui-design-pro # cài đúng 1 skill
npx skills add https://github.com/DuySeu/skillkit --all                 # cài mọi skill cho mọi agent
npx skills add https://github.com/DuySeu/skillkit -g                    # cài toàn cục (~/.claude/skills)
npx skills add https://github.com/DuySeu/skillkit -l                    # chỉ xem có skill gì
```

Mặc định CLI symlink vào thư mục agent (`./.claude/skills`); thêm `--copy` nếu muốn copy hẳn.
Cập nhật về sau bằng `npx skills update`, gỡ bằng `npx skills remove`.

---

Repo này gồm bộ **skills** (trong `skills/`) và một script tiện ích trong `script/`:

| Script | Mục đích |
|--------|----------|
| [`script/project_setup.sh`](#scriptproject_setupsh--scaffold-project-python--convention) | Tạo khung project Python (core/utils/logging) kèm coding convention vào thư mục hiện tại |

## Yêu cầu

- `bash`
- `python3` (để chạy project sinh ra bởi `project_setup.sh`)

Cấp quyền thực thi lần đầu nếu cần:

```bash
chmod +x script/project_setup.sh
```

## Chạy script từ mọi terminal (không cần gõ đường dẫn repo)

Script tự tìm về repo dù được gọi từ đâu (kể cả qua symlink), nên chỉ cần
đưa nó vào `PATH` một lần sau khi clone. Có 2 cách:

**Cách 1 — symlink vào `~/.local/bin` (khuyên dùng):**

```bash
mkdir -p ~/.local/bin
ln -sf "$(pwd)/script/project_setup.sh" ~/.local/bin/project-setup
```

Nếu `~/.local/bin` chưa có trong `PATH`, thêm vào `~/.zshrc` (hoặc `~/.bashrc`):

```bash
export PATH="$HOME/.local/bin:$PATH"
```

**Cách 2 — thêm thẳng thư mục repo vào `PATH`:**

```bash
# trong ~/.zshrc / ~/.bashrc
export PATH="/duong/dan/toi/repo/script:$PATH"
```

Mở terminal mới (hoặc `source ~/.zshrc`) rồi dùng ở bất kỳ đâu:

```bash
cd /duong/dan/project-cua-ban
project-setup --demo --claude     # (cách 2 thì gõ: project_setup.sh --demo --claude)
```

---

## Dev skill trong repo này

`.claude/skills/` và `.kiro/skills/` ở gốc repo chỉ chứa symlink trỏ ngược vào `skills/`,
nhờ vậy sửa `SKILL.md` là có hiệu lực ngay mà không cần cài lại. Thêm skill mới thì tạo
symlink cho nó:

```bash
for d in skills/*/; do
  ln -sfn "../../$d" ".claude/skills/$(basename "$d")"
done
```

Đổi `.claude` thành `.kiro` để làm tương tự cho Kiro CLI.

---

## `script/project_setup.sh` — scaffold project Python + convention

Tạo khung một project Python theo convention dataflow (mỗi step một file trong `core/`,
helper trong `utils/`, logging tập trung), kèm file convention để trợ lý AI **tự nạp**.

> Các file được tạo trong **thư mục hiện tại** — script không tạo folder bao ngoài.
> Chạy `cd` vào thư mục project của bạn trước khi chạy.

### Cách chạy

```bash
cd /duong/dan/project-cua-ban
/duong/dan/repo/script/project_setup.sh                          # demo + kiro (mặc định)
/duong/dan/repo/script/project_setup.sh --production             # dùng convention production
/duong/dan/repo/script/project_setup.sh --claude                 # ghi convention cho Claude Code
/duong/dan/repo/script/project_setup.sh --production --claude     # kết hợp
/duong/dan/repo/script/project_setup.sh --force                  # ghi đè file trùng tên
/duong/dan/repo/script/project_setup.sh --help                   # xem hướng dẫn
```

### Cờ

| Nhóm | Cờ | Mặc định | Ý nghĩa |
|------|----|----------|---------|
| Mode | `--demo` / `--production` | `--demo` | Chọn bộ convention (gọn cho demo, nghiêm ngặt hơn cho production) |
| CLI đích | `--kiro` / `--claude` | `--kiro` | Nơi ghi convention để trợ lý tự nạp |
| Ghi đè | `--force` | (tắt) | Ghi đè file đã tồn tại; nếu không, file đã có đúng path sẽ được bỏ qua |

Mỗi nhóm chỉ chọn **một** cờ; truyền cả hai trong cùng nhóm sẽ báo lỗi.

### File được tạo

```
main.py                 # entry point — điều phối dataflow
core/__init__.py        # core logic: mỗi file = một step trong workflow
utils/__init__.py
utils/log.py            # logging tập trung (level qua LOG_LEVEL, màu theo level)
.gitignore
requirements.txt
README.md
```

Cộng thêm phần convention tùy CLI đích:

- `--kiro` → `.kiro/steering/coding-conventions.md` + `.kiro/steering/folder-structure.md`
  (Kiro CLI tự nạp mọi file trong `.kiro/steering/`)
- `--claude` → `CLAUDE.md` ở gốc project
  (Claude Code tự nạp `CLAUDE.md` ở đầu mỗi session)

### Chạy thử project sinh ra

```bash
python3 main.py
# LOG_LEVEL=DEBUG python3 main.py   # đổi mức log
```

### Tùy biến template

- Nội dung convention "thật" nằm ở `project/demo/` và `project/production/`
  (mỗi bộ có `coding-conventions.md`, `folder-structure.md`).
- `project/log.py` là logging dùng chung cho mọi mode/CLI.
- Các file phụ (`main.py`, `.gitignore`, `README.md`, `requirements.txt`, `__init__.py`)
  được hardcode inline trong `script/project_setup.sh`.
