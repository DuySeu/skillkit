# Skills Kit: My usefull Agentic Skills for Claude Code, Gemini CLI, Cursor, Copilot & More

**The Ultimate Collection of high-performance agentic skills for AI coding assistants — Claude Code, Kiro CLI, Gemini CLI, Codex CLI, Cursor, Copilot & more.**

## Cài nhanh (khuyên dùng)

Dùng `skills` [CLI](https://github.com/vercel-labs/skills), hỗ trợ 75+ coding agent (Claude Code, Cursor, Codex, Copilot, Kiro CLI, Gemini CLI…):

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

Repo này gồm bộ **skills** (trong `skills/`) và các script tiện ích trong `script/`:


| Script | Mục đích |
| ------ | -------- |
| [`script/project_setup.sh`](#scriptproject_setupsh--scaffold-project-python--convention) | Tạo khung project Python (core/utils/logging) kèm coding convention vào thư mục hiện tại |
| [`script/global_link.sh`](#scriptglobal_linksh--sửa-config-toàn-cục-của-agent-ngay-trong-repo) | Symlink config toàn cục của agent (`~/.claude`, `~/.cursor`, …) vào `global/` để sửa ngay trong repo |




## Yêu cầu

- `bash`: có sẵn trên macOS/Linux; trên Windows dùng **Git Bash** (đi kèm [Git for Windows](https://git-scm.com/download/win))
- `python3` (để chạy project sinh ra bởi `project_setup.sh`)
- `Node.js` **≥ 22.20** (để chạy `npx skills add`; Node cũ hơn sẽ lỗi `does not provide an export named 'glob'`). Kiểm tra bằng `node -v`, nâng cấp qua [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) hoặc [nvm-windows](https://github.com/nvm-windows/nvm): `nvm install 22 && nvm use 22`

Cấp quyền thực thi lần đầu nếu cần (macOS/Linux):

```bash
chmod +x script/*.sh
```



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

Viết hoặc sửa skill thì dùng skill `skill-creator` (gõ `/skill-creator` trong Claude Code). Trước khi coi skill là xong, chạy validator rồi đối chiếu checklist trong `skills/skill-creator/references/best-practices.md`:

```bash
cd skills/skill-creator && python3 -m scripts.quick_validate ../<ten-skill>
```

---



## `script/global_link.sh` — sửa config toàn cục của agent ngay trong repo

Tạo symlink từ `global/<agent>/` tới config cấp user của từng agent, để mở và sửa
chúng ngay trong workspace này:

| Agent  | Nguồn       | Entry được link                                                  |
| ------ | ----------- | ---------------------------------------------------------------- |
| claude | `~/.claude` | `CLAUDE.md` `settings.json` `skills` `agents` `commands` `rules` |
| cursor | `~/.cursor` | `skills` `rules` `agents` `mcp.json`                             |
| kiro   | `~/.kiro`   | `skills` `steering` `agents` `settings` `powers`                 |
| codex  | `~/.codex`  | `AGENTS.md` `config.toml` `skills`                               |
| gemini | `~/.gemini` | `GEMINI.md` `settings.json`                                      |

Script chỉ link entry **đã tồn tại** trong home, không đụng tới file auth, history hay cache.
Nội dung `global/` bị gitignore vì chứa đường dẫn tuyệt đối riêng của từng máy. Chạy lại
bao nhiêu lần cũng được.

> Sửa file trong `global/` là sửa **config thật** trong home: không hiện diff trong repo,
> và `rg`/`grep` bỏ qua thư mục này nếu không có `--follow`.

### Cách chạy

Đứng ở gốc repo, cả 3 hệ điều hành dùng chung một lệnh:

```bash
bash script/global_link.sh
```

- **macOS / Linux:** chạy trong Terminal.
- **Windows:** chạy trong **Git Bash**. Trước lần chạy đầu tiên, bật **Developer Mode**
  (Settings → System → For developers): Windows chỉ cho tạo symlink khi bật chế độ này
  hoặc khi chạy Git Bash bằng quyền Administrator. Nếu chưa bật, script dừng và báo lỗi
  chứ không lặng lẽ copy file.
- **Windows, từ PowerShell:** gọi đúng bash của Git. Lệnh `bash` không kèm đường dẫn có thể
  trỏ sang WSL, khi đó `$HOME` là home của Linux chứ không phải `C:\Users\<you>`:

  ```powershell
  & "C:\Program Files\Git\bin\bash.exe" script/global_link.sh
  ```

Mỗi dòng kết quả là một trong ba loại: `link` (đã tạo symlink), `keep` (đã có file hoặc thư mục
thật trùng tên nên bỏ qua), `skip` (máy không cài agent đó).

### Lưu ý

- **Entry chưa có thì không được link.** Ví dụ muốn link `~/.claude/CLAUDE.md` và `~/.claude/skills`
  khi chúng chưa tồn tại, hãy tạo trước rồi chạy lại:

  ```bash
  mkdir -p ~/.claude/skills && touch ~/.claude/CLAUDE.md
  bash script/global_link.sh
  ```

- **Gặp dòng `keep`** sau khi từng chạy `ln -s` trên Windows lúc chưa bật Developer Mode: đó là
  bản **copy**, không phải link. Xóa nó trong `global/<agent>/` rồi chạy lại script.
- **Repo nằm trong OneDrive, Dropbox hoặc iCloud:** dịch vụ sync có thể đi theo symlink và đẩy
  cả config trong home lên cloud. Nên đặt repo ngoài thư mục sync.

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


| Nhóm     | Cờ                        | Mặc định | Ý nghĩa                                                                |
| -------- | ------------------------- | -------- | ---------------------------------------------------------------------- |
| Mode     | `--demo` / `--production` | `--demo` | Chọn bộ convention (gọn cho demo, nghiêm ngặt hơn cho production)      |
| CLI đích | `--kiro` / `--claude`     | `--kiro` | Nơi ghi convention để trợ lý tự nạp                                    |
| Ghi đè   | `--force`                 | (tắt)    | Ghi đè file đã tồn tại; nếu không, file đã có đúng path sẽ được bỏ qua |


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

