import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestHeader, setResponseStatus, setResponseHeader, send, getRequestHeaders, getRequestURL, getResponseHeader, setResponseHeaders, removeResponseHeader, createError, appendResponseHeader, getRequestProtocol, getRequestHost, setHeader, getHeader, getQuery as getQuery$1, getRouterParam, getResponseStatus, lazyEventHandler, useBase, createApp, createRouter as createRouter$1, toNodeListener, readBody, getResponseStatusText } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/h3/dist/index.mjs';
import { Server } from 'node:http';
import { resolve as resolve$1, dirname, join } from 'node:path';
import nodeCrypto from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { getRequestDependencies, getPreloadLinks, getPrefetchLinks, createRenderer } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import { stringify, uneval } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/devalue/index.js';
import { renderToString } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/vue/server-renderer/index.mjs';
import { renderSSRHead } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/@unhead/ssr/dist/index.mjs';
import { createServerHead as createServerHead$1 } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/unhead/dist/index.mjs';
import { toValue, unref, version } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/vue/index.mjs';
import { defineHeadPlugin } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/@unhead/shared/dist/index.mjs';
import destr from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/node_modules/destr/dist/index.mjs';
import { createHooks } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/node-mock-http/dist/index.mjs';
import { createStorage, prefixStorage } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/node_modules/ohash/dist/index.mjs';
import { klona } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/klona/dist/index.mjs';
import defu, { defuFn, defu as defu$1, createDefu } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/node_modules/defu/dist/defu.mjs';
import { snakeCase } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/scule/dist/index.mjs';
import { getContext } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/unctx/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import consola, { createConsola } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/youch-core/build/index.js';
import { Youch } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/nitropack/node_modules/source-map/source-map.js';
import devalue from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/@nuxt/devalue/dist/devalue.mjs';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$2, isAbsolute } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/node_modules/pathe/dist/index.mjs';
import { XMLParser } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/node_modules/fast-xml-parser/src/fxp.js';
import { ipxFSStorage, ipxHttpStorage, createIPX, createIPXH3Handler } from 'file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/node_modules/ipx/dist/index.mjs';

const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const IM_RE = /\?/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
const ENC_SLASH_RE = /%2f/gi;
const ENC_ENC_SLASH_RE = /%252f/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function encodePath(text) {
  return encode(text).replace(HASH_RE, "%23").replace(IM_RE, "%3F").replace(ENC_ENC_SLASH_RE, "%2F").replace(AMPERSAND_RE, "%26").replace(PLUS_RE, "%2B");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodePath(text) {
  return decode(text.replace(ENC_SLASH_RE, "%252F"));
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}

function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}

const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function hasLeadingSlash(input = "") {
  return input.startsWith("/");
}
function withoutLeadingSlash(input = "") {
  return (hasLeadingSlash(input) ? input.slice(1) : input) || "/";
}
function withLeadingSlash(input = "") {
  return hasLeadingSlash(input) ? input : "/" + input;
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withoutBase(input, base) {
  if (isEmptyURL(base)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (!input.startsWith(_base)) {
    return input;
  }
  const nextChar = input[_base.length];
  if (nextChar && nextChar !== "/" && nextChar !== "?") {
    return input;
  }
  const trimmed = input.slice(_base.length);
  return trimmed[0] === "/" ? trimmed : "/" + trimmed;
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function getQuery(input) {
  return parseQuery(parseURL(input).search);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
function withHttps(input) {
  return withProtocol(input, "https://");
}
function withProtocol(input, protocol) {
  let match = input.match(PROTOCOL_REGEX);
  if (!match) {
    match = input.match(/^\/{2,}/);
  }
  if (!match) {
    return protocol + input;
  }
  return protocol + input.slice(match[0].length);
}

const protocolRelative = Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return defaultProto ? parseURL(defaultProto + input) : parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path = path.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}

const serverAssets = [{"baseName":"server","dir":"/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend"}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/server"}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/.nuxt"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/.nuxt/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {
  "nuxt": {
    "buildId": "dev"
  }
};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/**": {
        "headers": {
          "Content-Security-Policy": "default-src 'self' http://localhost:* http://*.nip.io:* https://*.stripe.com https://*.google.com https://*.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.stripe.com https://*.google.com https://*.gstatic.com http://localhost:* http://*.nip.io:*; img-src * data: blob:; media-src 'self' data: blob:; worker-src 'self' blob:; frame-src 'self' https://*.stripe.com https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.stripe.com https://*.google.com http://localhost:* http://*.nip.io:* ws://localhost:* ws://*.nip.io:* https://nominatim.openstreetmap.org;"
        }
      },
      "/__sitemap__/style.xsl": {
        "headers": {
          "Content-Type": "application/xslt+xml"
        }
      },
      "/sitemap.xml": {
        "redirect": {
          "to": "/sitemap_index.xml",
          "statusCode": 307
        }
      },
      "/sitemap_index.xml": {},
      "/__sitemap__/tr-TR.xml": {},
      "/__sitemap__/en-US.xml": {},
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      }
    }
  },
  "public": {
    "apiBase": "http://localhost:3001",
    "appName": "TicariTakas",
    "appDescription": "Ticari Takas Platformu",
    "stripePublishableKey": "pk_test_51RXSv8BBb9r8vub8ZFfj4no24OQYkgjhbPDtvlIdX9LSni434NzDV3PeY4LnXbwlX2qrDiGt8o0KTHYp46s99A6z00R0iE0vV1",
    "minioBase": "http://localhost:9000/bazarx-public",
    "i18n": {
      "baseUrl": "",
      "defaultLocale": "tr",
      "defaultDirection": "ltr",
      "strategy": "prefix_except_default",
      "lazy": true,
      "rootRedirect": "",
      "routesNameSeparator": "___",
      "defaultLocaleRouteNameSuffix": "default",
      "skipSettingLocaleOnNavigate": false,
      "differentDomains": false,
      "trailingSlash": false,
      "configLocales": [
        {
          "code": "tr",
          "language": "tr-TR",
          "name": "Türkçe",
          "files": [
            "/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/locales/tr.json"
          ]
        },
        {
          "code": "en",
          "language": "en-US",
          "name": "English",
          "files": [
            "/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/locales/en.json"
          ]
        }
      ],
      "locales": {
        "tr": {
          "domain": ""
        },
        "en": {
          "domain": ""
        }
      },
      "detectBrowserLanguage": {
        "alwaysRedirect": false,
        "cookieCrossOrigin": false,
        "cookieDomain": "",
        "cookieKey": "i18n_redirected",
        "cookieSecure": false,
        "fallbackLocale": "",
        "redirectOn": "root",
        "useCookie": true
      },
      "experimental": {
        "localeDetector": "",
        "switchLocalePathLinkSSR": false,
        "autoImportTranslationFunctions": false
      },
      "multiDomainLocales": false
    }
  },
  "sitemap": {
    "isI18nMapped": true,
    "sitemapName": "sitemap.xml",
    "isMultiSitemap": true,
    "excludeAppSources": [],
    "cacheMaxAgeSeconds": 0,
    "autoLastmod": false,
    "defaultSitemapsChunkSize": 1000,
    "minify": false,
    "sortEntries": true,
    "debug": false,
    "discoverImages": true,
    "discoverVideos": true,
    "sitemapsPathPrefix": "/__sitemap__/",
    "isNuxtContentDocumentDriven": false,
    "xsl": "/__sitemap__/style.xsl",
    "xslTips": true,
    "xslColumns": [
      {
        "label": "URL",
        "width": "50%"
      },
      {
        "label": "Images",
        "width": "25%",
        "select": "count(image:image)"
      },
      {
        "label": "Last Updated",
        "width": "25%",
        "select": "concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"
      }
    ],
    "credits": true,
    "version": "7.6.0",
    "sitemaps": {
      "index": {
        "sitemapName": "index",
        "_route": "sitemap_index.xml",
        "sitemaps": [],
        "include": [],
        "exclude": []
      },
      "tr-TR": {
        "include": [],
        "exclude": [
          "/_**",
          "/_nuxt/**"
        ],
        "includeAppSources": true,
        "sitemapName": "tr-TR",
        "_route": "/__sitemap__/tr-TR.xml"
      },
      "en-US": {
        "include": [],
        "exclude": [
          "/_**",
          "/_nuxt/**"
        ],
        "includeAppSources": true,
        "sitemapName": "en-US",
        "_route": "/__sitemap__/en-US.xml"
      }
    },
    "autoI18n": {
      "differentDomains": false,
      "defaultLocale": "tr",
      "locales": [
        {
          "code": "tr",
          "language": "tr-TR",
          "name": "Türkçe",
          "file": "tr.json",
          "_hreflang": "tr-TR",
          "_sitemap": "tr-TR"
        },
        {
          "code": "en",
          "language": "en-US",
          "name": "English",
          "file": "en.json",
          "_hreflang": "en-US",
          "_sitemap": "en-US"
        }
      ],
      "strategy": "prefix_except_default",
      "pages": {}
    }
  },
  "nuxt-site-config": {
    "stack": [
      {
        "_context": "system",
        "_priority": -15,
        "name": "frontend",
        "env": "development"
      },
      {
        "_context": "package.json",
        "_priority": -10,
        "name": "ecommerce-frontend",
        "description": "E-Commerce Platform Frontend with Nuxt 3"
      },
      {
        "_priority": -3,
        "_context": "nuxt-site-config:config",
        "url": "https://barterborsa.com",
        "name": "BarterBorsa",
        "description": "Türkiye'nin En Büyük Ticari Takas Platformu",
        "defaultLocale": "tr"
      },
      {
        "_context": "@nuxtjs/i18n",
        "defaultLocale": "tr-TR"
      }
    ],
    "version": "3.2.21",
    "debug": false,
    "multiTenancy": []
  },
  "ipx": {
    "baseURL": "/_ipx",
    "alias": {
      "/backend": "http://localhost:3001"
    },
    "fs": {
      "dir": [
        "/Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/public"
      ]
    },
    "http": {
      "domains": [
        "localhost",
        "127.0.0.1",
        "172.20.10.8.nip.io",
        "loremflickr.com",
        "images.unsplash.com",
        "placehold.co"
      ]
    }
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

getContext("nitro-app", {
  asyncContext: false,
  AsyncLocalStorage: void 0
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function normalizeError(error, isDev) {
  const cwd = typeof process.cwd === "function" ? process.cwd() : "/";
  const stack = (error.unhandled || error.fatal) ? [] : (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Not Found" : "");
  const message = error.unhandled ? "internal server error" : error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler$0 = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.path,
    statusCode,
    statusMessage,
    message,
    stack: statusCode !== 404 ? `<pre>${stack.map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n")}</pre>` : "",
    // TODO: check and validate error.data for serialisation into query
    data: error.data
  };
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (event.handled) {
    return;
  }
  setResponseStatus(event, errorObject.statusCode !== 200 && errorObject.statusCode || 500, errorObject.statusMessage);
  if (isJsonRequest(event)) {
    setResponseHeader(event, "Content-Type", "application/json");
    return send(event, JSON.stringify(errorObject));
  }
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig().app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (!res) {
    const { template } = await Promise.resolve().then(function () { return errorDev; }) ;
    {
      errorObject.description = errorObject.message;
    }
    if (event.handled) {
      return;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  if (event.handled) {
    return;
  }
  for (const [header, value] of res.headers.entries()) {
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : void 0, res.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json ?? !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve$1(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = `
if (!window.__NUXT_DEVTOOLS_TIME_METRIC__) {
  Object.defineProperty(window, '__NUXT_DEVTOOLS_TIME_METRIC__', {
    value: {},
    enumerable: false,
    configurable: true,
  })
}
window.__NUXT_DEVTOOLS_TIME_METRIC__.appInit = Date.now()
`;

const _v6ruNoU96cFoxFUDaznF49QdOz5g6XhzpjjFOcNCGe4 = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

function normalizeSiteConfig(config) {
  if (typeof config.indexable !== "undefined")
    config.indexable = String(config.indexable) !== "false";
  if (typeof config.trailingSlash !== "undefined" && !config.trailingSlash)
    config.trailingSlash = String(config.trailingSlash) !== "false";
  if (config.url && !hasProtocol(String(config.url), { acceptRelative: true, strict: false }))
    config.url = withHttps(String(config.url));
  const keys = Object.keys(config).sort((a, b) => a.localeCompare(b));
  const newConfig = {};
  for (const k of keys)
    newConfig[k] = config[k];
  return newConfig;
}
function createSiteConfigStack(options) {
  const debug = options?.debug || false;
  const stack = [];
  function push(input) {
    if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
      return () => {
      };
    }
    if (!input._context && debug) {
      let lastFunctionName = new Error("tmp").stack?.split("\n")[2]?.split(" ")[5];
      if (lastFunctionName?.includes("/"))
        lastFunctionName = "anonymous";
      input._context = lastFunctionName;
    }
    const entry = {};
    for (const k in input) {
      const val = input[k];
      if (typeof val !== "undefined" && val !== "")
        entry[k] = val;
    }
    if (Object.keys(entry).filter((k) => !k.startsWith("_")).length === 0) {
      return () => {
      };
    }
    stack.push(entry);
    return () => {
      const idx = stack.indexOf(entry);
      if (idx !== -1)
        stack.splice(idx, 1);
    };
  }
  function get(options2) {
    const siteConfig = {};
    if (options2?.debug)
      siteConfig._context = {};
    siteConfig._priority = {};
    for (const o in stack.sort((a, b) => (a._priority || 0) - (b._priority || 0))) {
      for (const k in stack[o]) {
        const key = k;
        const val = options2?.resolveRefs ? toValue(stack[o][k]) : stack[o][k];
        if (!k.startsWith("_") && typeof val !== "undefined" && val !== "") {
          siteConfig[k] = val;
          if (typeof stack[o]._priority !== "undefined" && stack[o]._priority !== -1) {
            siteConfig._priority[key] = stack[o]._priority;
          }
          if (options2?.debug)
            siteConfig._context[key] = stack[o]._context?.[key] || stack[o]._context || "anonymous";
        }
      }
    }
    return options2?.skipNormalize ? siteConfig : normalizeSiteConfig(siteConfig);
  }
  return {
    stack,
    push,
    get
  };
}

function envSiteConfig(env = {}) {
  return Object.fromEntries(Object.entries(env).filter(([k]) => k.startsWith("NUXT_SITE_") || k.startsWith("NUXT_PUBLIC_SITE_")).map(([k, v]) => [
    k.replace(/^NUXT_(PUBLIC_)?SITE_/, "").split("_").map((s, i) => i === 0 ? s.toLowerCase() : s[0]?.toUpperCase() + s.slice(1).toLowerCase()).join(""),
    v
  ]));
}

const logger$1 = /* @__PURE__ */ createConsola({
  defaults: {
    tag: "nuxt-site-config"
  }
});

function getSiteConfig(e, _options) {
  if (!e.context._initedSiteConfig) {
    logger$1.warn("Site config has not been initialized yet. If you're trying to access site config in a server middleware then this not yet supported. See https://github.com/harlan-zw/nuxt-seo/issues/397");
  }
  e.context.siteConfig = e.context.siteConfig || createSiteConfigStack();
  const options = defu$1(_options, useRuntimeConfig(e)["nuxt-site-config"], { debug: false });
  return e.context.siteConfig.get(options);
}

const _BpJhWpDB1hSfZJjiYRCAAXLViB8UfDTCOpjDDROQNJk = defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook("render:html", async (ctx, { event }) => {
    const routeOptions = getRouteRules(event);
    event.path;
    const noSSR = event.context.nuxt?.noSSR || routeOptions.ssr === false && true || (false);
    if (noSSR) {
      const siteConfig = Object.fromEntries(
        Object.entries(getSiteConfig(event)).map(([k, v]) => [k, toValue(v)])
      );
      ctx.body.push(`<script>window.__NUXT_SITE_CONFIG__=${devalue(siteConfig)}<\/script>`);
    }
  });
});

const plugins = [
  _v6ruNoU96cFoxFUDaznF49QdOz5g6XhzpjjFOcNCGe4,
_BpJhWpDB1hSfZJjiYRCAAXLViB8UfDTCOpjDDROQNJk
];

const assets = {
  "/index.mjs": {
    "type": "text/javascript; charset=utf-8",
    "etag": "\"53d09-x0r+ZxdMebJwLaGrgp+XbGRganQ\"",
    "mtime": "2026-04-13T12:11:29.531Z",
    "size": 343305,
    "path": "index.mjs"
  },
  "/index.mjs.map": {
    "type": "application/json",
    "etag": "\"ba68f-735Xb5nLKHI2iwUtOuFg65g9qQg\"",
    "mtime": "2026-04-13T12:11:29.532Z",
    "size": 763535,
    "path": "index.mjs.map"
  }
};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve$2(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _1VotGN = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  if (asset.encoding !== void 0) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const r=Object.create(null),i=e=>globalThis.process?.env||globalThis._importMeta_.env||globalThis.Deno?.env.toObject()||globalThis.__env__||(e?r:globalThis),o=new Proxy(r,{get(e,s){return i()[s]??r[s]},has(e,s){const E=i();return s in E||s in r},set(e,s,E){const B=i(true);return B[s]=E,true},deleteProperty(e,s){if(!s)return  false;const E=i(true);return delete E[s],true},ownKeys(){const e=i(true);return Object.keys(e)}}),t=typeof process<"u"&&process.env&&"development"||"",f=[["APPVEYOR"],["AWS_AMPLIFY","AWS_APP_ID",{ci:true}],["AZURE_PIPELINES","SYSTEM_TEAMFOUNDATIONCOLLECTIONURI"],["AZURE_STATIC","INPUT_AZURE_STATIC_WEB_APPS_API_TOKEN"],["APPCIRCLE","AC_APPCIRCLE"],["BAMBOO","bamboo_planKey"],["BITBUCKET","BITBUCKET_COMMIT"],["BITRISE","BITRISE_IO"],["BUDDY","BUDDY_WORKSPACE_ID"],["BUILDKITE"],["CIRCLE","CIRCLECI"],["CIRRUS","CIRRUS_CI"],["CLOUDFLARE_PAGES","CF_PAGES",{ci:true}],["CLOUDFLARE_WORKERS","WORKERS_CI",{ci:true}],["CODEBUILD","CODEBUILD_BUILD_ARN"],["CODEFRESH","CF_BUILD_ID"],["DRONE"],["DRONE","DRONE_BUILD_EVENT"],["DSARI"],["GITHUB_ACTIONS"],["GITLAB","GITLAB_CI"],["GITLAB","CI_MERGE_REQUEST_ID"],["GOCD","GO_PIPELINE_LABEL"],["LAYERCI"],["HUDSON","HUDSON_URL"],["JENKINS","JENKINS_URL"],["MAGNUM"],["NETLIFY"],["NETLIFY","NETLIFY_LOCAL",{ci:false}],["NEVERCODE"],["RENDER"],["SAIL","SAILCI"],["SEMAPHORE"],["SCREWDRIVER"],["SHIPPABLE"],["SOLANO","TDDIUM"],["STRIDER"],["TEAMCITY","TEAMCITY_VERSION"],["TRAVIS"],["VERCEL","NOW_BUILDER"],["VERCEL","VERCEL",{ci:false}],["VERCEL","VERCEL_ENV",{ci:false}],["APPCENTER","APPCENTER_BUILD_ID"],["CODESANDBOX","CODESANDBOX_SSE",{ci:false}],["CODESANDBOX","CODESANDBOX_HOST",{ci:false}],["STACKBLITZ"],["STORMKIT"],["CLEAVR"],["ZEABUR"],["CODESPHERE","CODESPHERE_APP_ID",{ci:true}],["RAILWAY","RAILWAY_PROJECT_ID"],["RAILWAY","RAILWAY_SERVICE_ID"],["DENO-DEPLOY","DENO_DEPLOYMENT_ID"],["FIREBASE_APP_HOSTING","FIREBASE_APP_HOSTING",{ci:true}]];function b(){if(globalThis.process?.env)for(const e of f){const s=e[1]||e[0];if(globalThis.process?.env[s])return {name:e[0].toLowerCase(),...e[2]}}return globalThis.process?.env?.SHELL==="/bin/jsh"&&globalThis.process?.versions?.webcontainer?{name:"stackblitz",ci:false}:{name:"",ci:false}}const l=b();l.name;function n(e){return e?e!=="false":false}const I=globalThis.process?.platform||"",T=n(o.CI)||l.ci!==false,R=n(globalThis.process?.stdout&&globalThis.process?.stdout.isTTY);n(o.DEBUG);const a=t==="test"||n(o.TEST),h=t==="dev"||t==="development";n(o.MINIMAL)||T||a||!R;const A=/^win/i.test(I);!n(o.NO_COLOR)&&(n(o.FORCE_COLOR)||(R||A)&&o.TERM!=="dumb"||T);const C=(globalThis.process?.versions?.node||"").replace(/^v/,"")||null;Number(C?.split(".")[0])||null;const W=globalThis.process||Object.create(null),_={versions:{}};new Proxy(W,{get(e,s){if(s==="env")return o;if(s in e)return e[s];if(s in _)return _[s]}});const O=globalThis.process?.release?.name==="node",c=!!globalThis.Bun||!!globalThis.process?.versions?.bun,D=!!globalThis.Deno,L=!!globalThis.fastly,S=!!globalThis.Netlify,u=!!globalThis.EdgeRuntime,N=globalThis.navigator?.userAgent==="Cloudflare-Workers",F=[[S,"netlify"],[u,"edge-light"],[N,"workerd"],[L,"fastly"],[D,"deno"],[c,"bun"],[O,"node"]];function G(){const e=F.find(s=>s[0]);if(e)return {name:e[1]}}const P=G();P?.name||"";

function isLocalhostHost(host) {
  if (!host || host.startsWith("localhost") || host.startsWith("127.") || host.startsWith("0.0.0.0"))
    return true;
  const hostname = host.startsWith("[") ? host.slice(0, host.indexOf("]") + 1) : host;
  return hostname === "[::1]" || hostname === "::1" || hostname === "[::]" || hostname === "::";
}
function extractHostname(host) {
  if (host.startsWith("[")) {
    const close = host.indexOf("]");
    return close !== -1 ? host.slice(0, close + 1) : host;
  }
  const colonCount = host.split(":").length - 1;
  return colonCount === 1 ? host.slice(0, host.indexOf(":")) : host;
}
function splitHostPort(host) {
  if (host.startsWith("[")) {
    const close = host.indexOf("]");
    const hostname = close !== -1 ? host.slice(0, close + 1) : host;
    const port = close !== -1 && host[close + 1] === ":" ? host.slice(close + 2) : "";
    const normalized = hostname === "[::1]" || hostname === "[::]" ? "localhost" : hostname;
    return { host: normalized, port };
  }
  if (host === "0.0.0.0" || host.startsWith("0.0.0.0:")) {
    const i = host.indexOf(":");
    return { host: "localhost", port: i !== -1 ? host.slice(i + 1) : "" };
  }
  const colonCount = host.split(":").length - 1;
  if (colonCount === 1) {
    const i = host.indexOf(":");
    return { host: host.slice(0, i), port: host.slice(i + 1) };
  }
  if (colonCount > 1) {
    const normalized = host === "::1" || host === "::" ? "localhost" : `[${host}]`;
    return { host: normalized, port: "" };
  }
  return { host, port: "" };
}
function getNitroOrigin$1(ctx = {}) {
  const isDev = ctx.isDev ?? h;
  const isPrerender = ctx.isPrerender ?? !!o.prerender;
  let host = "";
  let port = "";
  let protocol = o.NITRO_SSL_CERT && o.NITRO_SSL_KEY ? "https" : "http";
  if (isDev || isPrerender) {
    const devEnv = o.__NUXT_DEV__ || o.NUXT_VITE_NODE_OPTIONS;
    if (devEnv) {
      const parsed = JSON.parse(devEnv);
      const origin = parsed.proxy?.url || parsed.baseURL?.replace("/__nuxt_vite_node__", "");
      host = origin.replace(/^https?:\/\//, "").replace(/\/$/, "");
      protocol = origin.startsWith("https") ? "https" : "http";
    }
  }
  if (isDev && isLocalhostHost(host) && ctx.requestHost) {
    const reqHost = extractHostname(ctx.requestHost);
    if (reqHost && !isLocalhostHost(reqHost)) {
      host = ctx.requestHost;
      protocol = ctx.requestProtocol || protocol;
    }
  }
  if (!host && ctx.requestHost) {
    host = ctx.requestHost;
    protocol = ctx.requestProtocol || protocol;
  }
  if (!host) {
    host = o.NITRO_HOST || o.HOST || "";
    if (isDev)
      port = o.NITRO_PORT || o.PORT || "3000";
  }
  const split = splitHostPort(host);
  host = split.host;
  if (split.port)
    port = split.port;
  host = o.NUXT_SITE_HOST_OVERRIDE || host;
  port = o.NUXT_SITE_PORT_OVERRIDE || port;
  if (host.startsWith("http://") || host.startsWith("https://")) {
    protocol = host.startsWith("https://") ? "https" : "http";
    host = host.replace(/^https?:\/\//, "");
  } else if (!isDev && (!host || !isLocalhostHost(host))) {
    protocol = "https";
  }
  return `${protocol}://${host}${port ? `:${port}` : ""}/`;
}

function getNitroOrigin(e) {
  return getNitroOrigin$1({
    isDev: true,
    isPrerender: false,
    requestHost: e ? getRequestHost(e, { xForwardedHost: true }) : void 0,
    requestProtocol: e ? getRequestProtocol(e, { xForwardedProto: true }) : void 0
  });
}

const _1Qut89 = eventHandler(async (e) => {
  if (e.context._initedSiteConfig)
    return;
  const runtimeConfig = useRuntimeConfig(e);
  const config = runtimeConfig["nuxt-site-config"];
  const nitroApp = useNitroApp();
  const siteConfig = e.context.siteConfig || createSiteConfigStack({
    debug: config.debug
  });
  const nitroOrigin = getNitroOrigin(e);
  e.context.siteConfigNitroOrigin = nitroOrigin;
  {
    siteConfig.push({
      _context: "nitro:init",
      _priority: -4,
      url: nitroOrigin
    });
  }
  siteConfig.push({
    _context: "runtimeEnv",
    _priority: 0,
    ...runtimeConfig.site || {},
    ...runtimeConfig.public.site || {},
    ...envSiteConfig(globalThis._importMeta_.env || {})
    // just in-case, shouldn't be needed
  });
  const buildStack = config.stack || [];
  buildStack.forEach((c) => siteConfig.push(c));
  if (e.context._nitro.routeRules.site) {
    siteConfig.push({
      _context: "route-rules",
      ...e.context._nitro.routeRules.site
    });
  }
  if (config.multiTenancy) {
    const host = parseURL(nitroOrigin).host?.replace(/:\d+$/, "") || "";
    const tenant = config.multiTenancy?.find((t) => t.hosts.includes(host));
    if (tenant) {
      siteConfig.push({
        _context: `multi-tenancy:${host}`,
        _priority: 0,
        ...tenant.config
      });
    }
  }
  const ctx = { siteConfig, event: e };
  await nitroApp.hooks.callHook("site-config:init", ctx);
  e.context.siteConfig = ctx.siteConfig;
  e.context._initedSiteConfig = true;
});

const _H0J8ks = eventHandler(async (e) => {
  const siteConfig = getSiteConfig(e);
  const nitroOrigin = getNitroOrigin(e);
  const runtimeConfig = useRuntimeConfig(e);
  const stack = e.context.siteConfig.stack;
  setHeader(e, "Content-Type", "application/json");
  return {
    config: siteConfig,
    stack,
    nitroOrigin,
    version: runtimeConfig["nuxt-site-config"].version
  };
});

const logger = createConsola({
  defaults: {
    tag: "@nuxt/sitemap"
  }
});
const merger = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value))
    obj[key] = Array.from(/* @__PURE__ */ new Set([...obj[key], ...value]));
  return obj[key];
});
function mergeOnKey(arr, key) {
  const seen = /* @__PURE__ */ new Map();
  let resultLength = 0;
  const result = Array.from({ length: arr.length });
  for (const item of arr) {
    const k = item[key];
    if (seen.has(k)) {
      const existingIndex = seen.get(k);
      result[existingIndex] = merger(item, result[existingIndex]);
    } else {
      seen.set(k, resultLength);
      result[resultLength++] = item;
    }
  }
  result.length = resultLength;
  return result;
}
function splitForLocales(path, locales) {
  const prefix = withLeadingSlash(path).split("/")[1];
  if (prefix && locales.includes(prefix))
    return [prefix, path.replace(`/${prefix}`, "")];
  return [null, path];
}
const StringifiedRegExpPattern = /\/(.*?)\/([gimsuy]*)$/;
function normalizeRuntimeFilters(input) {
  return (input || []).map((rule) => {
    if (rule instanceof RegExp || typeof rule === "string")
      return rule;
    const match = rule.regex.match(StringifiedRegExpPattern);
    if (match)
      return new RegExp(match[1], match[2]);
    return false;
  }).filter(Boolean);
}
function createPathFilter(options = {}) {
  const urlFilter = createFilter(options);
  return (loc) => {
    let path = loc;
    try {
      path = parseURL(loc).pathname;
    } catch {
      return false;
    }
    return urlFilter(path);
  };
}
function findPageMapping(pathWithoutPrefix, pages) {
  const stripped = pathWithoutPrefix[0] === "/" ? pathWithoutPrefix.slice(1) : pathWithoutPrefix;
  const pageKey = stripped.endsWith("/index") ? stripped.slice(0, -6) || "index" : stripped || "index";
  if (pages[pageKey])
    return { mappings: pages[pageKey], paramSegments: [] };
  const sortedKeys = Object.keys(pages).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (pageKey.startsWith(key + "/")) {
      const paramPath = pageKey.slice(key.length + 1);
      return { mappings: pages[key], paramSegments: paramPath.split("/") };
    }
  }
  return null;
}
function applyDynamicParams(customPath, paramSegments) {
  if (!paramSegments.length)
    return customPath;
  let i = 0;
  return customPath.replace(/\[[^\]]+\]/g, () => paramSegments[i++] || "");
}
function createFilter(options = {}) {
  const include = options.include || [];
  const exclude = options.exclude || [];
  if (include.length === 0 && exclude.length === 0)
    return () => true;
  const excludeRegex = exclude.filter((r) => r instanceof RegExp);
  const includeRegex = include.filter((r) => r instanceof RegExp);
  const excludeStrings = exclude.filter((r) => typeof r === "string");
  const includeStrings = include.filter((r) => typeof r === "string");
  const excludeMatcher = excludeStrings.length > 0 ? toRouteMatcher(createRouter({
    routes: Object.fromEntries(excludeStrings.map((r) => [r, true])),
    strictTrailingSlash: false
  })) : null;
  const includeMatcher = includeStrings.length > 0 ? toRouteMatcher(createRouter({
    routes: Object.fromEntries(includeStrings.map((r) => [r, true])),
    strictTrailingSlash: false
  })) : null;
  const excludeExact = new Set(excludeStrings);
  const includeExact = new Set(includeStrings);
  return function(path) {
    if (excludeRegex.some((r) => r.test(path)))
      return false;
    if (excludeExact.has(path))
      return false;
    if (excludeMatcher && excludeMatcher.matchAll(path).length > 0)
      return false;
    if (includeRegex.some((r) => r.test(path)))
      return true;
    if (includeExact.has(path))
      return true;
    if (includeMatcher && includeMatcher.matchAll(path).length > 0)
      return true;
    return include.length === 0;
  };
}

