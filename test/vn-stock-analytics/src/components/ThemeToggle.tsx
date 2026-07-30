import { useTheme } from "@/lib/theme";
import { IconMoon, IconSun } from "./icons";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const toLight = theme === "dark";

  return (
    <button
      onClick={toggle}
      /* Icon-only, so it carries its own label. */
      aria-label={toLight ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      title={toLight ? "Giao diện sáng" : "Giao diện tối"}
      className="grid h-11 w-11 place-items-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
    >
      {toLight ? (
        <IconSun className="h-5 w-5" />
      ) : (
        <IconMoon className="h-5 w-5" />
      )}
    </button>
  );
}
