export const AUDIENCE_STORAGE_KEY = "criativai:audience";

export type Audience = "recruiters";

const audienceRoutes: Record<Audience, readonly string[]> = {
  recruiters: ["/for-recrutiers", "/human-resources"],
};

function normalizePathname(pathname: string) {
  return (pathname.replace(/^\/en(?=\/|$)/, "") || "/").replace(/\/$/, "") || "/";
}

export function syncAudienceFromPathname(pathname: string): "clear" | "unchanged" {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === "/clear") return "clear";

  for (const [audience, routes] of Object.entries(audienceRoutes) as [Audience, readonly string[]][]) {
    if (routes.includes(normalizedPathname)) {
      window.localStorage.setItem(AUDIENCE_STORAGE_KEY, audience);
      break;
    }
  }

  return "unchanged";
}

export function clearAudience() {
  window.localStorage.removeItem(AUDIENCE_STORAGE_KEY);
}

export function isAudienceEnabled(audience: Audience) {
  return window.localStorage.getItem(AUDIENCE_STORAGE_KEY) === audience;
}