function xmlEscape(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function useSitemapRuntimeConfig(e) {
  const clone = JSON.parse(JSON.stringify(useRuntimeConfig(e).sitemap));
  for (const k in clone.sitemaps) {
    const sitemap = clone.sitemaps[k];
    sitemap.include = normalizeRuntimeFilters(sitemap.include);
    sitemap.exclude = normalizeRuntimeFilters(sitemap.exclude);
    clone.sitemaps[k] = sitemap;
  }
  return Object.freeze(clone);
}

function isValidString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function parseNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseFloat(value.trim());
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function parseInteger(value) {
  if (typeof value === "number") return Math.floor(value);
  if (typeof value === "string" && value.trim()) {
    const num = Number.parseInt(value.trim(), 10);
    return Number.isNaN(num) ? void 0 : num;
  }
  return void 0;
}
function extractUrlFromParsedElement(urlElement, warnings) {
  if (!isValidString(urlElement.loc)) {
    warnings.push({
      type: "validation",
      message: "URL entry missing required loc element",
      context: { url: String(urlElement.loc || "undefined") }
    });
    return null;
  }
  const urlObj = { loc: urlElement.loc };
  if (isValidString(urlElement.lastmod)) {
    urlObj.lastmod = urlElement.lastmod;
  }
  if (isValidString(urlElement.changefreq)) {
    const validFreqs = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
    if (validFreqs.includes(urlElement.changefreq)) {
      urlObj.changefreq = urlElement.changefreq;
    } else {
      warnings.push({
        type: "validation",
        message: "Invalid changefreq value",
        context: { url: urlElement.loc, field: "changefreq", value: urlElement.changefreq }
      });
    }
  }
  const priority = parseNumber(urlElement.priority);
  if (priority !== void 0 && !Number.isNaN(priority)) {
    if (priority < 0 || priority > 1) {
      warnings.push({
        type: "validation",
        message: "Priority value should be between 0.0 and 1.0, clamping to valid range",
        context: { url: urlElement.loc, field: "priority", value: priority }
      });
    }
    urlObj.priority = Math.max(0, Math.min(1, priority));
  } else if (urlElement.priority !== void 0) {
    warnings.push({
      type: "validation",
      message: "Invalid priority value",
      context: { url: urlElement.loc, field: "priority", value: urlElement.priority }
    });
  }
  if (urlElement.image) {
    const images = Array.isArray(urlElement.image) ? urlElement.image : [urlElement.image];
    const validImages = images.map((img) => {
      if (isValidString(img.loc)) {
        return { loc: img.loc };
      } else {
        warnings.push({
          type: "validation",
          message: "Image missing required loc element",
          context: { url: urlElement.loc, field: "image.loc" }
        });
        return null;
      }
    }).filter((img) => img !== null);
    if (validImages.length > 0) {
      urlObj.images = validImages;
    }
  }
  if (urlElement.video) {
    const videos = Array.isArray(urlElement.video) ? urlElement.video : [urlElement.video];
    const validVideos = videos.map((video) => {
      const missingFields = [];
      if (!isValidString(video.title)) missingFields.push("title");
      if (!isValidString(video.thumbnail_loc)) missingFields.push("thumbnail_loc");
      if (!isValidString(video.description)) missingFields.push("description");
      if (!isValidString(video.content_loc)) missingFields.push("content_loc");
      if (missingFields.length > 0) {
        warnings.push({
          type: "validation",
          message: `Video missing required fields: ${missingFields.join(", ")}`,
          context: { url: urlElement.loc, field: "video" }
        });
        return null;
      }
      const videoObj = {
        title: video.title,
        thumbnail_loc: video.thumbnail_loc,
        description: video.description,
        content_loc: video.content_loc
      };
      if (isValidString(video.player_loc)) {
        videoObj.player_loc = video.player_loc;
      }
      const duration = parseInteger(video.duration);
      if (duration !== void 0) {
        videoObj.duration = duration;
      } else if (video.duration !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video duration value",
          context: { url: urlElement.loc, field: "video.duration", value: video.duration }
        });
      }
      if (isValidString(video.expiration_date)) {
        videoObj.expiration_date = video.expiration_date;
      }
      const rating = parseNumber(video.rating);
      if (rating !== void 0) {
        if (rating < 0 || rating > 5) {
          warnings.push({
            type: "validation",
            message: "Video rating should be between 0.0 and 5.0",
            context: { url: urlElement.loc, field: "video.rating", value: rating }
          });
        }
        videoObj.rating = rating;
      } else if (video.rating !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video rating value",
          context: { url: urlElement.loc, field: "video.rating", value: video.rating }
        });
      }
      const viewCount = parseInteger(video.view_count);
      if (viewCount !== void 0) {
        videoObj.view_count = viewCount;
      } else if (video.view_count !== void 0) {
        warnings.push({
          type: "validation",
          message: "Invalid video view_count value",
          context: { url: urlElement.loc, field: "video.view_count", value: video.view_count }
        });
      }
      if (isValidString(video.publication_date)) {
        videoObj.publication_date = video.publication_date;
      }
      if (isValidString(video.family_friendly)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.family_friendly)) {
          videoObj.family_friendly = video.family_friendly;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video family_friendly value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.family_friendly", value: video.family_friendly }
          });
        }
      }
      if (isValidString(video.requires_subscription)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.requires_subscription)) {
          videoObj.requires_subscription = video.requires_subscription;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video requires_subscription value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.requires_subscription", value: video.requires_subscription }
          });
        }
      }
      if (isValidString(video.live)) {
        const validValues = ["yes", "no"];
        if (validValues.includes(video.live)) {
          videoObj.live = video.live;
        } else {
          warnings.push({
            type: "validation",
            message: 'Invalid video live value, should be "yes" or "no"',
            context: { url: urlElement.loc, field: "video.live", value: video.live }
          });
        }
      }
      if (video.restriction && typeof video.restriction === "object") {
        const restriction = video.restriction;
        if (isValidString(restriction.relationship) && isValidString(restriction["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(restriction.relationship)) {
            videoObj.restriction = {
              relationship: restriction.relationship,
              restriction: restriction["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video restriction relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.restriction.relationship", value: restriction.relationship }
            });
          }
        }
      }
      if (video.platform && typeof video.platform === "object") {
        const platform = video.platform;
        if (isValidString(platform.relationship) && isValidString(platform["#text"])) {
          const validRelationships = ["allow", "deny"];
          if (validRelationships.includes(platform.relationship)) {
            videoObj.platform = {
              relationship: platform.relationship,
              platform: platform["#text"]
            };
          } else {
            warnings.push({
              type: "validation",
              message: 'Invalid video platform relationship, should be "allow" or "deny"',
              context: { url: urlElement.loc, field: "video.platform.relationship", value: platform.relationship }
            });
          }
        }
      }
      if (video.price) {
        const prices = Array.isArray(video.price) ? video.price : [video.price];
        const validPrices = prices.map((price) => {
          const priceValue = price["#text"];
          if (priceValue == null || typeof priceValue !== "string" && typeof priceValue !== "number") {
            warnings.push({
              type: "validation",
              message: "Video price missing value",
              context: { url: urlElement.loc, field: "video.price" }
            });
            return null;
          }
          const validTypes = ["rent", "purchase", "package", "subscription"];
          if (price.type && !validTypes.includes(price.type)) {
            warnings.push({
              type: "validation",
              message: `Invalid video price type "${price.type}", should be one of: ${validTypes.join(", ")}`,
              context: { url: urlElement.loc, field: "video.price.type", value: price.type }
            });
          }
          return {
            price: String(priceValue),
            currency: price.currency,
            type: price.type
          };
        }).filter((p) => p !== null);
        if (validPrices.length > 0) {
          videoObj.price = validPrices;
        }
      }
      if (video.uploader && typeof video.uploader === "object") {
        const uploader = video.uploader;
        if (isValidString(uploader.info) && isValidString(uploader["#text"])) {
          videoObj.uploader = {
            uploader: uploader["#text"],
            info: uploader.info
          };
        } else {
          warnings.push({
            type: "validation",
            message: "Video uploader missing required info or name",
            context: { url: urlElement.loc, field: "video.uploader" }
          });
        }
      }
      if (video.tag) {
        const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
        const validTags = tags.filter(isValidString);
        if (validTags.length > 0) {
          videoObj.tag = validTags;
        }
      }
      return videoObj;
    }).filter((video) => video !== null);
    if (validVideos.length > 0) {
      urlObj.videos = validVideos;
    }
  }
  if (urlElement.link) {
    const links = Array.isArray(urlElement.link) ? urlElement.link : [urlElement.link];
    const alternatives = links.map((link) => {
      if (link.rel === "alternate" && isValidString(link.hreflang) && isValidString(link.href)) {
        return {
          hreflang: link.hreflang,
          href: link.href
        };
      } else {
        warnings.push({
          type: "validation",
          message: 'Alternative link missing required rel="alternate", hreflang, or href',
          context: { url: urlElement.loc, field: "link" }
        });
        return null;
      }
    }).filter((alt) => alt !== null);
    if (alternatives.length > 0) {
      urlObj.alternatives = alternatives;
    }
  }
  if (urlElement.news && typeof urlElement.news === "object") {
    const news = urlElement.news;
    if (isValidString(news.title) && isValidString(news.publication_date) && news.publication && isValidString(news.publication.name) && isValidString(news.publication.language)) {
      urlObj.news = {
        title: news.title,
        publication_date: news.publication_date,
        publication: {
          name: news.publication.name,
          language: news.publication.language
        }
      };
    } else {
      warnings.push({
        type: "validation",
        message: "News entry missing required fields (title, publication_date, publication.name, publication.language)",
        context: { url: urlElement.loc, field: "news" }
      });
    }
  }
  return Object.fromEntries(
    Object.entries(urlObj).filter(
      ([_, value]) => value != null && (!Array.isArray(value) || value.length > 0)
    )
  );
}
async function parseSitemapXml(xml) {
  const warnings = [];
  if (!xml) {
    throw new Error("Empty XML input provided");
  }
  const { XMLParser } = await import('file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/node_modules/fast-xml-parser/src/fxp.js');
  const parser = new XMLParser({
    isArray: (tagName) => ["url", "image", "video", "link", "tag", "price"].includes(tagName),
    removeNSPrefix: true,
    parseAttributeValue: false,
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: true
  });
  try {
    const parsed = parser.parse(xml);
    if (!parsed?.urlset) {
      throw new Error("XML does not contain a valid urlset element");
    }
    if (!parsed.urlset.url) {
      throw new Error("Sitemap contains no URL entries");
    }
    const urls = Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url];
    const validUrls = urls.map((url) => extractUrlFromParsedElement(url, warnings)).filter((url) => url !== null);
    if (validUrls.length === 0 && urls.length > 0) {
      warnings.push({
        type: "validation",
        message: "No valid URLs found in sitemap after validation"
      });
    }
    return { urls: validUrls, warnings };
  } catch (error) {
    if (error instanceof Error && (error.message === "Empty XML input provided" || error.message === "XML does not contain a valid urlset element" || error.message === "Sitemap contains no URL entries")) {
      throw error;
    }
    throw new Error(`Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

new XMLParser({
  isArray: (tagName) => tagName === "sitemap",
  removeNSPrefix: true,
  trimValues: true
});

function normalizeSourceInput(source) {
  if (typeof source === "string") {
    return { context: { name: "hook" }, fetch: source };
  }
  if (Array.isArray(source)) {
    return { context: { name: "hook" }, fetch: source };
  }
  return source;
}
async function tryFetchWithFallback(url, options, event) {
  const isExternalUrl = !url.startsWith("/");
  if (isExternalUrl) {
    const strategies = [
      // Strategy 1: Use globalThis.$fetch (original approach)
      () => globalThis.$fetch(url, options),
      // Strategy 2: If event is available, try using event context even for external URLs
      event ? () => event.$fetch(url, options) : null,
      // Strategy 3: Use native fetch as last resort
      () => $fetch(url, options)
    ].filter(Boolean);
    let lastError = null;
    for (const strategy of strategies) {
      try {
        return await strategy();
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    throw lastError;
  }
  const fetchContainer = url.startsWith("/") && event ? event : globalThis;
  return await fetchContainer.$fetch(url, options);
}
async function fetchDataSource(input, event) {
  const context = typeof input.context === "string" ? { name: input.context } : input.context || { name: "fetch" };
  const url = typeof input.fetch === "string" ? input.fetch : input.fetch[0];
  const options = typeof input.fetch === "string" ? {} : input.fetch[1];
  const start = Date.now();
  const isExternalUrl = !url.startsWith("/");
  const timeout = isExternalUrl ? 1e4 : options.timeout || 5e3;
  const timeoutController = new AbortController();
  const abortRequestTimeout = setTimeout(() => timeoutController.abort(), timeout);
  try {
    let isMaybeErrorResponse = false;
    const isXmlRequest = parseURL(url).pathname.endsWith(".xml");
    const mergedHeaders = defu$1(
      options?.headers,
      {
        Accept: isXmlRequest ? "text/xml" : "application/json"
      },
      event && !isExternalUrl ? { host: getRequestHost(event, { xForwardedHost: true }) } : {}
    );
    const fetchOptions = {
      ...options,
      responseType: isXmlRequest ? "text" : "json",
      signal: timeoutController.signal,
      headers: mergedHeaders,
      // Use ofetch's built-in retry for external sources
      ...isExternalUrl && {
        retry: 2,
        retryDelay: 200
      },
      // @ts-expect-error untyped
      onResponse({ response }) {
        if (typeof response._data === "string" && response._data.startsWith("<!DOCTYPE html>"))
          isMaybeErrorResponse = true;
      }
    };
    const res = await tryFetchWithFallback(url, fetchOptions, event);
    const timeTakenMs = Date.now() - start;
    if (isMaybeErrorResponse) {
      return {
        ...input,
        context,
        urls: [],
        timeTakenMs,
        error: "Received HTML response instead of JSON"
      };
    }
    let urls = [];
    if (typeof res === "object") {
      urls = res.urls || res;
    } else if (typeof res === "string" && parseURL(url).pathname.endsWith(".xml")) {
      const result = await parseSitemapXml(res);
      urls = result.urls;
    }
    return {
      ...input,
      context,
      timeTakenMs,
      urls
    };
  } catch (_err) {
    const error = _err;
    if (isExternalUrl) {
      const errorInfo = {
        url,
        timeout,
        error: error.message,
        statusCode: error.response?.status,
        statusText: error.response?.statusText,
        method: options?.method || "GET"
      };
      logger.error("Failed to fetch external source.", errorInfo);
    } else {
      logger.error("Failed to fetch source.", { url, error: error.message });
    }
    return {
      ...input,
      context,
      urls: [],
      error: error.message,
      _isFailure: true
      // Mark as failure to prevent caching
    };
  } finally {
    if (abortRequestTimeout) {
      clearTimeout(abortRequestTimeout);
    }
  }
}
async function globalSitemapSources() {
  const m = await Promise.resolve().then(function () { return globalSources; });
  return [...m.sources];
}
async function childSitemapSources(definition) {
  if (!definition?._hasSourceChunk)
    return [];
  const m = await Promise.resolve().then(function () { return childSources; });
  return [...m.sources[definition.sitemapName] || []];
}
async function resolveSitemapSources(sources, event) {
  return (await Promise.all(
    sources.map((source) => {
      const normalized = normalizeSourceInput(source);
      if ("urls" in normalized) {
        return {
          timeTakenMs: 0,
          ...normalized,
          urls: normalized.urls
        };
      }
      if (normalized.fetch)
        return fetchDataSource(normalized, event);
      return {
        ...normalized,
        error: "Invalid source"
      };
    })
  )).flat();
}

const VALID_CHANGEFREQ = ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"];
function validateSitemapUrl(url) {
  if (typeof url === "string")
    return [];
  const warnings = [];
  if (url.lastmod) {
    const d = typeof url.lastmod === "string" ? url.lastmod : void 0;
    if (d && !isValidW3CDate(d))
      warnings.push(`lastmod "${d}" is not a valid W3C date`);
  }
  if (url.changefreq && !VALID_CHANGEFREQ.includes(url.changefreq))
    warnings.push(`changefreq "${url.changefreq}" is not valid (expected: always|hourly|daily|weekly|monthly|yearly|never)`);
  if (url.priority !== void 0) {
    const p = typeof url.priority === "number" ? url.priority : Number.parseFloat(String(url.priority));
    if (Number.isNaN(p) || p < 0 || p > 1)
      warnings.push(`priority "${url.priority}" is not valid (expected: number between 0.0 and 1.0)`);
  }
  return warnings;
}
function resolve(s, resolvers) {
  if (typeof s === "undefined")
    return void 0;
  const str = typeof s === "string" ? s : s.toString();
  if (!resolvers)
    return str;
  if (hasProtocol(str, { acceptRelative: true, strict: false }))
    return resolvers.fixSlashes(str);
  return resolvers.canonicalUrlResolver(str);
}
function removeTrailingSlash(s) {
  return s.replace(/\/(\?|#|$)/, "$1");
}
function preNormalizeEntry(_e, resolvers) {
  const input = typeof _e === "string" ? { loc: _e } : { ..._e };
  if (input.url && !input.loc) {
    input.loc = input.url;
  }
  delete input.url;
  if (typeof input.loc !== "string") {
    input.loc = "";
  }
  const skipEncoding = input._encoded === true;
  const e = input;
  e.loc = removeTrailingSlash(e.loc);
  e._abs = hasProtocol(e.loc, { acceptRelative: false, strict: false });
  try {
    e._path = e._abs ? parseURL(e.loc) : parsePath(e.loc);
  } catch {
    e._path = null;
  }
  if (e._path) {
    const search = e._path.search;
    const qs = search && search.length > 1 ? stringifyQuery(parseQuery(search)) : "";
    const pathname = skipEncoding ? e._path.pathname : encodePath(e._path.pathname);
    e._relativeLoc = `${pathname}${qs.length ? `?${qs}` : ""}`;
    if (e._path.host) {
      e.loc = stringifyParsedURL(e._path);
    } else {
      e.loc = e._relativeLoc;
    }
  } else if (!skipEncoding && !isEncoded(e.loc)) {
    e.loc = encodeURI(e.loc);
  }
  if (e.loc === "")
    e.loc = `/`;
  e.loc = resolve(e.loc, resolvers);
  e._key = `${e._sitemap || ""}${withoutTrailingSlash(e.loc)}`;
  return e;
}
function isEncoded(url) {
  try {
    return url !== decodeURIComponent(url);
  } catch {
    return false;
  }
}
function normaliseEntry(_e, defaults, resolvers) {
  const e = defu$1(_e, defaults);
  {
    const warnings = validateSitemapUrl(e);
    if (warnings.length)
      e._warnings = (e._warnings || []).concat(warnings);
  }
  if (e.lastmod) {
    const date = normaliseDate(e.lastmod);
    if (date)
      e.lastmod = date;
    else
      delete e.lastmod;
  }
  if (!e.lastmod)
    delete e.lastmod;
  e.loc = resolve(e.loc, resolvers);
  if (e.alternatives) {
    const alternatives = e.alternatives.map((a) => ({ ...a }));
    for (const alt of alternatives) {
      if (typeof alt.href === "string") {
        alt.href = resolve(alt.href, resolvers);
      } else if (typeof alt.href === "object" && alt.href) {
        alt.href = resolve(alt.href.href, resolvers);
      }
    }
    e.alternatives = mergeOnKey(alternatives, "hreflang");
  }
  if (e.images) {
    const images = e.images.map((i) => ({ ...i }));
    for (const img of images) {
      img.loc = resolve(img.loc, resolvers);
    }
    e.images = mergeOnKey(images, "loc");
  }
  if (e.videos) {
    const videos = e.videos.map((v) => ({ ...v }));
    for (const video of videos) {
      if (video.content_loc) {
        video.content_loc = resolve(video.content_loc, resolvers);
      }
    }
    e.videos = mergeOnKey(videos, "content_loc");
  }
  return e;
}
const IS_VALID_W3C_DATE = [
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/,
  /^\d{4}-[01]\d-[0-3]\d$/,
  /^\d{4}-[01]\d$/,
  /^\d{4}$/
];
function isValidW3CDate(d) {
  return IS_VALID_W3C_DATE.some((r) => r.test(d));
}
function normaliseDate(d) {
  if (typeof d === "string") {
    const tIdx = d.indexOf("T");
    if (tIdx !== -1) {
      const t = d.slice(tIdx + 1);
      if (!t.includes("+") && !t.includes("-") && !t.includes("Z")) {
        d += "Z";
      }
    }
    if (!isValidW3CDate(d))
      return false;
    d = new Date(d);
    d.setMilliseconds(0);
    if (Number.isNaN(d.getTime()))
      return false;
  }
  const z = (n) => `0${n}`.slice(-2);
  const date = `${d.getUTCFullYear()}-${z(d.getUTCMonth() + 1)}-${z(d.getUTCDate())}`;
  if (d.getUTCHours() > 0 || d.getUTCMinutes() > 0 || d.getUTCSeconds() > 0) {
    return `${date}T${z(d.getUTCHours())}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())}Z`;
  }
  return date;
}

function useSiteConfig(e, _options) {
  return getSiteConfig(e, _options);
}

function resolveSitePath(pathOrUrl, options) {
  let path = pathOrUrl;
  if (hasProtocol(pathOrUrl, { strict: false, acceptRelative: true })) {
    const parsed = parseURL(pathOrUrl);
    path = parsed.pathname;
  }
  const base = withLeadingSlash(options.base || "/");
  if (base !== "/" && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  let origin = withoutTrailingSlash(options.absolute ? options.siteUrl : "");
  if (base !== "/" && origin.endsWith(base)) {
    origin = origin.slice(0, origin.indexOf(base));
  }
  const baseWithOrigin = options.withBase ? withBase(base, origin || "/") : origin;
  const resolvedUrl = withBase(path, baseWithOrigin);
  return path === "/" && !options.withBase ? withTrailingSlash(resolvedUrl) : fixSlashes(options.trailingSlash, resolvedUrl);
}
const fileExtensions = [
  // Images
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "webp",
  "svg",
  "ico",
  // Documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "md",
  "markdown",
  // Archives
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  // Audio
  "mp3",
  "wav",
  "flac",
  "ogg",
  "opus",
  "m4a",
  "aac",
  "midi",
  "mid",
  // Video
  "mp4",
  "avi",
  "mkv",
  "mov",
  "wmv",
  "flv",
  "webm",
  // Web
  "html",
  "css",
  "js",
  "json",
  "xml",
  "tsx",
  "jsx",
  "ts",
  "vue",
  "svelte",
  "xsl",
  "rss",
  "atom",
  // Programming
  "php",
  "py",
  "rb",
  "java",
  "c",
  "cpp",
  "h",
  "go",
  // Data formats
  "csv",
  "tsv",
  "sql",
  "yaml",
  "yml",
  // Fonts
  "woff",
  "woff2",
  "ttf",
  "otf",
  "eot",
  // Executables/Binaries
  "exe",
  "msi",
  "apk",
  "ipa",
  "dmg",
  "iso",
  "bin",
  // Scripts/Config
  "bat",
  "cmd",
  "sh",
  "env",
  "htaccess",
  "conf",
  "toml",
  "ini",
  // Package formats
  "deb",
  "rpm",
  "jar",
  "war",
  // E-books
  "epub",
  "mobi",
  // Common temporary/backup files
  "log",
  "tmp",
  "bak",
  "old",
  "sav"
];
function isPathFile(path) {
  const lastSegment = path.split("/").pop();
  const ext = (lastSegment || path).match(/\.[0-9a-z]+$/i)?.[0];
  return ext && fileExtensions.includes(ext.replace(".", ""));
}
function fixSlashes(trailingSlash, pathOrUrl) {
  const $url = parseURL(pathOrUrl);
  if (isPathFile($url.pathname))
    return pathOrUrl;
  const fixedPath = trailingSlash ? withTrailingSlash($url.pathname) : withoutTrailingSlash($url.pathname);
  return `${$url.protocol ? `${$url.protocol}//` : ""}${$url.host || ""}${fixedPath}${$url.search || ""}${$url.hash || ""}`;
}

function createSitePathResolver(e, options = {}) {
  const siteConfig = getSiteConfig(e);
  const nitroOrigin = getNitroOrigin(e);
  const nuxtBase = useRuntimeConfig(e).app.baseURL || "/";
  return (path) => {
    return resolveSitePath(path, {
      ...options,
      siteUrl: options.canonical !== false || false ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase
    });
  };
}

function attachUrlWarnings(sources) {
  for (const source of sources) {
    if (!source.urls?.length)
      continue;
    const warnings = [];
    for (const url of source.urls) {
      const msgs = validateSitemapUrl(url);
      if (msgs.length) {
        const loc = typeof url === "string" ? url : url.loc || "";
        for (const message of msgs)
          warnings.push({ loc, message });
      }
    }
    if (warnings.length)
      source._urlWarnings = warnings;
  }
  return sources;
}
const _tXEhkc = defineEventHandler(async (e) => {
  const _runtimeConfig = useSitemapRuntimeConfig();
  const siteConfig = getSiteConfig(e);
  const { sitemaps: _sitemaps } = _runtimeConfig;
  const runtimeConfig = { ..._runtimeConfig };
  delete runtimeConfig.sitemaps;
  const globalSources = await globalSitemapSources();
  const nitroOrigin = getNitroOrigin(e);
  const sitemaps = {};
  for (const s of Object.keys(_sitemaps)) {
    const sitemap = _sitemaps[s];
    sitemaps[s] = {
      ...sitemap,
      sources: attachUrlWarnings(await resolveSitemapSources(await childSitemapSources(sitemap), e))
    };
  }
  return {
    nitroOrigin,
    sitemaps,
    runtimeConfig,
    globalSources: attachUrlWarnings(await resolveSitemapSources(globalSources, e)),
    siteConfig: { ...siteConfig }
  };
});

const _ybNbgb = defineEventHandler(async (e) => {
  const fixPath = createSitePathResolver(e, { absolute: false, withBase: true });
  const { sitemapName: fallbackSitemapName, cacheMaxAgeSeconds, version, xslColumns, xslTips } = useSitemapRuntimeConfig();
  setHeader(e, "Content-Type", "application/xslt+xml");
  if (cacheMaxAgeSeconds)
    setHeader(e, "Cache-Control", `public, max-age=${cacheMaxAgeSeconds}, must-revalidate`);
  else
    setHeader(e, "Cache-Control", `no-cache, no-store`);
  const { name: siteName, url: siteUrl } = useSiteConfig(e);
  const referrer = getHeader(e, "Referer") || "/";
  const referrerPath = parseURL(referrer).pathname;
  const isNotIndexButHasIndex = referrerPath !== "/sitemap.xml" && referrerPath !== "/sitemap_index.xml" && referrerPath.endsWith(".xml");
  const sitemapName = parseURL(referrer).pathname.split("/").pop()?.split("-sitemap")[0] || fallbackSitemapName;
  const title = `${siteName}${sitemapName !== "sitemap.xml" ? ` - ${sitemapName === "sitemap_index.xml" ? "index" : sitemapName}` : ""}`.replace(/&/g, "&amp;");
  const isIndexPage = referrerPath === "/sitemap.xml" || referrerPath === "/sitemap_index.xml";
  const canonicalQuery = getQuery(referrer).canonical;
  const isShowingCanonical = typeof canonicalQuery !== "undefined" && canonicalQuery !== "false";
  const debugUrl = xmlEscape(withQuery("/__sitemap__/debug.json", { sitemap: sitemapName }));
  const devUrl = xmlEscape(referrerPath);
  const prodUrl = xmlEscape(withQuery(referrerPath, { canonical: "" }));
  const fetchErrors = [];
  const xslQuery = getQuery$1(e);
  if (xslQuery.error_messages) {
    const errorMessages = xslQuery.error_messages;
    const errorUrls = xslQuery.error_urls;
    if (errorMessages) {
      const messages = Array.isArray(errorMessages) ? errorMessages : [errorMessages];
      const urls = Array.isArray(errorUrls) ? errorUrls : errorUrls ? [errorUrls] : [];
      messages.forEach((msg, i) => {
        const errorParts = [xmlEscape(msg)];
        if (urls[i])
          errorParts.push(xmlEscape(urls[i]));
        fetchErrors.push(`<span class="error-item">${errorParts.join(" \u2014 ")}</span>`);
      });
    }
  }
  const hasRuntimeErrors = fetchErrors.length > 0;
  const showDevTools = xslTips !== false;
  const hints = [
    `This is an XSL sitemap (CSS for XML). Disable with <code>xsl: false</code>`,
    `View the raw XML by adding <code>?canonical</code> to the URL`,
    `Check <code>/__sitemap__/debug.json</code> for full sitemap diagnostics`
  ];
  const hint = hints[Math.floor(Math.random() * hints.length)];
  let columns = [...xslColumns];
  if (!columns.length) {
    columns = [
      { label: "URL", width: "50%" },
      { label: "Images", width: "25%", select: "count(image:image)" },
      { label: "Last Updated", width: "25%", select: "concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))" }
    ];
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          :root {
            --accent: #00dc82;
            --accent-hover: #00b86b;
            --bg: #0a0a0a;
            --bg-elevated: #141414;
            --bg-subtle: #1a1a1a;
            --border: #262626;
            --border-subtle: #1f1f1f;
            --text: #e5e5e5;
            --text-muted: #737373;
            --text-faint: #525252;
            --error: #ef4444;
            --error-bg: rgba(239,68,68,0.1);
            --warning: #f59e0b;
          }
          * { box-sizing: border-box; }
          body {
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
            font-size: 13px;
            color: var(--text);
            background: var(--bg);
            margin: 0;
            padding: 0;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          a { color: inherit; transition: color 0.15s; }
          a:hover { color: var(--accent); }

          /* Debug bar (dev only) */
          .debug-bar {
            position: fixed;
            bottom: 0.75rem;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 0 1rem;
            height: 2.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 100;
            font-size: 11px;
          }
          .debug-bar-brand {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            text-decoration: none;
          }
          .debug-bar-brand:hover { color: var(--text); }
          .debug-bar-brand svg { flex-shrink: 0; }
          .debug-bar-hint {
            color: var(--text-faint);
            margin-right: auto;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .debug-bar-hint code {
            background: var(--bg-subtle);
            padding: 0.1rem 0.3rem;
            border-radius: 3px;
            font-size: 10px;
          }
          .mode-badge {
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
          }
          .mode-dev { background: rgba(245,158,11,0.15); color: var(--warning); }
          .mode-prod { background: rgba(0,220,130,0.12); color: var(--accent); }
          .mode-toggle {
            display: inline-flex;
            border-radius: 4px;
            overflow: hidden;
            background: var(--bg-subtle);
            padding: 2px;
            gap: 1px;
          }
          .mode-toggle a {
            padding: 0.2rem 0.4rem;
            font-size: 9px;
            font-weight: 500;
            text-decoration: none;
            color: var(--text-muted);
            border-radius: 2px;
            transition: all 0.15s;
          }
          .mode-toggle a:hover { color: var(--text); }
          .mode-toggle a.active {
            background: var(--accent);
            color: #0a0a0a;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            text-decoration: none;
            font-size: 10px;
            font-weight: 500;
            transition: all 0.15s;
          }
          .btn-primary {
            background: var(--accent);
            color: #0a0a0a;
          }
          .btn-primary:hover { background: var(--accent-hover); color: #0a0a0a; }
          .btn svg { width: 12px; height: 12px; }

          /* Error banner */
          .error-banner {
            background: var(--error-bg);
            border-bottom: 1px solid rgba(239,68,68,0.2);
            padding: 0.75rem 1.5rem;
            color: #fca5a5;
            font-size: 12px;
          }
          .error-banner strong { color: var(--error); }
          .error-item { display: block; margin-top: 0.375rem; color: #fca5a5; }
          .error-debug-link {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.625rem;
            padding: 0.25rem 0.5rem;
            background: var(--error);
            color: #fff;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            text-decoration: none;
            transition: background 0.15s;
          }
          .error-debug-link:hover { background: #dc2626; color: #fff; }

          /* Main content */
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1.5rem;
          }
          .header {
            margin-bottom: 1.25rem;
          }
          .header h1 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0 0 0.25rem 0;
            color: var(--text);
          }
          .header-meta {
            color: var(--text-muted);
            font-size: 12px;
          }
          .header-meta a {
            color: var(--text-muted);
            text-decoration: underline;
            text-decoration-color: var(--border);
            text-underline-offset: 2px;
          }
          .header-meta a:hover { color: var(--accent); text-decoration-color: var(--accent); }

          /* Table */
          .table-wrap {
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
            background: var(--bg-elevated);
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            text-align: left;
            padding: 0.625rem 1rem;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            background: var(--bg-subtle);
            border-bottom: 1px solid var(--border);
          }
          td {
            padding: 0.5rem 1rem;
            border-bottom: 1px solid var(--border-subtle);
            font-size: 12px;
            color: var(--text);
          }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: rgba(255,255,255,0.02); }
          td a {
            text-decoration: none;
            word-break: break-all;
            color: var(--text);
          }
          td a:hover { color: var(--accent); }
          .inline-warning {
            font-size: 11px;
            color: var(--warning);
            margin-top: 0.25rem;
            line-height: 1.4;
          }
          .inline-warning::before {
            content: "\u26A0 ";
          }
          .count {
            display: inline-block;
            min-width: 1.25rem;
            padding: 0.125rem 0.375rem;
            background: var(--bg-subtle);
            border-radius: 4px;
            text-align: center;
            font-size: 11px;
            color: var(--text-muted);
            font-variant-numeric: tabular-nums;
          }
          .count:empty::before { content: "0"; }

          /* Light mode */
          @media (prefers-color-scheme: light) {
            :root {
              --accent: #00a963;
              --accent-hover: #008f54;
              --bg: #ffffff;
              --bg-elevated: #f5f5f5;
              --bg-subtle: #ebebeb;
              --border: #d4d4d4;
              --border-subtle: #e5e5e5;
              --text: #171717;
              --text-muted: #525252;
              --text-faint: #737373;
              --error: #dc2626;
              --error-bg: rgba(220,38,38,0.08);
              --warning: #b45309;
            }
            tr:hover td { background: rgba(0,0,0,0.02); }
            .btn-primary { color: #fff; }
            .btn-primary:hover { color: #fff; }
            .mode-toggle a.active { color: #fff; }
            .error-banner { color: #991b1b; }
            .error-item { color: #b91c1c; }
            .error-debug-link { color: #fff; }
            .error-debug-link:hover { color: #fff; }
          }

          .debug-bar-version {
            color: var(--text-faint);
            font-size: 10px;
          }

          /* Responsive */
          @media (max-width: 640px) {
            .debug-bar { padding: 0 0.75rem; gap: 0.5rem; width: 95%; }
            .debug-bar-brand span { display: none; }
            .debug-bar-hint { display: none; }
            .debug-bar-version { display: none; }
            .mode-badge { display: none; }
            .container { padding: 1rem; }
            th, td { padding: 0.5rem 0.75rem; }
          }
          ${showDevTools ? "body { padding-bottom: 3.5rem; }" : ""}
        </style>
      </head>
      <body>
        ${hasRuntimeErrors ? `<div class="error-banner">
            <strong>Sitemap Generation Errors</strong>
            ${fetchErrors.join("")}
            <a href="${debugUrl}" target="_blank" class="error-debug-link">View Debug Info \u2192</a>
          </div>` : ""}
        <div class="container">
          <div class="header">
            <h1>${xmlEscape(title)}</h1>
            <div class="header-meta">
              ${isNotIndexButHasIndex ? `Part of <a href="${xmlEscape(fixPath("/sitemap_index.xml"))}">${xmlEscape(fixPath("/sitemap_index.xml"))}</a> \xB7 ` : ""}
              <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
                <xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> sitemaps
              </xsl:if>
              <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs
              </xsl:if>
            </div>
          </div>
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style="width:70%">Sitemap</th>
                    <th style="width:30%">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                    <xsl:variable name="sitemapURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <tr>
                      <td>
                        <a href="{$sitemapURL}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                      </td>
                      <td>
                        <xsl:value-of
                          select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)),concat(' ', substring(sitemap:lastmod,20,6)))"/>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </xsl:if>
          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &lt; 1">
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    ${columns.map((c) => `<th style="width:${c.width}">${c.label}</th>`).join("\n")}
                  </tr>
                </thead>
                <tbody>
                  <xsl:for-each select="sitemap:urlset/sitemap:url">
                    <tr>
                      <td>
                        <xsl:variable name="itemURL">
                          <xsl:value-of select="sitemap:loc"/>
                        </xsl:variable>
                        <a href="{$itemURL}">
                          <xsl:value-of select="sitemap:loc"/>
                        </a>
                        ${showDevTools ? `<xsl:for-each select="comment()[starts-with(normalize-space(.), 'WARN:')]">
                          <div class="inline-warning">
                            <xsl:value-of select="substring-after(normalize-space(.), 'WARN:')"/>
                          </div>
                        </xsl:for-each>` : ""}
                      </td>
                      ${columns.filter((c) => c.label !== "URL").map((c) => `<td><span class="count"><xsl:value-of select="${c.select}"/></span></td>`).join("\n")}
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>
          </xsl:if>
        </div>
        ${showDevTools ? `<div class="debug-bar">
            <a href="${xmlEscape(fixPath("/sitemap_index.xml"))}" class="debug-bar-brand">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 32 32"><path fill="#00dc82" d="M4 26h4v4H4zm10 0h4v4h-4zm10 0h4v4h-4zm1-10h-8v-2h-2v2H7a2 2 0 0 0-2 2v6h2v-6h8v6h2v-6h8v6h2v-6a2 2 0 0 0-2-2zM9 2v10h14V2zm2 2h2v6h-2zm10 6h-6V4h6z"/></svg>
              <span>Sitemap Debug Bar</span>
            </a>
            <span class="debug-bar-version">v${version} \xB7 ${xmlEscape(siteUrl)}</span>
            <span class="debug-bar-hint">Hint: ${hint}</span>
            ${isIndexPage ? `<span class="mode-badge ${isShowingCanonical ? "mode-prod" : "mode-dev"}">${isShowingCanonical ? "Prod" : "Dev"}</span>
              <div class="mode-toggle">
                <a href="${isShowingCanonical ? devUrl : "#"}" class="${!isShowingCanonical ? "active" : ""}">Dev</a>
                <a href="${!isShowingCanonical ? prodUrl : "#"}" class="${isShowingCanonical ? "active" : ""}">Prod</a>
              </div>` : ""}
            <a href="${debugUrl}" target="_blank" class="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              Debug
            </a>
          </div>` : ""}
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`;
});

