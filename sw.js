/* Service Worker — Idealis Cardápio & Protocolos
 *
 * Estratégia:
 *  - HTML      -> REDE PRIMEIRO. Todo deploy novo aparece na hora.
 *                 O cache do HTML só é usado se você estiver offline.
 *  - CDN       -> CACHE PRIMEIRO (React/Babel/supabase-js/fontes). O Babel sozinho
 *                 tem ~560 KB e não muda entre deploys.
 *  - API       -> NUNCA interceptada. Supabase e Apps Script sempre pela rede.
 *  - não-GET   -> nunca interceptado.
 *
 * Kill switch: abra o app com  ?sw=off  na URL para desregistrar o SW
 * e limpar todos os caches.
 *
 * v23: entrou cdn.jsdelivr.net (supabase-js) na allowlist, entrou a guarda
 *      explícita de *.supabase.co, e o HTML passou a ser cacheado por URL
 *      (antes index.html e index-v2.html brigavam pela mesma chave).
 */

const VERSAO = "idealis-v23";
const CACHE_APP = VERSAO + "-app";
const CACHE_CDN = VERSAO + "-cdn";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_APP).then((c) =>
      Promise.all(ARQUIVOS.map((u) => c.add(u).catch(() => {})))
    )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const chaves = await caches.keys();
      await Promise.all(
        chaves
          .filter((k) => k !== CACHE_APP && k !== CACHE_CDN)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "limpar") {
    caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k))));
  }
});

self.addEventListener("fetch", (e) => {
  const req = e.request;

  // POST/PATCH/DELETE (escrita no Supabase) nunca passa pelo cache
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const mesmaOrigem = url.origin === self.location.origin;
  const ehHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  // 0) API -> SEMPRE pela rede, nunca cacheia.
  //    Sem isto, a lista de exercícios fica presa no cache e aparece
  //    desatualizada até dar Ctrl+Shift+R.
  const ehAPI =
    url.hostname.endsWith("supabase.co") ||
    url.hostname.endsWith("supabase.in") ||
    url.hostname.endsWith("script.google.com") ||
    url.hostname.endsWith("script.googleusercontent.com") ||
    url.hostname.endsWith("googleusercontent.com");
  if (ehAPI) return; // passa direto pro navegador, sem interceptar

  // 1) HTML -> rede primeiro (deploy novo sempre vence), cache como fallback offline.
  //    Guarda por URL: index.html e index-v2.html não se sobrescrevem.
  if (ehHTML) {
    e.respondWith(
      (async () => {
        try {
          const fresco = await fetch(req, { cache: "no-store" });
          const c = await caches.open(CACHE_APP);
          c.put(req, fresco.clone());
          return fresco;
        } catch (err) {
          const cacheado = (await caches.match(req)) || (await caches.match("./index.html"));
          return cacheado || Response.error();
        }
      })()
    );
    return;
  }

  // 2) CDN conhecido -> cache primeiro. Allowlist explícita.
  const CDNS = [
    "unpkg.com",
    "cdn.jsdelivr.net",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
    "cdnjs.cloudflare.com",
  ];
  const ehCDN = CDNS.some((d) => url.hostname === d || url.hostname.endsWith("." + d));
  if (!mesmaOrigem && !ehCDN) return; // terceiro desconhecido: não intercepta
  if (!mesmaOrigem) {
    e.respondWith(
      (async () => {
        const cacheado = await caches.match(req);
        if (cacheado) return cacheado;
        try {
          const resp = await fetch(req);
          const c = await caches.open(CACHE_CDN);
          c.put(req, resp.clone());
          return resp;
        } catch (err) {
          return Response.error();
        }
      })()
    );
    return;
  }

  // 3) Resto do mesmo domínio (ícones) -> cache primeiro
  e.respondWith(
    (async () => {
      const cacheado = await caches.match(req);
      if (cacheado) return cacheado;
      try {
        const resp = await fetch(req);
        const c = await caches.open(CACHE_APP);
        c.put(req, resp.clone());
        return resp;
      } catch (err) {
        return Response.error();
      }
    })()
  );
});
