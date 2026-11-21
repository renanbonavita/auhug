# AuHug — MVP

Ferramenta de autorregulação e comunicação para pessoas autistas em momentos de crise.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html` | O app inteiro (telas, textos, estilo e lógica) |
| `manifest.webmanifest` | Permite instalar na tela inicial com nome e ícone |
| `sw.js` | Faz o app funcionar sem internet depois da primeira visita |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Ícones do app (Android; a versão maskable tem margem para o recorte redondo) |
| `apple-touch-icon.png` | Ícone do app (iPhone) |
| `favicon.png` | Ícone da aba do navegador |
| `og-image.png` | Imagem de prévia quando o link é compartilhado |

## Como editar os textos

Abra `index.html` num editor de texto e procure por `CONTEÚDO`. Todos os textos das quatro telas e dos cartões estão ali, num bloco só. Mude o texto entre aspas e salve.

Para ativar o botão "Conte como foi" (WhatsApp) na página Sobre, coloque seu número em `WHATSAPP = ""`, só números, com 55 e DDD (ex.: `"5511999999999"`).

Para mostrar o Pix de doação na página Sobre, preencha `CHAVE_PIX = ""`.

## Publicar no GitHub Pages (sem usar linha de comando)

1. Crie uma conta gratuita em **github.com** (se ainda não tiver).
2. No canto superior direito, toque em **+** e depois em **New repository**.
3. Em *Repository name*, escreva `auhug`. Deixe marcado **Public** e toque em **Create repository**.
4. Na página do repositório vazio, clique em **uploading an existing file**.
5. Arraste **todos os arquivos desta pasta** (não a pasta, os arquivos) e clique em **Commit changes**.
6. Vá em **Settings** → **Pages** (no menu lateral).
7. Em *Branch*, escolha **main**, pasta **/ (root)**, e clique em **Save**.
8. Espere de 1 a 3 minutos e recarregue a página. O endereço aparece no topo, algo como:
   `https://SEU-USUARIO.github.io/auhug/`
9. Abra esse endereço no celular e teste os quatro botões.

### Atualizar depois

No repositório, clique em **Add file** → **Upload files**, arraste o `index.html` novo e clique em **Commit changes**. A atualização chega ao site em 1 a 3 minutos.

**Importante (modo sem internet):** quem já tem o AuHug no celular abre sempre a versão guardada, para abrir na hora mesmo sem sinal. A versão nova é baixada em segundo plano e aparece **na próxima vez** que a pessoa abrir o app. Para conferir uma mudança, abra o app, feche e abra de novo.

Se você **adicionar ou renomear arquivos**, abra `sw.js`, atualize a lista `ARQUIVOS` e mude `auhug-v1` para `auhug-v2` (e assim por diante).

## Domínio próprio

O site está em **https://auhug.com.br** (registrado no Registro.br; DNS no modo avançado com 4 registros A do GitHub e CNAME `www` → `renanbonavita.github.io`). O arquivo `CNAME` do repositório diz ao GitHub qual é o domínio: não apague.

### Como foi configurado

1. Verifique a disponibilidade de `auhug.app`, `auhug.com.br` etc. num registrador (ex.: Registro.br para `.com.br`, ou Cloudflare, Porkbun, Namecheap).
2. Em **Settings → Pages → Custom domain**, escreva o domínio e salve.
3. No painel do registrador, crie os registros DNS indicados pela documentação do GitHub Pages.
4. Marque **Enforce HTTPS** (obrigatório para domínios `.app`).

## Checklist de teste antes de divulgar

- [ ] Os 4 botões abrem a instrução certa.
- [ ] "Mostrar cartão para alguém" abre o cartão em tela clara.
- [ ] "Voltar" e o botão voltar do celular funcionam.
- [ ] O cartão fica legível com o celular virado para outra pessoa, a um braço de distância.
- [ ] Instalação na tela inicial funciona no Android (Chrome) e no iPhone (Safari).
- [ ] O app instalado abre direto nos botões, sem barra de navegador.
- [ ] O link 188 abre o discador.
- [ ] Depois de abrir uma vez, ative o modo avião: o app instalado ainda abre e mostra os cartões.

## Próximas versões (fora do MVP)

Decidido: o cartão continua genérico, sem dados pessoais, para ser simples de usar na crise.


- Tela de recuperação pós-crise e burnout
- Versão em inglês (em domínio .com próprio)

## Créditos

Pictogramas: Sergio Palao. Origem: ARASAAC (arasaac.org). Licença: CC BY-NC-SA. Propriedade: Governo de Aragão (Espanha).
