/* =============================================================
   CONTEÚDO — edite os textos aqui.
   - principal: instrução para a própria pessoa (até ~5 palavras)
   - permissao: frase menor de acolhimento
   - destaque: primeira linha do cartão
   - estado: o que está acontecendo
   - pedido: o que a outra pessoa deve fazer
   - notaSeguranca: mostra a frase sobre álcool/drogas no fim do cartão
   - nota: (opcional) frase própria no fim do cartão, no lugar da frase padrão
   ============================================================= */
const CONTEUDO = {
  forte: {
    principal: "Afaste-se do barulho.",
    permissao: "Você pode sair sem explicar.",
    destaque: "Sou autista.",
    estado: ["Barulho, luz e movimento estão fortes demais para mim.",
             "Preciso de um lugar mais calmo por alguns minutos."],
    pedido: ["Fale pouco e devagar.", "Não toque em mim."],
    notaSeguranca: true
  },
  explodindo: {
    principal: "Vá para um canto quieto.",
    permissao: "Nada precisa ser resolvido.",
    destaque: "Sou autista.",
    estado: ["Estou em sobrecarga e não consigo falar.", "Isso vai passar."],
    pedido: ["Fique por perto, em silêncio.", "Peça para as pessoas se afastarem.",
             "Não toque em mim.", "Não faça perguntas."],
    notaSeguranca: true
  },
  travado: {
    principal: "Fique onde está.",
    permissao: "Isso vai passar.",
    destaque: "Sou autista.",
    estado: ["Na sobrecarga, meu corpo pode travar e posso não conseguir falar ou me mexer.",
             "Posso ouvir, mesmo sem conseguir responder."],
    pedido: ["Preciso de tempo, silêncio e um lugar tranquilo.", "Não faça perguntas.", "Não toque em mim."],
    /* Nota própria: travar e perder a fala de repente também pode ser sinal de AVC. */
    nota: "Esta é uma reação que reconheço em mim. Se parecer nova, diferente do meu padrão, ou um lado do meu rosto ou corpo estiver fraco, ligue 192 (SAMU)."
  },
  comecar: {
    principal: "Beba um gole de água.",
    permissao: "Uma coisa só. Sem pressa.",
    destaque: "Sou autista.",
    estado: ["Estou com dificuldade de começar, mudar ou terminar uma tarefa."],
    pedido: ["Me ajude assim: diga um passo simples por vez.",
             "Avise antes de mudar de atividade.",
             "Espere eu terminar antes do próximo.", "Sem pressa."],
    notaSeguranca: false
  }
};

const NOTA_SEGURANCA = "Esta é uma reação neurológica do autismo. Não estou sob efeito de álcool ou drogas.";

/* WhatsApp para relatos (página Sobre): só números, com 55 e DDD, ex.: "5511999999999".
   Deixe vazio para esconder o bloco "Conte como foi". */
const WHATSAPP = "";
const WHATSAPP_MENSAGEM = "Oi! Usei o AuHug e queria contar como foi: ";

/* Link do formulário de avaliação (ex.: Google Forms). Deixe vazio para esconder. */
const LINK_FORMULARIO = "https://forms.gle/9T5ycz3EdE6rd37m8";

/* Pix para doações (página Sobre). Deixe CHAVE_PIX vazio para esconder. */
const CHAVE_PIX = "9e6c357a-1e7a-4344-b6c7-91fcf739bc10";

/* ============================================================= */

const telas = ["inicio","instrucao","cartao","sobre"];
let estadoAtual = null;
let travaTela = null;

function el(tag, classe, texto){
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texto) e.textContent = texto;
  return e;
}

let manterVoz = false;   /* true quando a fala começou no toque que abriu esta tela */
function mostrar(id){
  if (!manterVoz) pararVoz();
  manterVoz = false;
  telas.forEach(t => document.getElementById(t).classList.toggle("ativa", t === id));
  window.scrollTo(0,0);
  document.querySelector('meta[name="theme-color"]')
    .setAttribute("content", id === "cartao" ? "#ece5d8" : "#1f2329");
  if (id === "cartao") manterTelaLigada(); else liberarTela();
}

