import { useEffect, useState } from "react";

/** Hash routing, hand-rolled: three pages don't justify a routing dependency,
 *  and the confirmed stack was "Tailwind only, no library". Swap for
 *  react-router if the app grows real nested routes — see DECISIONS.md. */
export type Route = "/" | "/auth" | "/chat";

const ROUTES: Route[] = ["/", "/auth", "/chat"];

function current(): Route {
  const h = window.location.hash.replace(/^#/, "").split("?")[0];
  return (ROUTES.find((r) => r === h) ?? "/") as Route;
}

/** Query after the route, e.g. #/auth?mode=register */
function currentQuery(): string {
  const h = window.location.hash.replace(/^#/, "");
  return h.includes("?") ? h.slice(h.indexOf("?") + 1) : "";
}

export function navigate(to: Route, query?: string) {
  window.location.hash = query ? `${to}?${query}` : to;
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(current);
  const [query, setQuery] = useState<string>(currentQuery);

  useEffect(() => {
    const on = () => {
      setRoute(current());
      setQuery(currentQuery());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  return { route, query };
}
