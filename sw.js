/* Service Worker — Idealis Cardápio & Protocolos
 *
 * Estratégia escolhida de propósito:
 *  - HTML  -> REDE PRIMEIRO. Assim, todo deploy novo aparece na hora.
 *             O cache do HTML só é usado se você estiver offline.
 *  - CDN   -> CACHE PRIMEIRO (React/Babel/fonte). Ganho grande de velocidade:
 *             o Babel sozinho tem ~560 KB e não muda entre deploys.
 *  - POST  -> nunca interceptado (as chamadas ao Apps Script vão sempre pela rede).
 *
 * Kill switch: abra o app com  ?sw=off  na URL para desregistrar o SW
 * e limpar todos os caches (útil se algo travar).
 */

const VERSAO = "idealis-v22";
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
  self.skipWaiting(); // assume o controle sem esperar abas antigas fecharem
  e.waitUntil(
    caches.open(CACHE_APP).then((c) =>
      // addAll falha inteiro se um item falhar; adiciona um a um pra ser tolerante
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

  // POST/PUT (Apps Script) nunca passa pelo cache
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const mesmaOrigem = url.origin === self.location.origin;
  const ehHTML =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  // 0) API (Apps Script) -> SEMPRE pela rede, nunca cacheia.
  //    Sem isso, o GET dos exercícios ficava preso no cache e a lista
  //    aparecia desatualizada até dar Ctrl+Shift+R.
  const ehAPI =
    url.hostname.endsWith("script.google.com") ||
    url.hostname.endsWith("script.googleusercontent.com") ||
    url.hostname.endsWith("googleusercontent.com");
  if (ehAPI) return; // deixa passar direto pro navegador, sem interceptar

  // 1) HTML -> rede primeiro (deploy novo sempre vence), cache como fallback offline
  if (ehHTML) {
    e.respondWith(
      (async () => {
        try {
          const fresco = await fetch(req, { cache: "no-store" });
          const c = await caches.open(CACHE_APP);
          c.put("./index.html", fresco.clone());
          return fresco;
        } catch (err) {
          const cacheado = await caches.match("./index.html");
          return cacheado || Response.error();
        }
      })()
    );
    return;
  }

  // 2) CDN conhecido (React, Babel, fontes) -> cache primeiro.
  //    Allowlist explícita: qualquer outro domínio passa direto pela rede.
  const CDNS = ["unpkg.com", "fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com"];
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
