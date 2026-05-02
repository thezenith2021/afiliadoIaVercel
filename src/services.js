// ============================================================
// SERVIÇOS: WhatsApp, Encurtador, QR Code — AfiliadoAI PRO
// ============================================================

// ─── WHATSAPP ────────────────────────────────────────────────
export function gerarMensagemWhatsApp(produto, linkAfiliado) {
  const link  = linkAfiliado || produto.link || produto.affiliateLink || "https://meli.la/17XoYuZ";
  const preco = produto.price ? `\n💲 *Preço:* ${produto.price}` : "";
  const comis = produto.commission ? `\n💰 *Sua comissão:* ${produto.commission}` : "";

  const mensagem =
    `🔥 *Oferta IMPERDÍVEL!* 🔥\n\n` +
    `Olha o que achei pra você! 👇\n\n` +
    `🛍️ *${produto.name}*${preco}\n` +
    `💰 Economize agora com esse link exclusivo!\n\n` +
    `👉 *CLIQUE AQUI E GARANTA O SEU:*\n${link}\n\n` +
    `⚠️ _Estoque limitado! Corre antes que acabe!_ 🚨\n\n` +
    `_Enviado por AfiliadoAI PRO_ ⚡`;

  return `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
}

export function abrirWhatsApp(produto, linkAfiliado) {
  const url = gerarMensagemWhatsApp(produto, linkAfiliado);
  window.open(url, "_blank");
}

// ─── ENCURTADOR (TinyURL — sem precisar de API key) ──────────
export async function encurtarLink(url) {
  try {
    const res  = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    const short = await res.text();
    if (short.startsWith("http")) return short;
    return url;
  } catch (_) {
    return url;
  }
}

// ─── QR CODE (API gratuita) ──────────────────────────────────
export function gerarQRCode(url, tamanho = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${tamanho}x${tamanho}&data=${encodeURIComponent(url)}&bgcolor=0f1421&color=00FFD1&format=png`;
}

// ─── RASTREAMENTO DE CLIQUES ─────────────────────────────────
const cliquesLocais = {};

export function rastrearClique(linkId) {
  cliquesLocais[linkId] = (cliquesLocais[linkId] || 0) + 1;
  return cliquesLocais[linkId];
}

export function getCliques(linkId) {
  return cliquesLocais[linkId] || 0;
}

// ─── COPY TO CLIPBOARD ───────────────────────────────────────
export async function copiarLink(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (_) {
    return false;
  }
}
