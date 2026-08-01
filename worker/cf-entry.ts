export default {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }

    return new Response("Not found", { status: 404 });
  },
};