function withoutQuery(path) {
  return path.split("?")[0];
}
function createNitroRouteRuleMatcher() {
  const { nitro, app } = useRuntimeConfig();
  const _routeRulesMatcher = toRouteMatcher(
    createRouter({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {}).map(([path, rules]) => [path === "/" ? path : withoutTrailingSlash(path), rules])
      )
    })
  );
  return (pathOrUrl) => {
    const path = pathOrUrl[0] === "/" ? pathOrUrl : parseURL(pathOrUrl, app.baseURL).pathname;
    const pathWithoutQuery = withoutQuery(path);
    return defu$1({}, ..._routeRulesMatcher.matchAll(
      // radix3 does not support trailing slashes
      withoutBase(pathWithoutQuery === "/" ? pathWithoutQuery : withoutTrailingSlash(pathWithoutQuery), app.baseURL)
    ).reverse());
  };
}

function sortInPlace(urls) {
  urls.sort((a, b) => {
    const aLoc = typeof a === "string" ? a : a.loc;
    const bLoc = typeof b === "string" ? b : b.loc;
    const aSegments = aLoc.split("/").length;
    const bSegments = bLoc.split("/").length;
    if (aSegments !== bSegments) {
      return aSegments - bSegments;
    }
    return aLoc.localeCompare(bLoc, void 0, { numeric: true });
  });
  return urls;
}