function renderInstrucao(chave){
  const c = CONTEUDO[chave];
  document.getElementById("instrucao-principal").textContent = c.principal;
  document.getElementById("instrucao-permissao").textContent = c.permissao;
  document.getElementById("instrucao-simbolo").src = "simbolos/acao-" + chave + ".png";
}

/* ---------- Personalize seu cartão (guardado só no celular) ---------- */
const PLANO_TOQUE = { nao: "Não toque em mim.", ombro: "Se precisar, pode tocar no meu ombro, com calma.", abraco: "Um abraço firme me ajuda, se eu aceitar." };
const PLANO_PERGUNTAS = { nao: "Não faça perguntas.", simnao: "Faça só perguntas de sim ou não; posso responder com um gesto." };
const PLANO_AJUDA = { luz: "Diminua o barulho e a luz, se puder.", calmo: "Me ajude a ir para um lugar mais calmo.",
  perto: "Fique por perto, em silêncio.", agua: "Me ofereça água.", fone: "Não tire meu fone nem o objeto que estou segurando." };
function lerPlano(){ try { return JSON.parse(localStorage.getItem("auhug-plano") || "null"); } catch(e){ return null; } }
function gravarPlano(p){ try { if (p) localStorage.setItem("auhug-plano", JSON.stringify(p)); else localStorage.removeItem("auhug-plano"); return true; } catch(e){ return false; } }

function conteudoCartao(chave){
  const c = CONTEUDO[chave], p = lerPlano();
  const r = { destaque: c.destaque, estado: c.estado.slice(), pedido: c.pedido.slice(),
              nota: c.nota || (c.notaSeguranca ? NOTA_SEGURANCA : ""), contato: null };
  if (!p) return r;
  r.pedido = r.pedido.map(f => f === "Não toque em mim." ? PLANO_TOQUE[p.toque] || f
                             : f === "Não faça perguntas." ? PLANO_PERGUNTAS[p.perguntas] || f : f);
  if (chave !== "comecar") (p.ajuda || []).forEach(k => {
    const f = PLANO_AJUDA[k]; if (f && !r.pedido.includes(f)) r.pedido.push(f);
  });
  if (p.frase) r.pedido.push(p.frase.trim());
  const tel = (p.contatoTel || "").replace(/[^0-9+]/g, "");
  if (p.contatoNome || tel) r.contato = { nome: (p.contatoNome || "").trim(), tel, telTexto: (p.contatoTel || "").trim() };
  return r;
}

function renderCartao(chave){
  const c = conteudoCartao(chave);
  const corpo = document.getElementById("cartao-corpo");
  corpo.replaceChildren();
  corpo.appendChild(el("p","frase destaque",c.destaque));
  c.estado.forEach(f => corpo.appendChild(el("p","frase",f)));
  const pedido = el("div","pedido");
  c.pedido.forEach(f => pedido.appendChild(el("p","frase",f)));
  corpo.appendChild(pedido);
  if (c.contato) {
    const box = el("p","contato");
    box.appendChild(document.createTextNode("Pessoa de confiança: " + (c.contato.nome || "")));
    if (c.contato.tel) {
      box.appendChild(document.createTextNode(c.contato.nome ? " · " : ""));
      const a = el("a", null, c.contato.telTexto || c.contato.tel); a.href = "tel:" + c.contato.tel; box.appendChild(a);
    }
    corpo.appendChild(box);
  }
  if (c.nota) corpo.appendChild(el("p","nota",c.nota));
}

/* Ajuste automático: se o cartão não couber na tela, reduz a fonte aos poucos (mínimo 75%). */
function ajustarCartao(){
  const corpo = document.getElementById("cartao-corpo");
  let esc = 1; corpo.style.fontSize = "";
  while (document.documentElement.scrollHeight > window.innerHeight + 1 && esc > 0.75) {
    esc -= 0.05; corpo.style.fontSize = (16 * esc) + "px";
  }
}
window.addEventListener("resize", () => { if (location.hash.startsWith("#cartao/")) ajustarCartao(); });

