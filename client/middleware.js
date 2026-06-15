export default async function middleware(request) {
  const backend =
    process.env.BACKEND_URL ||
    process.env.VITE_API_URL?.replace(/\/api\/?$/, "");

  if (!backend) {
    return Response.json(
      { message: "BACKEND_URL is not configured for this deployment." },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const target = `${backend.replace(/\/$/, "")}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  return fetch(target, init);
}

export const config = {
  matcher: "/api/:path*",
};