function parseChunkInfo(sitemapName, sitemaps, defaultChunkSize) {
  defaultChunkSize = defaultChunkSize || 1e3;
  if (typeof sitemaps.chunks !== "undefined" && !Number.isNaN(Number(sitemapName))) {
    return {
      isChunked: true,
      baseSitemapName: "sitemap",
      chunkIndex: Number(sitemapName),
      chunkSize: defaultChunkSize
    };
  }
  if (sitemapName.includes("-")) {
    const parts = sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const baseSitemapName = parts.join("-");
      const baseSitemap = sitemaps[baseSitemapName];
      if (baseSitemap && (baseSitemap.chunks || baseSitemap._isChunking)) {
        const chunkSize = typeof baseSitemap.chunks === "number" ? baseSitemap.chunks : baseSitemap.chunkSize || defaultChunkSize;
        return {
          isChunked: true,
          baseSitemapName,
          chunkIndex: Number(lastPart),
          chunkSize
        };
      }
    }
  }
  return {
    isChunked: false,
    baseSitemapName: sitemapName,
    chunkIndex: void 0,
    chunkSize: defaultChunkSize
  };
}
function getSitemapConfig(sitemapName, sitemaps, defaultChunkSize = 1e3) {
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, defaultChunkSize);
  if (chunkInfo.isChunked) {
    if (chunkInfo.baseSitemapName === "sitemap" && typeof sitemaps.chunks !== "undefined") {
      return {
        ...sitemaps.chunks,
        sitemapName,
        _isChunking: true,
        _chunkSize: chunkInfo.chunkSize
      };
    }
    const baseSitemap = sitemaps[chunkInfo.baseSitemapName];
    if (baseSitemap) {
      return {
        ...baseSitemap,
        sitemapName,
        // Use the full name with chunk index
        _isChunking: true,
        _chunkSize: chunkInfo.chunkSize
      };
    }
  }
  return sitemaps[sitemapName];
}
function sliceUrlsForChunk(urls, sitemapName, sitemaps, defaultChunkSize = 1e3) {
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, defaultChunkSize);
  if (chunkInfo.isChunked && chunkInfo.chunkIndex !== void 0) {
    const startIndex = chunkInfo.chunkIndex * chunkInfo.chunkSize;
    const endIndex = (chunkInfo.chunkIndex + 1) * chunkInfo.chunkSize;
    return urls.slice(startIndex, endIndex);
  }
  return urls;
}

function escapeValueForXml(value) {
  if (value === true || value === false)
    return value ? "yes" : "no";
  return xmlEscape(String(value));
}
const yesNo = (v) => v === "yes" || v === true ? "yes" : "no";
const URLSET_OPENING_TAG = '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
function buildUrlXml(url, NL, I1, I2, I3, I4) {
  let xml = `${I1}<url>${NL}`;
  if (url.loc) xml += `${I2}<loc>${xmlEscape(url.loc)}</loc>${NL}`;
  if (url.lastmod) xml += `${I2}<lastmod>${url.lastmod}</lastmod>${NL}`;
  if (url.changefreq) xml += `${I2}<changefreq>${url.changefreq}</changefreq>${NL}`;
  if (url.priority !== void 0) {
    const p = typeof url.priority === "number" ? url.priority : Number.parseFloat(url.priority);
    xml += `${I2}<priority>${p.toFixed(1)}</priority>${NL}`;
  }
  if (url.alternatives) {
    for (const alt of url.alternatives) {
      let attrs = "";
      for (const [k, v] of Object.entries(alt)) attrs += ` ${k}="${xmlEscape(String(v))}"`;
      xml += `${I2}<xhtml:link rel="alternate"${attrs} />${NL}`;
    }
  }
  if (url.images) {
    for (const img of url.images) {
      xml += `${I2}<image:image>${NL}${I3}<image:loc>${xmlEscape(img.loc)}</image:loc>${NL}`;
      if (img.title) xml += `${I3}<image:title>${xmlEscape(img.title)}</image:title>${NL}`;
      if (img.caption) xml += `${I3}<image:caption>${xmlEscape(img.caption)}</image:caption>${NL}`;
      if (img.geo_location) xml += `${I3}<image:geo_location>${xmlEscape(img.geo_location)}</image:geo_location>${NL}`;
      if (img.license) xml += `${I3}<image:license>${xmlEscape(img.license)}</image:license>${NL}`;
      xml += `${I2}</image:image>${NL}`;
    }
  }
  if (url.videos) {
    for (const video of url.videos) {
      xml += `${I2}<video:video>${NL}${I3}<video:title>${xmlEscape(video.title)}</video:title>${NL}`;
      if (video.thumbnail_loc) xml += `${I3}<video:thumbnail_loc>${xmlEscape(video.thumbnail_loc)}</video:thumbnail_loc>${NL}`;
      xml += `${I3}<video:description>${xmlEscape(video.description)}</video:description>${NL}`;
      if (video.content_loc) xml += `${I3}<video:content_loc>${xmlEscape(video.content_loc)}</video:content_loc>${NL}`;
      if (video.player_loc) xml += `${I3}<video:player_loc>${xmlEscape(video.player_loc)}</video:player_loc>${NL}`;
      if (video.duration !== void 0) xml += `${I3}<video:duration>${video.duration}</video:duration>${NL}`;
      if (video.expiration_date) xml += `${I3}<video:expiration_date>${video.expiration_date}</video:expiration_date>${NL}`;
      if (video.rating !== void 0) xml += `${I3}<video:rating>${video.rating}</video:rating>${NL}`;
      if (video.view_count !== void 0) xml += `${I3}<video:view_count>${video.view_count}</video:view_count>${NL}`;
      if (video.publication_date) xml += `${I3}<video:publication_date>${video.publication_date}</video:publication_date>${NL}`;
      if (video.family_friendly !== void 0) xml += `${I3}<video:family_friendly>${yesNo(video.family_friendly)}</video:family_friendly>${NL}`;
      if (video.restriction) xml += `${I3}<video:restriction relationship="${video.restriction.relationship || "allow"}">${xmlEscape(video.restriction.restriction)}</video:restriction>${NL}`;
      if (video.platform) xml += `${I3}<video:platform relationship="${video.platform.relationship || "allow"}">${xmlEscape(video.platform.platform)}</video:platform>${NL}`;
      if (video.requires_subscription !== void 0) xml += `${I3}<video:requires_subscription>${yesNo(video.requires_subscription)}</video:requires_subscription>${NL}`;
      if (video.price) {
        for (const price of video.price) {
          const c = price.currency ? ` currency="${price.currency}"` : "";
          const t = price.type ? ` type="${price.type}"` : "";
          xml += `${I3}<video:price${c}${t}>${xmlEscape(String(price.price ?? ""))}</video:price>${NL}`;
        }
      }
      if (video.uploader) {
        const info = video.uploader.info ? ` info="${xmlEscape(video.uploader.info)}"` : "";
        xml += `${I3}<video:uploader${info}>${xmlEscape(video.uploader.uploader)}</video:uploader>${NL}`;
      }
      if (video.live !== void 0) xml += `${I3}<video:live>${yesNo(video.live)}</video:live>${NL}`;
      if (video.tag) {
        const tags = Array.isArray(video.tag) ? video.tag : [video.tag];
        for (const t of tags) xml += `${I3}<video:tag>${xmlEscape(t)}</video:tag>${NL}`;
      }
      if (video.category) xml += `${I3}<video:category>${xmlEscape(video.category)}</video:category>${NL}`;
      if (video.gallery_loc) xml += `${I3}<video:gallery_loc>${xmlEscape(video.gallery_loc)}</video:gallery_loc>${NL}`;
      xml += `${I2}</video:video>${NL}`;
    }
  }
  if (url.news) {
    xml += `${I2}<news:news>${NL}${I3}<news:publication>${NL}`;
    xml += `${I4}<news:name>${xmlEscape(url.news.publication.name)}</news:name>${NL}`;
    xml += `${I4}<news:language>${xmlEscape(url.news.publication.language)}</news:language>${NL}`;
    xml += `${I3}</news:publication>${NL}`;
    if (url.news.title) xml += `${I3}<news:title>${xmlEscape(url.news.title)}</news:title>${NL}`;
    if (url.news.publication_date) xml += `${I3}<news:publication_date>${url.news.publication_date}</news:publication_date>${NL}`;
    xml += `${I2}</news:news>${NL}`;
  }
  if (url._warnings?.length) {
    for (const w of url._warnings)
      xml += `${I2}<!-- WARN: ${w} -->${NL}`;
  }
  xml += `${I1}</url>`;
  return xml;
}
function urlsToXml(urls, resolvers, { version, xsl, credits, minify }, errorInfo) {
  let xslHref = xsl ? resolvers.relativeBaseUrlResolver(xsl) : false;
  if (xslHref && errorInfo?.messages.length) {
    xslHref = withQuery(xslHref, {
      errors: "true",
      error_messages: errorInfo.messages,
      error_urls: errorInfo.urls
    });
  }
  const NL = minify ? "" : "\n";
  const I1 = minify ? "" : "    ";
  const I2 = minify ? "" : "        ";
  const I3 = minify ? "" : "            ";
  const I4 = minify ? "" : "                ";
  let xml = xslHref ? `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="${escapeValueForXml(xslHref)}"?>${NL}` : `<?xml version="1.0" encoding="UTF-8"?>${NL}`;
  xml += URLSET_OPENING_TAG + NL;
  for (const url of urls) {
    xml += buildUrlXml(url, NL, I1, I2, I3, I4) + NL;
  }
  xml += "</urlset>";
  if (credits) {
    xml += `${NL}<!-- XML Sitemap generated by @nuxtjs/sitemap v${version} at ${(/* @__PURE__ */ new Date()).toISOString()} -->`;
  }
  return xml;
}