/* Navegação por endereço (#), para o botão "voltar" do celular funcionar. */
function rota(){
  const h = location.hash.replace("#","");
  const [tipo, chave] = h.split("/");
  if ((tipo === "instrucao" || tipo === "cartao") && CONTEUDO[chave]){
    estadoAtual = chave;
    if (tipo === "instrucao") renderInstrucao(chave); else renderCartao(chave);
    mostrar(tipo);
    if (tipo === "cartao") ajustarCartao();
  } else if (tipo === "sobre"){
    mostrar("sobre");
    const alvo = { instalar: "sobre-instalar", avaliar: "sobre-avaliar", "quem-fez": "sobre-quem-fez", plano: "sobre-plano" }[chave];
    if (alvo) { const d = document.getElementById(alvo); d.open = true; d.scrollIntoView(); }
  } else {
    mostrar("inicio");
  }
}

document.querySelectorAll("[data-estado]").forEach(b =>
  b.addEventListener("click", () => { location.hash = "instrucao/" + b.dataset.estado; }));

document.getElementById("botao-cartao").addEventListener("click", () => {
  location.hash = "cartao/" + estadoAtual;
});

/* "Voltar" desfaz o último passo dentro do app; se a pessoa abriu direto num link, vai para o início. */
const pilha = [location.hash];
window.addEventListener("hashchange", () => {
  if (pilha.length > 1 && pilha[pilha.length - 2] === location.hash) pilha.pop();
  else pilha.push(location.hash);
});
document.querySelectorAll("[data-voltar]").forEach(b =>
  b.addEventListener("click", () => {
    if (pilha.length > 1) { history.back(); return; }
    const destino = location.hash.startsWith("#cartao/") ? "#instrucao/" + estadoAtual : "#";
    history.replaceState(null, "", destino === "#" ? location.pathname : destino);
    pilha[0] = location.hash;
    rota();
  }));

document.querySelectorAll("[data-ir='sobre-instalar']").forEach(b =>
  b.addEventListener("click", () => { location.hash = "sobre/instalar"; }));

/* Mantém a tela acesa enquanto o cartão está aberto (quando o navegador permite). */
async function manterTelaLigada(){
  try { if ("wakeLock" in navigator && !travaTela) travaTela = await navigator.wakeLock.request("screen"); }
  catch(e){ travaTela = null; }
}
function liberarTela(){
  try { if (travaTela) travaTela.release(); } catch(e){}
  travaTela = null;
}
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && location.hash.startsWith("#cartao/")) {
    travaTela = null; manterTelaLigada();
  }
});

/* "Usar sem internet" (topo): só no navegador, não no app instalado.
   No Android/Chrome, abre a janela de instalação do próprio navegador; nos outros, abre as instruções. */
(function(){
  const instalado = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (instalado) return;
  const botao = document.getElementById("botao-instalar");
  botao.hidden = false; document.body.classList.add("navegador");
  let pedido = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); pedido = e; });
  window.addEventListener("appinstalled", () => { botao.hidden = true; document.body.classList.remove("navegador"); pedido = null; });
  botao.addEventListener("click", async () => {
    if (pedido){
      pedido.prompt();
      try { await pedido.userChoice; } catch(e){}
      pedido = null;
    } else {
      location.hash = "sobre/instalar";
    }
  });
})();

/* Link de relatos */
/* Pix */
if (CHAVE_PIX){
  document.getElementById("pix-chave").textContent = CHAVE_PIX;
  
  document.getElementById("bloco-pix").hidden = false;
  document.getElementById("pix-copiar").addEventListener("click", async () => {
    const ok = document.getElementById("pix-ok");
    try { await navigator.clipboard.writeText(CHAVE_PIX); ok.textContent = "Copiada."; }
    catch(e){
      const r = document.createRange(); r.selectNodeContents(document.getElementById("pix-chave"));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      ok.textContent = "Selecionada. Toque e segure para copiar.";
    }
  });
}

