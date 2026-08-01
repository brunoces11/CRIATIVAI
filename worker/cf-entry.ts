type Env = {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
};

function isAssetPath(pathname: string) {
  return /\.[a-z0-9]+$/i.test(pathname);
}

function createAssetRequest(request: Request, pathname: string) {
  return new Request(new URL(pathname, request.url), request);
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    if (isAssetPath(url.pathname)) {
      return assetResponse;
    }

    const indexResponse = await env.ASSETS.fetch(createAssetRequest(request, "/index.html"));
    return new Response(indexResponse.body, {
      headers: indexResponse.headers,
      status: indexResponse.ok ? 200 : indexResponse.status,
      statusText: indexResponse.statusText,
    });
  },
};
