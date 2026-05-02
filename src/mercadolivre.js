// ============================================================
// MERCADO LIVRE API — AfiliadoAI PRO
// ============================================================
// INSTRUÇÕES PARA OBTER AS CREDENCIAIS:
// 1. Acesse https://developers.mercadolivre.com.br
// 2. Clique em "Criar aplicação"
// 3. Preencha os dados do app
// 4. Copie o CLIENT_ID e CLIENT_SECRET abaixo
// 5. Para o ACCESS_TOKEN: faça login OAuth e copie o token
// ============================================================

const ML_BASE = "https://api.mercadolibre.com";

// ─── Cole suas credenciais aqui ──────────────────────────────
const ML_ACCESS_TOKEN = "COLE_AQUI_SEU_ACCESS_TOKEN";
// ─────────────────────────────────────────────────────────────

const ML_HEADERS = {
  "Authorization": `Bearer ${ML_ACCESS_TOKEN}`,
  "Content-Type": "application/json"
};

// ─── BUSCAR PRODUTOS ─────────────────────────────────────────
export async function buscarProdutosML(query, limite = 10) {
  try {
    const res = await fetch(
      `${ML_BASE}/sites/MLB/search?q=${encodeURIComponent(query)}&limit=${limite}`,
      { headers: ML_HEADERS }
    );
    const data = await res.json();

    if (!data.results) return [];

    return data.results.map(item => ({
      id:            item.id,
      name:          item.title,
      price:         `R$ ${item.price?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      priceRaw:      item.price,
      store:         "mercadolivre",
      img:           item.thumbnail || "🛒",
      thumbnailUrl:  item.thumbnail,
      link:          item.permalink,
      sold:          item.sold_quantity || 0,
      category:      "Mercado Livre",
      trend:         Math.min(99, Math.floor((item.sold_quantity || 0) / 10) + 60),
      commission:    `R$ ${((item.price || 0) * 0.08).toFixed(2)}`,
    }));
  } catch (err) {
    console.error("Erro ML buscarProdutos:", err);
    return [];
  }
}

// ─── BUSCAR PRODUTO POR LINK/ID ──────────────────────────────
export async function buscarProdutoPorLink(url) {
  try {
    // Extrai ID do link (ex: MLB-123456 ou meli.la/...)
    let itemId = "";

    if (url.includes("MLB") || url.includes("mlb")) {
      const match = url.match(/MLB-?(\d+)/i);
      if (match) itemId = `MLB${match[1]}`;
    } else if (url.includes("meli.la")) {
      // Resolve redirect do meli.la
      const res = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(url)}&limit=1`);
      const data = await res.json();
      if (data.results?.[0]) {
        const item = data.results[0];
        return formatarItemML(item);
      }
    }

    if (itemId) {
      const res  = await fetch(`${ML_BASE}/items/${itemId}`, { headers: ML_HEADERS });
      const item = await res.json();
      return formatarItemML(item);
    }

    // Busca genérica pelo link como texto
    const res  = await fetch(`${ML_BASE}/sites/MLB/search?q=${encodeURIComponent(url)}&limit=1`);
    const data = await res.json();
    if (data.results?.[0]) return formatarItemML(data.results[0]);

    return null;
  } catch (err) {
    console.error("Erro ML buscarPorLink:", err);
    return null;
  }
}

function formatarItemML(item) {
  return {
    id:           item.id,
    name:         item.title,
    price:        `R$ ${(item.price || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    priceRaw:     item.price,
    store:        "mercadolivre",
    img:          "🛒",
    thumbnailUrl: item.thumbnail || item.pictures?.[0]?.url,
    link:         item.permalink,
    sold:         item.sold_quantity || 0,
    category:     "Mercado Livre",
    trend:        Math.min(99, Math.floor((item.sold_quantity || 0) / 10) + 60),
    commission:   `R$ ${((item.price || 0) * 0.08).toFixed(2)}`,
    clicks:       0,
    sales:        item.sold_quantity || 0,
  };
}

// ─── TRENDING / MAIS VENDIDOS ────────────────────────────────
export async function getTrendingML(categoria = "") {
  try {
    const terms = ["tênis viral", "perfume importado", "smartwatch", "fone bluetooth", "vestido", "mochila"];
    const busca = categoria || terms[Math.floor(Math.random() * terms.length)];
    return await buscarProdutosML(busca, 6);
  } catch (err) {
    console.error("Erro ML getTrending:", err);
    return [];
  }
}
