/* AuHug — funcionamento sem internet.
   Na primeira visita, guarda todos os arquivos no celular.
   Depois, abre sempre na hora a partir do celular (mesmo sem sinal)
   e, se houver internet, baixa a versão nova em segundo plano
   para a próxima vez que o app for aberto.

   Só é preciso mexer aqui se você ADICIONAR ou RENOMEAR arquivos:
   atualize a lista ARQUIVOS e aumente o número em VERSAO. */

const VERSAO = "auhug-v27";
const ARQUIVOS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "favicon.png",
  "og-image-6.png",
  "simbolos/arasaac-forte.png",
  "simbolos/arasaac-explodindo.png",
  "simbolos/arasaac-travado.png",
  "simbolos/arasaac-comecar.png",
  "simbolos/acao-forte.png",
  "simbolos/acao-explodindo.png",
  "simbolos/acao-travado.png",
  "simbolos/acao-comecar.png"
];

self.addEventListener("install", evento => {
  evento.waitUntil(
    // cache: "reload" ignora a cópia antiga que o navegador guarda e busca a versão do servidor.
    caches.open(VERSAO).then(c => c.addAll(ARQUIVOS.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", evento => {
  evento.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(nomes.filter(n => n !== VERSAO).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", evento => {
  const pedido = evento.request;
  if (pedido.method !== "GET" || new URL(pedido.url).origin !== self.location.origin) return;

  // Abrir o app (o endereço raiz, com ou sem #...) usa a página principal guardada.
  // Outras páginas do site (ex.: /artigos/) são buscadas na rede e guardadas para leitura sem internet.
  const url = new URL(pedido.url);
  const raiz = new URL(self.registration.scope).pathname;
  const ehApp = url.pathname === raiz || url.pathname === raiz + "index.html";
  if (pedido.mode === "navigate" && !ehApp) {
    evento.respondWith(
      fetch(pedido).then(resp => {
        if (resp && resp.ok) { const c = resp.clone(); caches.open(VERSAO).then(cache => cache.put(pedido, c)); }
        return resp;
      }).catch(() => caches.match(pedido, { ignoreSearch: true }).then(r =>
        r || new Response("Sem conexão. Abra o AuHug pela tela inicial.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })))
    );
    return;
  }
  const chave = pedido.mode === "navigate" ? "./" : pedido;

  evento.respondWith(
    caches.open(VERSAO).then(async cache => {
      const guardado = await cache.match(chave, { ignoreSearch: true });
      // cache: "no-cache" confere com o servidor se há versão nova, em vez de usar a cópia do navegador.
      const daRede = fetch(pedido.url, { cache: "no-cache", credentials: "same-origin" })
        .then(resp => {
          if (resp && resp.ok) cache.put(chave, resp.clone());
          return resp;
        })
        .catch(() => null);

      if (guardado) {
        evento.waitUntil(daRede);
        return guardado;
      }
      const resp = await daRede;
      return resp || new Response("Sem conexão.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    })
  );
});