if (WHATSAPP){
  const z = document.getElementById("link-relato");
  z.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(WHATSAPP_MENSAGEM); z.hidden = false;
  document.getElementById("sobre-avaliar").hidden = false;
}

/* ---------- Voz (leitura em voz alta com a voz do próprio celular) ---------- */
const temVoz = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
let vozAuto = false;
try { vozAuto = localStorage.getItem("auhug-voz-auto") === "1"; } catch(e){}

function textoDaTela(qual){
  const c = CONTEUDO[estadoAtual]; if (!c) return "";
  if (qual === "instrucao") return c.principal + " " + c.permissao;
  const k = conteudoCartao(estadoAtual);
  return [k.destaque, ...k.estado, ...k.pedido, k.contato ? "Pessoa de confiança: " + k.contato.nome : "", k.nota].join(" ");
}
function vozPortugues(){
  const vs = speechSynthesis.getVoices();
  return vs.find(v => /^pt[-_]BR/i.test(v.lang)) || vs.find(v => /^pt/i.test(v.lang)) || null;
}
function marcarBotoes(ativo){
  if (!ativo) document.querySelectorAll("[data-falar]").forEach(b => b.setAttribute("aria-pressed","false"));
  document.querySelectorAll("[data-ouvir]").forEach(b => {
    b.setAttribute("aria-pressed", ativo ? "true" : "false");
    b.querySelector("span").textContent = ativo ? "Parar" : (b.dataset.ouvir === "cartao" ? "Ler em voz alta" : "Ouvir");
  });
}
function falar(texto){
  if (!temVoz || !texto) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = "pt-BR"; u.rate = 0.9;
  const v = vozPortugues(); if (v) u.voice = v;
  u.onend = u.onerror = () => marcarBotoes(false);
  marcarBotoes(true);
  speechSynthesis.speak(u);
}
function pararVoz(){ if (temVoz) { speechSynthesis.cancel(); marcarBotoes(false); } }

if (temVoz) {
  document.querySelectorAll("[data-ouvir]").forEach(b => {
    b.hidden = false;
    b.addEventListener("click", () => {
      if (b.getAttribute("aria-pressed") === "true") pararVoz(); else falar(textoDaTela(b.dataset.ouvir));
    });
  });
  document.getElementById("bloco-voz").hidden = false;
  document.body.classList.add("com-voz");
  document.querySelectorAll("[data-falar]").forEach(b => {
    b.hidden = false;
    b.addEventListener("click", () => {
      const tocando = b.getAttribute("aria-pressed") === "true";
      pararVoz();
      if (tocando) return;
      const texto = document.querySelector('[data-estado="' + b.dataset.falar + '"] span:last-child').textContent;
      falar(texto);
      b.setAttribute("aria-pressed", "true");
    });
  });
  const caixa = document.getElementById("voz-auto");
  caixa.checked = vozAuto;
  caixa.addEventListener("change", () => {
    vozAuto = caixa.checked;
    try { localStorage.setItem("auhug-voz-auto", vozAuto ? "1" : "0"); } catch(e){}
  });
  /* Leitura automática: fala direto no toque (alguns celulares só permitem voz em resposta a um toque). */
  document.querySelectorAll("[data-estado]").forEach(b => b.addEventListener("click", () => {
    if (!vozAuto) return;
    const c = CONTEUDO[b.dataset.estado];
    manterVoz = true;
    falar(c.principal + " " + c.permissao);
  }));
  speechSynthesis.getVoices();
}