function resolveSitemapEntries(sitemap, urls, runtimeConfig, resolvers) {
  const {
    autoI18n,
    isI18nMapped
  } = runtimeConfig;
  const filterPath = createPathFilter({
    include: sitemap.include,
    exclude: sitemap.exclude
  });
  const _urls = urls.map((_e) => {
    const e = preNormalizeEntry(_e, resolvers);
    if (!e.loc || !filterPath(e.loc))
      return false;
    return e;
  }).filter(Boolean);
  let validI18nUrlsForTransform = [];
  const withoutPrefixPaths = {};
  if (autoI18n && autoI18n.strategy !== "no_prefix") {
    const localeCodes = autoI18n.locales.map((l) => l.code);
    const localeByCode = new Map(autoI18n.locales.map((l) => [l.code, l]));
    const isPrefixStrategy = autoI18n.strategy === "prefix";
    const isPrefixExceptOrAndDefault = autoI18n.strategy === "prefix_and_default" || autoI18n.strategy === "prefix_except_default";
    const xDefaultAndLocales = [{ code: "x-default", _hreflang: "x-default" }, ...autoI18n.locales];
    const defaultLocale = autoI18n.defaultLocale;
    const hasPages = !!autoI18n.pages;
    const hasDifferentDomains = !!autoI18n.differentDomains;
    validI18nUrlsForTransform = _urls.map((_e, i) => {
      if (_e._abs)
        return false;
      const split = splitForLocales(_e._relativeLoc, localeCodes);
      let localeCode = split[0];
      const pathWithoutPrefix = split[1];
      if (!localeCode)
        localeCode = defaultLocale;
      const e = _e;
      e._pathWithoutPrefix = pathWithoutPrefix;
      const locale = localeByCode.get(localeCode);
      if (!locale)
        return false;
      e._locale = locale;
      e._index = i;
      e._key = `${e._sitemap || ""}${e._path?.pathname || "/"}${e._path?.search || ""}`;
      withoutPrefixPaths[pathWithoutPrefix] = withoutPrefixPaths[pathWithoutPrefix] || [];
      if (!withoutPrefixPaths[pathWithoutPrefix].some((e2) => e2._locale.code === locale.code))
        withoutPrefixPaths[pathWithoutPrefix].push(e);
      return e;
    }).filter(Boolean);
    for (const e of validI18nUrlsForTransform) {
      if (!e._i18nTransform && !e.alternatives?.length) {
        const alternatives = (withoutPrefixPaths[e._pathWithoutPrefix] || []).map((u) => {
          const entries = [];
          if (u._locale.code === defaultLocale) {
            entries.push({
              href: u.loc,
              hreflang: "x-default"
            });
          }
          entries.push({
            href: u.loc,
            hreflang: u._locale._hreflang || defaultLocale
          });
          return entries;
        }).flat().filter(Boolean);
        if (alternatives.length)
          e.alternatives = alternatives;
      } else if (e._i18nTransform) {
        delete e._i18nTransform;
        if (hasDifferentDomains) {
          const defLocale = localeByCode.get(defaultLocale);
          e.alternatives = [
            {
              ...defLocale,
              code: "x-default"
            },
            ...autoI18n.locales.filter((l) => !!l.domain)
          ].map((locale) => {
            return {
              hreflang: locale._hreflang,
              href: joinURL(withHttps(locale.domain), e._pathWithoutPrefix)
            };
          });
        } else {
          const pageMatch = hasPages ? findPageMapping(e._pathWithoutPrefix, autoI18n.pages) : null;
          const pathSearch = e._path?.search || "";
          const pathWithoutPrefix = e._pathWithoutPrefix;
          for (const l of autoI18n.locales) {
            let loc = pathWithoutPrefix;
            if (pageMatch && pageMatch.mappings[l.code] !== void 0) {
              const customPath = pageMatch.mappings[l.code];
              if (customPath === false)
                continue;
              if (typeof customPath === "string") {
                loc = customPath[0] === "/" ? customPath : `/${customPath}`;
                loc = applyDynamicParams(loc, pageMatch.paramSegments);
                if (isPrefixStrategy || isPrefixExceptOrAndDefault && l.code !== defaultLocale)
                  loc = joinURL(`/${l.code}`, loc);
              }
            } else if (!hasDifferentDomains && !(isPrefixExceptOrAndDefault && l.code === defaultLocale)) {
              loc = joinURL(`/${l.code}`, pathWithoutPrefix);
            }
            const _sitemap = isI18nMapped ? l._sitemap : void 0;
            const alternatives = [];
            for (const locale of xDefaultAndLocales) {
              const code = locale.code === "x-default" ? defaultLocale : locale.code;
              const isDefault = locale.code === "x-default" || locale.code === defaultLocale;
              let href = pathWithoutPrefix;
              if (pageMatch && pageMatch.mappings[code] !== void 0) {
                const customPath = pageMatch.mappings[code];
                if (customPath === false)
                  continue;
                if (typeof customPath === "string") {
                  href = customPath[0] === "/" ? customPath : `/${customPath}`;
                  href = applyDynamicParams(href, pageMatch.paramSegments);
                  if (isPrefixStrategy || isPrefixExceptOrAndDefault && !isDefault)
                    href = joinURL("/", code, href);
                }
              } else if (isPrefixStrategy) {
                href = joinURL("/", code, pathWithoutPrefix);
              } else if (isPrefixExceptOrAndDefault && !isDefault) {
                href = joinURL("/", code, pathWithoutPrefix);
              }
              if (!filterPath(href))
                continue;
              alternatives.push({
                hreflang: locale._hreflang,
                href
              });
            }
            const { _index: _, ...rest } = e;
            const newEntry = preNormalizeEntry({
              _sitemap,
              ...rest,
              _key: `${_sitemap || ""}${loc || "/"}${pathSearch}`,
              _locale: l,
              loc,
              alternatives
            }, resolvers);
            if (e._locale.code === newEntry._locale.code) {
              _urls[e._index] = newEntry;
              e._index = void 0;
            } else {
              _urls.push(newEntry);
            }
          }
        }
      }
      if (isI18nMapped) {
        e._sitemap = e._sitemap || e._locale._sitemap;
        e._key = `${e._sitemap || ""}${e.loc || "/"}${e._path?.search || ""}`;
      }
      if (e._index)
        _urls[e._index] = e;
    }
  }
  return _urls;
}
async function buildSitemapUrls(sitemap, resolvers, runtimeConfig, nitro) {
  const {
    sitemaps,
    // enhancing
    autoI18n,
    isI18nMapped,
    isMultiSitemap,
    // sorting
    sortEntries,
    // chunking
    defaultSitemapsChunkSize
  } = runtimeConfig;
  const chunkSize = defaultSitemapsChunkSize || void 0;
  const chunkInfo = parseChunkInfo(sitemap.sitemapName, sitemaps, chunkSize);
  function maybeSort(urls2) {
    return sortEntries ? sortInPlace(urls2) : urls2;
  }
  function maybeSlice(urls2) {
    return sliceUrlsForChunk(urls2, sitemap.sitemapName, sitemaps, chunkSize);
  }
  if (autoI18n?.differentDomains) {
    const domain = autoI18n.locales.find((e) => e.language === sitemap.sitemapName || e.code === sitemap.sitemapName)?.domain;
    if (domain) {
      const _tester = resolvers.canonicalUrlResolver;
      resolvers.canonicalUrlResolver = (path) => resolveSitePath(path, {
        absolute: true,
        withBase: false,
        siteUrl: withHttps(domain),
        trailingSlash: _tester("/test/").endsWith("/"),
        base: "/"
      });
    }
  }
  let effectiveSitemap = sitemap;
  const baseSitemapName = chunkInfo.baseSitemapName;
  if (chunkInfo.isChunked && baseSitemapName !== sitemap.sitemapName && sitemaps[baseSitemapName]) {
    effectiveSitemap = sitemaps[baseSitemapName];
  }
  let sourcesInput = effectiveSitemap.includeAppSources ? [...await globalSitemapSources(), ...await childSitemapSources(effectiveSitemap)] : await childSitemapSources(effectiveSitemap);
  if (nitro && resolvers.event) {
    const ctx = {
      event: resolvers.event,
      sitemapName: baseSitemapName,
      sources: sourcesInput
    };
    await nitro.hooks.callHook("sitemap:sources", ctx);
    sourcesInput = ctx.sources;
  }
  const sources = await resolveSitemapSources(sourcesInput, resolvers.event);
  const failedSources = sources.filter((source) => source.error && source._isFailure).map((source) => ({
    url: typeof source.fetch === "string" ? source.fetch : source.fetch?.[0] || "unknown",
    error: source.error || "Unknown error"
  }));
  const resolvedCtx = {
    urls: sources.flatMap((s) => s.urls),
    sitemapName: sitemap.sitemapName,
    event: resolvers.event
  };
  await nitro?.hooks.callHook("sitemap:input", resolvedCtx);
  const enhancedUrls = resolveSitemapEntries(sitemap, resolvedCtx.urls, { autoI18n, isI18nMapped }, resolvers);
  if (isMultiSitemap) {
    const sitemapNames = Object.keys(sitemaps).filter((k) => k !== "index");
    const warnedSitemaps = nitro?._sitemapWarnedSitemaps || /* @__PURE__ */ new Set();
    for (const e of enhancedUrls) {
      if (typeof e._sitemap === "string" && !sitemapNames.includes(e._sitemap)) {
        if (!warnedSitemaps.has(e._sitemap)) {
          warnedSitemaps.add(e._sitemap);
          logger.error(`Sitemap \`${e._sitemap}\` not found in sitemap config. Available sitemaps: ${sitemapNames.join(", ")}. Entry \`${e.loc}\` will be omitted.`);
        }
      }
    }
    if (nitro) {
      nitro._sitemapWarnedSitemaps = warnedSitemaps;
    }
  }
  const filteredUrls = enhancedUrls.filter((e) => {
    if (e._sitemap === false)
      return false;
    if (isMultiSitemap && e._sitemap && sitemap.sitemapName) {
      if (sitemap._isChunking)
        return sitemap.sitemapName.startsWith(e._sitemap + "-");
      return e._sitemap === sitemap.sitemapName;
    }
    return true;
  });
  const sortedUrls = maybeSort(filteredUrls);
  const urls = maybeSlice(sortedUrls);
  return { urls, failedSources };
}

function useNitroUrlResolvers(e) {
  const canonicalQuery = getQuery$1(e).canonical;
  const isShowingCanonical = typeof canonicalQuery !== "undefined" && canonicalQuery !== "false";
  const siteConfig = getSiteConfig(e);
  return {
    event: e,
    fixSlashes: (path) => fixSlashes(siteConfig.trailingSlash, path),
    // we need these as they depend on the nitro event
    canonicalUrlResolver: createSitePathResolver(e, {
      canonical: isShowingCanonical || false,
      absolute: true,
      withBase: true
    }),
    relativeBaseUrlResolver: createSitePathResolver(e, { absolute: false, withBase: true })
  };
}
async function buildSitemapXml(event, definition, resolvers, runtimeConfig) {
  const { sitemapName } = definition;
  const nitro = useNitroApp();
  const { urls: sitemapUrls, failedSources } = await buildSitemapUrls(definition, resolvers, runtimeConfig, nitro);
  const routeRuleMatcher = createNitroRouteRuleMatcher();
  const { autoI18n } = runtimeConfig;
  let validCount = 0;
  for (let i = 0; i < sitemapUrls.length; i++) {
    const u = sitemapUrls[i];
    const path = u._path?.pathname || u.loc;
    let routeRules = routeRuleMatcher(path);
    if (autoI18n?.locales && autoI18n?.strategy !== "no_prefix") {
      const match = splitForLocales(path, autoI18n.locales.map((l) => l.code));
      const pathWithoutPrefix = match[1];
      if (pathWithoutPrefix && pathWithoutPrefix !== path)
        routeRules = defu$1(routeRules, routeRuleMatcher(pathWithoutPrefix));
    }
    if (routeRules.sitemap === false)
      continue;
    if (typeof routeRules.robots !== "undefined" && !routeRules.robots)
      continue;
    const hasRobotsDisabled = Object.entries(routeRules.headers || {}).some(([name, value]) => name.toLowerCase() === "x-robots-tag" && value.toLowerCase().includes("noindex"));
    if (routeRules.redirect || hasRobotsDisabled)
      continue;
    sitemapUrls[validCount++] = routeRules.sitemap ? defu$1(u, routeRules.sitemap) : u;
  }
  sitemapUrls.length = validCount;
  if (validCount === 0 && sitemapUrls.length > 0) {
    logger.warn(`Sitemap had ${sitemapUrls.length} that were all filtered out. This may be due to a robots rules blocking these URLs from indexing. Check your /** route rules or robots.txt configuration.`);
  }
  const locSize = sitemapUrls.length;
  const resolvedCtx = {
    urls: sitemapUrls,
    sitemapName,
    event
  };
  await nitro.hooks.callHook("sitemap:resolved", resolvedCtx);
  if (resolvedCtx.urls.length !== locSize) {
    resolvedCtx.urls = resolvedCtx.urls.map((e) => preNormalizeEntry(e, resolvers));
  }
  const maybeSort = (urls2) => runtimeConfig.sortEntries ? sortInPlace(urls2) : urls2;
  const defaults = definition.defaults || {};
  const normalizedPreDedupe = resolvedCtx.urls.map((e) => normaliseEntry(e, defaults, resolvers));
  const urls = maybeSort(mergeOnKey(normalizedPreDedupe, "_key").map((e) => normaliseEntry(e, defaults, resolvers)));
  if (definition._isChunking && definition.sitemapName.includes("-")) {
    const parts = definition.sitemapName.split("-");
    const lastPart = parts.pop();
    if (!Number.isNaN(Number(lastPart))) {
      const chunkIndex = Number(lastPart);
      const baseSitemapName = parts.join("-");
      if (urls.length === 0 && chunkIndex > 0) {
        throw createError({
          statusCode: 404,
          message: `Sitemap chunk ${chunkIndex} for "${baseSitemapName}" does not exist.`
        });
      }
    }
  }
  const errorInfo = failedSources.length > 0 ? {
    messages: failedSources.map((f) => f.error),
    urls: failedSources.map((f) => f.url)
  } : void 0;
  const sitemap = urlsToXml(urls, resolvers, runtimeConfig, errorInfo);
  const ctx = { sitemap, sitemapName, event };
  await nitro.hooks.callHook("sitemap:output", ctx);
  return ctx.sitemap;
}
defineCachedFunction(
  buildSitemapXml,
  {
    name: "sitemap:xml",
    group: "sitemap",
    maxAge: 60 * 10,
    // Default 10 minutes
    base: "sitemap",
    // Use the sitemap storage
    getKey: (event, definition) => {
      const host = getHeader(event, "host") || getHeader(event, "x-forwarded-host") || "";
      const proto = getHeader(event, "x-forwarded-proto") || "https";
      const sitemapName = definition.sitemapName || "default";
      return `${sitemapName}-${proto}-${host}`;
    },
    swr: true
    // Enable stale-while-revalidate
  }
);
async function createSitemap(event, definition, runtimeConfig) {
  const resolvers = useNitroUrlResolvers(event);
  const xml = await buildSitemapXml(event, definition, resolvers, runtimeConfig);
  setHeader(event, "Content-Type", "text/xml; charset=UTF-8");
  if (runtimeConfig.cacheMaxAgeSeconds) {
    setHeader(event, "Cache-Control", `public, max-age=${runtimeConfig.cacheMaxAgeSeconds}, s-maxage=${runtimeConfig.cacheMaxAgeSeconds}, stale-while-revalidate=3600`);
    const now = /* @__PURE__ */ new Date();
    setHeader(event, "X-Sitemap-Generated", now.toISOString());
    setHeader(event, "X-Sitemap-Cache-Duration", `${runtimeConfig.cacheMaxAgeSeconds}s`);
    const expiryTime = new Date(now.getTime() + runtimeConfig.cacheMaxAgeSeconds * 1e3);
    setHeader(event, "X-Sitemap-Cache-Expires", expiryTime.toISOString());
    const remainingSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1e3);
    setHeader(event, "X-Sitemap-Cache-Remaining", `${remainingSeconds}s`);
  } else {
    setHeader(event, "Cache-Control", `no-cache, no-store`);
  }
  event.context._isSitemap = true;
  return xml;
}

