const TARGET_HOST = "r.iirose.com";
const TARGET_PROTOCOL = "https";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico", "avif"];

function isImagePath(pathname) {
  const ext = pathname.split(".").pop()?.toLowerCase();
  return ext && IMAGE_EXTS.includes(ext);
}

function buildTargetUrl(request) {
  const url = new URL(request.url);
  return `${TARGET_PROTOCOL}://${TARGET_HOST}${url.pathname}${url.search}`;
}

export default async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  if (url.pathname === "/" || url.pathname === "/index.html") {
    return fetch(request);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, HEAD, OPTIONS",
        "access-control-allow-headers": "Content-Type, Range, If-Range",
        "access-control-max-age": "86400",
      },
    });
  }

  if (url.pathname === "/debug") {
    const info = {
      message: "Function is running",
      url: request.url,
      path: url.pathname,
      method: request.method,
      targetHost: TARGET_HOST,
    };
    return new Response(JSON.stringify(info, null, 2), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const targetUrl = buildTargetUrl(request);

    const headers = new Headers();
    const keepHeaders = ["accept", "accept-encoding", "user-agent", "referer", "range", "if-range", "if-none-match", "if-modified-since"];
    for (const [key, value] of request.headers) {
      if (keepHeaders.includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    }
    headers.set("x-forwarded-host", request.headers.get("host") || "");
    headers.set("x-forwarded-proto", "https");

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
    });

    const respHeaders = new Headers(response.headers);
    respHeaders.delete("set-cookie");
    respHeaders.delete("server");
    respHeaders.delete("x-powered-by");

    if (isImagePath(url.pathname)) {
      respHeaders.set("cache-control", "public, max-age=31536000, immutable");
      respHeaders.set("cdn-cache-control", "public, max-age=31536000");
    }

    respHeaders.set("access-control-allow-origin", "*");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: respHeaders,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: "Proxy Error",
        type: e.constructor?.name || typeof e,
        message: e.message || String(e),
      }),
      {
        status: 502,
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      }
    );
  }
}
