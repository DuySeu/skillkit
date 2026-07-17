# Skills Kit: My usefull Agentic Skills for Claude Code, Gemini CLI, Cursor, Copilot & More

**The Ultimate Collection of high-performance agentic skills for AI coding assistants — Claude Code, Kiro CLI, Gemini CLI, Codex CLI, Cursor, Copilot & more.**

Repo này gồm bộ **skills** (trong `skills/`) và 2 script tiện ích ở gốc repo:

| Script | Mục đích |
|--------|----------|
| [`install.sh`](#1-installsh--cài-skills-vào-kiro-cli--claude-code) | Cài các skill trong `skills/` vào project hiện tại — mặc định Claude Code (`./.claude/skills`), `--kiro` cho Kiro CLI, `--global` để cài toàn cục |
| [`project_setup.sh`](#2-project_setupsh--scaffold-project-python--convention) | Tạo khung project Python (core/utils/logging) kèm coding convention vào thư mục hiện tại |

## Yêu cầu

- `bash`
- `python3` (để chạy project sinh ra bởi `project_setup.sh`)

Cấp quyền thực thi lần đầu nếu cần:

```bash
chmod +x install.sh project_setup.sh
```

## Chạy script từ mọi terminal (không cần gõ đường dẫn repo)

Cả hai script đều tự tìm về repo dù được gọi từ đâu (kể cả qua symlink), nên chỉ cần
đưa chúng vào `PATH` một lần sau khi clone. Có 2 cách:

**Cách 1 — symlink vào `~/.local/bin` (khuyên dùng):**

```bash
mkdir -p ~/.local/bin
ln -sf "$(pwd)/install.sh"       ~/.local/bin/install-skills
ln -sf "$(pwd)/project_setup.sh" ~/.local/bin/project-setup
```

Nếu `~/.local/bin` chưa có trong `PATH`, thêm vào `~/.zshrc` (hoặc `~/.bashrc`):

```bash
export PATH="$HOME/.local/bin:$PATH"
```

**Cách 2 — thêm thẳng thư mục repo vào `PATH`:**

```bash
# trong ~/.zshrc / ~/.bashrc
export PATH="/duong/dan/toi/repo:$PATH"
```

Mở terminal mới (hoặc `source ~/.zshrc`) rồi dùng ở bất kỳ đâu:

```bash
install-skills --dry-run          # (cách 2 thì gõ: install.sh --dry-run)
cd /duong/dan/project-cua-ban
project-setup --demo --claude     # (cách 2 thì gõ: project_setup.sh --demo --claude)
```

---

## 1. `install.sh` — cài skills vào Kiro CLI / Claude Code

Quét mọi thư mục con trong `skills/` có chứa `SKILL.md` và cài vào **project hiện tại**.
Mặc định cài cho **Claude Code** (`./.claude/skills`); truyền `--kiro` để cài cho Kiro CLI
(`./.kiro/skills`) — chỉ chọn một trong hai. Muốn cài toàn cục (mọi project dùng chung)
thì thêm `--global`.

### Cách chạy

```bash
cd /duong/dan/project-cua-ban
./install.sh                 # cài cho Claude Code: ./.claude/skills (mặc định)
./install.sh --kiro          # cài cho Kiro CLI: ./.kiro/skills
./install.sh --claude        # như mặc định (không kết hợp được với --kiro)
./install.sh --global        # cài toàn cục: ~/.kiro/skills và ~/.claude/skills
./install.sh --target DIR    # cài vào một thư mục skills tùy chọn
./install.sh --link          # tạo symlink thay vì copy (tự cập nhật theo repo)
./install.sh --force         # ghi đè skill đã tồn tại, không hỏi
./install.sh --dry-run       # xem trước, không thay đổi gì
./install.sh --help          # xem hướng dẫn
```

### Cờ

| Cờ | Ý nghĩa |
|----|---------|
| `--kiro` | Cài cho Kiro CLI (`./.kiro/skills`, hoặc `~/.kiro/skills` nếu kèm `--global`) |
| `--claude` | Cài cho Claude Code — chính là mặc định (`./.claude/skills`, hoặc `~/.claude/skills` nếu kèm `--global`) |
| `--global` | Cài vào thư mục toàn cục trong `$HOME` thay vì project hiện tại |
| `--target DIR` | Cài vào thư mục tùy chọn (có thể lặp lại) |
| `--link` | Symlink thay vì copy — skill tự cập nhật khi repo đổi |
| `--force` | Ghi đè skill trùng tên mà không hỏi |
| `--dry-run` | Chỉ in ra những gì sẽ làm |

`--kiro` và `--claude` loại trừ nhau — truyền cả hai sẽ báo lỗi. Không truyền gì → Claude Code.

### Ví dụ

```bash
# Cài skills cho project đang làm (chạy từ thư mục project) — Claude Code
cd ~/Workspace/my-project && install-skills

# Thử trước xem sẽ cài gì mà không thay đổi
install-skills --dry-run

# Dev skill: symlink để sửa repo là có hiệu lực ngay trong project
install-skills --link

# Cài cho Kiro CLI, toàn cục cho mọi project
install-skills --kiro --global
```

---

## 2. `project_setup.sh` — scaffold project Python + convention

Tạo khung một project Python theo convention dataflow (mỗi step một file trong `core/`,
helper trong `utils/`, logging tập trung), kèm file convention để trợ lý AI **tự nạp**.

> Các file được tạo trong **thư mục hiện tại** — script không tạo folder bao ngoài.
> Chạy `cd` vào thư mục project của bạn trước khi chạy.

### Cách chạy

```bash
cd /duong/dan/project-cua-ban
/duong/dan/repo/project_setup.sh                          # demo + kiro (mặc định)
/duong/dan/repo/project_setup.sh --production             # dùng convention production
/duong/dan/repo/project_setup.sh --claude                 # ghi convention cho Claude Code
/duong/dan/repo/project_setup.sh --production --claude     # kết hợp
/duong/dan/repo/project_setup.sh --force                  # ghi đè file trùng tên
/duong/dan/repo/project_setup.sh --help                   # xem hướng dẫn
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
  được hardcode inline trong `project_setup.sh`.