/* Formulário do plano de apoio: não envia nada (só grava no celular, a cada mudança) */
document.getElementById("form-plano").addEventListener("submit", e => e.preventDefault());
/* Formulário do plano de apoio: grava a cada mudança */
(function(){
  const f = document.getElementById("form-plano"), st = document.getElementById("plano-status");
  function preencher(p){
    f.reset();
    if (!p) return;
    f.querySelectorAll("[name=toque]").forEach(i => i.checked = i.value === p.toque);
    f.querySelectorAll("[name=perguntas]").forEach(i => i.checked = i.value === p.perguntas);
    f.querySelectorAll("[name=ajuda]").forEach(i => i.checked = (p.ajuda || []).includes(i.value));
    f.frase.value = p.frase || ""; f.contatoNome.value = p.contatoNome || ""; f.contatoTel.value = p.contatoTel || "";
  }
  function coletar(){
    return { toque: (f.querySelector("[name=toque]:checked") || {}).value || "nao",
             perguntas: (f.querySelector("[name=perguntas]:checked") || {}).value || "nao",
             ajuda: [...f.querySelectorAll("[name=ajuda]:checked")].map(i => i.value),
             frase: f.frase.value.trim(), contatoNome: f.contatoNome.value.trim(), contatoTel: f.contatoTel.value.trim() };
  }
  preencher(lerPlano());
  f.addEventListener("input", () => { st.textContent = gravarPlano(coletar()) ? "Salvo neste celular." : "Não foi possível salvar neste navegador."; });
  document.getElementById("apagar-plano").addEventListener("click", () => {
    gravarPlano(null); preencher(null); st.textContent = "Escolhas apagadas. Os cartões voltaram ao padrão.";
  });
})();

/* Imprimir meu cartão: monta as 4 páginas com o plano aplicado e abre a impressão do celular */
function montarImpressao(){
  const area = document.getElementById("impressao"); area.replaceChildren();
  document.querySelectorAll("[data-estado]").forEach(b => {
    const k = b.dataset.estado, c = CONTEUDO[k], cc = conteudoCartao(k);
    const folha = el("section","imp-folha");
    const sit = el("div","imp-sit"); const i1 = document.createElement("img"); i1.src = "simbolos/arasaac-" + k + ".png"; i1.alt = "";
    const s1 = el("div"); s1.append(el("p","imp-rot","QUANDO"), el("p","imp-grande", b.querySelector("span:last-child").textContent)); sit.append(i1, s1);
    const mim = el("div","imp-mim"); mim.appendChild(el("p","imp-rot","PARA MIM"));
    const ac = el("div","imp-acao"); const i2 = document.createElement("img"); i2.src = "simbolos/acao-" + k + ".png"; i2.alt = "";
    const s2 = el("div"); s2.append(el("p","imp-grande",c.principal), el("p","imp-perm",c.permissao)); ac.append(i2, s2); mim.appendChild(ac);
    const out = el("div","imp-outro"); out.appendChild(el("p","imp-rot","PARA QUEM ESTÁ POR PERTO"));
    out.appendChild(el("p","imp-destaque",cc.destaque)); cc.estado.forEach(f => out.appendChild(el("p","imp-frase",f)));
    const ped = el("div","imp-pedido"); cc.pedido.forEach(f => ped.appendChild(el("p","imp-frase",f))); out.appendChild(ped);
    if (cc.contato) out.appendChild(el("p","imp-contato","Pessoa de confiança: " + [cc.contato.nome, cc.contato.telTexto || cc.contato.tel].filter(Boolean).join(" · ")));
    if (cc.nota) out.appendChild(el("p","imp-nota",cc.nota));
    folha.append(sit, mim, out, el("p","imp-rodape","Cartão do AuHug · auhug.com.br · Pictogramas: ARASAAC, Sergio Palao (CC BY-NC-SA), e desenhos próprios do AuHug"));
    area.appendChild(folha);
  });
  return area;
}
document.getElementById("imprimir-plano").addEventListener("click", () => {
  const imgs = [...montarImpressao().querySelectorAll("img")];
  Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; }))).then(() => window.print());
});

/* Formulário de avaliação */
if (LINK_FORMULARIO){
  const a = document.getElementById("link-formulario"); a.href = LINK_FORMULARIO; a.hidden = false;
  document.getElementById("sobre-avaliar").hidden = false;
  document.getElementById("privacidade-form").hidden = false;
  document.getElementById("rodape-avaliar").hidden = false;
}

window.addEventListener("hashchange", rota);
rota();

/* Funcionamento sem internet (arquivo sw.js). */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
