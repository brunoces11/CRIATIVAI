const PUBLIC_ROUTES = new Set([
  "/",
  "/about-me",
  "/contact",
  "/hire-me",
  "/human-resources",
  "/privacy",
  "/services",
  "/style",
  "/talent-preview",
  "/terms",
  "/video",
]);

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) || "/" : pathname;
}

async function fetchAsset(request, env, pathname) {
  return env.ASSETS.fetch(new Request(new URL(pathname, request.url), request));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const assetResponse = await fetchAsset(request, env, url.pathname);

    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    if (url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }

    const normalizedPath = normalizePathname(url.pathname);

    if (!PUBLIC_ROUTES.has(normalizedPath)) {
      return assetResponse;
    }

    const indexResponse = await fetchAsset(request, env, "/index.html");

    if (!indexResponse.ok) {
      return indexResponse;
    }

    return new Response(indexResponse.body, {
      headers: indexResponse.headers,
      status: 200,
      statusText: indexResponse.statusText,
    });
  },
};
