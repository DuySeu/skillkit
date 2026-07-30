import { IconLogo } from "./icons";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex shrink-0 items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
        <IconLogo className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="text-[1.0625rem] font-extrabold tracking-tight">
          VN<span className="text-primary">Alpha</span>
        </span>
      )}
    </span>
  );
}