defineCachedFunction(
  async (event, resolvers, runtimeConfig, nitro) => {
    return buildSitemapIndexInternal(resolvers, runtimeConfig, nitro);
  },
  {
    name: "sitemap:index",
    group: "sitemap",
    maxAge: 60 * 10,
    // 10 minutes default
    base: "sitemap",
    // Use the sitemap storage
    getKey: (event) => {
      const host = getHeader(event, "host") || getHeader(event, "x-forwarded-host") || "";
      const proto = getHeader(event, "x-forwarded-proto") || "https";
      return `sitemap-index-${proto}-${host}`;
    },
    swr: true
    // Enable stale-while-revalidate
  }
);
async function buildSitemapIndexInternal(resolvers, runtimeConfig, nitro) {
  const {
    sitemaps,
    // enhancing
    autoLastmod,
    // chunking
    defaultSitemapsChunkSize,
    autoI18n,
    isI18nMapped,
    sortEntries,
    sitemapsPathPrefix
  } = runtimeConfig;
  if (!sitemaps)
    throw new Error("Attempting to build a sitemap index without required `sitemaps` configuration.");
  function maybeSort(urls) {
    return sortEntries ? sortInPlace(urls) : urls;
  }
  const chunks = {};
  const allFailedSources = [];
  for (const sitemapName in sitemaps) {
    if (sitemapName === "index" || sitemapName === "chunks") continue;
    const sitemapConfig = sitemaps[sitemapName];
    if (sitemapConfig.chunks || sitemapConfig._isChunking) {
      sitemapConfig._isChunking = true;
      sitemapConfig._chunkSize = typeof sitemapConfig.chunks === "number" ? sitemapConfig.chunks : sitemapConfig.chunkSize || defaultSitemapsChunkSize || 1e3;
    } else {
      chunks[sitemapName] = chunks[sitemapName] || { urls: [] };
    }
  }
  if (typeof sitemaps.chunks !== "undefined") {
    const sitemap = sitemaps.chunks;
    let sourcesInput = await globalSitemapSources();
    if (nitro && resolvers.event) {
      const ctx = {
        event: resolvers.event,
        sitemapName: sitemap.sitemapName,
        sources: sourcesInput
      };
      await nitro.hooks.callHook("sitemap:sources", ctx);
      sourcesInput = ctx.sources;
    }
    const sources = await resolveSitemapSources(sourcesInput, resolvers.event);
    const failedSources = sources.filter((source) => source.error && source._isFailure).map((source) => ({
      url: typeof source.fetch === "string" ? source.fetch : source.fetch?.[0] || "unknown",
      error: source.error || "Unknown error"
    }));
    allFailedSources.push(...failedSources);
    const resolvedCtx = {
      urls: sources.flatMap((s) => s.urls),
      sitemapName: sitemap.sitemapName,
      event: resolvers.event
    };
    await nitro?.hooks.callHook("sitemap:input", resolvedCtx);
    const normalisedUrls = resolveSitemapEntries(sitemap, resolvedCtx.urls, { autoI18n, isI18nMapped }, resolvers);
    const enhancedUrls = normalisedUrls.map((e) => defu$1(e, sitemap.defaults));
    const sortedUrls = maybeSort(enhancedUrls);
    sortedUrls.forEach((url, i) => {
      const chunkIndex = Math.floor(i / defaultSitemapsChunkSize);
      chunks[chunkIndex] = chunks[chunkIndex] || { urls: [] };
      chunks[chunkIndex].urls.push(url);
    });
  }
  const entries = [];
  for (const name in chunks) {
    const sitemap = chunks[name];
    const entry = {
      _sitemapName: name,
      sitemap: resolvers.canonicalUrlResolver(joinURL(sitemapsPathPrefix || "", `/${name}.xml`))
    };
    let lastmod = sitemap.urls.filter((a) => !!a?.lastmod).map((a) => typeof a.lastmod === "string" ? new Date(a.lastmod) : a.lastmod).sort((a, b) => (b?.getTime() || 0) - (a?.getTime() || 0))?.[0];
    if (!lastmod && autoLastmod)
      lastmod = /* @__PURE__ */ new Date();
    if (lastmod)
      entry.lastmod = normaliseDate(lastmod);
    entries.push(entry);
  }
  for (const sitemapName in sitemaps) {
    const sitemapConfig = sitemaps[sitemapName];
    if (sitemapName !== "index" && sitemapConfig._isChunking) {
      const chunkSize = sitemapConfig._chunkSize || defaultSitemapsChunkSize || 1e3;
      let sourcesInput = sitemapConfig.includeAppSources ? [...await globalSitemapSources(), ...await childSitemapSources(sitemapConfig)] : await childSitemapSources(sitemapConfig);
      if (nitro && resolvers.event) {
        const ctx = {
          event: resolvers.event,
          sitemapName: sitemapConfig.sitemapName,
          sources: sourcesInput
        };
        await nitro.hooks.callHook("sitemap:sources", ctx);
        sourcesInput = ctx.sources;
      }
      const sources = await resolveSitemapSources(sourcesInput, resolvers.event);
      const failedSources = sources.filter((source) => source.error && source._isFailure).map((source) => ({
        url: typeof source.fetch === "string" ? source.fetch : source.fetch?.[0] || "unknown",
        error: source.error || "Unknown error"
      }));
      allFailedSources.push(...failedSources);
      const resolvedCtx = {
        urls: sources.flatMap((s) => s.urls),
        sitemapName: sitemapConfig.sitemapName,
        event: resolvers.event
      };
      await nitro?.hooks.callHook("sitemap:input", resolvedCtx);
      const normalisedUrls = resolveSitemapEntries(sitemapConfig, resolvedCtx.urls, { autoI18n, isI18nMapped }, resolvers);
      const totalUrls = normalisedUrls.length;
      const chunkCount = Math.ceil(totalUrls / chunkSize);
      sitemapConfig._chunkCount = chunkCount;
      for (let i = 0; i < chunkCount; i++) {
        const chunkName = `${sitemapName}-${i}`;
        const entry = {
          _sitemapName: chunkName,
          sitemap: resolvers.canonicalUrlResolver(joinURL(sitemapsPathPrefix || "", `/${chunkName}.xml`))
        };
        const chunkUrls = normalisedUrls.slice(i * chunkSize, (i + 1) * chunkSize);
        let lastmod = chunkUrls.filter((a) => !!a?.lastmod).map((a) => typeof a.lastmod === "string" ? new Date(a.lastmod) : a.lastmod).sort((a, b) => (b?.getTime() || 0) - (a?.getTime() || 0))?.[0];
        if (!lastmod && autoLastmod)
          lastmod = /* @__PURE__ */ new Date();
        if (lastmod)
          entry.lastmod = normaliseDate(lastmod);
        entries.push(entry);
      }
    }
  }
  if (sitemaps.index) {
    entries.push(...sitemaps.index.sitemaps.map((entry) => {
      return typeof entry === "string" ? { sitemap: entry } : entry;
    }));
  }
  return { entries, failedSources: allFailedSources };
}
function urlsToIndexXml(sitemaps, resolvers, { version, xsl, credits, minify }, errorInfo) {
  const sitemapXml = sitemaps.map((e) => [
    "    <sitemap>",
    `        <loc>${escapeValueForXml(e.sitemap)}</loc>`,
    // lastmod is optional
    e.lastmod ? `        <lastmod>${escapeValueForXml(e.lastmod)}</lastmod>` : false,
    "    </sitemap>"
  ].filter(Boolean).join("\n")).join("\n");
  const xmlParts = [
    '<?xml version="1.0" encoding="UTF-8"?>'
  ];
  if (xsl) {
    let relativeBaseUrl = resolvers.relativeBaseUrlResolver?.(xsl) ?? xsl;
    if (errorInfo && errorInfo.messages.length > 0) {
      relativeBaseUrl = withQuery(relativeBaseUrl, {
        errors: "true",
        error_messages: errorInfo.messages,
        error_urls: errorInfo.urls
      });
    }
    xmlParts.push(`<?xml-stylesheet type="text/xsl" href="${escapeValueForXml(relativeBaseUrl)}"?>`);
  }
  xmlParts.push(
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    sitemapXml,
    "</sitemapindex>"
  );
  if (credits) {
    xmlParts.push(`<!-- XML Sitemap Index generated by @nuxtjs/sitemap v${version} at ${(/* @__PURE__ */ new Date()).toISOString()} -->`);
  }
  return minify ? xmlParts.join("").replace(/(?<!<[^>]*)\s(?![^<]*>)/g, "") : xmlParts.join("\n");
}
async function buildSitemapIndex(resolvers, runtimeConfig, nitro) {
  return buildSitemapIndexInternal(resolvers, runtimeConfig, nitro);
}

async function sitemapXmlEventHandler(e) {
  const runtimeConfig = useSitemapRuntimeConfig();
  const { sitemaps } = runtimeConfig;
  if ("index" in sitemaps)
    return sendRedirect(e, withBase("/sitemap_index.xml", useRuntimeConfig().app.baseURL), 302 );
  return createSitemap(e, Object.values(sitemaps)[0], runtimeConfig);
}
async function sitemapIndexXmlEventHandler(e) {
  const runtimeConfig = useSitemapRuntimeConfig();
  const nitro = useNitroApp();
  const resolvers = useNitroUrlResolvers(e);
  const { entries: sitemaps, failedSources } = await buildSitemapIndex(resolvers, runtimeConfig, nitro);
  const indexResolvedCtx = { sitemaps, event: e };
  await nitro.hooks.callHook("sitemap:index-resolved", indexResolvedCtx);
  const errorInfo = failedSources.length > 0 ? { messages: failedSources.map((f) => f.error), urls: failedSources.map((f) => f.url) } : void 0;
  const output = urlsToIndexXml(indexResolvedCtx.sitemaps, resolvers, runtimeConfig, errorInfo);
  const ctx = { sitemap: output, sitemapName: "sitemap", event: e };
  await nitro.hooks.callHook("sitemap:output", ctx);
  setHeader(e, "Content-Type", "text/xml; charset=UTF-8");
  if (runtimeConfig.cacheMaxAgeSeconds) {
    setHeader(e, "Cache-Control", `public, max-age=${runtimeConfig.cacheMaxAgeSeconds}, s-maxage=${runtimeConfig.cacheMaxAgeSeconds}, stale-while-revalidate=3600`);
    const now = /* @__PURE__ */ new Date();
    setHeader(e, "X-Sitemap-Generated", now.toISOString());
    setHeader(e, "X-Sitemap-Cache-Duration", `${runtimeConfig.cacheMaxAgeSeconds}s`);
    const expiryTime = new Date(now.getTime() + runtimeConfig.cacheMaxAgeSeconds * 1e3);
    setHeader(e, "X-Sitemap-Cache-Expires", expiryTime.toISOString());
    const remainingSeconds = Math.floor((expiryTime.getTime() - now.getTime()) / 1e3);
    setHeader(e, "X-Sitemap-Cache-Remaining", `${remainingSeconds}s`);
  } else {
    setHeader(e, "Cache-Control", `no-cache, no-store`);
  }
  return ctx.sitemap;
}
async function sitemapChildXmlEventHandler(e) {
  if (!e.path.endsWith(".xml"))
    return;
  const runtimeConfig = useSitemapRuntimeConfig(e);
  const { sitemaps } = runtimeConfig;
  let sitemapName = getRouterParam(e, "sitemap");
  if (!sitemapName) {
    const path = e.path;
    const match = path.match(/(?:\/__sitemap__\/)?(.+)\.xml$/);
    if (match)
      sitemapName = match[1];
  }
  if (!sitemapName)
    throw createError({ statusCode: 400, message: "Invalid sitemap request" });
  sitemapName = sitemapName.replace(/\.xml$/, "");
  sitemapName = withLeadingSlash(sitemapName);
  if (sitemapName.startsWith("/__sitemap__/"))
    sitemapName = sitemapName.replace("/__sitemap__/", "/");
  if (runtimeConfig.sitemapsPathPrefix) {
    const prefix = withLeadingSlash(runtimeConfig.sitemapsPathPrefix);
    if (sitemapName.startsWith(prefix))
      sitemapName = sitemapName.replace(prefix, "/");
  }
  sitemapName = withoutLeadingSlash(withoutTrailingSlash(sitemapName));
  const chunkInfo = parseChunkInfo(sitemapName, sitemaps, runtimeConfig.defaultSitemapsChunkSize);
  const isAutoChunked = typeof sitemaps.chunks !== "undefined" && !Number.isNaN(Number(sitemapName));
  const sitemapExists = sitemapName in sitemaps || chunkInfo.baseSitemapName in sitemaps || isAutoChunked;
  if (!sitemapExists)
    throw createError({ statusCode: 404, message: `Sitemap "${sitemapName}" not found.` });
  if (chunkInfo.isChunked && chunkInfo.chunkIndex !== void 0) {
    const baseSitemap = sitemaps[chunkInfo.baseSitemapName];
    if (baseSitemap && !baseSitemap.chunks && !baseSitemap._isChunking)
      throw createError({ statusCode: 404, message: `Sitemap "${chunkInfo.baseSitemapName}" does not support chunking.` });
    if (baseSitemap?._chunkCount !== void 0 && chunkInfo.chunkIndex >= baseSitemap._chunkCount)
      throw createError({ statusCode: 404, message: `Chunk ${chunkInfo.chunkIndex} does not exist for sitemap "${chunkInfo.baseSitemapName}".` });
  }
  const sitemapConfig = getSitemapConfig(sitemapName, sitemaps, runtimeConfig.defaultSitemapsChunkSize || void 0);
  return createSitemap(e, sitemapConfig, runtimeConfig);
}

const _InRiSq = defineEventHandler(sitemapXmlEventHandler);

function defineNitroPlugin(def) {
  return def;
}

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinURL(publicBase, ...path) : publicBase;
}

const _HcJ0Ig = lazyEventHandler(() => {
  const opts = useRuntimeConfig().ipx || {};
  const fsDir = opts?.fs?.dir ? (Array.isArray(opts.fs.dir) ? opts.fs.dir : [opts.fs.dir]).map((dir) => isAbsolute(dir) ? dir : fileURLToPath(new URL(dir, globalThis._importMeta_.url))) : void 0;
  const fsStorage = opts.fs?.dir ? ipxFSStorage({ ...opts.fs, dir: fsDir }) : void 0;
  const httpStorage = opts.http?.domains ? ipxHttpStorage({ ...opts.http }) : void 0;
  if (!fsStorage && !httpStorage) {
    throw new Error("IPX storage is not configured!");
  }
  const ipxOptions = {
    ...opts,
    storage: fsStorage || httpStorage,
    httpStorage
  };
  const ipx = createIPX(ipxOptions);
  const ipxHandler = createIPXH3Handler(ipx);
  return useBase(opts.baseURL, ipxHandler);
});

const _lazy_zX_OJc = () => Promise.resolve().then(function () { return renderer$1; });
const _lazy_3E8BkU = () => Promise.resolve().then(function () { return sitemap_index_xml$1; });
const _lazy_k7o_cE = () => Promise.resolve().then(function () { return _sitemap__xml$1; });

