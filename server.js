const http = require('node:http');
const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');

const UPSTREAM_ORIGIN = 'https://titaniumsdk.com';
const DOWNLOADS_URL = 'https://titaniumsdk.com/downloads';

const SKIP_REQUEST_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

const SKIP_RESPONSE_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-encoding',
]);

function registryTarget(requestUrl) {
  if (!requestUrl || requestUrl.startsWith('//') || /^[a-zA-Z][a-zA-Z+\-.]*:/.test(requestUrl)) {
    return null;
  }

  let target;
  try {
    target = new URL(requestUrl, UPSTREAM_ORIGIN);
  } catch {
    return null;
  }

  if (target.origin !== UPSTREAM_ORIGIN) return null;
  if (target.pathname !== '/registry' && !target.pathname.startsWith('/registry/')) return null;
  return target;
}

function requestHeaders(incoming) {
  const headers = {};
  for (const [key, value] of Object.entries(incoming)) {
    if (value == null || SKIP_REQUEST_HEADERS.has(key)) continue;
    headers[key] = Array.isArray(value) ? value.join(', ') : value;
  }
  // fetch decodes compressed bodies. Ask for identity so Content-Length stays accurate.
  headers['accept-encoding'] = 'identity';
  return headers;
}

function responseHeaders(upstream) {
  const headers = {};
  upstream.headers.forEach((value, key) => {
    if (SKIP_RESPONSE_HEADERS.has(key)) return;
    headers[key] = value;
  });

  const cookies = typeof upstream.headers.getSetCookie === 'function'
    ? upstream.headers.getSetCookie()
    : [];
  if (cookies.length > 0) headers['set-cookie'] = cookies;

  if (upstream.headers.has('content-encoding')) delete headers['content-length'];
  return headers;
}

async function proxyRegistry(request, response, target) {
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const upstream = await fetch(target, {
    method: request.method,
    headers: requestHeaders(request.headers),
    body: hasBody ? Readable.toWeb(request) : undefined,
    duplex: hasBody ? 'half' : undefined,
    redirect: 'follow',
  });

  response.writeHead(upstream.status, responseHeaders(upstream));

  if (request.method === 'HEAD' || upstream.body == null) {
    response.end();
    return;
  }

  await pipeline(Readable.fromWeb(upstream.body), response);
}

function redirectToDownloads(response) {
  response.writeHead(308, { Location: DOWNLOADS_URL });
  response.end();
}

const server = http.createServer(async (request, response) => {
  try {
    const target = registryTarget(request.url ?? '/');
    if (target) {
      await proxyRegistry(request, response, target);
      return;
    }
    redirectToDownloads(response);
  } catch (error) {
    console.error(error);
    if (response.headersSent || response.writableEnded) {
      response.destroy();
      return;
    }
    response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Bad gateway');
  }
});

server.listen(Number(process.env.PORT ?? 3000));
