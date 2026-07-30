import { useRoute } from "@/lib/router";
import { Landing } from "@/pages/Landing";
import { Auth } from "@/pages/Auth";
import { Chat } from "@/pages/Chat";

export default function App() {
  const { route, query } = useRoute();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Bỏ qua điều hướng
      </a>

      {route === "/auth" ? (
        <Auth query={query} />
      ) : route === "/chat" ? (
        <Chat />
      ) : (
        <Landing />
      )}
    </>
  );
}