const handlers = [
  { route: '', handler: _1VotGN, lazy: false, middleware: true, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_zX_OJc, lazy: true, middleware: false, method: undefined },
  { route: '', handler: _1Qut89, lazy: false, middleware: true, method: undefined },
  { route: '/__site-config__/debug.json', handler: _H0J8ks, lazy: false, middleware: false, method: undefined },
  { route: '/sitemap_index.xml', handler: _lazy_3E8BkU, lazy: true, middleware: false, method: undefined },
  { route: '/__sitemap__/**:sitemap', handler: _lazy_k7o_cE, lazy: true, middleware: false, method: undefined },
  { route: '/__sitemap__/debug.json', handler: _tXEhkc, lazy: false, middleware: false, method: undefined },
  { route: '/__sitemap__/**:sitemap', handler: _lazy_k7o_cE, lazy: true, middleware: true, method: undefined },
  { route: '/__sitemap__/style.xsl', handler: _ybNbgb, lazy: false, middleware: false, method: undefined },
  { route: '/sitemap.xml', handler: _InRiSq, lazy: false, middleware: false, method: undefined },
  { route: '/_ipx/**', handler: _HcJ0Ig, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_zX_OJc, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(
    nodeHandler,
    aRequest
  );
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto.webcrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const _messages = {"appName":"Nuxt","version":"","statusCode":500,"statusMessage":"Server error","description":"An error occurred in the application and the page could not be served. If you are the application owner, check your server logs for details.","stack":""};
const _render = function({ messages }) {
var __t, __p = '';
__p += '<!DOCTYPE html><html data-critters-container><head><title>' +
((__t = ( messages.statusCode )) == null ? '' : __t) +
' - ' +
((__t = ( messages.statusMessage )) == null ? '' : __t) +
' | ' +
((__t = ( messages.appName )) == null ? '' : __t) +
'</title><meta charset="utf-8"><meta content="width=device-width,initial-scale=1,minimum-scale=1" name="viewport"><style>.spotlight{background:linear-gradient(45deg, #00DC82 0%, #36E4DA 50%, #0047E1 100%);opacity:0.8;filter:blur(30vh);height:60vh;bottom:-40vh}*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}:before,:after{--un-content:""}html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}h1{font-size:inherit;font-weight:inherit}pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}h1,p,pre{margin:0}*,:before,:after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgb(0 0 0 / 0);--un-ring-shadow:0 0 rgb(0 0 0 / 0);--un-shadow-inset: ;--un-shadow:0 0 rgb(0 0 0 / 0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgb(147 197 253 / .5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.fixed{position:fixed}.left-0{left:0}.right-0{right:0}.z-10{z-index:10}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.h-auto{height:auto}.min-h-screen{min-height:100vh}.flex{display:flex}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}.overflow-y-auto{overflow-y:auto}.rounded-t-md{border-top-left-radius:.375rem;border-top-right-radius:.375rem}.bg-black\\/5{background-color:#0000000d}.bg-white{--un-bg-opacity:1;background-color:rgb(255 255 255 / var(--un-bg-opacity))}.p-8{padding:2rem}.px-10{padding-left:2.5rem;padding-right:2.5rem}.pt-14{padding-top:3.5rem}.text-6xl{font-size:3.75rem;line-height:1}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-black{--un-text-opacity:1;color:rgb(0 0 0 / var(--un-text-opacity))}.font-light{font-weight:300}.font-medium{font-weight:500}.leading-tight{line-height:1.25}.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji"}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media (prefers-color-scheme: dark){.dark\\:bg-black{--un-bg-opacity:1;background-color:rgb(0 0 0 / var(--un-bg-opacity))}.dark\\:bg-white\\/10{background-color:#ffffff1a}.dark\\:text-white{--un-text-opacity:1;color:rgb(255 255 255 / var(--un-text-opacity))}}@media (min-width: 640px){.sm\\:text-2xl{font-size:1.5rem;line-height:2rem}.sm\\:text-8xl{font-size:6rem;line-height:1}}</style><script>(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll(\'link[rel="modulepreload"]\'))i(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function s(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(e){if(e.ep)return;e.ep=!0;const r=s(e);fetch(e.href,r)}})();</script></head><body class="font-sans antialiased bg-white px-10 pt-14 dark:bg-black text-black dark:text-white min-h-screen flex flex-col"><div class="fixed left-0 right-0 spotlight"></div><h1 class="text-6xl sm:text-8xl font-medium mb-6">' +
((__t = ( messages.statusCode )) == null ? '' : __t) +
'</h1><p class="text-xl sm:text-2xl font-light mb-8 leading-tight">' +
((__t = ( messages.description )) == null ? '' : __t) +
'</p><div class="bg-white rounded-t-md bg-black/5 dark:bg-white/10 flex-1 overflow-y-auto h-auto"><pre class="text-xl font-light leading-tight z-10 p-8">' +
((__t = ( messages.stack )) == null ? '' : __t) +
'</pre></div></body></html>';
return __p
};
const _template = (messages) => _render({ messages: { ..._messages, ...messages } });
const template$1 = _template;

const errorDev = /*#__PURE__*/Object.freeze({
  __proto__: null,
  template: template$1
});

const sources$1 = [
    {
        "sourceType": "user",
        "fetch": "/api/sitemap-urls"
    },
    {
        "context": {
            "name": "nuxt:pages",
            "description": "Generated from your static page files.",
            "tips": [
                "Can be disabled with `{ excludeAppSources: ['nuxt:pages'] }`."
            ]
        },
        "urls": [
            {
                "loc": "/admin/advertising",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/advertising"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/advertising"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/advertising"
                    }
                ]
            },
            {
                "loc": "/en/admin/advertising",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/advertising"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/advertising"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/advertising"
                    }
                ]
            },
            {
                "loc": "/admin/analytics",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/analytics"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/analytics"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/analytics"
                    }
                ]
            },
            {
                "loc": "/en/admin/analytics",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/analytics"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/analytics"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/analytics"
                    }
                ]
            },
            {
                "loc": "/admin/analytics/olap",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/analytics/olap"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/analytics/olap"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/analytics/olap"
                    }
                ]
            },
            {
                "loc": "/en/admin/analytics/olap",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/analytics/olap"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/analytics/olap"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/analytics/olap"
                    }
                ]
            },
            {
                "loc": "/admin/auctions",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/auctions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/auctions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/auctions"
                    }
                ]
            },
            {
                "loc": "/en/admin/auctions",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/auctions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/auctions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/auctions"
                    }
                ]
            },
            {
                "loc": "/admin/audit-logs",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/audit-logs"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/audit-logs"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/audit-logs"
                    }
                ]
            },
            {
                "loc": "/en/admin/audit-logs",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/audit-logs"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/audit-logs"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/audit-logs"
                    }
                ]
            },
            {
                "loc": "/admin/badge-rules",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/badge-rules"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/badge-rules"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/badge-rules"
                    }
                ]
            },
            {
                "loc": "/en/admin/badge-rules",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/badge-rules"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/badge-rules"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/badge-rules"
                    }
                ]
            },
            {
                "loc": "/admin/banners",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/banners"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/banners"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/banners"
                    }
                ]
            },
            {
                "loc": "/en/admin/banners",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/banners"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/banners"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/banners"
                    }
                ]
            },
            {
                "loc": "/admin/barter-categories",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/barter-categories"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/barter-categories"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/barter-categories"
                    }
                ]
            },
            {
                "loc": "/en/admin/barter-categories",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/barter-categories"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/barter-categories"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/barter-categories"
                    }
                ]
            },
            {
                "loc": "/admin/barter",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/barter"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/barter"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/barter"
                    }
                ]
            },
            {
                "loc": "/en/admin/barter",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/barter"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/barter"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/barter"
                    }
                ]
            },
            {
                "loc": "/admin/barter/matching",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/barter/matching"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/barter/matching"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/barter/matching"
                    }
                ]
            },
            {
                "loc": "/en/admin/barter/matching",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/barter/matching"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/barter/matching"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/barter/matching"
                    }
                ]
            },
            {
                "loc": "/admin/barter/transactions",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/barter/transactions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/barter/transactions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/barter/transactions"
                    }
                ]
            },
            {
                "loc": "/en/admin/barter/transactions",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/barter/transactions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/barter/transactions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/barter/transactions"
                    }
                ]
            },
            {
                "loc": "/admin/brands",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/brands"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/brands"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/brands"
                    }
                ]
            },
            {
                "loc": "/en/admin/brands",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/brands"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/brands"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/brands"
                    }
                ]
            },
            {
                "loc": "/admin/categories",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/categories"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/categories"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/categories"
                    }
                ]
            },
            {
                "loc": "/en/admin/categories",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/categories"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/categories"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/categories"
                    }
                ]
            },
            {
                "loc": "/admin/chat-monitor",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/chat-monitor"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/chat-monitor"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/chat-monitor"
                    }
                ]
            },
            {
                "loc": "/en/admin/chat-monitor",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/chat-monitor"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/chat-monitor"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/chat-monitor"
                    }
                ]
            },
            {
                "loc": "/admin/collection-form",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/collection-form"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/collection-form"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/collection-form"
                    }
                ]
            },
            {
                "loc": "/en/admin/collection-form",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/collection-form"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/collection-form"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/collection-form"
                    }
                ]
            },
            {
                "loc": "/admin/collections",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/collections"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/collections"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/collections"
                    }
                ]
            },
            {
                "loc": "/en/admin/collections",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/collections"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/collections"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/collections"
                    }
                ]
            },
            {
                "loc": "/admin/company-approvals",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/company-approvals"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/company-approvals"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/company-approvals"
                    }
                ]
            },
            {
                "loc": "/en/admin/company-approvals",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/company-approvals"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/company-approvals"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/company-approvals"
                    }
                ]
            },
            {
                "loc": "/admin/content",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/content"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/content"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/content"
                    }
                ]
            },
            {
                "loc": "/en/admin/content",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/content"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/content"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/content"
                    }
                ]
            },
            {
                "loc": "/admin/coupons",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/coupons"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/coupons"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/coupons"
                    }
                ]
            },
            {
                "loc": "/en/admin/coupons",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/coupons"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/coupons"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/coupons"
                    }
                ]
            },
            {
                "loc": "/admin/customer-form",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/customer-form"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/customer-form"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/customer-form"
                    }
                ]
            },
            {
                "loc": "/en/admin/customer-form",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/customer-form"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/customer-form"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/customer-form"
                    }
                ]
            },
            {
                "loc": "/admin/demand-matching",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/demand-matching"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/demand-matching"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/demand-matching"
                    }
                ]
            },
            {
                "loc": "/en/admin/demand-matching",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/demand-matching"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/demand-matching"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/demand-matching"
                    }
                ]
            },
            {
                "loc": "/admin/ecosystems",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/ecosystems"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/ecosystems"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/ecosystems"
                    }
                ]
            },
            {
                "loc": "/en/admin/ecosystems",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/ecosystems"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/ecosystems"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/ecosystems"
                    }
                ]
            },
            {
                "loc": "/admin/gift-card-form",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/gift-card-form"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/gift-card-form"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/gift-card-form"
                    }
                ]
            },
            {
                "loc": "/en/admin/gift-card-form",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/gift-card-form"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/gift-card-form"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/gift-card-form"
                    }
                ]
            },
            {
                "loc": "/admin/gift-cards",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/gift-cards"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/gift-cards"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/gift-cards"
                    }
                ]
            },
            {
                "loc": "/en/admin/gift-cards",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/gift-cards"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/gift-cards"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/gift-cards"
                    }
                ]
            },
            {
                "loc": "/admin/group-buy",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/group-buy"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/group-buy"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/group-buy"
                    }
                ]
            },
            {
                "loc": "/en/admin/group-buy",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/group-buy"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/group-buy"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/group-buy"
                    }
                ]
            },
            {
                "loc": "/admin/help",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/help"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/help"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/help"
                    }
                ]
            },
            {
                "loc": "/en/admin/help",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/help"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/help"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/help"
                    }
                ]
            },
            {
                "loc": "/admin",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin"
                    }
                ]
            },
            {
                "loc": "/en/admin",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin"
                    }
                ]
            },
            {
                "loc": "/admin/inventory",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/inventory"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/inventory"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/inventory"
                    }
                ]
            },
            {
                "loc": "/en/admin/inventory",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/inventory"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/inventory"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/inventory"
                    }
                ]
            },
            {
                "loc": "/admin/ledger-dashboard",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/ledger-dashboard"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/ledger-dashboard"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/ledger-dashboard"
                    }
                ]
            },
            {
                "loc": "/en/admin/ledger-dashboard",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/ledger-dashboard"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/ledger-dashboard"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/ledger-dashboard"
                    }
                ]
            },
            {
                "loc": "/admin/lotteries",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/lotteries"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/lotteries"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/lotteries"
                    }
                ]
            },
            {
                "loc": "/en/admin/lotteries",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/lotteries"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/lotteries"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/lotteries"
                    }
                ]
            },
            {
                "loc": "/admin/loyalty",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/loyalty"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/loyalty"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/loyalty"
                    }
                ]
            },
            {
                "loc": "/en/admin/loyalty",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/loyalty"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/loyalty"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/loyalty"
                    }
                ]
            },
            {
                "loc": "/admin/marketing",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/marketing"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/marketing"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/marketing"
                    }
                ]
            },
            {
                "loc": "/en/admin/marketing",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/marketing"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/marketing"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/marketing"
                    }
                ]
            },
            {
                "loc": "/admin/minio-archive",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/minio-archive"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/minio-archive"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/minio-archive"
                    }
                ]
            },
            {
                "loc": "/en/admin/minio-archive",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/minio-archive"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/minio-archive"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/minio-archive"
                    }
                ]
            },
            {
                "loc": "/admin/newsletter",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/newsletter"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/newsletter"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/newsletter"
                    }
                ]
            },
            {
                "loc": "/en/admin/newsletter",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/newsletter"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/newsletter"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/newsletter"
                    }
                ]
            },
            {
                "loc": "/admin/offers",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/offers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/offers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/offers"
                    }
                ]
            },
            {
                "loc": "/en/admin/offers",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/offers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/offers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/offers"
                    }
                ]
            },
            {
                "loc": "/admin/orders",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/orders"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/orders"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/orders"
                    }
                ]
            },
            {
                "loc": "/en/admin/orders",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/orders"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/orders"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/orders"
                    }
                ]
            },
            {
                "loc": "/admin/payouts",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/payouts"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/payouts"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/payouts"
                    }
                ]
            },
            {
                "loc": "/en/admin/payouts",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/payouts"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/payouts"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/payouts"
                    }
                ]
            },
            {
                "loc": "/admin/permissions",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/permissions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/permissions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/permissions"
                    }
                ]
            },
            {
                "loc": "/en/admin/permissions",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/permissions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/permissions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/permissions"
                    }
                ]
            },
            {
                "loc": "/admin/product-form",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/product-form"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/product-form"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/product-form"
                    }
                ]
            },
            {
                "loc": "/en/admin/product-form",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/product-form"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/product-form"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/product-form"
                    }
                ]
            },
            {
                "loc": "/admin/products",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/products"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/products"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/products"
                    }
                ]
            },
            {
                "loc": "/en/admin/products",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/products"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/products"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/products"
                    }
                ]
            },
            {
                "loc": "/admin/products/pending",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/products/pending"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/products/pending"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/products/pending"
                    }
                ]
            },
            {
                "loc": "/en/admin/products/pending",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/products/pending"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/products/pending"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/products/pending"
                    }
                ]
            },
            {
                "loc": "/admin/purchase-orders",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/purchase-orders"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/purchase-orders"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/purchase-orders"
                    }
                ]
            },
            {
                "loc": "/en/admin/purchase-orders",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/purchase-orders"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/purchase-orders"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/purchase-orders"
                    }
                ]
            },
            {
                "loc": "/admin/reviews",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/reviews"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/reviews"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/reviews"
                    }
                ]
            },
            {
                "loc": "/en/admin/reviews",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/reviews"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/reviews"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/reviews"
                    }
                ]
            },
            {
                "loc": "/admin/segments",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/segments"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/segments"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/segments"
                    }
                ]
            },
            {
                "loc": "/en/admin/segments",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/segments"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/segments"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/segments"
                    }
                ]
            },
            {
                "loc": "/admin/settings/anasayfabarterborsa",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/anasayfabarterborsa"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/anasayfabarterborsa"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/anasayfabarterborsa"
                    }
                ]
            },
            {
                "loc": "/en/admin/settings/anasayfabarterborsa",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/anasayfabarterborsa"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/anasayfabarterborsa"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/anasayfabarterborsa"
                    }
                ]
            },
            {
                "loc": "/admin/settings/anasayfabazarx",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/anasayfabazarx"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/anasayfabazarx"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/anasayfabazarx"
                    }
                ]
            },
            {
                "loc": "/en/admin/settings/anasayfabazarx",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/anasayfabazarx"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/anasayfabazarx"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/anasayfabazarx"
                    }
                ]
            },
            {
                "loc": "/admin/settings/anasayfaticaritakas",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/anasayfaticaritakas"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/anasayfaticaritakas"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/anasayfaticaritakas"
                    }
                ]
            },
            {
                "loc": "/en/admin/settings/anasayfaticaritakas",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/anasayfaticaritakas"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/anasayfaticaritakas"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/anasayfaticaritakas"
                    }
                ]
            },
            {
                "loc": "/admin/settings/homepage",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/homepage"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/homepage"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/homepage"
                    }
                ]
            },
            {
                "loc": "/en/admin/settings/homepage",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/homepage"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/homepage"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/homepage"
                    }
                ]
            },
            {
                "loc": "/admin/settings/quad-cards",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/quad-cards"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/quad-cards"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/quad-cards"
                    }
                ]
            },
            {
                "loc": "/en/admin/settings/quad-cards",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/quad-cards"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/quad-cards"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/quad-cards"
                    }
                ]
            },
            {
                "loc": "/admin/settings/quick-access",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/quick-access"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/quick-access"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/quick-access"
                    }
                ]
            },
            {
                "loc": "/en/admin/settings/quick-access",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/quick-access"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/quick-access"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/quick-access"
                    }
                ]
            },
            {
                "loc": "/admin/settings/side-ads",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/side-ads"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/side-ads"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/side-ads"
                    }
                ]
            },
            {
                "loc": "/en/admin/settings/side-ads",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/settings/side-ads"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/settings/side-ads"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/settings/side-ads"
                    }
                ]
            },
            {
                "loc": "/admin/surplus-approvals",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/surplus-approvals"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/surplus-approvals"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/surplus-approvals"
                    }
                ]
            },
            {
                "loc": "/en/admin/surplus-approvals",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/surplus-approvals"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/surplus-approvals"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/surplus-approvals"
                    }
                ]
            },
            {
                "loc": "/admin/surplus-categories",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/surplus-categories"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/surplus-categories"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/surplus-categories"
                    }
                ]
            },
            {
                "loc": "/en/admin/surplus-categories",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/surplus-categories"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/surplus-categories"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/surplus-categories"
                    }
                ]
            },
            {
                "loc": "/admin/tier-management",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/tier-management"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/tier-management"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/tier-management"
                    }
                ]
            },
            {
                "loc": "/en/admin/tier-management",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/tier-management"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/tier-management"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/tier-management"
                    }
                ]
            },
            {
                "loc": "/admin/tiers",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/tiers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/tiers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/tiers"
                    }
                ]
            },
            {
                "loc": "/en/admin/tiers",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/tiers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/tiers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/tiers"
                    }
                ]
            },
            {
                "loc": "/admin/trade-history",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/trade-history"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/trade-history"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/trade-history"
                    }
                ]
            },
            {
                "loc": "/en/admin/trade-history",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/trade-history"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/trade-history"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/trade-history"
                    }
                ]
            },
            {
                "loc": "/admin/transfers",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/transfers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/transfers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/transfers"
                    }
                ]
            },
            {
                "loc": "/en/admin/transfers",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/transfers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/transfers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/transfers"
                    }
                ]
            },
            {
                "loc": "/admin/users",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/users"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/users"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/users"
                    }
                ]
            },
            {
                "loc": "/en/admin/users",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/users"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/users"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/users"
                    }
                ]
            },
            {
                "loc": "/admin/vendors",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/vendors"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/vendors"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/vendors"
                    }
                ]
            },
            {
                "loc": "/en/admin/vendors",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/vendors"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/vendors"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/vendors"
                    }
                ]
            },
            {
                "loc": "/admin/wallet-audit",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/wallet-audit"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/wallet-audit"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/wallet-audit"
                    }
                ]
            },
            {
                "loc": "/en/admin/wallet-audit",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/wallet-audit"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/wallet-audit"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/wallet-audit"
                    }
                ]
            },
            {
                "loc": "/admin/wallet-transactions",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/wallet-transactions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/wallet-transactions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/wallet-transactions"
                    }
                ]
            },
            {
                "loc": "/en/admin/wallet-transactions",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/wallet-transactions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/wallet-transactions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/wallet-transactions"
                    }
                ]
            },
            {
                "loc": "/admin/wallet",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/wallet"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/wallet"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/wallet"
                    }
                ]
            },
            {
                "loc": "/en/admin/wallet",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/wallet"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/wallet"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/wallet"
                    }
                ]
            },
            {
                "loc": "/admin/wanted-items",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/wanted-items"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/wanted-items"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/wanted-items"
                    }
                ]
            },
            {
                "loc": "/en/admin/wanted-items",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/wanted-items"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/wanted-items"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/wanted-items"
                    }
                ]
            },
            {
                "loc": "/admin/xp-rules",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/xp-rules"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/xp-rules"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/xp-rules"
                    }
                ]
            },
            {
                "loc": "/en/admin/xp-rules",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/admin/xp-rules"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/admin/xp-rules"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/admin/xp-rules"
                    }
                ]
            },
            {
                "loc": "/auctions",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/auctions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/auctions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/auctions"
                    }
                ]
            },
            {
                "loc": "/en/auctions",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/auctions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/auctions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/auctions"
                    }
                ]
            },
            {
                "loc": "/auctions/my",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/auctions/my"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/auctions/my"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/auctions/my"
                    }
                ]
            },
            {
                "loc": "/en/auctions/my",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/auctions/my"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/auctions/my"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/auctions/my"
                    }
                ]
            },
            {
                "loc": "/auth/callback",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/auth/callback"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/auth/callback"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/auth/callback"
                    }
                ]
            },
            {
                "loc": "/en/auth/callback",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/auth/callback"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/auth/callback"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/auth/callback"
                    }
                ]
            },
            {
                "loc": "/barter",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/barter"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/barter"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/barter"
                    }
                ]
            },
            {
                "loc": "/en/barter",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/barter"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/barter"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/barter"
                    }
                ]
            },
            {
                "loc": "/barterborsa",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/barterborsa"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/barterborsa"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/barterborsa"
                    }
                ]
            },
            {
                "loc": "/en/barterborsa",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/barterborsa"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/barterborsa"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/barterborsa"
                    }
                ]
            },
            {
                "loc": "/become-vendor",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/become-vendor"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/become-vendor"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/become-vendor"
                    }
                ]
            },
            {
                "loc": "/en/become-vendor",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/become-vendor"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/become-vendor"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/become-vendor"
                    }
                ]
            },
            {
                "loc": "/campaigns",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/campaigns"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/campaigns"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/campaigns"
                    }
                ]
            },
            {
                "loc": "/en/campaigns",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/campaigns"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/campaigns"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/campaigns"
                    }
                ]
            },
            {
                "loc": "/cart",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/cart"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/cart"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/cart"
                    }
                ]
            },
            {
                "loc": "/en/cart",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/cart"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/cart"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/cart"
                    }
                ]
            },
            {
                "loc": "/categories",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/categories"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/categories"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/categories"
                    }
                ]
            },
            {
                "loc": "/en/categories",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/categories"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/categories"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/categories"
                    }
                ]
            },
            {
                "loc": "/checkout",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/checkout"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/checkout"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/checkout"
                    }
                ]
            },
            {
                "loc": "/en/checkout",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/checkout"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/checkout"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/checkout"
                    }
                ]
            },
            {
                "loc": "/dashboard/wanted-items",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/dashboard/wanted-items"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/dashboard/wanted-items"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/dashboard/wanted-items"
                    }
                ]
            },
            {
                "loc": "/en/dashboard/wanted-items",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/dashboard/wanted-items"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/dashboard/wanted-items"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/dashboard/wanted-items"
                    }
                ]
            },
            {
                "loc": "/dashboard/wanted-items/manage",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/dashboard/wanted-items/manage"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/dashboard/wanted-items/manage"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/dashboard/wanted-items/manage"
                    }
                ]
            },
            {
                "loc": "/en/dashboard/wanted-items/manage",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/dashboard/wanted-items/manage"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/dashboard/wanted-items/manage"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/dashboard/wanted-items/manage"
                    }
                ]
            },
            {
                "loc": "/favorites",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/favorites"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/favorites"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/favorites"
                    }
                ]
            },
            {
                "loc": "/en/favorites",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/favorites"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/favorites"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/favorites"
                    }
                ]
            },
            {
                "loc": "/forgot-password",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/forgot-password"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/forgot-password"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/forgot-password"
                    }
                ]
            },
            {
                "loc": "/en/forgot-password",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/forgot-password"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/forgot-password"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/forgot-password"
                    }
                ]
            },
            {
                "loc": "/help",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/help"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/help"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/help"
                    }
                ]
            },
            {
                "loc": "/en/help",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/help"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/help"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/help"
                    }
                ]
            },
            {
                "loc": "/",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/"
                    }
                ]
            },
            {
                "loc": "/en",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/"
                    }
                ]
            },
            {
                "loc": "/login",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/login"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/login"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/login"
                    }
                ]
            },
            {
                "loc": "/en/login",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/login"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/login"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/login"
                    }
                ]
            },
            {
                "loc": "/lotteries",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/lotteries"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/lotteries"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/lotteries"
                    }
                ]
            },
            {
                "loc": "/en/lotteries",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/lotteries"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/lotteries"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/lotteries"
                    }
                ]
            },
            {
                "loc": "/markalar",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/markalar"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/markalar"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/markalar"
                    }
                ]
            },
            {
                "loc": "/en/markalar",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/markalar"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/markalar"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/markalar"
                    }
                ]
            },
            {
                "loc": "/my/coupons",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/my/coupons"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/my/coupons"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/my/coupons"
                    }
                ]
            },
            {
                "loc": "/en/my/coupons",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/my/coupons"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/my/coupons"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/my/coupons"
                    }
                ]
            },
            {
                "loc": "/my/offers",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/my/offers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/my/offers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/my/offers"
                    }
                ]
            },
            {
                "loc": "/en/my/offers",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/my/offers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/my/offers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/my/offers"
                    }
                ]
            },
            {
                "loc": "/my/surplus",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/my/surplus"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/my/surplus"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/my/surplus"
                    }
                ]
            },
            {
                "loc": "/en/my/surplus",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/my/surplus"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/my/surplus"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/my/surplus"
                    }
                ]
            },
            {
                "loc": "/my/trades",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/my/trades"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/my/trades"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/my/trades"
                    }
                ]
            },
            {
                "loc": "/en/my/trades",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/my/trades"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/my/trades"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/my/trades"
                    }
                ]
            },
            {
                "loc": "/orders",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/orders"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/orders"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/orders"
                    }
                ]
            },
            {
                "loc": "/en/orders",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/orders"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/orders"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/orders"
                    }
                ]
            },
            {
                "loc": "/partner/bulk-upload",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/partner/bulk-upload"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/partner/bulk-upload"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/partner/bulk-upload"
                    }
                ]
            },
            {
                "loc": "/en/partner/bulk-upload",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/partner/bulk-upload"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/partner/bulk-upload"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/partner/bulk-upload"
                    }
                ]
            },
            {
                "loc": "/partner/dashboard",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/partner/dashboard"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/partner/dashboard"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/partner/dashboard"
                    }
                ]
            },
            {
                "loc": "/en/partner/dashboard",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/partner/dashboard"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/partner/dashboard"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/partner/dashboard"
                    }
                ]
            },
            {
                "loc": "/payment-success",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/payment-success"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/payment-success"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/payment-success"
                    }
                ]
            },
            {
                "loc": "/en/payment-success",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/payment-success"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/payment-success"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/payment-success"
                    }
                ]
            },
            {
                "loc": "/payment/bank-transfer",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/payment/bank-transfer"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/payment/bank-transfer"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/payment/bank-transfer"
                    }
                ]
            },
            {
                "loc": "/en/payment/bank-transfer",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/payment/bank-transfer"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/payment/bank-transfer"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/payment/bank-transfer"
                    }
                ]
            },
            {
                "loc": "/payment/credit-card",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/payment/credit-card"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/payment/credit-card"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/payment/credit-card"
                    }
                ]
            },
            {
                "loc": "/en/payment/credit-card",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/payment/credit-card"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/payment/credit-card"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/payment/credit-card"
                    }
                ]
            },
            {
                "loc": "/payment/eft",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/payment/eft"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/payment/eft"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/payment/eft"
                    }
                ]
            },
            {
                "loc": "/en/payment/eft",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/payment/eft"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/payment/eft"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/payment/eft"
                    }
                ]
            },
            {
                "loc": "/payments",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/payments"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/payments"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/payments"
                    }
                ]
            },
            {
                "loc": "/en/payments",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/payments"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/payments"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/payments"
                    }
                ]
            },
            {
                "loc": "/premium",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/premium"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/premium"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/premium"
                    }
                ]
            },
            {
                "loc": "/en/premium",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/premium"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/premium"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/premium"
                    }
                ]
            },
            {
                "loc": "/products/discover",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/products/discover"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/products/discover"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/products/discover"
                    }
                ]
            },
            {
                "loc": "/en/products/discover",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/products/discover"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/products/discover"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/products/discover"
                    }
                ]
            },
            {
                "loc": "/products",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/products"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/products"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/products"
                    }
                ]
            },
            {
                "loc": "/en/products",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/products"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/products"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/products"
                    }
                ]
            },
            {
                "loc": "/profile",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/profile"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/profile"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/profile"
                    }
                ]
            },
            {
                "loc": "/en/profile",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/profile"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/profile"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/profile"
                    }
                ]
            },
            {
                "loc": "/profile/trade-offers",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/profile/trade-offers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/profile/trade-offers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/profile/trade-offers"
                    }
                ]
            },
            {
                "loc": "/en/profile/trade-offers",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/profile/trade-offers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/profile/trade-offers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/profile/trade-offers"
                    }
                ]
            },
            {
                "loc": "/register",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/register"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/register"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/register"
                    }
                ]
            },
            {
                "loc": "/en/register",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/register"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/register"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/register"
                    }
                ]
            },
            {
                "loc": "/reset-password",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/reset-password"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/reset-password"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/reset-password"
                    }
                ]
            },
            {
                "loc": "/en/reset-password",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/reset-password"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/reset-password"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/reset-password"
                    }
                ]
            },
            {
                "loc": "/reviews",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/reviews"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/reviews"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/reviews"
                    }
                ]
            },
            {
                "loc": "/en/reviews",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/reviews"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/reviews"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/reviews"
                    }
                ]
            },
            {
                "loc": "/settings",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/settings"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/settings"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/settings"
                    }
                ]
            },
            {
                "loc": "/en/settings",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/settings"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/settings"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/settings"
                    }
                ]
            },
            {
                "loc": "/support",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/support"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/support"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/support"
                    }
                ]
            },
            {
                "loc": "/en/support",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/support"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/support"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/support"
                    }
                ]
            },
            {
                "loc": "/surplus",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/surplus"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/surplus"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/surplus"
                    }
                ]
            },
            {
                "loc": "/en/surplus",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/surplus"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/surplus"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/surplus"
                    }
                ]
            },
            {
                "loc": "/test-product",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/test-product"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/test-product"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/test-product"
                    }
                ]
            },
            {
                "loc": "/en/test-product",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/test-product"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/test-product"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/test-product"
                    }
                ]
            },
            {
                "loc": "/tier-info",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/tier-info"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/tier-info"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/tier-info"
                    }
                ]
            },
            {
                "loc": "/en/tier-info",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/tier-info"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/tier-info"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/tier-info"
                    }
                ]
            },
            {
                "loc": "/unsubscribe",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/unsubscribe"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/unsubscribe"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/unsubscribe"
                    }
                ]
            },
            {
                "loc": "/en/unsubscribe",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/unsubscribe"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/unsubscribe"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/unsubscribe"
                    }
                ]
            },
            {
                "loc": "/vendor-application",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor-application"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor-application"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor-application"
                    }
                ]
            },
            {
                "loc": "/en/vendor-application",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor-application"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor-application"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor-application"
                    }
                ]
            },
            {
                "loc": "/vendor/advertising",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/advertising"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/advertising"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/advertising"
                    }
                ]
            },
            {
                "loc": "/en/vendor/advertising",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/advertising"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/advertising"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/advertising"
                    }
                ]
            },
            {
                "loc": "/vendor/analytics",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/analytics"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/analytics"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/analytics"
                    }
                ]
            },
            {
                "loc": "/en/vendor/analytics",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/analytics"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/analytics"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/analytics"
                    }
                ]
            },
            {
                "loc": "/vendor/banners",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/banners"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/banners"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/banners"
                    }
                ]
            },
            {
                "loc": "/en/vendor/banners",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/banners"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/banners"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/banners"
                    }
                ]
            },
            {
                "loc": "/vendor/brands",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/brands"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/brands"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/brands"
                    }
                ]
            },
            {
                "loc": "/en/vendor/brands",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/brands"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/brands"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/brands"
                    }
                ]
            },
            {
                "loc": "/vendor/categories",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/categories"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/categories"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/categories"
                    }
                ]
            },
            {
                "loc": "/en/vendor/categories",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/categories"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/categories"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/categories"
                    }
                ]
            },
            {
                "loc": "/vendor/dashboard",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/dashboard"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/dashboard"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/dashboard"
                    }
                ]
            },
            {
                "loc": "/en/vendor/dashboard",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/dashboard"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/dashboard"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/dashboard"
                    }
                ]
            },
            {
                "loc": "/vendor/ecosystem",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/ecosystem"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/ecosystem"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/ecosystem"
                    }
                ]
            },
            {
                "loc": "/en/vendor/ecosystem",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/ecosystem"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/ecosystem"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/ecosystem"
                    }
                ]
            },
            {
                "loc": "/vendor/financial/invoices",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/financial/invoices"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/financial/invoices"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/financial/invoices"
                    }
                ]
            },
            {
                "loc": "/en/vendor/financial/invoices",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/financial/invoices"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/financial/invoices"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/financial/invoices"
                    }
                ]
            },
            {
                "loc": "/vendor",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor"
                    }
                ]
            },
            {
                "loc": "/en/vendor",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor"
                    }
                ]
            },
            {
                "loc": "/vendor/inventory",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/inventory"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/inventory"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/inventory"
                    }
                ]
            },
            {
                "loc": "/en/vendor/inventory",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/inventory"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/inventory"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/inventory"
                    }
                ]
            },
            {
                "loc": "/vendor/orders",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/orders"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/orders"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/orders"
                    }
                ]
            },
            {
                "loc": "/en/vendor/orders",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/orders"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/orders"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/orders"
                    }
                ]
            },
            {
                "loc": "/vendor/product-form",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/product-form"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/product-form"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/product-form"
                    }
                ]
            },
            {
                "loc": "/en/vendor/product-form",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/product-form"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/product-form"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/product-form"
                    }
                ]
            },
            {
                "loc": "/vendor/products",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/products"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/products"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/products"
                    }
                ]
            },
            {
                "loc": "/en/vendor/products",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/products"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/products"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/products"
                    }
                ]
            },
            {
                "loc": "/vendor/purchase-orders/create",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/purchase-orders/create"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/purchase-orders/create"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/purchase-orders/create"
                    }
                ]
            },
            {
                "loc": "/en/vendor/purchase-orders/create",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/purchase-orders/create"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/purchase-orders/create"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/purchase-orders/create"
                    }
                ]
            },
            {
                "loc": "/vendor/purchase-orders",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/purchase-orders"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/purchase-orders"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/purchase-orders"
                    }
                ]
            },
            {
                "loc": "/en/vendor/purchase-orders",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/purchase-orders"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/purchase-orders"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/purchase-orders"
                    }
                ]
            },
            {
                "loc": "/vendor/settings",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/settings"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/settings"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/settings"
                    }
                ]
            },
            {
                "loc": "/en/vendor/settings",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/settings"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/settings"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/settings"
                    }
                ]
            },
            {
                "loc": "/vendor/transfers",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/transfers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/transfers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/transfers"
                    }
                ]
            },
            {
                "loc": "/en/vendor/transfers",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/transfers"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/transfers"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/transfers"
                    }
                ]
            },
            {
                "loc": "/vendor/users",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/users"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/users"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/users"
                    }
                ]
            },
            {
                "loc": "/en/vendor/users",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendor/users"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendor/users"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendor/users"
                    }
                ]
            },
            {
                "loc": "/vendors",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendors"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendors"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendors"
                    }
                ]
            },
            {
                "loc": "/en/vendors",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/vendors"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/vendors"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/vendors"
                    }
                ]
            },
            {
                "loc": "/verify-email",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/verify-email"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/verify-email"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/verify-email"
                    }
                ]
            },
            {
                "loc": "/en/verify-email",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/verify-email"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/verify-email"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/verify-email"
                    }
                ]
            },
            {
                "loc": "/wallet-test",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/wallet-test"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/wallet-test"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/wallet-test"
                    }
                ]
            },
            {
                "loc": "/en/wallet-test",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/wallet-test"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/wallet-test"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/wallet-test"
                    }
                ]
            },
            {
                "loc": "/wallet",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/wallet"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/wallet"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/wallet"
                    }
                ]
            },
            {
                "loc": "/en/wallet",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/wallet"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/wallet"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/wallet"
                    }
                ]
            },
            {
                "loc": "/wallet/transactions",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/wallet/transactions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/wallet/transactions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/wallet/transactions"
                    }
                ]
            },
            {
                "loc": "/en/wallet/transactions",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/wallet/transactions"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/wallet/transactions"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/wallet/transactions"
                    }
                ]
            },
            {
                "loc": "/wishlist",
                "_sitemap": "tr-TR",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/wishlist"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/wishlist"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/wishlist"
                    }
                ]
            },
            {
                "loc": "/en/wishlist",
                "_sitemap": "en-US",
                "alternatives": [
                    {
                        "hreflang": "tr-TR",
                        "href": "/wishlist"
                    },
                    {
                        "hreflang": "en-US",
                        "href": "/en/wishlist"
                    },
                    {
                        "hreflang": "x-default",
                        "href": "/wishlist"
                    }
                ]
            }
        ],
        "sourceType": "app"
    }
];

