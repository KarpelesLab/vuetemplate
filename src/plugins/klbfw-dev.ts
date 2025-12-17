import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

interface RegistryConfig {
  [key: string]: string;
}

interface UrlLookupData {
  Registry_Url__: string;
  Domain: string;
  Site__: string;
  Realm__: string;
  Languages: string[];
  Branch: string;
  ExtraFw: {
    urlid: string;
    Realm: Record<string, unknown>;
  };
  Registry: Record<string, Record<string, string>>;
}

interface UrlLookupResponse {
  data: UrlLookupData;
}

function parseIniFile(filePath: string): RegistryConfig {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const config: RegistryConfig = {};

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(';')) continue;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        config[key] = value;
      }
    }

    return config;
  } catch {
    return {};
  }
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generateCsrfToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Parse prefix from URL path, e.g., /l/en-US/about -> { prefix: "/l/en-US", context: { l: "en-US" }, remainingPath: "/about" }
function parsePrefix(path: string, languages: string[]): { prefix: string; context: Record<string, string>; remainingPath: string } {
  const context: Record<string, string> = {};
  let prefix = '';
  let remaining = path;

  // Match pattern like /l/en-US or /c/USD etc.
  const prefixRegex = /^\/([a-z])\/([^/]+)/;

  while (true) {
    const match = remaining.match(prefixRegex);
    if (!match) break;

    const key = match[1];
    const value = match[2];

    // Validate the value based on key
    if (key === 'l' && !languages.includes(value)) {
      break; // Invalid language, stop parsing
    }

    context[key] = value;
    prefix += `/${key}/${value}`;
    remaining = remaining.substring(match[0].length) || '/';
  }

  return { prefix, context, remainingPath: remaining };
}

export function klbfwDev(): Plugin {
  // Cache only the API response data
  let cachedApiData: UrlLookupData | null = null;
  let cachedConfig: RegistryConfig | null = null;
  const uuid = generateUuid();
  const token = generateCsrfToken();
  const tokenExp = Date.now() + 86400000; // 24 hours

  return {
    name: 'klbfw-dev',
    apply: 'serve', // Only apply in dev mode

    configureServer(server) {
      // API proxy middleware for /_special/rest/ and /_rest/
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url || '';

        // Check if this is an API request
        if (!url.startsWith('/_special/rest/') && !url.startsWith('/_rest/')) {
          return next();
        }

        // Normalize path: /_rest/ -> /_special/rest/
        const apiPath = url.startsWith('/_rest/')
          ? '/_special/rest/' + url.substring('/_rest/'.length)
          : url;

        const targetUrl = `https://ws.atonline.com${apiPath}`;

        try {
          // Collect request body
          const bodyChunks: Buffer[] = [];
          for await (const chunk of req) {
            bodyChunks.push(chunk as Buffer);
          }
          const body = Buffer.concat(bodyChunks);

          // Build headers for proxy request
          const headers: Record<string, string> = {};
          for (const [key, value] of Object.entries(req.headers)) {
            if (value && key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
              headers[key] = Array.isArray(value) ? value.join(', ') : value;
            }
          }

          // Check for CSRF token validation
          const authHeader = req.headers['authorization'];
          if (authHeader && typeof authHeader === 'string') {
            const match = authHeader.match(/^Session\s+(.+)$/i);
            if (match && match[1] === token) {
              headers['Sec-Csrf-Token'] = 'valid';
            }
          }

          // Make proxy request
          const proxyResponse = await fetch(targetUrl, {
            method: req.method || 'GET',
            headers: headers,
            body: body.length > 0 ? body : undefined,
          });

          // Forward response status and headers
          res.statusCode = proxyResponse.status;
          for (const [key, value] of proxyResponse.headers.entries()) {
            // Skip headers that shouldn't be forwarded
            if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'connection') {
              res.setHeader(key, value);
            }
          }

          // Forward response body
          const responseBody = await proxyResponse.arrayBuffer();
          res.end(Buffer.from(responseBody));

        } catch (error) {
          console.error('[klbfw-dev] Proxy error:', error);
          res.statusCode = 502;
          res.end(JSON.stringify({ error: 'Proxy error', message: String(error) }));
        }
      });
    },

    async transformIndexHtml(html, ctx) {
      try {
        const rootDir = process.cwd();

        // Cache config from registry files
        if (!cachedConfig) {
          const registry = parseIniFile(resolve(rootDir, 'etc/registry.ini'));
          const registryDev = parseIniFile(resolve(rootDir, 'etc/registry_dev.ini'));
          cachedConfig = { ...registry, ...registryDev };
        }

        const realm = cachedConfig.Realm;
        if (!realm) {
          console.warn('[klbfw-dev] No Realm found in registry files');
          return html;
        }

        // Cache API response
        if (!cachedApiData) {
          const apiUrl = `https://ws.atonline.com/_special/rest/Registry/Url:lookup?host=localhost@${realm}`;
          const response = await fetch(apiUrl);
          const result = await response.json() as UrlLookupResponse;
          cachedApiData = result.data;

          if (!cachedApiData) {
            console.warn('[klbfw-dev] No data in API response');
            return html;
          }
          console.log('[klbfw-dev] API data cached');
        }

        const data = cachedApiData;
        const languages = data.Languages || ['en-US'];
        const defaultLang = languages[0];

        // Parse the request URL to extract prefix and query string
        const requestUrl = ctx.originalUrl || '/';
        const [pathPart, queryString] = requestUrl.split('?');
        const { prefix, context: urlContext, remainingPath } = parsePrefix(pathPart, languages);

        // Parse query string into GET object
        const GET: Record<string, string> = {};
        if (queryString) {
          const params = new URLSearchParams(queryString);
          for (const [key, value] of params) {
            GET[key] = value;
          }
        }

        // Determine language from URL or default
        const language = urlContext.l || defaultLang;
        const currency = urlContext.c || data.Registry?.[language]?.Currency_Default || cachedConfig.Currency_List || 'USD';

        const registryData = data.Registry?.[language] || data.Registry?.[defaultLang] || {};

        // Build URL object
        const urlObj: Record<string, string> = {
          full: `http://localhost:5173${requestUrl}`,
          host: 'localhost:5173',
          path: pathPart,
          scheme: 'http'
        };
        if (queryString) {
          urlObj.query = queryString;
        }

        // Build FW object - regenerated for each request based on URL
        const fw = {
          Context: {
            b: data.Branch || 'master',
            c: currency,
            l: language
          },
          GET: GET,
          Locale: language,
          Realm: data.ExtraFw?.Realm || {},
          Registry: registryData,
          URL: urlObj,
          _ssr_diag: 'nossr',
          cookies: {
            Locale: language
          },
          hostname: 'localhost',
          mode: 'client',
          path: remainingPath,
          prefix: prefix,
          token: token,
          token_exp: tokenExp,
          urlid: data.ExtraFw?.urlid || data.Registry_Url__,
          uuid: uuid
        };

        const fwScript = `<script type="text/javascript">
var FW = (function() {
    var my = ${JSON.stringify(fw, null, 4).split('\n').join('\n    ')};
    return my;
}());
</script>
`;

        console.log(`[klbfw-dev] FW injected: prefix="${prefix}", lang="${language}", path="${remainingPath}"`);
        return html.replace('</head>', `${fwScript}</head>`);

      } catch (error) {
        console.error('[klbfw-dev] Failed to generate FW variable:', error);
        return html;
      }
    }
  };
}