const globalSources = /*#__PURE__*/Object.freeze({
  __proto__: null,
  sources: sources$1
});

const sources = {
    "tr-TR": [],
    "en-US": []
};

const childSources = /*#__PURE__*/Object.freeze({
  __proto__: null,
  sources: sources
});

const Vue3 = version[0] === "3";

function resolveUnref(r) {
  return typeof r === "function" ? r() : unref(r);
}
function resolveUnrefHeadInput(ref) {
  if (ref instanceof Promise || ref instanceof Date || ref instanceof RegExp)
    return ref;
  const root = resolveUnref(ref);
  if (!ref || !root)
    return root;
  if (Array.isArray(root))
    return root.map((r) => resolveUnrefHeadInput(r));
  if (typeof root === "object") {
    const resolved = {};
    for (const k in root) {
      if (!Object.prototype.hasOwnProperty.call(root, k)) {
        continue;
      }
      if (k === "titleTemplate" || k[0] === "o" && k[1] === "n") {
        resolved[k] = unref(root[k]);
        continue;
      }
      resolved[k] = resolveUnrefHeadInput(root[k]);
    }
    return resolved;
  }
  return root;
}

const VueReactivityPlugin = defineHeadPlugin({
  hooks: {
    "entries:resolve": (ctx) => {
      for (const entry of ctx.entries)
        entry.resolvedInput = resolveUnrefHeadInput(entry.input);
    }
  }
});

const headSymbol = "usehead";
function vueInstall(head) {
  const plugin = {
    install(app) {
      if (Vue3) {
        app.config.globalProperties.$unhead = head;
        app.config.globalProperties.$head = head;
        app.provide(headSymbol, head);
      }
    }
  };
  return plugin.install;
}
function createServerHead(options = {}) {
  const head = createServerHead$1(options);
  head.use(VueReactivityPlugin);
  head.install = vueInstall(head);
  return head;
}

const unheadPlugins = [];

const appHead = {"meta":[{"charset":"utf-8"},{"name":"viewport","content":"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover"},{"name":"description","content":"TicariTakas - Ticari sektöründe fazla malzeme ve stokların takası için modern platform"}],"link":[{"rel":"icon","type":"image/x-icon","href":"/favicon.ico"}],"style":[],"script":[],"noscript":[],"title":"TicariTakas - Ticari Takas Platformu"};

const appRootId = "__nuxt";

const appRootTag = "div";

globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const getClientManifest = () => import('file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/.nuxt/dist/server/client.manifest.mjs').then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getServerEntry = () => import('file:///Users/macbook/Desktop/barter/barterborsa/barterborsa/frontend/.nuxt/dist/server/server.mjs').then((r) => r.default || r);
const getSSRRenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  if (!manifest) {
    throw new Error("client.manifest is not available");
  }
  const createSSRApp = await getServerEntry();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const options = {
    manifest,
    renderToString: renderToString$1,
    buildAssetsURL
  };
  const renderer = createRenderer(createSSRApp, options);
  async function renderToString$1(input, context) {
    const html = await renderToString(input, context);
    if (process.env.NUXT_VITE_NODE_OPTIONS) {
      renderer.rendererContext.updateManifest(await getClientManifest());
    }
    return `<${appRootTag}${` id="${appRootId}"` }>${html}</${appRootTag}>`;
  }
  return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  const spaTemplate = await Promise.resolve().then(function () { return _virtual__spaTemplate; }).then((r) => r.template).catch(() => "");
  const options = {
    manifest,
    renderToString: () => `<${appRootTag}${` id="${appRootId}"` }>${spaTemplate}</${appRootTag}>`,
    buildAssetsURL
  };
  const renderer = createRenderer(() => () => {
  }, options);
  const result = await renderer.renderToString({});
  const renderToString = (ssrContext) => {
    const config = useRuntimeConfig();
    ssrContext.modules = ssrContext.modules || /* @__PURE__ */ new Set();
    ssrContext.payload = {
      _errors: {},
      serverRendered: false,
      data: {},
      state: {},
      once: /* @__PURE__ */ new Set()
    };
    ssrContext.config = {
      public: config.public,
      app: config.app
    };
    return Promise.resolve(result);
  };
  return {
    rendererContext: renderer.rendererContext,
    renderToString
  };
});
const PAYLOAD_URL_RE = /\/_payload(\.[a-zA-Z0-9]+)?.json(\?.*)?$/ ;
const renderer = defineRenderHandler(async (event) => {
  const nitroApp = useNitroApp();
  const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
  if (ssrError && ssrError.statusCode) {
    ssrError.statusCode = parseInt(ssrError.statusCode);
  }
  if (ssrError && !("__unenv__" in event.node.req)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found: /__nuxt_error"
    });
  }
  const isRenderingIsland = false;
  const islandContext = void 0;
  let url = ssrError?.url || islandContext?.url || event.path;
  const isRenderingPayload = PAYLOAD_URL_RE.test(url) && !isRenderingIsland;
  if (isRenderingPayload) {
    url = url.substring(0, url.lastIndexOf("/")) || "/";
    event._path = url;
    event.node.req.url = url;
  }
  const routeOptions = getRouteRules(event);
  const head = createServerHead({
    plugins: unheadPlugins
  });
  const headEntryOptions = { mode: "server" };
  {
    head.push(appHead, headEntryOptions);
  }
  const ssrContext = {
    url,
    event,
    runtimeConfig: useRuntimeConfig(),
    noSSR: event.context.nuxt?.noSSR || routeOptions.ssr === false && !isRenderingIsland || (false),
    head,
    error: !!ssrError,
    nuxt: void 0,
    /* NuxtApp */
    payload: ssrError ? { error: ssrError } : {},
    _payloadReducers: {},
    modules: /* @__PURE__ */ new Set(),
    set _registeredComponents(value) {
      this.modules = value;
    },
    get _registeredComponents() {
      return this.modules;
    },
    islandContext
  };
  const renderer = ssrContext.noSSR ? await getSPARenderer() : await getSSRRenderer();
  const _rendered = await renderer.renderToString(ssrContext).catch(async (error) => {
    if (ssrContext._renderResponse && error.message === "skipping render") {
      return {};
    }
    const _err = !ssrError && ssrContext.payload?.error || error;
    await ssrContext.nuxt?.hooks.callHook("app:error", _err);
    throw _err;
  });
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult: _rendered });
  if (ssrContext._renderResponse) {
    return ssrContext._renderResponse;
  }
  if (ssrContext.payload?.error && !ssrError) {
    throw ssrContext.payload.error;
  }
  if (isRenderingPayload) {
    const response2 = renderPayloadResponse(ssrContext);
    return response2;
  }
  const inlinedStyles = [];
  const NO_SCRIPTS = routeOptions.experimentalNoScripts;
  const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
  head.push({ style: inlinedStyles });
  {
    const link = [];
    for (const style in styles) {
      const resource = styles[style];
      if ("inline" in getQuery(resource.file)) {
        continue;
      }
      {
        link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file) });
      }
    }
    head.push({ link }, headEntryOptions);
  }
  if (!NO_SCRIPTS && !isRenderingIsland) {
    head.push({
      link: getPreloadLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    head.push({
      link: getPrefetchLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    head.push({
      script: renderPayloadJsonScript({ id: "__NUXT_DATA__", ssrContext, data: ssrContext.payload }) 
    }, {
      ...headEntryOptions,
      // this should come before another end of body scripts
      tagPosition: "bodyClose",
      tagPriority: "high"
    });
  }
  if (!routeOptions.experimentalNoScripts && !isRenderingIsland) {
    head.push({
      script: Object.values(scripts).map((resource) => ({
        type: resource.module ? "module" : null,
        src: renderer.rendererContext.buildAssetsURL(resource.file),
        defer: resource.module ? null : true,
        crossorigin: ""
      }))
    }, headEntryOptions);
  }
  const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(head);
  const htmlContext = {
    island: isRenderingIsland,
    htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
    head: normalizeChunks([headTags, ssrContext.styles]),
    bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
    bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
    body: [_rendered.html],
    bodyAppend: [bodyTags]
  };
  await nitroApp.hooks.callHook("render:html", htmlContext, { event });
  const response = {
    body: renderHTMLDocument(htmlContext),
    statusCode: getResponseStatus(event),
    statusMessage: getResponseStatusText(event),
    headers: {
      "content-type": "text/html;charset=utf-8",
      "x-powered-by": "Nuxt"
    }
  };
  return response;
});
function lazyCachedFunction(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}
function normalizeChunks(chunks) {
  return chunks.filter(Boolean).map((i) => i.trim());
}
function joinTags(tags) {
  return tags.join("");
}
function joinAttrs(chunks) {
  return chunks.join(" ");
}
function renderHTMLDocument(html) {
  return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}
function renderPayloadResponse(ssrContext) {
  return {
    body: stringify(splitPayload(ssrContext).payload, ssrContext._payloadReducers) ,
    statusCode: getResponseStatus(ssrContext.event),
    statusMessage: getResponseStatusText(ssrContext.event),
    headers: {
      "content-type": "application/json;charset=utf-8" ,
      "x-powered-by": "Nuxt"
    }
  };
}
function renderPayloadJsonScript(opts) {
  const contents = opts.data ? stringify(opts.data, opts.ssrContext._payloadReducers) : "";
  const payload = {
    type: "application/json",
    id: opts.id,
    innerHTML: contents,
    "data-ssr": !(opts.ssrContext.noSSR)
  };
  if (opts.src) {
    payload["data-src"] = opts.src;
  }
  return [
    payload,
    {
      innerHTML: `window.__NUXT__={};window.__NUXT__.config=${uneval(opts.ssrContext.config)}`
    }
  ];
}
function splitPayload(ssrContext) {
  const { data, prerenderedAt, ...initial } = ssrContext.payload;
  return {
    initial: { ...initial, prerenderedAt },
    payload: { data, prerenderedAt }
  };
}

const renderer$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: renderer
});

const sitemap_index_xml = defineEventHandler(sitemapIndexXmlEventHandler);

const sitemap_index_xml$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: sitemap_index_xml
});

const _sitemap__xml = defineEventHandler(sitemapChildXmlEventHandler);

const _sitemap__xml$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  default: _sitemap__xml
});

const template = "";

const _virtual__spaTemplate = /*#__PURE__*/Object.freeze({
  __proto__: null,
  template: template
});
//# sourceMappingURL=index.mjs.map
