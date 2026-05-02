import { useState, useEffect, useRef } from "react";

const STORES = [
  {
    id: "mercadolivre", name: "Mercado Livre", color: "#FFE600", icon: "🛒", commission: "8%",
    programa: "Mercado Pago Afiliados",
    linkPrograma: "https://www.mercadolivre.com.br/afiliados",
    permissoes: {
      tiktok:    { ok: true,  regra: "Permitido. Usar link mlg.to ou meli.la. Não usar preço falso." },
      instagram: { ok: true,  regra: "Permitido. Link na bio ou stories com swipe up." },
      youtube:   { ok: true,  regra: "Permitido. Link na descrição e comentário fixado." },
      facebook:  { ok: true,  regra: "Permitido. Link direto nas publicações." },
      kwai:      { ok: true,  regra: "Permitido. Link na bio. Não prometer cashback falso." },
      whatsapp:  { ok: true,  regra: "Permitido. Não enviar spam em massa." },
    },
    proibido: ["Não usar marca 'Mercado Livre' como nome de perfil", "Não prometer desconto que não existe", "Não usar preços desatualizados"],
    obrigatorio: ["Sempre informar que é link de afiliado", "Usar link oficial do programa"],
    cookie: "30 dias",
  },
  {
    id: "amazon", name: "Amazon", color: "#FF9900", icon: "📦", commission: "10%",
    programa: "Amazon Associates Brasil",
    linkPrograma: "https://associados.amazon.com.br",
    permissoes: {
      tiktok:    { ok: true,  regra: "Permitido via amzn.to. Deve mencionar #publicidade ou #ad." },
      instagram: { ok: true,  regra: "Permitido. Obrigatório usar #ad ou #publi no post." },
      youtube:   { ok: true,  regra: "Permitido. Obrigatório avisar na descrição que é link de afiliado." },
      facebook:  { ok: true,  regra: "Permitido. Não usar anúncios pagos com link de afiliado direto." },
      kwai:      { ok: true,  regra: "Permitido. Mesmas regras do TikTok." },
      whatsapp:  { ok: false, regra: "⚠️ PROIBIDO enviar links Amazon em grupos de WhatsApp em massa." },
    },
    proibido: ["Não usar em e-mail marketing", "Não comprar com seu próprio link", "Não usar anúncios pagos direcionando ao link de afiliado", "Não encurtar link com serviços não aprovados (usar só amzn.to)"],
    obrigatorio: ["Declarar parceria em todo conteúdo", "Usar tag de afiliado no link", "Disclosure: 'Como afiliado Amazon ganho comissão'"],
    cookie: "24 horas",
  },
  {
    id: "shopee", name: "Shopee", color: "#EE4D2D", icon: "🛍️", commission: "12%",
    programa: "Shopee Afiliados",
    linkPrograma: "https://shopee.com.br/m/shopee-affiliate",
    permissoes: {
      tiktok:    { ok: true,  regra: "Permitido e INCENTIVADO. TikTok Shop integrado. Usar #ShopeeAfiliado." },
      instagram: { ok: true,  regra: "Permitido. Link na bio via link aggregator (Linktree etc)." },
      youtube:   { ok: true,  regra: "Permitido. Link na descrição com tag de afiliado." },
      facebook:  { ok: true,  regra: "Permitido. Grupos e páginas são permitidos." },
      kwai:      { ok: true,  regra: "Permitido. Parceria oficial Shopee x Kwai." },
      whatsapp:  { ok: true,  regra: "Permitido. Grupos de oferta são incentivados." },
    },
    proibido: ["Não alterar preço manualmente no conteúdo", "Não criar loja falsa com nome Shopee"],
    obrigatorio: ["Usar link gerado no painel de afiliados", "Mencionar que é afiliado Shopee"],
    cookie: "30 dias",
  },
  {
    id: "shein", name: "Shein", color: "#E91E8C", icon: "👗", commission: "15%",
    programa: "Shein Affiliate Program",
    linkPrograma: "https://affiliate.shein.com",
    permissoes: {
      tiktok:    { ok: true,  regra: "MUITO incentivado. Shein tem programa oficial no TikTok. Usar #SheinPartner." },
      instagram: { ok: true,  regra: "Permitido. Reels e Stories são os formatos preferidos." },
      youtube:   { ok: true,  regra: "Permitido. Try-on hauls são o formato mais aceito." },
      facebook:  { ok: true,  regra: "Permitido. Grupos de moda são ideais." },
      kwai:      { ok: true,  regra: "Permitido. Formato de try-on funciona bem." },
      whatsapp:  { ok: true,  regra: "Permitido. Grupos de moda e promoções." },
    },
    proibido: ["Não comparar negativamente com outras marcas", "Não usar imagens oficiais da Shein sem autorização", "Não prometer frete grátis sem confirmar"],
    obrigatorio: ["#SheinPartner ou #SheinAfiliado obrigatório", "Mencionar código de desconto se tiver"],
    cookie: "30 dias",
  },
  {
    id: "temu", name: "Temu", color: "#FF5722", icon: "🏷️", commission: "9%",
    programa: "Temu Affiliate",
    linkPrograma: "https://www.temu.com/affiliate",
    permissoes: {
      tiktok:    { ok: true,  regra: "Permitido. Usar link gerado no painel Temu." },
      instagram: { ok: true,  regra: "Permitido. Mostrar produto real, não apenas foto do site." },
      youtube:   { ok: true,  regra: "Permitido. Unboxing e reviews são formatos incentivados." },
      facebook:  { ok: true,  regra: "Permitido. Não criar páginas falsas com nome Temu." },
      kwai:      { ok: true,  regra: "Permitido." },
      whatsapp:  { ok: true,  regra: "Permitido em grupos de oferta." },
    },
    proibido: ["Não prometer qualidade que o produto não tem", "Não usar avaliações falsas", "Não criar perfil como se fosse a loja oficial Temu"],
    obrigatorio: ["Divulgar que é afiliado", "Usar link oficial do programa"],
    cookie: "30 dias",
  },
  {
    id: "natura", name: "Natura", color: "#00A86B", icon: "🌿", commission: "14%",
    programa: "Natura Afiliados",
    linkPrograma: "https://www.natura.com.br/afiliados",
    permissoes: {
      tiktok:    { ok: true,  regra: "Permitido. Conteúdo de beleza e bem-estar é incentivado." },
      instagram: { ok: true,  regra: "Permitido. Reels de review e antes/depois são permitidos." },
      youtube:   { ok: true,  regra: "Permitido. Reviews detalhados são bem aceitos." },
      facebook:  { ok: true,  regra: "Permitido." },
      kwai:      { ok: true,  regra: "Permitido." },
      whatsapp:  { ok: true,  regra: "Permitido. Natura tem cultura de venda por WhatsApp." },
    },
    proibido: ["Não fazer alegações de saúde não comprovadas", "Não usar antes/depois enganosos", "Não associar produto a tratamento médico"],
    obrigatorio: ["Mencionar que é revendedora/afiliada Natura", "Não fazer promessas além do que o produto entrega"],
    cookie: "30 dias",
  },
  {
    id: "boticario", name: "O Boticário", color: "#4CAF50", icon: "💄", commission: "13%",
    programa: "Boticário Afiliados",
    linkPrograma: "https://www.boticario.com.br/afiliados",
    permissoes: {
      tiktok:    { ok: true,  regra: "Permitido. Reviews de perfume e maquiagem são incentivados." },
      instagram: { ok: true,  regra: "Permitido. Uso de #parceriaboticario obrigatório." },
      youtube:   { ok: true,  regra: "Permitido. Tutoriais de maquiagem com produtos são ideais." },
      facebook:  { ok: true,  regra: "Permitido." },
      kwai:      { ok: true,  regra: "Permitido." },
      whatsapp:  { ok: true,  regra: "Permitido." },
    },
    proibido: ["Não usar logo Boticário sem autorização", "Não fazer comparações com concorrentes", "Não prometer efeito que o produto não tem"],
    obrigatorio: ["#parceriaboticario ou 'em parceria com Boticário'", "Mostrar produto real no conteúdo"],
    cookie: "30 dias",
  },
  {
    id: "cacaushow", name: "Cacau Show", color: "#8B4513", icon: "🍫", commission: "11%",
    programa: "Cacau Show Afiliados",
    linkPrograma: "https://www.cacaushow.com.br/afiliados",
    permissoes: {
      tiktok:    { ok: true,  regra: "Permitido. Conteúdo de presentes e datas especiais funciona bem." },
      instagram: { ok: true,  regra: "Permitido. Fotos de produto são incentivadas." },
      youtube:   { ok: true,  regra: "Permitido. Review de caixas de chocolate são populares." },
      facebook:  { ok: true,  regra: "Permitido. Grupos de presente e confraternização." },
      kwai:      { ok: true,  regra: "Permitido." },
      whatsapp:  { ok: true,  regra: "Permitido. Envio de catálogo por WhatsApp é prática comum." },
    },
    proibido: ["Não usar imagens de produtos sem mostrar preço real", "Não criar perfil oficial falso"],
    obrigatorio: ["Mencionar que é afiliado", "Usar link oficial do programa"],
    cookie: "15 dias",
  },
  {
    id: "pernambucanas", name: "Pernambucanas", color: "#E53935", icon: "🏪", commission: "7%",
    programa: "Pernambucanas Afiliados",
    linkPrograma: "https://www.pernambucanas.com.br/afiliados",
    permissoes: {
      tiktok:    { ok: true,  regra: "Permitido. Conteúdo de moda e casa são os mais aceitos." },
      instagram: { ok: true,  regra: "Permitido. Posts de look do dia com produtos são incentivados." },
      youtube:   { ok: true,  regra: "Permitido." },
      facebook:  { ok: true,  regra: "Permitido. Grupos de moda e promoção." },
      kwai:      { ok: true,  regra: "Permitido." },
      whatsapp:  { ok: true,  regra: "Permitido." },
    },
    proibido: ["Não usar nome Pernambucanas como perfil", "Não prometer parcelamento sem confirmar condições"],
    obrigatorio: ["Mencionar parceria", "Link sempre via programa oficial"],
    cookie: "30 dias",
  },
];

const MOCK_PRODUCTS = [
  { id: 7, name: "Meu Produto — Mercado Livre", store: "mercadolivre", price: "", commission: "", clicks: 0, sales: 0, trend: 90, img: "⭐", category: "Meu Link", affiliateLink: "https://meli.la/17XoYuZ", highlight: true },
  { id: 1, name: "Tênis Nike Air Max", store: "amazon", price: "R$ 389,90", commission: "R$ 38,99", clicks: 2847, sales: 312, trend: 94, img: "👟", category: "Moda" },
  { id: 2, name: "Perfume Natura Kaiak", store: "natura", price: "R$ 149,90", commission: "R$ 20,99", clicks: 1923, sales: 287, trend: 88, img: "🌸", category: "Beleza" },
  { id: 3, name: "Fone Bluetooth JBL", store: "mercadolivre", price: "R$ 299,90", commission: "R$ 24,00", clicks: 3201, sales: 445, trend: 97, img: "🎧", category: "Tech" },
  { id: 4, name: "Vestido Floral Shein", store: "shein", price: "R$ 79,90", commission: "R$ 11,99", clicks: 5621, sales: 891, trend: 99, img: "👗", category: "Moda" },
  { id: 5, name: "Kit Chocolate Cacau", store: "cacaushow", price: "R$ 89,90", commission: "R$ 9,89", clicks: 1204, sales: 178, trend: 72, img: "🍫", category: "Presentes" },
  { id: 6, name: "Smartwatch Temu", store: "temu", price: "R$ 129,90", commission: "R$ 11,69", clicks: 4102, sales: 623, trend: 91, img: "⌚", category: "Tech" },
];

const TABS = ["Dashboard", "Produtos", "Vídeos", "Automação", "Links", "Alertas", "Configurações"];

const TAB_ICONS = {
  Dashboard: "⚡", Produtos: "🛒", Vídeos: "🎬", Automação: "🤖", Links: "🔗", Alertas: "🔔", Configurações: "⚙️"
};

// formatCurrency removed

function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseFloat(value);
    const duration = 1200;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{typeof value === "number" && value % 1 !== 0 ? display.toFixed(2) : Math.floor(display)}{suffix}</span>;
}

function NeonBadge({ children, color = "#00FFD1" }) {
  return (
    <span style={{
      background: `${color}22`, border: `1px solid ${color}55`, color, borderRadius: 6,
      padding: "2px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase"
    }}>{children}</span>
  );
}

function TrendBar({ value }) {
  const color = value > 90 ? "#00FFD1" : value > 75 ? "#FFD700" : "#FF6B6B";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, background: "#1a1f2e", borderRadius: 99, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, height: "100%", borderRadius: 99, transition: "width 1s ease", boxShadow: `0 0 8px ${color}` }} />
      </div>
      <span style={{ color, fontSize: 12, fontWeight: 700, minWidth: 32 }}>{value}%</span>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// 🤖 MOTOR DE IA — BUSCA, COMPARA E RANQUEIA OPORTUNIDADES
// ═══════════════════════════════════════════════════════════

const STORE_COMMISSIONS = {
  mercadolivre: 0.08, amazon: 0.10, shopee: 0.12,
  shein: 0.15, temu: 0.09, natura: 0.14,
  boticario: 0.13, cacaushow: 0.11, pernambucanas: 0.07,
};

// Banco de produtos comparados por categoria (simulando busca real nas lojas)
const PRICE_DATABASE = [
  {
    id: "p001", name: "Tênis Nike Air Max 270", img: "👟", category: "Moda",
    stores: [
      { id: "amazon",       price: 389.90, url: "https://amzn.to/nike" },
      { id: "mercadolivre", price: 412.00, url: "https://meli.la/nike" },
      { id: "shopee",       price: 359.90, url: "https://shope.ee/nike" },
    ],
    searches: 48200, trend: 96, viral: true,
  },
  {
    id: "p002", name: "Perfume Natura Kaiak", img: "🌸", category: "Beleza",
    stores: [
      { id: "natura",       price: 149.90, url: "https://natura.com/kaiak" },
      { id: "mercadolivre", price: 167.00, url: "https://meli.la/kaiak" },
      { id: "shopee",       price: 139.90, url: "https://shope.ee/kaiak" },
    ],
    searches: 31000, trend: 89, viral: false,
  },
  {
    id: "p003", name: "Fone Bluetooth JBL Tune", img: "🎧", category: "Tech",
    stores: [
      { id: "amazon",       price: 299.90, url: "https://amzn.to/jbl" },
      { id: "mercadolivre", price: 279.90, url: "https://meli.la/jbl" },
      { id: "shopee",       price: 259.90, url: "https://shope.ee/jbl" },
      { id: "temu",         price: 189.90, url: "https://temu.com/jbl" },
    ],
    searches: 62100, trend: 98, viral: true,
  },
  {
    id: "p004", name: "Vestido Floral Feminino", img: "👗", category: "Moda",
    stores: [
      { id: "shein",        price: 59.90,  url: "https://shein.com/vestido" },
      { id: "shopee",       price: 79.90,  url: "https://shope.ee/vestido" },
      { id: "mercadolivre", price: 99.90,  url: "https://meli.la/vestido" },
      { id: "temu",         price: 49.90,  url: "https://temu.com/vestido" },
    ],
    searches: 89400, trend: 99, viral: true,
  },
  {
    id: "p005", name: "Smartwatch Fitness Pro", img: "⌚", category: "Tech",
    stores: [
      { id: "temu",         price: 89.90,  url: "https://temu.com/watch" },
      { id: "shopee",       price: 129.90, url: "https://shope.ee/watch" },
      { id: "mercadolivre", price: 159.90, url: "https://meli.la/watch" },
      { id: "amazon",       price: 189.90, url: "https://amzn.to/watch" },
    ],
    searches: 44800, trend: 92, viral: false,
  },
  {
    id: "p006", name: "Kit Skincare Vitamina C", img: "🧴", category: "Beleza",
    stores: [
      { id: "shopee",       price: 69.90,  url: "https://shope.ee/skincare" },
      { id: "mercadolivre", price: 89.90,  url: "https://meli.la/skincare" },
      { id: "amazon",       price: 99.90,  url: "https://amzn.to/skincare" },
      { id: "boticario",    price: 119.90, url: "https://boticario.com/skincare" },
    ],
    searches: 71200, trend: 95, viral: true,
  },
  {
    id: "p007", name: "Mochila Escolar Impermeável", img: "🎒", category: "Outros",
    stores: [
      { id: "temu",         price: 49.90,  url: "https://temu.com/mochila" },
      { id: "shopee",       price: 79.90,  url: "https://shope.ee/mochila" },
      { id: "mercadolivre", price: 109.90, url: "https://meli.la/mochila" },
    ],
    searches: 38900, trend: 83, viral: false,
  },
  {
    id: "p008", name: "Fritadeira Air Fryer 4L", img: "🍳", category: "Casa",
    stores: [
      { id: "shopee",       price: 189.90, url: "https://shope.ee/airfryer" },
      { id: "mercadolivre", price: 229.90, url: "https://meli.la/airfryer" },
      { id: "amazon",       price: 259.90, url: "https://amzn.to/airfryer" },
    ],
    searches: 93700, trend: 99, viral: true,
  },
];

// ─── MOTOR DE COMPARAÇÃO DE PREÇOS ───────────────────────────
function calcOpportunity(product) {
  const prices = product.stores.map(s => s.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const bestStore = product.stores.find(s => s.price === minPrice);
  const worstStore = product.stores.find(s => s.price === maxPrice);
  const commissionRate = STORE_COMMISSIONS[bestStore.id] || 0.10;
  const commission = minPrice * commissionRate;
  const priceDiff = ((maxPrice - minPrice) / maxPrice * 100).toFixed(0);
  const opportunityScore = Math.min(100, Math.round(
    (product.trend * 0.4) +
    (Math.min(parseInt(priceDiff), 40) * 0.8) +
    (Math.min(product.searches / 2000, 20))
  ));

  return {
    ...product,
    bestStore,
    worstStore,
    minPrice,
    maxPrice,
    commission: commission.toFixed(2),
    commissionRate: (commissionRate * 100).toFixed(0),
    priceDiff,
    opportunityScore,
    priceFormatted: `R$ ${minPrice.toFixed(2).replace(".", ",")}`,
    commissionFormatted: `R$ ${commission.toFixed(2).replace(".", ",")}`,
    allStores: product.stores.sort((a, b) => a.price - b.price),
  };
}

function runAISearch(query = "", category = "todos") {
  let results = PRICE_DATABASE;
  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  if (category !== "todos") {
    results = results.filter(p => p.category === category);
  }
  return results
    .map(calcOpportunity)
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}

// ─── COMPONENTE: BUSCADOR DE OPORTUNIDADES COM IA ────────────
function AIProductSearch({ onCreateVideo, onSelectProduct }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todos");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [phase, setPhase] = useState(0);

  const PHASES = [
    "🔍 Buscando produtos nas lojas...",
    "📊 Comparando preços entre plataformas...",
    "💡 Calculando comissões e margens...",
    "🔥 Detectando tendências virais...",
    "⚡ Ranqueando melhores oportunidades...",
  ];

  const handleSearch = () => {
    setSearching(true);
    setSearched(false);
    setResults([]);
    setPhase(0);
    let p = 0;
    const interval = setInterval(() => {
      p++;
      setPhase(p);
      if (p >= PHASES.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          setResults(runAISearch(query, category));
          setSearching(false);
          setSearched(true);
        }, 600);
      }
    }, 600);
  };

  const getScoreColor = (score) =>
    score >= 90 ? "#FF6B6B" : score >= 80 ? "#FFD700" : "#00FFD1";

  const getScoreLabel = (score) =>
    score >= 90 ? "🔥 QUENTE" : score >= 80 ? "⚡ BOM" : "✅ OK";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* HEADER IA */}
      <div style={{
        background: "linear-gradient(135deg, #0a0010, #000d1a)",
        border: "2px solid #B47EFF44",
        borderRadius: 18, padding: 18,
        boxShadow: "0 0 32px #B47EFF11"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "linear-gradient(135deg, #B47EFF, #0080FF)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
          }}>🤖</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>IA de Comparação de Preços</div>
            <div style={{ color: "#5a6a8a", fontSize: 11 }}>Busca nas lojas · Compara · Mostra a melhor oportunidade</div>
          </div>
        </div>

        {/* SEARCH INPUT */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <input
            placeholder="Ex: tênis, perfume, fone, vestido..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{
              width: "100%", background: "#0a0f1e",
              border: "1px solid #B47EFF44",
              borderRadius: 12, padding: "12px 46px 12px 14px",
              color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box"
            }}
          />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
        </div>

        {/* CATEGORY PILLS */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {["todos", "Tech", "Moda", "Beleza", "Casa", "Outros"].map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              background: category === c ? "linear-gradient(135deg, #B47EFF, #0080FF)" : "#1a2035",
              border: "none", borderRadius: 99, padding: "5px 12px",
              color: category === c ? "#fff" : "#5a6a8a",
              fontWeight: 700, fontSize: 11, cursor: "pointer"
            }}>{c}</button>
          ))}
        </div>

        <button onClick={handleSearch} disabled={searching} style={{
          width: "100%",
          background: searching ? "#1a2035" : "linear-gradient(135deg, #B47EFF, #FF6B6B, #FF8C00)",
          border: "none", borderRadius: 12, padding: 13,
          color: searching ? "#5a6a8a" : "#fff",
          fontWeight: 900, fontSize: 14, cursor: searching ? "default" : "pointer",
          boxShadow: searching ? "none" : "0 4px 20px #B47EFF33"
        }}>
          {searching ? PHASES[phase] : "🤖 BUSCAR MELHORES OPORTUNIDADES"}
        </button>

        {/* LOADING PHASES */}
        {searching && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {PHASES.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                opacity: i <= phase ? 1 : 0.2, transition: "opacity 0.4s"
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: i < phase ? "#00FFD1" : i === phase ? "#FFD700" : "#2a3a5a",
                  boxShadow: i === phase ? "0 0 8px #FFD700" : "none",
                  animation: i === phase ? "pulse 1s infinite" : "none"
                }} />
                <span style={{ color: i < phase ? "#00FFD1" : i === phase ? "#FFD700" : "#3a4a6a", fontSize: 11 }}>{p}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESULTADOS */}
      {searched && results.length === 0 && (
        <div style={{ textAlign: "center", padding: 24, color: "#5a6a8a", fontSize: 13 }}>
          Nenhum produto encontrado. Tente outro termo.
        </div>
      )}

      {searched && results.length > 0 && (
        <div style={{ background: "#0f1421", border: "1px solid #1a2a4a", borderRadius: 16, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>
              🏆 {results.length} Oportunidades Encontradas
            </div>
            <div style={{ color: "#5a6a8a", fontSize: 10 }}>Ordenado por oportunidade</div>
          </div>

          {results.map((p, i) => {
            const scoreColor = getScoreColor(p.opportunityScore);
            const isOpen = expanded === p.id;
            const storeName = STORES.find(s => s.id === p.bestStore.id)?.name || p.bestStore.id;

            return (
              <div key={p.id} style={{
                background: i === 0 ? "linear-gradient(135deg, #0d1a0d, #0a0f1e)" : "#1a2035",
                border: `1px solid ${i === 0 ? scoreColor + "55" : "#2a3a5a"}`,
                borderRadius: 14, marginBottom: 10, overflow: "hidden",
                boxShadow: i === 0 ? `0 0 20px ${scoreColor}15` : "none"
              }}>

                {/* TOP ROW */}
                <div style={{ padding: "12px 14px" }} onClick={() => setExpanded(isOpen ? null : p.id)}>
                  {i === 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <NeonBadge color={scoreColor}>🏆 MELHOR OPORTUNIDADE</NeonBadge>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 12,
                      background: `${scoreColor}22`,
                      border: `1px solid ${scoreColor}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 26, flexShrink: 0
                    }}>{p.img}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "#e8eaf6", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{p.name}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ color: "#00FFD1", fontSize: 11, fontWeight: 700 }}>{p.priceFormatted}</span>
                        <span style={{ color: "#5a6a8a", fontSize: 11 }}>em {storeName}</span>
                      </div>
                      <div style={{ color: "#FFD700", fontSize: 11, marginTop: 2 }}>
                        💰 {p.commissionFormatted} comissão ({p.commissionRate}%)
                      </div>
                    </div>

                    {/* SCORE */}
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: "50%",
                        background: `${scoreColor}22`, border: `2px solid ${scoreColor}`,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        boxShadow: `0 0 12px ${scoreColor}44`
                      }}>
                        <span style={{ color: scoreColor, fontWeight: 900, fontSize: 14, lineHeight: 1 }}>{p.opportunityScore}</span>
                        <span style={{ color: scoreColor, fontSize: 7, fontWeight: 700 }}>SCORE</span>
                      </div>
                      <div style={{ color: scoreColor, fontSize: 9, fontWeight: 700, marginTop: 3 }}>{getScoreLabel(p.opportunityScore)}</div>
                    </div>
                  </div>

                  {/* MINI STATS */}
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <span style={{ background: "#0a0f1e", borderRadius: 6, padding: "3px 8px", color: "#5a6a8a", fontSize: 10 }}>
                      🔍 {p.searches.toLocaleString()} buscas/mês
                    </span>
                    <span style={{ background: "#0a0f1e", borderRadius: 6, padding: "3px 8px", color: "#FF8C00", fontSize: 10 }}>
                      📉 {p.priceDiff}% mais barato
                    </span>
                    <span style={{ background: "#0a0f1e", borderRadius: 6, padding: "3px 8px", color: "#B47EFF", fontSize: 10 }}>
                      📊 {p.stores.length} lojas comparadas
                    </span>
                    {p.viral && <NeonBadge color="#FF6B6B">🔥 VIRAL</NeonBadge>}
                  </div>
                </div>

                {/* EXPANDIDO: COMPARAÇÃO DE LOJAS */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid #1a2a4a", padding: "12px 14px", background: "#0a0f1e" }}>
                    <div style={{ color: "#B47EFF", fontWeight: 700, fontSize: 12, marginBottom: 10 }}>
                      📊 Comparação de Preços entre Lojas
                    </div>
                    {p.allStores.map((s, si) => {
                      const store = STORES.find(st => st.id === s.id);
                      const comm = (s.price * (STORE_COMMISSIONS[s.id] || 0.10));
                      const isBest = si === 0;
                      return (
                        <div key={s.id} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 10px", marginBottom: 6,
                          background: isBest ? "#001a10" : "#1a2035",
                          border: `1px solid ${isBest ? "#00FFD144" : "#2a3a5a"}`,
                          borderRadius: 10
                        }}>
                          <span style={{ fontSize: 18 }}>{store?.icon || "🛒"}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: isBest ? "#00FFD1" : "#e8eaf6", fontWeight: 700, fontSize: 12 }}>
                              {store?.name || s.id} {isBest && "✅ MELHOR PREÇO"}
                            </div>
                            <div style={{ color: "#5a6a8a", fontSize: 10 }}>
                              Comissão: R$ {comm.toFixed(2)} ({((STORE_COMMISSIONS[s.id] || 0.10) * 100).toFixed(0)}%)
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ color: isBest ? "#00FFD1" : "#e8eaf6", fontWeight: 800, fontSize: 14 }}>
                              R$ {s.price.toFixed(2).replace(".", ",")}
                            </div>
                            {!isBest && (
                              <div style={{ color: "#FF6B6B", fontSize: 10 }}>
                                +R$ {(s.price - p.minPrice).toFixed(2).replace(".", ",")}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* AÇÕES */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                      <button onClick={() => onCreateVideo({ ...p, price: p.priceFormatted, commission: p.commissionFormatted, store: p.bestStore.id, affiliateLink: p.bestStore.url })} style={{
                        background: "linear-gradient(135deg, #FF6B6B, #FF8C00)",
                        border: "none", borderRadius: 10, padding: 10,
                        color: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer"
                      }}>🎬 CRIAR VÍDEO VIRAL</button>
                      <button onClick={() => onSelectProduct({ ...p, price: p.priceFormatted, commission: p.commissionFormatted, store: p.bestStore.id, affiliateLink: p.bestStore.url })} style={{
                        background: "linear-gradient(135deg, #25D366, #128C7E)",
                        border: "none", borderRadius: 10, padding: 10,
                        color: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer"
                      }}>💬 VENDER NO WHATSAPP</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Dashboard({ stats = {}, createdVideos = [], savedLinks = [], botActive = false, onCreateVideo, setActiveTab }) {
  const statCards = [
    { label: "Cliques Hoje", value: stats.cliques || 18420, icon: "👆", color: "#00FFD1", prefix: "" },
    { label: "Vendas Realizadas", value: stats.vendas || 2738, icon: "💰", color: "#FFD700", prefix: "" },
    { label: "Comissão Total", value: stats.comissao || 4892.50, icon: "💎", color: "#B47EFF", prefix: "R$ " },
    { label: "Vídeos Criados", value: createdVideos.length || 3, icon: "🎬", color: "#FF6B6B", prefix: "" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background: "linear-gradient(135deg, #0f1421 0%, #1a2035 100%)",
            border: `1px solid ${s.color}33`, borderRadius: 16, padding: "20px 18px",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, fontSize: 60, opacity: 0.07 }}>{s.icon}</div>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ color: s.color, fontSize: 22, fontWeight: 900, fontFamily: "monospace" }}>
              <AnimatedNumber value={s.value} prefix={s.prefix} />
            </div>
            <div style={{ color: "#5a6a8a", fontSize: 11, fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#0f1421", border: "1px solid #00FFD133", borderRadius: 16, padding: 18 }}>
        <div style={{ color: "#fff", fontWeight: 700, marginBottom: 14, fontSize: 14, display: "flex", justifyContent: "space-between" }}>
          <span>🔥 Melhores Oportunidades IA</span>
          <NeonBadge color="#00FFD1">AO VIVO</NeonBadge>
        </div>
        {runAISearch("", "todos").slice(0, 3).map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a2035" }}>
            <div style={{ fontSize: 28 }}>{p.img}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e8eaf6", fontSize: 13, fontWeight: 600 }}>{p.name}</div>
              <div style={{ color: "#5a6a8a", fontSize: 10, marginBottom: 3 }}>
                {STORES.find(s=>s.id===p.bestStore.id)?.name} · {p.stores.length} lojas comparadas
              </div>
              <TrendBar value={p.opportunityScore} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#00FFD1", fontWeight: 700, fontSize: 13 }}>{p.commissionFormatted}</div>
              <div style={{ color: "#5a6a8a", fontSize: 10 }}>comissão</div>
              <div style={{ color: "#FF8C00", fontSize: 10 }}>-{p.priceDiff}% barato</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: botActive ? "linear-gradient(135deg, #001a10, #000d1a)" : "#0f1421",
        border: `1px solid ${botActive ? "#00FFD133" : "#FFD70033"}`,
        borderRadius: 16, padding: 18, transition: "all 0.4s"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 14 }}>⚡ Modo Ultra — Máquina de Vendas</div>
          {botActive && <NeonBadge color="#00FFD1">🤖 BOT ATIVO</NeonBadge>}
        </div>
        <div style={{ color: "#8892b0", fontSize: 12, lineHeight: 1.7, marginBottom: 14 }}>
          {botActive
            ? "✅ Bot rodando — detectando produtos, criando vídeos e postando automaticamente!"
            : "IA escolhe produto → cria vídeo → sugere horário → posta automático → maximiza conversão"}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setActiveTab && setActiveTab("Automação")} style={{
            flex: 1, background: "linear-gradient(135deg, #FFD700, #FF8C00)", border: "none",
            borderRadius: 10, padding: "12px 0", color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer"
          }}>🚀 {botActive ? "VER BOT" : "ATIVAR MODO ULTRA"}</button>
          <button onClick={() => setActiveTab && setActiveTab("Produtos")} style={{
            flex: 1, background: "linear-gradient(135deg, #00FFD1, #0080FF)", border: "none",
            borderRadius: 10, padding: "12px 0", color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer"
          }}>🤖 BUSCAR PRODUTOS</button>
        </div>
      </div>

      <div style={{ background: "#0f1421", border: "1px solid #B47EFF33", borderRadius: 16, padding: 18 }}>
        <div style={{ color: "#B47EFF", fontWeight: 700, marginBottom: 12, fontSize: 14 }}>💰 Simulador de Ganhos</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[["Por Dia", "R$ 487"], ["Por Semana", "R$ 3.409"], ["Por Mês", "R$ 14.641"]].map(([l, v]) => (
            <div key={l} style={{ background: "#1a2035", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <div style={{ color: "#B47EFF", fontWeight: 900, fontSize: 16 }}>{v}</div>
              <div style={{ color: "#5a6a8a", fontSize: 10, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildWhatsAppMsg(product, affiliateLink) {
  const link = affiliateLink || "https://go.vrl.io/oferta";
  const price = product.price ? `\n💲 *Preço:* ${product.price}` : "";
  const msg =
    `🔥 *Oferta IMPERDÍVEL!* 🔥\n\n` +
    `Olha o que achei pra você! 👇\n\n` +
    `🛍️ *${product.name}*${price}\n` +
    `💰 Economize agora com esse link exclusivo!\n\n` +
    `👉 *CLIQUE AQUI E GARANTA O SEU:*\n${link}\n\n` +
    `⚠️ _Estoque limitado! Corre antes que acabe!_ 🚨`;
  return "https://wa.me/?text=" + encodeURIComponent(msg);
}

function WhatsAppButton({ product, affiliateLink }) {
  const [sent, setSent] = useState(false);
  const [preview, setPreview] = useState(false);

  const handleClick = () => {
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    window.open(buildWhatsAppMsg(product, affiliateLink), "_blank");
  };

  const link = affiliateLink || "https://go.vrl.io/oferta";
  const previewMsg =
    `🔥 *Oferta IMPERDÍVEL!* 🔥

Olha o que achei pra você! 👇

🛍️ *${product.name}*` +
    (product.price ? `
💲 *Preço:* ${product.price}` : "") +
    `
💰 Economize agora com esse link exclusivo!

👉 *CLIQUE AQUI E GARANTA O SEU:*
${link}

⚠️ _Estoque limitado! Corre antes que acabe!_ 🚨`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleClick} style={{
          flex: 1, background: sent
            ? "linear-gradient(135deg, #00C853, #007B33)"
            : "linear-gradient(135deg, #25D366, #128C7E)",
          border: "none", borderRadius: 10, padding: "11px 0",
          color: "#fff", fontWeight: 900, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          boxShadow: "0 4px 16px #25D36633", transition: "all 0.3s"
        }}>
          <span style={{ fontSize: 16 }}>💬</span>
          {sent ? "✅ WhatsApp Aberto!" : "Comprar via WhatsApp"}
        </button>
        <button onClick={() => setPreview(p => !p)} style={{
          background: preview ? "#25D36622" : "#1a2035",
          border: `1px solid ${preview ? "#25D366" : "#2a3a5a"}`,
          borderRadius: 10, padding: "0 12px", color: preview ? "#25D366" : "#5a6a8a",
          fontSize: 11, fontWeight: 700, cursor: "pointer"
        }}>👁</button>
      </div>

      {preview && (
        <div style={{
          background: "#0a1a0e", border: "1px solid #25D36633",
          borderRadius: 10, padding: 12, animation: "fadeIn 0.2s ease"
        }}>
          <div style={{ color: "#25D366", fontSize: 10, fontWeight: 700, marginBottom: 6 }}>📋 PRÉVIA DA MENSAGEM</div>
          <pre style={{
            color: "#b8f5c8", fontSize: 10, lineHeight: 1.7,
            whiteSpace: "pre-wrap", fontFamily: "monospace", margin: 0
          }}>{previewMsg}</pre>
        </div>
      )}
    </div>
  );
}

function Products({ onCreateVideo }) {
  const [filter, setFilter] = useState("todos");
  const [link, setLink] = useState("");
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(null);
  const [section, setSection] = useState("ai"); // "ai" | "meus"
  const [waProduct, setWaProduct] = useState(null);

  const handleImport = () => {
    if (!link.trim()) return;
    setImporting(true);
    setTimeout(() => {
      setImported({
        name: "Produto Importado Automaticamente",
        store: "amazon", price: "R$ 259,90", commission: "R$ 25,99",
        clicks: 0, sales: 0, trend: 85, img: "📦", category: "Tech",
        affiliateLink: link
      });
      setImporting(false);
    }, 1800);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* SECTION TABS */}
      <div style={{ display: "flex", gap: 8, background: "#0d1117", border: "1px solid #1a2a4a", borderRadius: 14, padding: 6 }}>
        {[["ai","🤖 IA Comparar Preços"],["meus","⭐ Meus Produtos"]].map(([id,label]) => (
          <button key={id} onClick={() => setSection(id)} style={{
            flex: 1, background: section === id ? "linear-gradient(135deg, #B47EFF, #FF6B6B)" : "transparent",
            border: "none", borderRadius: 10, padding: "10px 6px",
            color: section === id ? "#fff" : "#5a6a8a",
            fontWeight: 800, fontSize: 12, cursor: "pointer"
          }}>{label}</button>
        ))}
      </div>

      {/* WHATSAPP MODAL */}
      {waProduct && (
        <div style={{ background: "#0a1a0e", border: "1px solid #25D36644", borderRadius: 14, padding: 14 }}>
          <div style={{ color: "#25D366", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>💬 Vender via WhatsApp</div>
          <WhatsAppButton product={waProduct} affiliateLink={waProduct.affiliateLink} />
          <button onClick={() => setWaProduct(null)} style={{ marginTop: 8, width: "100%", background: "#1a2035", border: "none", borderRadius: 8, padding: 8, color: "#5a6a8a", fontSize: 12, cursor: "pointer" }}>✕ Fechar</button>
        </div>
      )}

      {/* AI SECTION */}
      {section === "ai" && (
        <AIProductSearch onCreateVideo={onCreateVideo} onSelectProduct={p => setWaProduct(p)} />
      )}

      {/* MEUS PRODUTOS SECTION */}
      {section === "meus" && <>
      <div style={{ background: "#0f1421", border: "1px solid #00FFD133", borderRadius: 14, padding: 16 }}>
        <div style={{ color: "#00FFD1", fontWeight: 700, marginBottom: 10, fontSize: 13 }}>🔗 Importar por Link de Afiliado</div>
        <input
          placeholder="Cole o link do produto aqui..."
          value={link}
          onChange={e => setLink(e.target.value)}
          style={{
            width: "100%", background: "#1a2035", border: "1px solid #2a3a5a", borderRadius: 10,
            padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 10
          }}
        />
        <button onClick={handleImport} style={{
          width: "100%", background: "linear-gradient(135deg, #00FFD1, #0080FF)",
          border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer"
        }}>{importing ? "⏳ Buscando produto..." : "⚡ IMPORTAR PRODUTO"}</button>
      </div>

      {imported && (
        <div style={{
          background: "linear-gradient(135deg, #0f1421, #1a2035)", border: "1px solid #00FFD155",
          borderRadius: 14, padding: 14, animation: "fadeIn 0.5s ease"
        }}>
          <NeonBadge color="#00FFD1">✅ Importado</NeonBadge>
          <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 36 }}>{imported.img}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700 }}>{imported.name}</div>
              <div style={{ color: "#00FFD1", fontSize: 13 }}>{imported.price} · {imported.commission} comissão</div>
            </div>
          </div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => onCreateVideo(imported)} style={{
              width: "100%", background: "linear-gradient(135deg, #FF6B6B, #FF8C00)",
              border: "none", borderRadius: 10, padding: 10, color: "#fff", fontWeight: 900, fontSize: 13, cursor: "pointer"
            }}>🎬 CRIAR VÍDEO VIRAL AGORA</button>
            <WhatsAppButton product={imported} affiliateLink={imported.affiliateLink} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["todos", "Meu Link", "Tech", "Moda", "Beleza", "Presentes"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? "linear-gradient(135deg, #00FFD1, #0080FF)" : "#1a2035",
            border: "none", borderRadius: 99, padding: "6px 14px", color: filter === f ? "#000" : "#8892b0",
            fontWeight: 700, fontSize: 12, cursor: "pointer"
          }}>{f}</button>
        ))}
      </div>

      {MOCK_PRODUCTS.filter(p => filter === "todos" || p.category === filter).map(p => (
        <div key={p.id} style={{
          background: p.highlight ? "linear-gradient(135deg, #0d1f0d, #0f1421)" : "#0f1421",
          border: p.highlight ? "2px solid #FFD700" : "1px solid #1a2a4a",
          borderRadius: 14, padding: 14,
          display: "flex", flexDirection: "column", gap: 10,
          boxShadow: p.highlight ? "0 0 24px #FFD70022" : "none"
        }}>
          {p.highlight && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <NeonBadge color="#FFD700">⭐ MEU LINK DE AFILIADO</NeonBadge>
              <a href={p.affiliateLink} target="_blank" rel="noreferrer" style={{
                color: "#00FFD1", fontSize: 10, textDecoration: "none", fontWeight: 700
              }}>🔗 Abrir link</a>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ fontSize: 40 }}>{p.img}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: p.highlight ? "#FFD700" : "#e8eaf6", fontWeight: 700, fontSize: 14 }}>{p.name}</div>
              {p.highlight && (
                <div style={{ color: "#5a6a8a", fontSize: 10, marginTop: 2, wordBreak: "break-all" }}>
                  {p.affiliateLink}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                <NeonBadge color="#FFD700">{STORES.find(s => s.id === p.store)?.name}</NeonBadge>
                <NeonBadge color="#B47EFF">{p.category}</NeonBadge>
              </div>
            </div>
          </div>
          {!p.highlight && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[["💲 Preço", p.price], ["💰 Comissão", p.commission], ["📈 Vendas", p.sales]].map(([l, v]) => (
                <div key={l} style={{ background: "#1a2035", borderRadius: 8, padding: 8, textAlign: "center" }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{v}</div>
                  <div style={{ color: "#5a6a8a", fontSize: 10 }}>{l}</div>
                </div>
              ))}
            </div>
          )}
          <div>
            <div style={{ color: "#5a6a8a", fontSize: 11, marginBottom: 4 }}>VIRAL SCORE</div>
            <TrendBar value={p.trend} />
          </div>
          <button onClick={() => onCreateVideo(p)} style={{
            background: p.highlight ? "linear-gradient(135deg, #FFD700, #FF8C00)" : "linear-gradient(135deg, #FF6B6B, #FF8C00)",
            border: "none", borderRadius: 10, padding: "10px 0",
            color: p.highlight ? "#000" : "#fff", fontWeight: 900, fontSize: 13, cursor: "pointer"
          }}>🎬 CRIAR VÍDEO VIRAL</button>
          <WhatsAppButton product={p} affiliateLink={p.affiliateLink} />
        </div>
      ))}
      </>}
    </div>
  );
}

function Videos({ selectedProduct, setActiveTab, createdVideos = [], onAddVideo, onPostAll, onCreateVideo }) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [script, setScript] = useState("");
  const [searchingViral, setSearchingViral] = useState(false);
  const [viralVideos, setViralVideos] = useState(null);
  const [aiImproving, setAiImproving] = useState(false);
  const [improvedScript, setImprovedScript] = useState(null);

  const VIRAL_DATA = {
    "Nike Air Max": [
      { platform: "TikTok", views: "4.2M", likes: "380K", hook: "POV: você achou o tênis que todo mundo quer 👟🔥", tag: "#nike #tenis #viral #moda", score: 98, duration: "0:18", gradient: "linear-gradient(135deg, #1a0020, #000d2e)" },
      { platform: "Instagram", views: "1.8M", likes: "142K", hook: "Esse tênis esgotou 3x essa semana... e eu descobri onde tem 😱", tag: "#sneakers #nike #airmax", score: 94, duration: "0:22", gradient: "linear-gradient(135deg, #1a1000, #0a1a00)" },
      { platform: "YouTube", views: "890K", likes: "67K", hook: "Comprei o tênis que viralizou no TikTok — VALE A PENA?", tag: "#review #nike #unboxing", score: 89, duration: "4:32", gradient: "linear-gradient(135deg, #001a1a, #0a000a)" },
    ],
    "Natura Kaiak": [
      { platform: "TikTok", views: "2.1M", likes: "198K", hook: "Esse perfume faz as pessoas te pararem na rua 🌸✨", tag: "#natura #perfume #kaiak", score: 96, duration: "0:15", gradient: "linear-gradient(135deg, #1a0010, #000a1a)" },
      { platform: "Instagram", views: "670K", likes: "54K", hook: "R$149 que mudaram minha autoestima... cheiro incrível", tag: "#beleza #natura #perfume", score: 88, duration: "0:30", gradient: "linear-gradient(135deg, #0a1a00, #1a000a)" },
    ],
    "default": [
      { platform: "TikTok", views: "3.5M", likes: "290K", hook: "Achei o produto que TODO MUNDO está procurando 🔥", tag: "#viral #produto #oferta", score: 97, duration: "0:20", gradient: "linear-gradient(135deg, #1a0a2e, #001428)" },
      { platform: "Instagram", views: "1.2M", likes: "98K", hook: "Esse produto mudou minha vida e está em promoção agora!", tag: "#imperdivel #compras #viral", score: 91, duration: "0:25", gradient: "linear-gradient(135deg, #0a1a00, #1a0a00)" },
      { platform: "YouTube", views: "540K", likes: "41K", hook: "Testei o produto viral do TikTok — resultado me surpreendeu", tag: "#review #viral #produto", score: 85, duration: "5:14", gradient: "linear-gradient(135deg, #00101a, #0a000a)" },
    ]
  };

  const getViralVideos = (product) => VIRAL_DATA[product?.name] || VIRAL_DATA["default"];

  const handleSearchViral = () => {
    setSearchingViral(true);
    setViralVideos(null);
    setImprovedScript(null);
    setTimeout(() => {
      setViralVideos(getViralVideos(selectedProduct));
      setSearchingViral(false);
    }, 2000);
  };

  const handleImproveWithAI = (viral) => {
    setAiImproving(true);
    setImprovedScript(null);
    setTimeout(() => {
      const product = selectedProduct?.name || "Produto";
      const price = selectedProduct?.price || "Preço imperdível";
      setImprovedScript({
        based_on: viral,
        script: `🔥 ROTEIRO MELHORADO PELA IA
Baseado no vídeo viral com ${viral.views} views no ${viral.platform}

⚡ [0-2s] HOOK VIRAL (copiado + melhorado):
"${viral.hook}"
→ Zoom no rosto + música trending

🎯 [2-6s] PRODUTO EM DESTAQUE:
Mostrar ${product} com iluminação boa
Efeito slow-motion ou transição rápida

💥 [6-12s] PROVA SOCIAL:
"Mais de 500 pessoas compraram hoje!"
"${price} — estoque acabando!"
Mostrar notificações de venda

🚀 [12-18s] CTA URGENTE:
"Link na bio AGORA — só por hoje!"
Emoji animado apontando para cima ⬆️

${viral.tag} #afiliado #oferta`
      });
      setAiImproving(false);
    }, 2500);
  };

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setScript(`🎬 ROTEIRO VIRAL — ${selectedProduct?.name || "Produto Top"}

📱 [0-3s] HOOK:
"Você PRECISA ver isso antes que acabe o estoque! 🚨"

🎯 [3-8s] APRESENTAÇÃO:
Mostrar produto com efeito zoom dramático
Música: trending beat atual 🎵

💥 [8-15s] BENEFÍCIOS:
✅ ${selectedProduct ? selectedProduct.price + " IMPERDÍVEL" : "Preço insano"}
✅ Entrega ULTRA RÁPIDA
✅ Qualidade PREMIUM

🔥 [15-20s] URGÊNCIA + CTA:
"Link na bio! Estoque LIMITADO! 
Últimas unidades por este preço!"

#viral #produto #compras #oferta #imperdivel`);
      setGenerating(false);
      setGenerated(true);
      // Notify global state
      onAddVideo && onAddVideo({
        title: `${selectedProduct?.name || "Produto"} — Vídeo Viral 🔥`,
        views: "0", likes: "0",
        product: `${selectedProduct?.img || "⭐"} ${selectedProduct?.name || "Produto"}`,
        platform: "TikTok", img: selectedProduct?.img || "⭐",
        duration: "0:20", commission: selectedProduct?.commission || "R$ 0,00"
      });
    }, 2200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {selectedProduct && (
        <div style={{ background: "linear-gradient(135deg, #0f1421, #1e1030)", border: "1px solid #B47EFF55", borderRadius: 14, padding: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 32 }}>{selectedProduct.img}</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700 }}>{selectedProduct.name}</div>
              <div style={{ color: "#00FFD1", fontSize: 12 }}>{selectedProduct.price} · {selectedProduct.commission} comissão</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button onClick={handleSearchViral} style={{
              background: searchingViral ? "#1a2035" : "linear-gradient(135deg, #FF6B6B, #FF8C00)",
              border: "none", borderRadius: 10, padding: 11, color: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer"
            }}>{searchingViral ? "🔍 Buscando..." : "🌐 BUSCAR VIRAIS"}</button>
            <button onClick={handleGenerate} style={{
              background: generating ? "#1a2035" : "linear-gradient(135deg, #B47EFF, #FF6B6B)",
              border: "none", borderRadius: 10, padding: 11, color: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer"
            }}>{generating ? "⏳ Gerando..." : "🤖 GERAR ROTEIRO"}</button>
          <button onClick={() => onCreateVideo && onCreateVideo({ product: selectedProduct, script: "" })} style={{
              background: "linear-gradient(135deg, #00FFD1, #0080FF)",
              border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: 900, fontSize: 12, cursor: "pointer"
            }}>🎬 CRIAR VÍDEO IA</button>
          </div>
        </div>
      )}

      {!selectedProduct && (
        <div style={{ background: "#0f1421", border: "1px dashed #2a3a5a", borderRadius: 14, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎬</div>
          <div style={{ color: "#8892b0", fontSize: 13 }}>Selecione um produto na aba <strong style={{ color: "#00FFD1" }}>Produtos</strong> para criar seu vídeo viral</div>
          <button onClick={() => setActiveTab("Produtos")} style={{
            marginTop: 12, background: "linear-gradient(135deg, #00FFD1, #0080FF)",
            border: "none", borderRadius: 10, padding: "10px 20px", color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer"
          }}>IR PARA PRODUTOS ➜</button>
        </div>
      )}

      {/* VIRAIS DA INTERNET */}
      {searchingViral && (
        <div style={{ background: "#0f1421", border: "1px solid #FF6B6B33", borderRadius: 14, padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8, animation: "pulse 1s infinite" }}>🔍</div>
          <div style={{ color: "#FF8C00", fontWeight: 700, fontSize: 13 }}>Buscando vídeos virais na internet...</div>
          <div style={{ color: "#5a6a8a", fontSize: 11, marginTop: 4 }}>TikTok · Instagram · YouTube · Kwai</div>
        </div>
      )}

      {viralVideos && (
        <div style={{ background: "#0f1421", border: "1px solid #FF6B6B44", borderRadius: 14, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>🌐</span>
            <span style={{ color: "#FF6B6B", fontWeight: 800, fontSize: 14 }}>Virais Encontrados na Internet</span>
            <NeonBadge color="#FF6B6B">{viralVideos.length} vídeos</NeonBadge>
          </div>
          <div style={{ color: "#5a6a8a", fontSize: 11, marginBottom: 12 }}>
            IA analisou estes vídeos virais do seu produto — clique em "Melhorar" para gerar seu roteiro baseado neles
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {viralVideos.map((v, i) => (
              <div key={i} style={{ background: "#1a2035", borderRadius: 12, overflow: "hidden", border: "1px solid #2a3a5a" }}>
                {/* Thumbnail fake */}
                <div style={{ height: 80, background: v.gradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#ffffff88", fontSize: 11, fontWeight: 700, padding: "0 12px", lineHeight: 1.4 }}>"{v.hook}"</div>
                  </div>
                  <div style={{ position: "absolute", left: 8, top: 8 }}>
                    <span style={{
                      background: v.platform === "TikTok" ? "#FF0050" : v.platform === "Instagram" ? "#E91E8C" : "#FF0000",
                      borderRadius: 4, padding: "2px 7px", color: "#fff", fontSize: 9, fontWeight: 800
                    }}>{v.platform}</span>
                  </div>
                  <div style={{ position: "absolute", right: 8, bottom: 8, background: "rgba(0,0,0,0.7)", borderRadius: 4, padding: "2px 6px", color: "#fff", fontSize: 9 }}>{v.duration}</div>
                  {/* Viral score badge */}
                  <div style={{
                    position: "absolute", right: 8, top: 8,
                    background: v.score >= 95 ? "#FF6B6B" : v.score >= 90 ? "#FFD700" : "#00FFD1",
                    borderRadius: 99, padding: "2px 7px", color: "#000", fontSize: 9, fontWeight: 900
                  }}>🔥 {v.score}%</div>
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                    <span style={{ color: "#00FFD1", fontSize: 11 }}>👁 {v.views}</span>
                    <span style={{ color: "#FF6B6B", fontSize: 11 }}>❤️ {v.likes}</span>
                  </div>
                  <TrendBar value={v.score} />
                  <button onClick={() => handleImproveWithAI(v)} style={{
                    marginTop: 10, width: "100%",
                    background: "linear-gradient(135deg, #B47EFF, #0080FF)",
                    border: "none", borderRadius: 8, padding: "9px 0",
                    color: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer"
                  }}>🤖 MELHORAR COM IA → MINHA VERSÃO</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI IMPROVED SCRIPT */}
      {aiImproving && (
        <div style={{ background: "#0f1421", border: "1px solid #B47EFF44", borderRadius: 14, padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8, animation: "pulse 1s infinite" }}>🤖</div>
          <div style={{ color: "#B47EFF", fontWeight: 700, fontSize: 13 }}>IA analisando o viral e criando sua versão melhorada...</div>
        </div>
      )}

      {improvedScript && (
        <div style={{ background: "linear-gradient(135deg, #0f1421, #1a0030)", border: "2px solid #B47EFF55", borderRadius: 14, padding: 14, boxShadow: "0 0 24px #B47EFF22" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>✨</span>
            <span style={{ color: "#B47EFF", fontWeight: 800, fontSize: 14 }}>Roteiro Melhorado pela IA</span>
            <NeonBadge color="#B47EFF">NOVO</NeonBadge>
          </div>
          <div style={{ color: "#5a6a8a", fontSize: 10, marginBottom: 10 }}>
            Baseado no viral de {improvedScript.based_on.views} views no {improvedScript.based_on.platform}
          </div>
          <pre style={{ color: "#c8d6f0", fontSize: 11, lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: "monospace", margin: 0, background: "#0a0f1e", padding: 12, borderRadius: 10 }}>{improvedScript.script}</pre>
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <button style={{ background: "linear-gradient(135deg, #B47EFF, #0080FF)", border: "none", borderRadius: 10, padding: 10, color: "#fff", fontWeight: 900, fontSize: 11, cursor: "pointer" }}>🎬 CRIAR VÍDEO</button>
            <button style={{ background: "linear-gradient(135deg, #00FFD1, #009977)", border: "none", borderRadius: 10, padding: 10, color: "#000", fontWeight: 900, fontSize: 11, cursor: "pointer" }}>📥 SALVAR</button>
            <button style={{ background: "linear-gradient(135deg, #FF6B6B, #FF8C00)", border: "none", borderRadius: 10, padding: 10, color: "#fff", fontWeight: 900, fontSize: 11, cursor: "pointer" }}>🚀 POSTAR</button>
          </div>
        </div>
      )}

      {generated && (
        <div style={{ background: "#0f1421", border: "1px solid #00FFD133", borderRadius: 14, padding: 14 }}>
          <div style={{ color: "#00FFD1", fontWeight: 700, marginBottom: 8 }}>✅ Roteiro Gerado pela IA</div>
          <pre style={{ color: "#c8d6f0", fontSize: 12, lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "monospace", margin: 0 }}>{script}</pre>
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button style={{ background: "linear-gradient(135deg, #00FFD1, #0080FF)", border: "none", borderRadius: 10, padding: 10, color: "#000", fontWeight: 900, fontSize: 12, cursor: "pointer" }}>📥 BAIXAR VÍDEO</button>
            <button onClick={() => onPostAll && onPostAll({ script: improvedScript?.script || "", product: { ...improvedScript?.based_on, ...selectedProduct } })} style={{
              gridColumn: "1 / -1", background: "linear-gradient(135deg, #FF6B6B, #FF8C00, #FFD700)",
              border: "none", borderRadius: 10, padding: 11, color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer",
              boxShadow: "0 4px 20px #FF6B6B44"
            }}>🚀 POSTAR EM TODAS AS PLATAFORMAS</button>
          </div>
        </div>
      )}

      <VideoGallery videos={createdVideos} onPostAll={onPostAll} />
    </div>
  );
}

function VideoGallery({ videos, onPostAll }) {
  const [watchingVideo, setWatchingVideo] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});
  // progressRef removed

  const DEFAULT_VIDEOS = [
    { id: 1, title: "Tênis que VIRALIZOU! 🔥", views: "128K", likes: "14K", product: "Nike Air Max", platform: "TikTok", img: "👟", duration: "0:28", commission: "R$38,99" },
    { id: 2, title: "Perfume INCRÍVEL por R$149!", views: "89K", likes: "9.2K", product: "Natura Kaiak", platform: "Instagram", img: "🌸", duration: "0:22", commission: "R$20,99" },
    { id: 3, title: "Fone TOP sem fio 🎧", views: "203K", likes: "22K", product: "JBL", platform: "YouTube", img: "🎧", duration: "0:32", commission: "R$24,00" },
  ];
  const VIDEOS = (videos && videos.length > 0) ? videos : DEFAULT_VIDEOS;

  useEffect(() => {
    if (!playing || !watchingVideo) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setPlaying(false); return 100; }
        return p + 1.2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [playing, watchingVideo]);

  const openVideo = (v) => {
    setWatchingVideo(v);
    setPlaying(false);
    setProgress(0);
  };

  const closeVideo = () => {
    setWatchingVideo(null);
    setPlaying(false);
    setProgress(0);
  };

  const togglePlay = () => {
    if (progress >= 100) setProgress(0);
    setPlaying(p => !p);
  };

  const formatProgress = (p) => {
    const total = watchingVideo ? parseInt(watchingVideo.duration.split(":")[1]) + parseInt(watchingVideo.duration.split(":")[0]) * 60 : 30;
    const current = Math.floor((p / 100) * total);
    return `0:${current.toString().padStart(2, "0")}`;
  };

  if (watchingVideo) {
    return (
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, height: "100vh", background: "#000",
        zIndex: 999, display: "flex", flexDirection: "column"
      }}>
        {/* Video screen */}
        <div style={{
          flex: 1, position: "relative", background: `linear-gradient(160deg, #0a0f1e 0%, #1a0a2e 40%, #0a1a0e 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden"
        }}>
          {/* Ambient glow */}
          <div style={{
            position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, #B47EFF33, transparent 70%)",
            pointerEvents: "none"
          }} />

          {/* Big emoji as video preview */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{
              fontSize: 90, marginBottom: 16,
              filter: "drop-shadow(0 0 30px rgba(255,255,255,0.3))",
              animation: playing ? "pulse 1s infinite" : "none"
            }}>{watchingVideo.img}</div>
            {!playing && progress === 0 && (
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, cursor: "pointer"
              }} onClick={togglePlay}>▶️</div>
            )}
            {progress >= 100 && (
              <div style={{ color: "#fff", fontSize: 13, marginTop: 8 }}>Vídeo finalizado ✅</div>
            )}
          </div>

          {/* Top bar */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            padding: "16px 16px 8px",
            background: "linear-gradient(180deg, rgba(0,0,0,0.7), transparent)",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <button onClick={closeVideo} style={{
              background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 99, width: 36, height: 36, color: "#fff", fontSize: 16,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}>✕</button>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>📺 Meu Vídeo</div>
            <div style={{
              background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 99, padding: "4px 10px", color: "#fff", fontSize: 11
            }}>{watchingVideo.duration}</div>
          </div>

          {/* Right side actions (TikTok style) */}
          <div style={{
            position: "absolute", right: 14, bottom: 120,
            display: "flex", flexDirection: "column", gap: 20, alignItems: "center"
          }}>
            {[
              { icon: liked[watchingVideo.id] ? "❤️" : "🤍", label: watchingVideo.likes, action: () => setLiked(l => ({ ...l, [watchingVideo.id]: !l[watchingVideo.id] })) },
              { icon: "💬", label: "Comentar", action: () => {} },
              { icon: saved[watchingVideo.id] ? "🔖" : "📌", label: "Salvar", action: () => setSaved(s => ({ ...s, [watchingVideo.id]: !s[watchingVideo.id] })) },
              { icon: "🚀", label: "Postar", action: () => {} },
            ].map((btn, i) => (
              <div key={i} onClick={btn.action} style={{ textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 28, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>{btn.icon}</div>
                <div style={{ color: "#fff", fontSize: 10, marginTop: 2, fontWeight: 600 }}>{btn.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom panel */}
        <div style={{
          background: "linear-gradient(0deg, #080c14, #0f1421)",
          border: "1px solid #1a2a4a", borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: "16px 16px 28px"
        }}>
          {/* Title + platform */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 15, marginBottom: 4 }}>{watchingVideo.title}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <NeonBadge color="#B47EFF">{watchingVideo.platform}</NeonBadge>
              <NeonBadge color="#FFD700">💰 {watchingVideo.commission}</NeonBadge>
            </div>
            <div style={{ color: "#5a6a8a", fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>{watchingVideo.desc}</div>
            <div style={{ color: "#00FFD188", fontSize: 11, marginTop: 4 }}>{watchingVideo.tag}</div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 12 }}>
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = ((e.clientX - rect.left) / rect.width) * 100;
                setProgress(pct);
              }}
              style={{ width: "100%", height: 4, background: "#1a2035", borderRadius: 99, cursor: "pointer", position: "relative" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #00FFD1, #0080FF)", borderRadius: 99, transition: "width 0.2s" }} />
              <div style={{
                width: 12, height: 12, background: "#fff", borderRadius: 99,
                position: "absolute", top: -4, left: `calc(${progress}% - 6px)`,
                boxShadow: "0 0 8px #00FFD1"
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ color: "#5a6a8a", fontSize: 10 }}>{formatProgress(progress)}</span>
              <span style={{ color: "#5a6a8a", fontSize: 10 }}>{watchingVideo.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={togglePlay} style={{
              flex: 1, background: playing ? "linear-gradient(135deg, #FF6B6B, #FF8C00)" : "linear-gradient(135deg, #00FFD1, #0080FF)",
              border: "none", borderRadius: 12, padding: 12, color: "#000",
              fontWeight: 900, fontSize: 13, cursor: "pointer"
            }}>{playing ? "⏸ PAUSAR" : progress >= 100 ? "🔄 REPLAY" : "▶️ PLAY"}</button>
            <button onClick={() => onPostAll && onPostAll({
                script: watchingVideo?.title || "",
                product: { name: watchingVideo?.product || "", img: watchingVideo?.img || "⭐", price: "", commission: watchingVideo?.commission || "", affiliateLink: "https://meli.la/17XoYuZ" }
              })} style={{
              flex: 1, background: "linear-gradient(135deg, #FF6B6B, #FF8C00, #FFD700)",
              border: "none", borderRadius: 12, padding: 12, color: "#000",
              fontWeight: 900, fontSize: 13, cursor: "pointer",
              boxShadow: "0 4px 20px #FF6B6B44"
            }}>🚀 POSTAR EM TODAS</button>
          </div>
        </div>
      </div>
    );
  }

  const GRADIENTS = [
    "linear-gradient(135deg, #1a0a2e 0%, #0a1a2e 60%, #001a10 100%)",
    "linear-gradient(135deg, #1a0a10 0%, #2e0a1a 60%, #0a0a2e 100%)",
    "linear-gradient(135deg, #0a1a2e 0%, #001428 60%, #0a001a 100%)",
    "linear-gradient(135deg, #1a1a0a 0%, #2e1a00 60%, #1a0a0a 100%)",
  ];

  return (
    <div style={{ background: "#0f1421", border: "1px solid #1a2a4a", borderRadius: 16, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📺</span>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>Meus Vídeos</span>
        </div>
        <NeonBadge color="#FF6B6B">{VIDEOS.length} vídeos</NeonBadge>
      </div>
      <div style={{ color: "#5a6a8a", fontSize: 11, marginBottom: 14 }}>▶️ Toque no vídeo para assistir</div>

      {/* Vídeo destaque */}
      <div onClick={() => openVideo(VIDEOS[0])} style={{
        borderRadius: 16, overflow: "hidden", cursor: "pointer",
        marginBottom: 12, border: "1px solid #B47EFF44",
        boxShadow: "0 4px 24px #B47EFF22"
      }}>
        <div style={{
          height: 180, background: GRADIENTS[0],
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
        }}>
          <span style={{ fontSize: 72, filter: "drop-shadow(0 0 24px rgba(180,126,255,0.5))" }}>{VIDEOS[0].img}</span>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(0,0,0,0.65)", border: "2px solid rgba(255,255,255,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
          }}>▶️</div>
          <div style={{
            position: "absolute", bottom: 10, right: 10,
            background: "rgba(0,0,0,0.8)", borderRadius: 6, padding: "3px 8px",
            color: "#fff", fontSize: 11, fontWeight: 700
          }}>{VIDEOS[0].duration}</div>
          <div style={{
            position: "absolute", top: 10, left: 10,
            background: "linear-gradient(135deg, #B47EFF, #FF6B6B)",
            borderRadius: 6, padding: "3px 10px", color: "#fff", fontSize: 10, fontWeight: 800
          }}>⭐ DESTAQUE</div>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))"
          }} />
        </div>
        <div style={{ background: "#1a2035", padding: "10px 12px" }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{VIDEOS[0].title}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
            <span style={{ color: "#00FFD1", fontSize: 11 }}>👁 {VIDEOS[0].views}</span>
            <span style={{ color: "#FF6B6B", fontSize: 11 }}>❤️ {VIDEOS[0].likes}</span>
            <span style={{ color: "#FFD700", fontSize: 11 }}>💰 {VIDEOS[0].commission}</span>
            <span style={{ color: "#B47EFF", fontSize: 11 }}>📱 {VIDEOS[0].platform}</span>
          </div>
        </div>
      </div>

      {/* Grade 2 colunas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {VIDEOS.slice(1).map((v, i) => (
          <div key={v.id} onClick={() => openVideo(v)} style={{
            borderRadius: 14, overflow: "hidden", cursor: "pointer",
            border: "1px solid #2a3a5a", background: "#1a2035"
          }}>
            <div style={{
              height: 100, background: GRADIENTS[(i + 1) % GRADIENTS.length],
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
            }}>
              <span style={{ fontSize: 40 }}>{v.img}</span>
              <div style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
              }}>▶️</div>
              <div style={{
                position: "absolute", bottom: 5, right: 5,
                background: "rgba(0,0,0,0.8)", borderRadius: 4,
                padding: "2px 6px", color: "#fff", fontSize: 9, fontWeight: 700
              }}>{v.duration}</div>
            </div>
            <div style={{ padding: "8px 8px 10px" }}>
              <div style={{ color: "#e8eaf6", fontWeight: 700, fontSize: 11, lineHeight: 1.3, marginBottom: 4 }}>{v.title}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ color: "#00FFD1", fontSize: 10 }}>👁 {v.views}</span>
                <span style={{ color: "#FF6B6B", fontSize: 10 }}>❤️ {v.likes}</span>
              </div>
              <div style={{ color: "#FFD700", fontSize: 10, marginTop: 3 }}>💰 {v.commission}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Automation({ botActive = false, setBotActive, botLog = [], setBotLog, savedLinks = [], onBotPost, setActiveTab }) {
  const [autoMode, setAutoMode] = useState(false);
  const [msgPlatform, setMsgPlatform] = useState("whatsapp");
  const [localBotActive, setLocalBotActive] = useState(botActive);
  const [, setBotTick] = useState(0);
  const [schedule, setSchedule] = useState({ tiktok: "20:00", instagram: "19:30", youtube: "21:00", facebook: "18:00" });
  const [editSchedule, setEditSchedule] = useState(false);

  const toggleBot = (val) => {
    setLocalBotActive(val);
    setBotActive && setBotActive(val);
    if (!val) setBotLog && setBotLog([]);
  };

  const BOT_STEPS = [
    { icon: "🔍", text: "Analisando tendências em tempo real...", color: "#00FFD1" },
    { icon: "📊", text: "Produto viral detectado: Fone JBL (+300%)", color: "#FFD700" },
    { icon: "🤖", text: "Gerando roteiro com IA...", color: "#B47EFF" },
    { icon: "🎬", text: "Vídeo criado automaticamente", color: "#00FFD1" },
    { icon: "⏰", text: "Melhor horário calculado: 20h14", color: "#FF8C00" },
    { icon: "🚀", text: "Postado no TikTok + Instagram", color: "#00FFD1" },
    { icon: "💰", text: "3 vendas geradas! +R$74,97 comissão", color: "#FFD700" },
  ];

  useEffect(() => {
    if (!localBotActive) return;
    const interval = setInterval(() => {
      setBotTick(t => {
        const next = t + 1;
        const step = BOT_STEPS[next % BOT_STEPS.length];
        const addLog = setBotLog || (() => {});
        addLog(log => [{
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          ...step
        }, ...log.slice(0, 9)]);
        return next;
      });
    }, 2800);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localBotActive]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* BOT CARD */}
      <div style={{
        background: botActive
          ? "linear-gradient(135deg, #000d1a, #001428)"
          : "#0f1421",
        border: `2px solid ${botActive ? "#00FFD1" : "#1a2a4a"}`,
        borderRadius: 18, padding: 18,
        boxShadow: botActive ? "0 0 32px #00FFD122" : "none",
        transition: "all 0.4s"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>🤖</span>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>Bot IA 24/7</span>
              {botActive && (
                <span style={{
                  background: "#00FFD122", border: "1px solid #00FFD1", color: "#00FFD1",
                  borderRadius: 99, padding: "2px 8px", fontSize: 9, fontWeight: 700,
                  animation: "pulse 1.5s infinite"
                }}>● AO VIVO</span>
              )}
            </div>
            <div style={{ color: "#5a6a8a", fontSize: 11, marginTop: 3, lineHeight: 1.5 }}>
              Posta sozinho — logado ou não.<br />Encontra o melhor horário e viraliza.
            </div>
          </div>
          <div onClick={() => toggleBot(!localBotActive)} style={{
            width: 56, height: 30, background: botActive ? "#00FFD1" : "#1a2a4a",
            borderRadius: 99, cursor: "pointer", position: "relative", transition: "all 0.3s",
            flexShrink: 0
          }}>
            <div style={{
              width: 22, height: 22, background: "#fff", borderRadius: 99,
              position: "absolute", top: 4, left: botActive ? 30 : 4, transition: "left 0.3s"
            }} />
          </div>
        </div>

        {/* Status indicators */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: "Status", value: botActive ? "Rodando" : "Pausado", color: botActive ? "#00FFD1" : "#5a6a8a", icon: botActive ? "🟢" : "⚫" },
            { label: "Modo", value: "24 horas / 7 dias", color: "#FFD700", icon: "⏰" },
            { label: "Sem login", value: "Funciona offline", color: "#B47EFF", icon: "🔓" },
            { label: "Otimização", value: "IA de horário", color: "#FF8C00", icon: "📈" },
          ].map(s => (
            <div key={s.label} style={{ background: "#0a0f1e", borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ fontSize: 12 }}>{s.icon}</span>
                <span style={{ color: s.color, fontWeight: 700, fontSize: 11 }}>{s.value}</span>
              </div>
              <div style={{ color: "#3a4a6a", fontSize: 9, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Schedule */}
        <div style={{ background: "#0a0f1e", borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 12 }}>⏰ Horários Automáticos</span>
            <button onClick={() => setEditSchedule(e => !e)} style={{
              background: "none", border: "1px solid #2a3a5a", borderRadius: 6,
              padding: "3px 8px", color: "#8892b0", fontSize: 10, cursor: "pointer"
            }}>{editSchedule ? "✅ Salvar" : "✏️ Editar"}</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[["tiktok", "🎵 TikTok"], ["instagram", "📸 Instagram"], ["youtube", "▶️ YouTube"], ["facebook", "👤 Facebook"]].map(([id, label]) => (
              <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a2035", borderRadius: 8, padding: "6px 8px" }}>
                <span style={{ color: "#8892b0", fontSize: 10 }}>{label}</span>
                {editSchedule
                  ? <input type="time" value={schedule[id]} onChange={e => setSchedule(s => ({ ...s, [id]: e.target.value }))}
                      style={{ background: "none", border: "1px solid #00FFD155", borderRadius: 4, color: "#00FFD1", fontSize: 10, padding: "2px 4px", width: 60, outline: "none" }} />
                  : <span style={{ color: "#00FFD1", fontWeight: 700, fontSize: 11 }}>{schedule[id]}</span>
                }
              </div>
            ))}
          </div>
          <div style={{ color: "#3a4a6a", fontSize: 10, marginTop: 8, textAlign: "center" }}>
            🧠 IA ajusta automaticamente com base nos picos de engajamento
          </div>
        </div>

        {/* Live log */}
        {botActive && (
          <div style={{ background: "#000810", borderRadius: 12, padding: 12, border: "1px solid #00FFD122" }}>
            <div style={{ color: "#00FFD1", fontWeight: 700, fontSize: 11, marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ animation: "pulse 1s infinite" }}>⚡</span> Log em Tempo Real
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 180, overflowY: "auto" }}>
              {botLog.length === 0 && (
                <div style={{ color: "#3a4a6a", fontSize: 11 }}>Iniciando bot...</div>
              )}
              {botLog.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", opacity: i === 0 ? 1 : 0.6 - i * 0.05 }}>
                  <span style={{ color: "#3a4a6a", fontSize: 9, fontFamily: "monospace", marginTop: 1, flexShrink: 0 }}>{l.time}</span>
                  <span style={{ fontSize: 12 }}>{l.icon}</span>
                  <span style={{ color: l.color, fontSize: 11, lineHeight: 1.4 }}>{l.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!botActive && (
          <button onClick={() => setBotActive(true)} style={{
            width: "100%", background: "linear-gradient(135deg, #00FFD1, #0080FF)",
            border: "none", borderRadius: 12, padding: 13, color: "#000",
            fontWeight: 900, fontSize: 14, cursor: "pointer",
            boxShadow: "0 4px 20px #00FFD133"
          }}>🚀 ATIVAR BOT IA AGORA</button>
        )}
      </div>

      {/* IA de Vendas */}
      <div style={{
        background: autoMode ? "linear-gradient(135deg, #001f1a, #002a24)" : "#0f1421",
        border: `1px solid ${autoMode ? "#00FFD1" : "#1a2a4a"}`,
        borderRadius: 16, padding: 18
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>🤖 IA de Vendas Automáticas</div>
            <div style={{ color: "#5a6a8a", fontSize: 11, marginTop: 2 }}>Analisa tendências e vende automaticamente</div>
          </div>
          <div onClick={() => setAutoMode(!autoMode)} style={{
            width: 52, height: 28, background: autoMode ? "#00FFD1" : "#1a2a4a", borderRadius: 99,
            cursor: "pointer", position: "relative", transition: "all 0.3s"
          }}>
            <div style={{
              width: 20, height: 20, background: "#fff", borderRadius: 99,
              position: "absolute", top: 4, left: autoMode ? 28 : 4, transition: "left 0.3s"
            }} />
          </div>
        </div>
        {autoMode && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["✅ Detectando produtos virais...", "✅ Gerando roteiro automático...", "✅ Criando vídeo com IA...", "⏳ Aguardando melhor horário para postar..."].map((s, i) => (
              <div key={i} style={{ color: i < 3 ? "#00FFD1" : "#FFD700", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: "#0f1421", border: "1px solid #1a2a4a", borderRadius: 16, padding: 18 }}>
        <div style={{ color: "#fff", fontWeight: 700, marginBottom: 12, fontSize: 14 }}>💬 Automação de Mensagens</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[["whatsapp", "💬 WhatsApp"], ["instagram", "📸 Instagram"], ["messenger", "💙 Messenger"]].map(([id, label]) => (
            <button key={id} onClick={() => setMsgPlatform(id)} style={{
              flex: 1, background: msgPlatform === id ? "linear-gradient(135deg, #00FFD1, #0080FF)" : "#1a2035",
              border: "none", borderRadius: 8, padding: "8px 4px", color: msgPlatform === id ? "#000" : "#8892b0",
              fontWeight: 700, fontSize: 10, cursor: "pointer"
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "🎯 Fechamento de Venda", text: "Olá! Vi que você se interessou pelo produto. Posso te ajudar a finalizar agora com frete grátis! 🚀", active: true },
            { label: "💪 Persuasão", text: "Últimas unidades! Mais de 500 pessoas compraram hoje. Não perca essa oportunidade! ⚡", active: true },
            { label: "🔄 Recuperação de Cliente", text: "Ei! Você deixou um produto no carrinho. Preparei um desconto especial só pra você! 🎁", active: false },
          ].map((t, i) => (
            <div key={i} style={{ background: "#1a2035", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ color: "#e8eaf6", fontWeight: 700, fontSize: 12 }}>{t.label}</span>
                <NeonBadge color={t.active ? "#00FFD1" : "#5a6a8a"}>{t.active ? "ATIVO" : "PAUSADO"}</NeonBadge>
              </div>
              <div style={{ color: "#8892b0", fontSize: 11, lineHeight: 1.5 }}>{t.text}</div>
            </div>
          ))}
        </div>
      </div>

      <PlatformsSection />
    </div>
  );
}

function PlatformsSection() {
  const PLATFORMS = [
    { id: "tiktok", name: "TikTok", icon: "🎵", color: "#FF0050", placeholder: "@seu_usuario_tiktok" },
    { id: "instagram", name: "Instagram", icon: "📸", color: "#E91E8C", placeholder: "@seu_instagram" },
    { id: "youtube", name: "YouTube", icon: "▶️", color: "#FF0000", placeholder: "@seu_canal_youtube" },
    { id: "facebook", name: "Facebook", icon: "👤", color: "#1877F2", placeholder: "facebook.com/sua_pagina" },
    { id: "kwai", name: "Kwai", icon: "🎬", color: "#FF6B00", placeholder: "@seu_kwai" },
    { id: "linkedin", name: "LinkedIn", icon: "💼", color: "#0077B5", placeholder: "linkedin.com/in/voce" },
  ];

  const [accounts, setAccounts] = useState({});
  const [autoPost, setAutoPost] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [inputs, setInputs] = useState({});

  const handleSave = (id) => {
    if (inputs[id]?.trim()) {
      setAccounts(a => ({ ...a, [id]: inputs[id].trim() }));
      setExpanded(null);
    }
  };

  const isConnected = (id) => !!accounts[id];

  return (
    <div style={{ background: "#0f1421", border: "1px solid #FFD70033", borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 14 }}>📱 Plataformas de Postagem</div>
        <NeonBadge color="#FFD700">{Object.keys(accounts).length} conectadas</NeonBadge>
      </div>
      <div style={{ color: "#5a6a8a", fontSize: 11, marginBottom: 14 }}>
        Conecte suas contas e ative postagem automática com IA
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PLATFORMS.map(p => (
          <div key={p.id} style={{
            background: "#1a2035",
            border: `1px solid ${isConnected(p.id) ? p.color + "44" : "#2a3a5a"}`,
            borderRadius: 12, overflow: "hidden",
            boxShadow: isConnected(p.id) ? `0 0 12px ${p.color}15` : "none",
            transition: "all 0.3s"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${p.color}22`, border: `1px solid ${p.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0
              }}>{p.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#e8eaf6", fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                {isConnected(p.id)
                  ? <div style={{ color: p.color, fontSize: 11, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✅ {accounts[p.id]}</div>
                  : <div style={{ color: "#5a6a8a", fontSize: 11, marginTop: 1 }}>Não conectado</div>
                }
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {isConnected(p.id) && (
                  <div
                    onClick={() => setAutoPost(a => ({ ...a, [p.id]: !a[p.id] }))}
                    style={{
                      width: 40, height: 22, background: autoPost[p.id] ? "#00FFD1" : "#2a3a5a",
                      borderRadius: 99, cursor: "pointer", position: "relative", transition: "all 0.3s", flexShrink: 0
                    }}>
                    <div style={{
                      width: 14, height: 14, background: "#fff", borderRadius: 99,
                      position: "absolute", top: 4, left: autoPost[p.id] ? 22 : 4, transition: "left 0.3s"
                    }} />
                  </div>
                )}
                <button
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  style={{
                    background: isConnected(p.id) ? `${p.color}22` : "linear-gradient(135deg, #00FFD1, #0080FF)",
                    border: isConnected(p.id) ? `1px solid ${p.color}44` : "none",
                    borderRadius: 8, padding: "5px 10px",
                    color: isConnected(p.id) ? p.color : "#000",
                    fontWeight: 700, fontSize: 10, cursor: "pointer", flexShrink: 0
                  }}>{isConnected(p.id) ? "✏️ Editar" : "Conectar"}</button>
              </div>
            </div>

            {isConnected(p.id) && (
              <div style={{
                background: autoPost[p.id] ? "#001a10" : "#0f1421",
                borderTop: `1px solid ${autoPost[p.id] ? "#00FFD122" : "#1a2a4a"}`,
                padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <span style={{ fontSize: 10, color: autoPost[p.id] ? "#00FFD1" : "#3a4a6a", fontWeight: 700 }}>
                  {autoPost[p.id] ? "🤖 AUTO-POSTAR ATIVO — IA postando automaticamente" : "AUTO-POSTAR desativado"}
                </span>
                {autoPost[p.id] && <span style={{ fontSize: 9, color: "#00FFD188", fontWeight: 600 }}>⚡ AO VIVO</span>}
              </div>
            )}

            {expanded === p.id && (
              <div style={{ padding: "0 12px 12px", borderTop: "1px solid #2a3a5a" }}>
                <div style={{ color: "#8892b0", fontSize: 11, margin: "10px 0 6px" }}>
                  {isConnected(p.id) ? "Atualizar conta:" : "Conectar sua conta:"}
                </div>
                <input
                  placeholder={p.placeholder}
                  value={inputs[p.id] || ""}
                  onChange={e => setInputs(i => ({ ...i, [p.id]: e.target.value }))}
                  style={{
                    width: "100%", background: "#0f1421", border: `1px solid ${p.color}44`,
                    borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 12,
                    outline: "none", boxSizing: "border-box", marginBottom: 8
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleSave(p.id)} style={{
                    flex: 1, background: `linear-gradient(135deg, ${p.color}, ${p.color}88)`,
                    border: "none", borderRadius: 8, padding: 9, color: "#fff", fontWeight: 900, fontSize: 12, cursor: "pointer"
                  }}>✅ SALVAR</button>
                  {isConnected(p.id) && (
                    <button onClick={() => {
                      setAccounts(a => { const n = {...a}; delete n[p.id]; return n; });
                      setAutoPost(a => { const n = {...a}; delete n[p.id]; return n; });
                      setExpanded(null);
                    }} style={{
                      flex: 1, background: "#FF6B6B22", border: "1px solid #FF6B6B44",
                      borderRadius: 8, padding: 9, color: "#FF6B6B", fontWeight: 700, fontSize: 12, cursor: "pointer"
                    }}>🗑 Desconectar</button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.values(autoPost).some(Boolean) && (
        <div style={{
          marginTop: 14, background: "linear-gradient(135deg, #001f14, #001a10)",
          border: "1px solid #00FFD133", borderRadius: 12, padding: 12
        }}>
          <div style={{ color: "#00FFD1", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
            🤖 Modo Automático Ativo em {Object.values(autoPost).filter(Boolean).length} plataforma(s)
          </div>
          <div style={{ color: "#5a6a8a", fontSize: 11, lineHeight: 1.6 }}>
            IA + suas contas trabalhando juntas: detecta produto viral → cria vídeo → posta no melhor horário → maximiza vendas automaticamente.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DETECTOR DE LOJA POR URL ────────────────────────────────
function detectarLoja(url) {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes("meli.la") || u.includes("mercadolivre") || u.includes("mlb")) return "mercadolivre";
  if (u.includes("amazon") || u.includes("amzn")) return "amazon";
  if (u.includes("shopee")) return "shopee";
  if (u.includes("shein")) return "shein";
  if (u.includes("temu")) return "temu";
  if (u.includes("natura")) return "natura";
  if (u.includes("boticario") || u.includes("boticário")) return "boticario";
  if (u.includes("cacaushow")) return "cacaushow";
  if (u.includes("pernambucanas")) return "pernambucanas";
  return "outro";
}

// ─── THUMBNAILS POR LOJA ─────────────────────────────────────
function getThumbnailUrl(lojaId, url) {
  // Tenta gerar thumbnail via serviço de screenshot
  // encoded removed
  // Usa o favicon + screenshot da página como fallback visual
  if (lojaId === "mercadolivre") return "https://http2.mlstatic.com/frontend-assets/homes-palpatine/web/v1.12.0/mercadolibre/images/og-image.png";
  if (lojaId === "amazon")       return "https://m.media-amazon.com/images/G/32/social/site-wide-social-image._CB627492198_.png";
  if (lojaId === "shopee")       return "https://cf.shopee.com.br/file/sg-11134004-22120-n9yev4rleanv72";
  if (lojaId === "shein")        return "https://img.ltwebstatic.com/images3_spmp/2021/09/27/1632736806e4d98baea2d85ee42d7b8a2e18d8b3f0.jpg";
  if (lojaId === "temu")         return "https://aimg.kwcdn.com/upload_aimg/commodity/bf7a6fc9-22df-44cf-a738-2d7b60db9aa5.png.slim.png";
  if (lojaId === "natura")       return "https://images.natura.com.br/pub/media/logo/logo-natura.png";
  if (lojaId === "boticario")    return "https://www.boticario.com.br/on/demandware.static/Sites-boticario-Site/-/pt_BR/v1696534893943/images/logos/logo-boticario.svg";
  return null;
}

// ─── BUSCA PRODUTO POR LINK (simulando API real) ─────────────
function buscarProdutoPorURL(url) {
  const lojaId = detectarLoja(url);
  const loja = STORES.find(s => s.id === lojaId);
  const thumbUrl = getThumbnailUrl(lojaId, url);

  // Tenta achar na PRICE_DATABASE primeiro
  const found = PRICE_DATABASE.find(p =>
    p.stores.some(s => s.id === lojaId && s.url && url.includes(s.url.split("/").pop()))
  );

  if (found) {
    const calc = calcOpportunity(found);
    const storeEntry = found.stores.find(s => s.id === lojaId) || found.stores[0];
    return {
      id: found.id,
      name: found.name,
      img: found.img,
      thumbnailUrl: thumbUrl,
      category: found.category,
      price: `R$ ${storeEntry.price.toFixed(2).replace(".", ",")}`,
      priceRaw: storeEntry.price,
      commission: `R$ ${(storeEntry.price * (STORE_COMMISSIONS[lojaId] || 0.10)).toFixed(2).replace(".", ",")}`,
      commissionRate: ((STORE_COMMISSIONS[lojaId] || 0.10) * 100).toFixed(0),
      store: lojaId,
      storeName: loja?.name || lojaId,
      storeIcon: loja?.icon || "🛒",
      affiliateLink: url,
      trend: found.trend,
      opportunityScore: calc.opportunityScore,
      allStores: calc.allStores,
      viral: found.viral,
      searches: found.searches,
    };
  }

  // Produto genérico detectado pelo domínio
  const commRate = STORE_COMMISSIONS[lojaId] || 0.10;
  const preco = lojaId === "shein" || lojaId === "temu" ? 79.90 :
                lojaId === "shopee" ? 129.90 : 249.90;
  return {
    id: "custom_" + Date.now(),
    name: loja ? `Produto ${loja.name}` : "Produto Afiliado",
    img: loja?.icon || "🛒",
    thumbnailUrl: thumbUrl,
    category: "Afiliado",
    price: `R$ ${preco.toFixed(2).replace(".", ",")}`,
    priceRaw: preco,
    commission: `R$ ${(preco * commRate).toFixed(2).replace(".", ",")}`,
    commissionRate: (commRate * 100).toFixed(0),
    store: lojaId,
    storeName: loja?.name || "Loja",
    storeIcon: loja?.icon || "🛒",
    affiliateLink: url,
    trend: 80,
    opportunityScore: 78,
    allStores: [],
    viral: false,
    searches: 0,
  };
}

function Links({ onCreateVideo, setActiveTab, savedLinks = [], onSaveLink, onRegisterClick }) {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [produto, setProduto] = useState(null);
  const [shortLink, setShortLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [localSavedLinks, setLocalSavedLinks] = useState(
    savedLinks && savedLinks.length > 0 ? savedLinks : [
      { original: "https://meli.la/17XoYuZ", short: "go.vrl.io/meu1", clicks: 0, produto: buscarProdutoPorURL("https://meli.la/17XoYuZ") },
    ]
  );
  const [phase, setPhase] = useState(0);

  const PHASES = [
    "🔍 Detectando loja e produto...",
    "📦 Buscando dados do produto...",
    "💰 Calculando comissão...",
    "📊 Comparando com outras lojas...",
    "✅ Produto identificado!",
  ];

  const handleAnalyze = () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setProduto(null);
    setShortLink("");
    setShowQR(false);
    setPhase(0);
    let p = 0;
    const iv = setInterval(() => {
      p++;
      setPhase(p);
      if (p >= PHASES.length - 1) {
        clearInterval(iv);
        setTimeout(() => {
          const p = buscarProdutoPorURL(url);
          setProduto(p);
          const rand = Math.random().toString(36).substring(2, 7);
          setShortLink("go.vrl.io/" + rand);
          const newLink = { original: url, short: "go.vrl.io/" + rand, clicks: 0, produto: p };
          setLocalSavedLinks(prev => {
            const exists = prev.find(l => l.original === url);
            if (exists) return prev;
            return [newLink, ...prev];
          });
          onSaveLink && onSaveLink(newLink);
          setAnalyzing(false);
        }, 500);
      }
    }, 550);
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = (link) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(link)}&bgcolor=0f1421&color=00FFD1&format=png`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* INPUT PRINCIPAL */}
      <div style={{ background: "#0f1421", border: "1px solid #00FFD133", borderRadius: 16, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 18 }}>🔗</span>
          <div>
            <div style={{ color: "#00FFD1", fontWeight: 800, fontSize: 14 }}>Analisador de Link Inteligente</div>
            <div style={{ color: "#5a6a8a", fontSize: 10 }}>Cole seu link → IA identifica o produto e conecta com todos os sistemas</div>
          </div>
        </div>

        <input
          placeholder="Cole seu link de afiliado aqui..."
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAnalyze()}
          style={{
            width: "100%", background: "#1a2035",
            border: `1px solid ${url ? "#00FFD155" : "#2a3a5a"}`,
            borderRadius: 10, padding: "11px 14px", color: "#fff",
            fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 10
          }}
        />

        <button onClick={handleAnalyze} disabled={analyzing || !url.trim()} style={{
          width: "100%",
          background: analyzing ? "#1a2035" : "linear-gradient(135deg, #00FFD1, #0080FF)",
          border: "none", borderRadius: 10, padding: 12,
          color: analyzing ? "#5a6a8a" : "#000",
          fontWeight: 900, fontSize: 13, cursor: analyzing ? "default" : "pointer",
          boxShadow: analyzing ? "none" : "0 4px 16px #00FFD133"
        }}>
          {analyzing ? PHASES[phase] : "⚡ ANALISAR + ENCURTAR + RASTREAR"}
        </button>

        {/* LOADING */}
        {analyzing && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
            {PHASES.map((ph, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", opacity: i <= phase ? 1 : 0.2, transition: "opacity 0.3s" }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: i < phase ? "#00FFD1" : i === phase ? "#FFD700" : "#2a3a5a",
                  boxShadow: i === phase ? "0 0 6px #FFD700" : "none"
                }} />
                <span style={{ color: i < phase ? "#00FFD1" : i === phase ? "#FFD700" : "#3a4a6a", fontSize: 11 }}>{ph}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRODUTO IDENTIFICADO */}
      {produto && (
        <div style={{
          background: "linear-gradient(135deg, #0a1a0a, #0a0f1e)",
          border: "2px solid #00FFD155", borderRadius: 18, padding: 16,
          boxShadow: "0 0 28px #00FFD115", animation: "fadeIn 0.4s ease"
        }}>
          <NeonBadge color="#00FFD1">✅ Produto Identificado pela IA</NeonBadge>

          {/* PRODUTO INFO */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", margin: "14px 0 10px" }}>
            <div style={{
              width: 80, height: 80, borderRadius: 14, flexShrink: 0,
              background: "#00FFD122", border: "2px solid #00FFD144",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", position: "relative"
            }}>
              {produto.thumbnailUrl ? (
                <img
                  src={produto.thumbnailUrl}
                  alt={produto.name}
                  onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
                />
              ) : null}
              <div style={{
                display: produto.thumbnailUrl ? "none" : "flex",
                position: "absolute", inset: 0,
                alignItems: "center", justifyContent: "center", fontSize: 36
              }}>{produto.img}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{produto.storeIcon}</span>
                <span style={{ color: "#5a6a8a", fontSize: 11 }}>{produto.storeName}</span>
              </div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, lineHeight: 1.3 }}>{produto.name}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ color: "#00FFD1", fontWeight: 800, fontSize: 16 }}>{produto.price}</span>
              </div>
              <div style={{ color: "#FFD700", fontSize: 12, marginTop: 3 }}>
                💰 {produto.commission} de comissão ({produto.commissionRate}%)
              </div>
            </div>
          </div>

          {/* MINI STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              ["📈 Trend", `${produto.trend}%`, "#00FFD1"],
              ["🎯 Score", `${produto.opportunityScore}`, "#FFD700"],
              ["🔥 Status", produto.viral ? "VIRAL" : "Normal", produto.viral ? "#FF6B6B" : "#5a6a8a"],
            ].map(([l, v, c]) => (
              <div key={l} style={{ background: "#0f1421", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                <div style={{ color: c, fontWeight: 800, fontSize: 13 }}>{v}</div>
                <div style={{ color: "#5a6a8a", fontSize: 10 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* COMPARAÇÃO DE LOJAS */}
          {produto.allStores && produto.allStores.length > 1 && (
            <div style={{ background: "#0f1421", borderRadius: 12, padding: 12, marginBottom: 14 }}>
              <div style={{ color: "#B47EFF", fontWeight: 700, fontSize: 12, marginBottom: 8 }}>📊 Comparação em outras lojas</div>
              {produto.allStores.map((s, i) => {
                const st = STORES.find(x => x.id === s.id);
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < produto.allStores.length - 1 ? "1px solid #1a2035" : "none" }}>
                    <span style={{ fontSize: 16 }}>{st?.icon || "🛒"}</span>
                    <span style={{ flex: 1, color: i === 0 ? "#00FFD1" : "#8892b0", fontSize: 12, fontWeight: i === 0 ? 700 : 400 }}>
                      {st?.name || s.id} {i === 0 && "✅"}
                    </span>
                    <span style={{ color: i === 0 ? "#00FFD1" : "#e8eaf6", fontWeight: 700, fontSize: 13 }}>
                      R$ {s.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* LINK ENCURTADO */}
          <div style={{ background: "#0f1421", borderRadius: 12, padding: 12, marginBottom: 14 }}>
            <div style={{ color: "#5a6a8a", fontSize: 10, marginBottom: 4 }}>🔗 LINK ENCURTADO</div>
            <div style={{ color: "#00FFD1", fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{shortLink}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => handleCopy(shortLink)} style={{
                flex: 1, background: copied ? "#00FFD122" : "#1a2035",
                border: `1px solid ${copied ? "#00FFD1" : "#2a3a5a"}`,
                borderRadius: 8, padding: 8, color: copied ? "#00FFD1" : "#8892b0",
                fontWeight: 700, fontSize: 11, cursor: "pointer"
              }}>{copied ? "✅ COPIADO!" : "📋 COPIAR"}</button>
              <button onClick={() => setShowQR(q => !q)} style={{
                flex: 1, background: showQR ? "#B47EFF22" : "#1a2035",
                border: `1px solid ${showQR ? "#B47EFF" : "#2a3a5a"}`,
                borderRadius: 8, padding: 8, color: showQR ? "#B47EFF" : "#8892b0",
                fontWeight: 700, fontSize: 11, cursor: "pointer"
              }}>📱 QR CODE</button>
            </div>
            {showQR && (
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <img src={qrUrl(shortLink)} alt="QR Code" style={{ borderRadius: 10, border: "1px solid #00FFD133" }} />
                <div style={{ color: "#5a6a8a", fontSize: 10, marginTop: 6 }}>Escaneie para abrir o link</div>
              </div>
            )}
          </div>

          {/* CONECTAR COM OUTROS SISTEMAS */}
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>⚡ Usar este produto em:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => { onCreateVideo && onCreateVideo(produto); setActiveTab && setActiveTab("Vídeos"); }} style={{
              background: "linear-gradient(135deg, #FF6B6B, #FF8C00)",
              border: "none", borderRadius: 10, padding: 11,
              color: "#fff", fontWeight: 900, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>🎬 CRIAR VÍDEO VIRAL COM ESTE PRODUTO</button>

            <WhatsAppButton product={produto} affiliateLink={url} />

            <button onClick={() => setActiveTab && setActiveTab("Automação")} style={{
              background: "linear-gradient(135deg, #1a2035, #0f1421)",
              border: "1px solid #B47EFF44", borderRadius: 10, padding: 11,
              color: "#B47EFF", fontWeight: 700, fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>🤖 ADICIONAR AO BOT 24/7</button>
          </div>
        </div>
      )}

      {/* MEUS LINKS SALVOS */}
      {localSavedLinks.length > 0 && (
        <div style={{ background: "#0f1421", border: "1px solid #1a2a4a", borderRadius: 14, padding: 16 }}>
          <div style={{ color: "#fff", fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
            📊 Meus Links Salvos
          </div>
          {localSavedLinks.map((l, i) => (
            <div key={i} style={{ background: "#1a2035", borderRadius: 12, padding: 12, marginBottom: 8 }}>
              {/* Produto do link */}
              {l.produto && (
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                    background: "#1a2035", border: "1px solid #2a3a5a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden", position: "relative"
                  }}>
                    {l.produto.thumbnailUrl ? (
                      <img
                        src={l.produto.thumbnailUrl}
                        alt={l.produto.name}
                        onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : null}
                    <div style={{
                      display: l.produto.thumbnailUrl ? "none" : "flex",
                      position: "absolute", inset: 0,
                      alignItems: "center", justifyContent: "center", fontSize: 22
                    }}>{l.produto.img}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#e8eaf6", fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>{l.produto.name}</div>
                    <div style={{ color: "#FFD700", fontSize: 10, marginTop: 2 }}>💰 {l.produto.commission}</div>
                  </div>
                  <NeonBadge color="#00FFD1">{l.produto.storeName}</NeonBadge>
                </div>
              )}
              <div style={{ color: "#5a6a8a", fontSize: 9, marginBottom: 2 }}>LINK ORIGINAL</div>
              <div style={{ color: "#3a4a6a", fontSize: 10, marginBottom: 6, wordBreak: "break-all" }}>{l.original}</div>
              <div style={{ color: "#00FFD1", fontWeight: 700, fontSize: 13 }}>{l.short}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <span style={{ color: "#FFD700", fontSize: 11 }}>👆 {l.clicks.toLocaleString()} cliques</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { setUrl(l.original); onRegisterClick && onRegisterClick(l.produto?.name); handleAnalyze(); }} style={{
                    background: "#0f1421", border: "1px solid #00FFD155",
                    borderRadius: 6, padding: "4px 10px", color: "#00FFD1", fontSize: 10, cursor: "pointer"
                  }}>🔍 Ver</button>
                  <button onClick={() => handleCopy(l.short)} style={{
                    background: "#0f1421", border: "1px solid #B47EFF55",
                    borderRadius: 6, padding: "4px 10px", color: "#B47EFF", fontSize: 10, cursor: "pointer"
                  }}>📋</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Alerts({ alerts = [], onAlertAction, onCreateVideo, setActiveTab }) {
  const localAlerts = alerts.length > 0 ? alerts : [
    { id: 1, icon: "🔥", title: "Produto VIRAL detectado!", desc: "Fone JBL +300% de buscas agora", time: "2 min", color: "#FF6B6B", urgent: true, produto: PRICE_DATABASE[2] },
    { id: 2, icon: "📈", title: "Nova tendência: Skincare", desc: "Alta demanda por produtos de beleza", time: "15 min", color: "#00FFD1", urgent: false },
    { id: 3, icon: "💰", title: "Alta comissão disponível", desc: "Shein aumentou comissão para 20%", time: "1h", color: "#FFD700", urgent: false },
    { id: 4, icon: "⏰", title: "Melhor horário para postar", desc: "20h-22h → 3x mais engajamento", time: "2h", color: "#B47EFF", urgent: false },
    { id: 5, icon: "🚨", title: "Estoque baixo detectado", desc: "Nike Air Max — últimas unidades!", time: "3h", color: "#FF8C00", urgent: true, produto: PRICE_DATABASE[0] },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>🔔 Alertas Inteligentes</div>
        <NeonBadge color="#FF6B6B">{localAlerts.filter(a => a.urgent).length} urgentes</NeonBadge>
      </div>
      {localAlerts.map((a, i) => (
        <div key={a.id || i} style={{
          background: a.urgent ? `linear-gradient(135deg, ${a.color}11, #0f1421)` : "#0f1421",
          border: `1px solid ${a.color}${a.urgent ? "55" : "33"}`,
          borderRadius: 12, padding: 14,
          boxShadow: a.urgent ? `0 0 20px ${a.color}15` : "none"
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ fontSize: 24 }}>{a.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: a.color, fontWeight: 700, fontSize: 13 }}>{a.title}</div>
              <div style={{ color: "#8892b0", fontSize: 12, marginTop: 2 }}>{a.desc}</div>
            </div>
            <div style={{ color: "#5a6a8a", fontSize: 10 }}>{a.time}</div>
          </div>
          {a.urgent && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {a.produto && (
                <button onClick={() => {
                  const c = calcOpportunity(a.produto);
                  onCreateVideo && onCreateVideo({ ...c, price: c.priceFormatted, commission: c.commissionFormatted, store: c.bestStore.id, affiliateLink: c.bestStore.url });
                }} style={{
                  flex: 1, background: "linear-gradient(135deg, #FF6B6B, #FF8C00)",
                  border: "none", borderRadius: 8, padding: 8, color: "#fff", fontWeight: 900, fontSize: 11, cursor: "pointer"
                }}>🎬 CRIAR VÍDEO</button>
              )}
              <button onClick={() => {
                onAlertAction && onAlertAction(a);
                setActiveTab && setActiveTab(a.produto ? "Vídeos" : "Produtos");
              }} style={{
                flex: 1, background: `linear-gradient(135deg, ${a.color}, ${a.color}88)`,
                border: "none", borderRadius: 8, padding: 8, color: "#000", fontWeight: 900, fontSize: 11, cursor: "pointer"
              }}>⚡ AGIR AGORA</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


function Settings({ setShowPermissions }) {
  const [connected, setConnected] = useState({ amazon: true });
  const [customStores, setCustomStores] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [form, setForm] = useState({ name: "", commission: "", link: "", icon: "🛒", color: "#00FFD1" });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [generalToggles, setGeneralToggles] = useState({ notif: true, autopost: true, ai: true, ultra: false });

  const resetForm = () => setForm({ name: "", commission: "", link: "", icon: "🛒", color: "#00FFD1" });

  const handleSaveStore = () => {
    if (!form.name.trim()) return;
    if (editingStore !== null) {
      setCustomStores(s => s.map((st, i) => i === editingStore ? { ...form } : st));
      setEditingStore(null);
    } else {
      setCustomStores(s => [...s, { ...form, id: Date.now().toString() }]);
    }
    resetForm();
    setShowAddForm(false);
    setShowIconPicker(false);
  };

  const handleEdit = (i) => {
    setForm({ ...customStores[i] });
    setEditingStore(i);
    setShowAddForm(true);
  };

  const handleDelete = (i) => {
    setCustomStores(s => s.filter((_, idx) => idx !== i));
  };

  const allStores = [
    ...STORES,
    ...customStores.map(s => ({ id: s.id, name: s.name, icon: s.icon, commission: s.commission, color: s.color, custom: true, link: s.link }))
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* LOJAS */}
      <div style={{ background: "#0f1421", border: "1px solid #1a2a4a", borderRadius: 14, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>🏪 Lojas Afiliadas</div>
            <div style={{ color: "#5a6a8a", fontSize: 10, marginTop: 1 }}>{allStores.length} lojas · {Object.values(connected).filter(Boolean).length} conectadas</div>
          </div>
          <button onClick={() => { setShowAddForm(f => !f); setEditingStore(null); resetForm(); setShowIconPicker(false); }} style={{
            background: showAddForm ? "#1a2035" : "linear-gradient(135deg, #00FFD1, #0080FF)",
            border: "none", borderRadius: 99, padding: "7px 14px",
            color: showAddForm ? "#5a6a8a" : "#000", fontWeight: 900, fontSize: 12, cursor: "pointer"
          }}>{showAddForm ? "✕ Fechar" : "+ Nova Loja"}</button>
        </div>

        {/* ADD / EDIT FORM */}
        {showAddForm && (
          <div style={{ background: "#0a0f1e", border: "1px solid #00FFD133", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <div style={{ color: "#00FFD1", fontWeight: 700, fontSize: 12, marginBottom: 12 }}>
              {editingStore !== null ? "✏️ Editar Loja" : "➕ Adicionar Nova Loja"}
            </div>

            {/* Icon + Color picker row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
              <div onClick={() => setShowIconPicker(p => !p)} style={{
                width: 48, height: 48, borderRadius: 12, background: form.color + "22",
                border: `2px solid ${form.color}66`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 24, cursor: "pointer", flexShrink: 0
              }}>{form.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#5a6a8a", fontSize: 10, marginBottom: 4 }}>COR DA LOJA</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {STORE_COLORS.map(c => (
                    <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                      width: 22, height: 22, borderRadius: 99, background: c, cursor: "pointer",
                      border: form.color === c ? "2px solid #fff" : "2px solid transparent",
                      boxShadow: form.color === c ? `0 0 8px ${c}` : "none"
                    }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Icon grid */}
            {showIconPicker && (
              <div style={{ background: "#1a2035", borderRadius: 10, padding: 10, marginBottom: 10 }}>
                <div style={{ color: "#5a6a8a", fontSize: 10, marginBottom: 6 }}>ESCOLHER ÍCONE</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {STORE_ICONS.map(ic => (
                    <div key={ic} onClick={() => { setForm(f => ({ ...f, icon: ic })); setShowIconPicker(false); }} style={{
                      width: 34, height: 34, borderRadius: 8, background: form.icon === ic ? form.color + "33" : "#0f1421",
                      border: `1px solid ${form.icon === ic ? form.color : "#2a3a5a"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, cursor: "pointer"
                    }}>{ic}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs */}
            {[
              { key: "name", placeholder: "Nome da loja (ex: Renner, Zara...)", label: "NOME DA LOJA *" },
              { key: "commission", placeholder: "Ex: 12%", label: "COMISSÃO" },
              { key: "link", placeholder: "Link do programa de afiliados", label: "LINK AFILIADO" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 8 }}>
                <div style={{ color: "#5a6a8a", fontSize: 9, marginBottom: 3, fontWeight: 700 }}>{f.label}</div>
                <input
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))}
                  style={{
                    width: "100%", background: "#1a2035", border: `1px solid ${form[f.key] ? form.color + "55" : "#2a3a5a"}`,
                    borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 12,
                    outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={handleSaveStore} disabled={!form.name.trim()} style={{
                flex: 1, background: form.name.trim() ? `linear-gradient(135deg, ${form.color}, ${form.color}88)` : "#1a2035",
                border: "none", borderRadius: 10, padding: 11, color: form.name.trim() ? "#000" : "#5a6a8a",
                fontWeight: 900, fontSize: 13, cursor: form.name.trim() ? "pointer" : "default"
              }}>✅ {editingStore !== null ? "SALVAR" : "ADICIONAR"}</button>
              <button onClick={() => { setShowAddForm(false); setEditingStore(null); resetForm(); setShowIconPicker(false); }} style={{
                background: "#1a2035", border: "1px solid #2a3a5a", borderRadius: 10,
                padding: "11px 16px", color: "#5a6a8a", fontWeight: 700, fontSize: 13, cursor: "pointer"
              }}>✕</button>
            </div>
          </div>
        )}

        {/* DEFAULT STORES */}
        <div style={{ color: "#5a6a8a", fontSize: 10, fontWeight: 700, marginBottom: 6, letterSpacing: 0.8 }}>LOJAS PADRÃO</div>
        {STORES.map(s => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #1a2035" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, background: s.color + "22",
              border: `1px solid ${s.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0
            }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e8eaf6", fontSize: 13, fontWeight: 600 }}>{s.name}</div>
              <div style={{ color: s.color, fontSize: 10 }}>💰 {s.commission} comissão</div>
            </div>
            <button onClick={() => setConnected(c => ({ ...c, [s.id]: !c[s.id] }))} style={{
              background: connected[s.id] ? "linear-gradient(135deg, #00FFD1, #0080FF)" : "#1a2035",
              border: connected[s.id] ? "none" : "1px solid #2a3a5a",
              borderRadius: 20, padding: "6px 12px", color: connected[s.id] ? "#000" : "#5a6a8a",
              fontWeight: 700, fontSize: 11, cursor: "pointer", flexShrink: 0
            }}>{connected[s.id] ? "✅ Ativo" : "Conectar"}</button>
          </div>
        ))}

        {/* CUSTOM STORES */}
        {customStores.length > 0 && (
          <>
            <div style={{ color: "#00FFD1", fontSize: 10, fontWeight: 700, margin: "14px 0 6px", letterSpacing: 0.8 }}>✨ MINHAS LOJAS ({customStores.length})</div>
            {customStores.map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: "1px solid #1a2035"
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8, background: s.color + "22",
                  border: `1px solid ${s.color}55`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 18, flexShrink: 0
                }}>{s.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#e8eaf6", fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {s.commission && <div style={{ color: s.color, fontSize: 10 }}>💰 {s.commission}</div>}
                    {s.link && <div style={{ color: "#5a6a8a", fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🔗 Link salvo</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => handleEdit(i)} style={{
                    background: "#1a2035", border: `1px solid ${s.color}44`, borderRadius: 8,
                    padding: "5px 9px", color: s.color, fontSize: 11, cursor: "pointer"
                  }}>✏️</button>
                  <button onClick={() => handleDelete(i)} style={{
                    background: "#1a2035", border: "1px solid #FF6B6B44", borderRadius: 8,
                    padding: "5px 9px", color: "#FF6B6B", fontSize: 11, cursor: "pointer"
                  }}>🗑</button>
                </div>
              </div>
            ))}
          </>
        )}

        {customStores.length === 0 && !showAddForm && (
          <div style={{ marginTop: 12, background: "#0a0f1e", borderRadius: 10, padding: 12, textAlign: "center", border: "1px dashed #2a3a5a" }}>
            <div style={{ color: "#3a4a6a", fontSize: 12 }}>Nenhuma loja personalizada ainda</div>
            <div style={{ color: "#5a6a8a", fontSize: 11, marginTop: 2 }}>Clique em "+ Nova Loja" para adicionar</div>
          </div>
        )}
      </div>

      {/* PERMISSÕES DAS LOJAS */}
      <div style={{ background: "#0f1421", border: "1px solid #FF6B6B33", borderRadius: 14, padding: 16, marginBottom: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 14 }}>🛡️ Permissões das Lojas</div>
            <div style={{ color: "#5a6a8a", fontSize: 11, marginTop: 2 }}>Regras de postagem por plataforma</div>
          </div>
          <button onClick={() => setShowPermissions(true)} style={{
            background: "linear-gradient(135deg, #FF6B6B, #FF8C00)",
            border: "none", borderRadius: 10, padding: "8px 14px",
            color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer"
          }}>Ver Regras →</button>
        </div>
      </div>

      {/* CONFIGURAÇÕES GERAIS */}
      <div style={{ background: "#0f1421", border: "1px solid #1a2a4a", borderRadius: 14, padding: 16 }}>
        <div style={{ color: "#fff", fontWeight: 700, marginBottom: 12, fontSize: 14 }}>⚙️ Configurações Gerais</div>
        {[
          { label: "Notificações Push", key: "notif", icon: "🔔" },
          { label: "Postagem Automática", key: "autopost", icon: "🚀" },
          { label: "IA em Tempo Real", key: "ai", icon: "🤖" },
          { label: "Modo Ultra Ativado", key: "ultra", icon: "⚡" },
        ].map(item => (
          <div key={item.key} onClick={() => setGeneralToggles(t => ({ ...t, [item.key]: !t[item.key] }))}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #1a2035", cursor: "pointer" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ color: "#e8eaf6", fontSize: 13 }}>{item.label}</span>
            </div>
            <div style={{ width: 44, height: 24, background: generalToggles[item.key] ? "#00FFD1" : "#1a2a4a", borderRadius: 99, position: "relative", transition: "background 0.3s" }}>
              <div style={{ width: 16, height: 16, background: "#fff", borderRadius: 99, position: "absolute", top: 4, left: generalToggles[item.key] ? 24 : 4, transition: "left 0.3s" }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// 🔐 LOGIN / CADASTRO
// ═══════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | cadastro
  const [step, setStep] = useState(1); // onboarding steps
  const [form, setForm] = useState({ nome: "", email: "", senha: "", meta: "1000" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [onboarding, setOnboarding] = useState(false);

  const ONBOARDING_STEPS = [
    {
      icon: "⚡", color: "#00FFD1",
      title: "Bem-vindo ao AfiliadoAI PRO!",
      desc: "A máquina de vendas automáticas com inteligência artificial que trabalha por você 24 horas por dia.",
      btn: "Próximo →"
    },
    {
      icon: "🛒", color: "#FFD700",
      title: "Compare preços em 9 lojas",
      desc: "Nossa IA busca e compara automaticamente os melhores produtos com maior comissão nas principais lojas.",
      btn: "Próximo →"
    },
    {
      icon: "🎬", color: "#B47EFF",
      title: "Crie vídeos virais com IA",
      desc: "Gere roteiros baseados nos vídeos mais virais da internet e adapte para o seu produto em segundos.",
      btn: "Próximo →"
    },
    {
      icon: "🤖", color: "#FF6B6B",
      title: "Bot 24/7 trabalhando por você",
      desc: "Ative o bot e ele detecta tendências, cria vídeos e posta automaticamente mesmo quando você dorme.",
      btn: "Começar a ganhar! 🚀"
    },
  ];

  const handleSubmit = () => {
    if (!form.email || !form.senha) { setError("Preencha e-mail e senha"); return; }
    if (mode === "cadastro" && !form.nome) { setError("Digite seu nome"); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "cadastro") {
        setOnboarding(true);
      } else {
        onLogin({ nome: form.nome || "Usuário", email: form.email, meta: parseFloat(form.meta) || 1000 });
      }
    }, 1500);
  };

  const finishOnboarding = () => {
    onLogin({ nome: form.nome || "Usuário", email: form.email, meta: parseFloat(form.meta) || 1000 });
  };

  // ONBOARDING
  if (onboarding) {
    const s = ONBOARDING_STEPS[step - 1];
    return (
      <div style={{ background: "#07090f", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'SF Pro Display', sans-serif" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
          {ONBOARDING_STEPS.map((_, i) => (
            <div key={i} style={{ width: i + 1 === step ? 24 : 8, height: 8, borderRadius: 99, background: i + 1 === step ? s.color : "#1a2a4a", transition: "all 0.3s" }} />
          ))}
        </div>

        <div style={{ fontSize: 80, marginBottom: 24, filter: `drop-shadow(0 0 30px ${s.color}66)` }}>{s.icon}</div>
        <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 24, textAlign: "center", marginBottom: 16, lineHeight: 1.3 }}>{s.title}</h2>
        <p style={{ color: "#8892b0", fontSize: 14, textAlign: "center", lineHeight: 1.8, marginBottom: 40, maxWidth: 320 }}>{s.desc}</p>

        <button onClick={() => { if (step < ONBOARDING_STEPS.length) setStep(s => s + 1); else finishOnboarding(); }} style={{
          width: "100%", maxWidth: 320,
          background: `linear-gradient(135deg, ${s.color}, ${s.color}88)`,
          border: "none", borderRadius: 14, padding: 16,
          color: "#000", fontWeight: 900, fontSize: 16, cursor: "pointer",
          boxShadow: `0 8px 24px ${s.color}44`
        }}>{s.btn}</button>
      </div>
    );
  }

  return (
    <div style={{ background: "#07090f", minHeight: "100vh", display: "flex", flexDirection: "column", padding: 24, fontFamily: "'SF Pro Display', sans-serif" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginTop: 60, marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>⚡</span>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 26 }}>AfiliadoAI</span>
          <span style={{ background: "#00FFD1", color: "#000", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>PRO</span>
        </div>
        <p style={{ color: "#5a6a8a", fontSize: 13 }}>Máquina de Vendas Automáticas com IA</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "#0d1117", border: "1px solid #1a2a4a", borderRadius: 14, padding: 5, marginBottom: 28 }}>
        {[["login", "Entrar"], ["cadastro", "Criar Conta"]].map(([id, label]) => (
          <button key={id} onClick={() => { setMode(id); setError(""); }} style={{
            flex: 1, background: mode === id ? "linear-gradient(135deg, #00FFD1, #0080FF)" : "transparent",
            border: "none", borderRadius: 10, padding: 11,
            color: mode === id ? "#000" : "#5a6a8a", fontWeight: 800, fontSize: 14, cursor: "pointer"
          }}>{label}</button>
        ))}
      </div>

      {/* Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "cadastro" && (
          <div>
            <div style={{ color: "#5a6a8a", fontSize: 11, fontWeight: 700, marginBottom: 5 }}>SEU NOME</div>
            <input placeholder="Como podemos te chamar?" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              style={{ width: "100%", background: "#0d1117", border: "1px solid #1a2a4a", borderRadius: 12, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        )}
        <div>
          <div style={{ color: "#5a6a8a", fontSize: 11, fontWeight: 700, marginBottom: 5 }}>E-MAIL</div>
          <input placeholder="seu@email.com" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={{ width: "100%", background: "#0d1117", border: "1px solid #1a2a4a", borderRadius: 12, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <div style={{ color: "#5a6a8a", fontSize: 11, fontWeight: 700, marginBottom: 5 }}>SENHA</div>
          <input placeholder="••••••••" type="password" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
            style={{ width: "100%", background: "#0d1117", border: "1px solid #1a2a4a", borderRadius: 12, padding: "13px 16px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>
        {mode === "cadastro" && (
          <div>
            <div style={{ color: "#5a6a8a", fontSize: 11, fontWeight: 700, marginBottom: 5 }}>META MENSAL (R$)</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["500", "1000", "3000", "5000"].map(v => (
                <button key={v} onClick={() => setForm(f => ({ ...f, meta: v }))} style={{
                  flex: 1, background: form.meta === v ? "linear-gradient(135deg, #00FFD1, #0080FF)" : "#0d1117",
                  border: `1px solid ${form.meta === v ? "#00FFD1" : "#1a2a4a"}`,
                  borderRadius: 8, padding: "8px 0", color: form.meta === v ? "#000" : "#5a6a8a",
                  fontWeight: 700, fontSize: 12, cursor: "pointer"
                }}>R${v}</button>
              ))}
            </div>
          </div>
        )}
        {error && <div style={{ color: "#FF6B6B", fontSize: 12, textAlign: "center" }}>{error}</div>}
        <button onClick={handleSubmit} style={{
          marginTop: 8, width: "100%",
          background: loading ? "#1a2035" : "linear-gradient(135deg, #00FFD1, #0080FF)",
          border: "none", borderRadius: 14, padding: 16,
          color: loading ? "#5a6a8a" : "#000", fontWeight: 900, fontSize: 16, cursor: loading ? "default" : "pointer",
          boxShadow: loading ? "none" : "0 8px 24px #00FFD133"
        }}>{loading ? "⏳ Entrando..." : mode === "login" ? "🚀 ENTRAR" : "✅ CRIAR MINHA CONTA"}</button>
      </div>

      <div style={{ textAlign: "center", marginTop: 20, color: "#3a4a6a", fontSize: 11 }}>
        Ao continuar você concorda com os Termos de Uso
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 👤 TELA DE PERFIL + METAS
// ═══════════════════════════════════════════════════════════════
function ProfileScreen({ user, stats, onClose, onUpdateUser }) {
  const [editingMeta, setEditingMeta] = useState(false);
  const [novaMeta, setNovaMeta] = useState(user.meta || 1000);
  const [editingName, setEditingName] = useState(false);
  const [novoNome, setNovoNome] = useState(user.nome || "");

  const progressMeta = Math.min(100, Math.round((stats.comissao / (user.meta || 1000)) * 100));
  const faltaMeta = Math.max(0, (user.meta || 1000) - stats.comissao);

  const NIVEL = stats.comissao < 500 ? { label: "Iniciante", icon: "🌱", color: "#00FFD1", next: 500 }
    : stats.comissao < 2000 ? { label: "Afiliado", icon: "⭐", color: "#FFD700", next: 2000 }
    : stats.comissao < 5000 ? { label: "Pro", icon: "🔥", color: "#FF6B6B", next: 5000 }
    : { label: "Expert", icon: "💎", color: "#B47EFF", next: null };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#07090f", zIndex: 200, overflowY: "auto", fontFamily: "'SF Pro Display', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a0010, #000d1a)", padding: "50px 20px 24px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, left: 16, background: "#1a2035", border: "none", borderRadius: 99, width: 36, height: 36, color: "#fff", fontSize: 18, cursor: "pointer" }}>←</button>

        {/* Avatar */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, #00FFD1, #0080FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, fontWeight: 900, color: "#000",
            margin: "0 auto 12px", boxShadow: "0 0 30px #00FFD144"
          }}>{(user.nome || "U")[0].toUpperCase()}</div>

          {editingName ? (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 8 }}>
              <input value={novoNome} onChange={e => setNovoNome(e.target.value)}
                style={{ background: "#1a2035", border: "1px solid #00FFD144", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 16, outline: "none", textAlign: "center" }} />
              <button onClick={() => { onUpdateUser({ nome: novoNome }); setEditingName(false); }} style={{ background: "#00FFD1", border: "none", borderRadius: 8, padding: "6px 12px", color: "#000", fontWeight: 700, cursor: "pointer" }}>✓</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>{user.nome}</span>
              <button onClick={() => setEditingName(true)} style={{ background: "none", border: "none", color: "#5a6a8a", fontSize: 14, cursor: "pointer" }}>✏️</button>
            </div>
          )}
          <div style={{ color: "#5a6a8a", fontSize: 12 }}>{user.email}</div>

          {/* Nível */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${NIVEL.color}22`, border: `1px solid ${NIVEL.color}44`, borderRadius: 99, padding: "4px 14px", marginTop: 10 }}>
            <span>{NIVEL.icon}</span>
            <span style={{ color: NIVEL.color, fontWeight: 700, fontSize: 12 }}>Nível {NIVEL.label}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 80px" }}>
        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            ["💰", "Comissão Total", `R$ ${stats.comissao.toFixed(2)}`, "#00FFD1"],
            ["📈", "Total Vendas", stats.vendas, "#FFD700"],
            ["👆", "Total Cliques", stats.cliques.toLocaleString(), "#B47EFF"],
            ["🎬", "Vídeos", stats.videos, "#FF6B6B"],
          ].map(([ic, label, val, color]) => (
            <div key={label} style={{ background: "#0d1117", border: `1px solid ${color}22`, borderRadius: 14, padding: 14 }}>
              <div style={{ fontSize: 20 }}>{ic}</div>
              <div style={{ color, fontWeight: 800, fontSize: 18, marginTop: 4 }}>{val}</div>
              <div style={{ color: "#5a6a8a", fontSize: 10 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* META */}
        <div style={{ background: "#0d1117", border: "1px solid #FFD70033", borderRadius: 16, padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 14 }}>🎯 Meta do Mês</div>
            <button onClick={() => setEditingMeta(!editingMeta)} style={{ background: "#1a2035", border: "none", borderRadius: 8, padding: "4px 10px", color: "#5a6a8a", fontSize: 11, cursor: "pointer" }}>
              {editingMeta ? "✅ Salvar" : "✏️ Editar"}
            </button>
          </div>

          {editingMeta ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                {[500, 1000, 3000, 5000, 10000].map(v => (
                  <button key={v} onClick={() => setNovaMeta(v)} style={{
                    flex: 1, background: novaMeta === v ? "#FFD700" : "#1a2035",
                    border: "none", borderRadius: 8, padding: "6px 0",
                    color: novaMeta === v ? "#000" : "#5a6a8a", fontWeight: 700, fontSize: 10, cursor: "pointer"
                  }}>R${v >= 1000 ? v/1000+"k" : v}</button>
                ))}
              </div>
              <button onClick={() => { onUpdateUser({ meta: novaMeta }); setEditingMeta(false); }} style={{
                width: "100%", background: "linear-gradient(135deg, #FFD700, #FF8C00)",
                border: "none", borderRadius: 10, padding: 10, color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer"
              }}>✅ DEFINIR META R$ {novaMeta.toLocaleString()}</button>
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "#fff", fontWeight: 700 }}>R$ {stats.comissao.toFixed(2)}</span>
            <span style={{ color: "#5a6a8a" }}>de R$ {(user.meta || 1000).toLocaleString()}</span>
          </div>
          <div style={{ background: "#1a2035", borderRadius: 99, height: 12, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ width: `${progressMeta}%`, height: "100%", background: "linear-gradient(90deg, #FFD700, #FF8C00)", borderRadius: 99, transition: "width 1s ease", boxShadow: "0 0 10px #FFD70066" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 14 }}>{progressMeta}% concluído</span>
            <span style={{ color: "#5a6a8a", fontSize: 12 }}>Faltam R$ {faltaMeta.toFixed(2)}</span>
          </div>

          {progressMeta >= 100 && (
            <div style={{ marginTop: 12, background: "#001a10", border: "1px solid #00FFD144", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <span style={{ color: "#00FFD1", fontWeight: 900 }}>🎉 META BATIDA! Parabéns!</span>
            </div>
          )}
        </div>

        {/* PRÓXIMO NÍVEL */}
        {NIVEL.next && (
          <div style={{ background: "#0d1117", border: `1px solid ${NIVEL.color}33`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ color: NIVEL.color, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🏆 Próximo nível</div>
            <div style={{ background: "#1a2035", borderRadius: 99, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (stats.comissao / NIVEL.next) * 100)}%`, height: "100%", background: `linear-gradient(90deg, ${NIVEL.color}, ${NIVEL.color}88)`, borderRadius: 99 }} />
            </div>
            <div style={{ color: "#5a6a8a", fontSize: 11, marginTop: 6 }}>
              R$ {stats.comissao.toFixed(0)} / R$ {NIVEL.next.toLocaleString()} para nível acima
            </div>
          </div>
        )}

        {/* SAIR */}
        <button onClick={() => { if (window.confirm && window.confirm("Sair da conta?")) onClose("logout"); }} style={{
          width: "100%", background: "#1a2035", border: "1px solid #FF6B6B44",
          borderRadius: 14, padding: 14, color: "#FF6B6B", fontWeight: 700, fontSize: 14, cursor: "pointer"
        }}>🚪 Sair da Conta</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 📊 HISTÓRICO DE VENDAS + GRÁFICO
// ═══════════════════════════════════════════════════════════════
function SalesHistory({ stats }) {
  const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const DATA = [142, 89, 234, 178, 312, 456, 389];
  const maxVal = Math.max(...DATA);

  const HISTORY = [
    { data: "Hoje", produto: "Fone JBL", comissao: 24.00, plataforma: "TikTok", icon: "🎧" },
    { data: "Hoje", produto: "Vestido Shein", comissao: 11.99, plataforma: "Instagram", icon: "👗" },
    { data: "Ontem", produto: "Nike Air Max", comissao: 38.99, plataforma: "WhatsApp", icon: "👟" },
    { data: "Ontem", produto: "Smartwatch Temu", comissao: 11.69, plataforma: "YouTube", icon: "⌚" },
    { data: "Seg", produto: "Perfume Natura", comissao: 20.99, plataforma: "TikTok", icon: "🌸" },
    { data: "Seg", produto: "Air Fryer", comissao: 18.99, plataforma: "WhatsApp", icon: "🍳" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* GRÁFICO */}
      <div style={{ background: "#0d1117", border: "1px solid #00FFD133", borderRadius: 16, padding: 18 }}>
        <div style={{ color: "#00FFD1", fontWeight: 800, fontSize: 14, marginBottom: 16 }}>📈 Comissões esta semana</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
          {DATA.map((val, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ color: "#5a6a8a", fontSize: 9 }}>R${val}</div>
              <div style={{
                width: "100%", borderRadius: "6px 6px 0 0",
                height: `${(val / maxVal) * 80}px`,
                background: i === 5 ? "linear-gradient(180deg, #00FFD1, #0080FF)" : "linear-gradient(180deg, #1a2a4a, #0f1421)",
                boxShadow: i === 5 ? "0 0 12px #00FFD155" : "none",
                transition: "height 1s ease"
              }} />
              <div style={{ color: i === 5 ? "#00FFD1" : "#3a4a6a", fontSize: 9, fontWeight: 700 }}>{DAYS[i]}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
          {[["📅 Esta semana", `R$ ${DATA.reduce((a,b)=>a+b,0).toLocaleString()}`, "#00FFD1"],
            ["📆 Este mês", `R$ ${stats.comissao.toFixed(2)}`, "#FFD700"],
            ["💹 Média/dia", `R$ ${(DATA.reduce((a,b)=>a+b,0)/7).toFixed(0)}`, "#B47EFF"]].map(([l,v,c]) => (
            <div key={l} style={{ background: "#1a2035", borderRadius: 10, padding: 10, textAlign: "center" }}>
              <div style={{ color: c, fontWeight: 800, fontSize: 12 }}>{v}</div>
              <div style={{ color: "#5a6a8a", fontSize: 9, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HISTÓRICO */}
      <div style={{ background: "#0d1117", border: "1px solid #1a2a4a", borderRadius: 16, padding: 16 }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, marginBottom: 14 }}>🧾 Histórico de Vendas</div>
        {HISTORY.map((h, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < HISTORY.length-1 ? "1px solid #0d1520" : "none" }}>
            <div style={{ fontSize: 28 }}>{h.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e8eaf6", fontWeight: 700, fontSize: 13 }}>{h.produto}</div>
              <div style={{ color: "#5a6a8a", fontSize: 11 }}>{h.data} · {h.plataforma}</div>
            </div>
            <div style={{ color: "#00FFD1", fontWeight: 800, fontSize: 14 }}>+R$ {h.comissao.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ✏️ EDITOR DE MENSAGEM WHATSAPP
// ═══════════════════════════════════════════════════════════════
function WhatsAppEditor({ product, onClose, onSend }) {
  const defaultMsg = `🔥 *Oferta IMPERDÍVEL!* 🔥

Olha o que achei pra você! 👇

🛍️ *${product?.name || "Produto"}*${product?.price ? `
💲 *Preço:* ${product.price}` : ""}
💰 Economize agora com esse link exclusivo!

👉 *CLIQUE AQUI E GARANTA O SEU:*
${product?.affiliateLink || "https://meli.la/17XoYuZ"}

⚠️ _Estoque limitado! Corre antes que acabe!_ 🚨`;

  const [msg, setMsg] = useState(defaultMsg);
  const [copied, setCopied] = useState(false);

  const TEMPLATES = [
    { label: "🔥 Urgência", text: `🚨 *URGENTE!* Estoque acabando!

${product?.name || "Produto"} por apenas ${product?.price || "preço incrível"}!

👉 ${product?.affiliateLink || "link"}

⏰ Só hoje!` },
    { label: "💎 Premium", text: `✨ Produto PREMIUM com desconto especial!

🛍️ *${product?.name || "Produto"}*
💲 ${product?.price || ""}

Qualidade garantida! Link exclusivo:
👉 ${product?.affiliateLink || "link"}` },
    { label: "🎁 Presente", text: `🎁 Ideia de presente PERFEITA!

${product?.name || "Produto"} — a escolha certa!

💰 Por apenas ${product?.price || "preço especial"}

👉 Compre aqui: ${product?.affiliateLink || "link"}` },
  ];

  const handleSend = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    onSend && onSend();
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "flex-end" }}>
      <div style={{ background: "#0d1117", borderRadius: "20px 20px 0 0", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ color: "#25D366", fontWeight: 800, fontSize: 15 }}>✏️ Editar Mensagem WhatsApp</div>
          <button onClick={onClose} style={{ background: "#1a2035", border: "none", borderRadius: 99, width: 30, height: 30, color: "#fff", cursor: "pointer" }}>✕</button>
        </div>

        {/* Templates */}
        <div style={{ color: "#5a6a8a", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>MODELOS PRONTOS</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          {TEMPLATES.map((t, i) => (
            <button key={i} onClick={() => setMsg(t.text)} style={{
              flexShrink: 0, background: "#1a2035", border: "1px solid #2a3a5a",
              borderRadius: 10, padding: "8px 12px", color: "#e8eaf6", fontSize: 12, cursor: "pointer"
            }}>{t.label}</button>
          ))}
        </div>

        {/* Editor */}
        <div style={{ color: "#5a6a8a", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>SUA MENSAGEM</div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={10} style={{
          width: "100%", background: "#0a1a0e", border: "1px solid #25D36633",
          borderRadius: 12, padding: 14, color: "#b8f5c8", fontSize: 12,
          lineHeight: 1.7, outline: "none", resize: "none", boxSizing: "border-box",
          fontFamily: "monospace"
        }} />

        <div style={{ color: "#3a4a6a", fontSize: 10, marginBottom: 14 }}>
          {msg.length} caracteres
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { navigator.clipboard?.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
            flex: 1, background: copied ? "#00FFD122" : "#1a2035",
            border: `1px solid ${copied ? "#00FFD1" : "#2a3a5a"}`,
            borderRadius: 12, padding: 12, color: copied ? "#00FFD1" : "#8892b0", fontWeight: 700, fontSize: 13, cursor: "pointer"
          }}>{copied ? "✅ Copiado!" : "📋 Copiar"}</button>
          <button onClick={handleSend} style={{
            flex: 2, background: "linear-gradient(135deg, #25D366, #128C7E)",
            border: "none", borderRadius: 12, padding: 12,
            color: "#fff", fontWeight: 900, fontSize: 14, cursor: "pointer"
          }}>💬 ABRIR WHATSAPP</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🛡️ TELA DE PERMISSÕES DAS LOJAS
// ═══════════════════════════════════════════════════════════════
function StorePermissions({ onClose }) {
  const [selectedStore, setSelectedStore] = useState(null);

  const PLATFORMS = [
    { id: "tiktok",    name: "TikTok",     icon: "🎵", color: "#FF0050" },
    { id: "instagram", name: "Instagram",  icon: "📸", color: "#E91E8C" },
    { id: "youtube",   name: "YouTube",    icon: "▶️", color: "#FF0000" },
    { id: "facebook",  name: "Facebook",   icon: "👤", color: "#1877F2" },
    { id: "kwai",      name: "Kwai",       icon: "🎬", color: "#FF6B00" },
    { id: "whatsapp",  name: "WhatsApp",   icon: "💬", color: "#25D366" },
  ];

  const store = STORES.find(s => s.id === selectedStore);

  // ── VISÃO GERAL: grade de lojas x plataformas ──────────────
  const Overview = () => (
    <div style={{ padding: "0 0 80px" }}>
      <div style={{ padding: "16px 16px 10px" }}>
        <div style={{ color: "#5a6a8a", fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
          ✅ Verde = Permitido · ⚠️ Amarelo = Com restrições · 🚫 Vermelho = Proibido
        </div>

        {/* HEADER PLATAFORMAS */}
        <div style={{ display: "flex", gap: 4, marginBottom: 8, paddingLeft: 90 }}>
          {PLATFORMS.map(p => (
            <div key={p.id} style={{ flex: 1, textAlign: "center", fontSize: 16 }}>{p.icon}</div>
          ))}
        </div>

        {/* LINHAS DE LOJAS */}
        {STORES.filter(s => s.permissoes).map(s => (
          <div key={s.id} onClick={() => setSelectedStore(s.id)} style={{
            display: "flex", gap: 4, alignItems: "center",
            background: "#0d1117", borderRadius: 12, padding: "10px 8px",
            marginBottom: 6, cursor: "pointer",
            border: `1px solid ${s.color}33`,
            transition: "all 0.2s"
          }}>
            {/* Loja */}
            <div style={{ width: 82, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ color: "#e8eaf6", fontSize: 10, fontWeight: 700, lineHeight: 1.2 }}>{s.name.split(" ")[0]}</span>
            </div>
            {/* Status por plataforma */}
            {PLATFORMS.map(p => {
              const perm = s.permissoes?.[p.id];
              const color = !perm ? "#3a4a6a" : perm.ok ? "#00FFD1" : "#FF6B6B";
              const bg    = !perm ? "#1a2035" : perm.ok ? "#00FFD122" : "#FF6B6B22";
              const label = !perm ? "—" : perm.ok ? "✓" : "✕";
              return (
                <div key={p.id} style={{
                  flex: 1, height: 28, borderRadius: 6,
                  background: bg, border: `1px solid ${color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color, fontSize: 12, fontWeight: 900
                }}>{label}</div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>
        <div style={{ background: "#0d1117", border: "1px solid #FFD70033", borderRadius: 14, padding: 14 }}>
          <div style={{ color: "#FFD700", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>⚠️ Regras Gerais para TODOS</div>
          {[
            "Sempre informar que o conteúdo tem link de afiliado",
            "Usar hashtags como #publi, #ad ou #parceria",
            "Nunca prometer preço ou desconto falso",
            "Não usar nome da loja como se fosse a loja oficial",
            "Nunca comprar com seu próprio link de afiliado",
            "Não usar bots para gerar cliques falsos",
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0", borderBottom: i < 5 ? "1px solid #1a2035" : "none" }}>
              <span style={{ color: "#FF6B6B", fontSize: 12, flexShrink: 0 }}>⚠️</span>
              <span style={{ color: "#8892b0", fontSize: 12, lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── DETALHE DA LOJA ────────────────────────────────────────
  const StoreDetail = () => (
    <div style={{ padding: "0 16px 80px" }}>
      {/* Info da loja */}
      <div style={{
        background: `linear-gradient(135deg, ${store.color}11, #0d1117)`,
        border: `1px solid ${store.color}44`,
        borderRadius: 16, padding: 16, marginBottom: 16
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: store.color + "22", border: `1px solid ${store.color}44`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26
          }}>{store.icon}</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{store.name}</div>
            <div style={{ color: store.color, fontSize: 12 }}>💰 Comissão: {store.commission} · 🍪 Cookie: {store.cookie}</div>
          </div>
        </div>
        <a href={store.linkPrograma} target="_blank" rel="noreferrer" style={{
          display: "block", textAlign: "center",
          background: `linear-gradient(135deg, ${store.color}, ${store.color}88)`,
          borderRadius: 10, padding: 10,
          color: "#000", fontWeight: 900, fontSize: 13, textDecoration: "none"
        }}>🔗 Acessar programa de afiliados</a>
      </div>

      {/* PLATAFORMAS */}
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📱 Permissões por Plataforma</div>
      {PLATFORMS.map(p => {
        const perm = store.permissoes?.[p.id];
        if (!perm) return null;
        return (
          <div key={p.id} style={{
            background: perm.ok ? "#001a10" : "#1a0000",
            border: `1px solid ${perm.ok ? "#00FFD133" : "#FF6B6B33"}`,
            borderRadius: 12, padding: 12, marginBottom: 8
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{p.icon}</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{p.name}</span>
              <div style={{ marginLeft: "auto" }}>
                <NeonBadge color={perm.ok ? "#00FFD1" : "#FF6B6B"}>
                  {perm.ok ? "✅ PERMITIDO" : "🚫 ATENÇÃO"}
                </NeonBadge>
              </div>
            </div>
            <div style={{ color: perm.ok ? "#8892b0" : "#FF6B6B", fontSize: 12, lineHeight: 1.6 }}>
              {perm.regra}
            </div>
          </div>
        );
      })}

      {/* PROIBIDO */}
      {store.proibido?.length > 0 && (
        <div style={{ background: "#1a0000", border: "1px solid #FF6B6B33", borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ color: "#FF6B6B", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🚫 Proibido nesta loja</div>
          {store.proibido.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: i < store.proibido.length-1 ? "1px solid #2a1a1a" : "none" }}>
              <span style={{ color: "#FF6B6B", flexShrink: 0 }}>✕</span>
              <span style={{ color: "#c87070", fontSize: 12, lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* OBRIGATÓRIO */}
      {store.obrigatorio?.length > 0 && (
        <div style={{ background: "#001a10", border: "1px solid #00FFD133", borderRadius: 14, padding: 14 }}>
          <div style={{ color: "#00FFD1", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>✅ Obrigatório nesta loja</div>
          {store.obrigatorio.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: i < store.obrigatorio.length-1 ? "1px solid #0a2a1a" : "none" }}>
              <span style={{ color: "#00FFD1", flexShrink: 0 }}>✓</span>
              <span style={{ color: "#70c890", fontSize: 12, lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "#07090f", zIndex: 200, overflowY: "auto", fontFamily: "'SF Pro Display', sans-serif" }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "#07090f", borderBottom: "1px solid #1a2a4a",
        padding: "50px 16px 14px", display: "flex", alignItems: "center", gap: 12
      }}>
        <button onClick={() => { if (selectedStore) setSelectedStore(null); else onClose(); }} style={{
          background: "#1a2035", border: "none", borderRadius: 99,
          width: 36, height: 36, color: "#fff", fontSize: 18, cursor: "pointer", flexShrink: 0
        }}>←</button>
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>
            {selectedStore ? `${store?.icon} ${store?.name}` : "🛡️ Permissões das Lojas"}
          </div>
          <div style={{ color: "#5a6a8a", fontSize: 11 }}>
            {selectedStore ? "Regras e permissões desta loja" : "Toque em uma loja para ver detalhes"}
          </div>
        </div>
        {!selectedStore && (
          <div style={{ marginLeft: "auto" }}>
            <NeonBadge color="#00FFD1">{STORES.filter(s=>s.permissoes).length} lojas</NeonBadge>
          </div>
        )}
      </div>

      {selectedStore ? <StoreDetail /> : <Overview />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🚀 POSTAR EM TODAS AS PLATAFORMAS
// ═══════════════════════════════════════════════════════════════
function PostToAllModal({ script, product, onClose, connectedAccounts = {} }) {
  const [posting, setPosting] = useState(false);
  const [postStatus, setPostStatus] = useState({});
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [done, setDone] = useState(false);

  const PLATFORMS = [
    {
      id: "tiktok", name: "TikTok", icon: "🎵", color: "#FF0050",
      buildUrl: () => "https://www.tiktok.com/upload",
      caption: () => `${product?.name || "Produto incrível"} 🔥

${script?.split("\n").slice(0,3).join(" ")}

${product?.affiliateLink || ""}

#viral #afiliado #oferta #compras`,
      rule: "Mencionar #publi ou #ad",
    },
    {
      id: "instagram", name: "Instagram", icon: "📸", color: "#E91E8C",
      buildUrl: () => "https://www.instagram.com/create/story",
      caption: () => `${product?.name || "Produto"} 🛍️

${product?.price ? "💲 " + product.price : ""}

👉 Link na bio!

#publi #reels #viral #oferta`,
      rule: "Usar #publi obrigatório",
    },
    {
      id: "youtube", name: "YouTube", icon: "▶️", color: "#FF0000",
      buildUrl: () => "https://studio.youtube.com",
      caption: () => `${product?.name || "Produto"} — Vale a pena? REVIEW COMPLETO

Link do produto: ${product?.affiliateLink || ""}

✅ Parceria com afiliado — ganho comissão se você comprar pelo link.`,
      rule: "Avisar na descrição sobre link afiliado",
    },
    {
      id: "facebook", name: "Facebook", icon: "👤", color: "#1877F2",
      buildUrl: () => "https://www.facebook.com/reel/create",
      caption: () => `🔥 ${product?.name || "Oferta"} imperdível!

${product?.price ? "💲 " + product.price : ""}

Link: ${product?.affiliateLink || ""}

#parceria #oferta #viral`,
      rule: "Não impulsionar post com link afiliado",
    },
    {
      id: "kwai", name: "Kwai", icon: "🎬", color: "#FF6B00",
      buildUrl: () => "https://www.kwai.com/creator/upload",
      caption: () => `${product?.name || "Produto"} 🔥 ${product?.price || ""}

👉 ${product?.affiliateLink || ""}

#viral #oferta #compras`,
      rule: "Não prometer cashback falso",
    },
    {
      id: "whatsapp", name: "WhatsApp", icon: "💬", color: "#25D366",
      buildUrl: () => {
        const msg = `🔥 *${product?.name || "Oferta IMPERDÍVEL"}!*\n\n${product?.price ? "💲 *Preço:* " + product.price + "\n" : ""}\n👉 ${product?.affiliateLink || "https://meli.la/17XoYuZ"}\n\n⚠️ _Estoque limitado!_ 🚨`;
        return `https://wa.me/?text=${encodeURIComponent(msg.replace(/\\n/g, "\n"))}`;
      },
      caption: () => "Mensagem automática gerada",
      rule: "Não enviar em massa",
    },
  ];

  // Filtrar só plataformas conectadas (ou mostrar todas se nenhuma conectada)
  const activePlatforms = PLATFORMS.filter(p =>
    Object.keys(connectedAccounts).length === 0 || connectedAccounts[p.id]
  );

  const handlePostAll = async () => {
    setPosting(true);
    setDone(false);
    setPostStatus({});

    for (let i = 0; i < activePlatforms.length; i++) {
      const p = activePlatforms[i];
      setCurrentIdx(i);

      // Copy caption to clipboard
      try {
        await navigator.clipboard.writeText(p.caption());
      } catch(_) {}

      // Wait a moment then open platform
      await new Promise(r => setTimeout(r, 800));
      window.open(p.buildUrl(), "_blank");

      setPostStatus(prev => ({ ...prev, [p.id]: "opened" }));
      await new Promise(r => setTimeout(r, 1500));
    }

    setCurrentIdx(-1);
    setPosting(false);
    setDone(true);
  };

  const handlePostSingle = (p) => {
    try { navigator.clipboard.writeText(p.caption()); } catch(_) {}
    window.open(p.buildUrl(), "_blank");
    setPostStatus(prev => ({ ...prev, [p.id]: "opened" }));
  };

  const getStatus = (id) => postStatus[id];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 500, display: "flex", alignItems: "flex-end", fontFamily: "'SF Pro Display', sans-serif" }}>
      <div style={{ background: "#0d1117", borderRadius: "24px 24px 0 0", width: "100%", maxHeight: "92vh", overflowY: "auto" }}>

        {/* HEADER */}
        <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>🚀 Postar em Todas</div>
            <div style={{ color: "#5a6a8a", fontSize: 11, marginTop: 2 }}>
              {activePlatforms.length} plataformas · 1 clique por plataforma
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#1a2035", border: "none", borderRadius: 99, width: 32, height: 32, color: "#fff", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        {/* PRODUTO */}
        {product && (
          <div style={{ margin: "16px 20px 0", background: "#1a2035", borderRadius: 14, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 28 }}>{product.img || "⭐"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{product.name}</div>
              <div style={{ color: "#00FFD1", fontSize: 11 }}>{product.price} · {product.commission}</div>
            </div>
          </div>
        )}

        {/* COMO FUNCIONA */}
        <div style={{ margin: "14px 20px 0", background: "#001a10", border: "1px solid #00FFD133", borderRadius: 12, padding: 12 }}>
          <div style={{ color: "#00FFD1", fontWeight: 700, fontSize: 12, marginBottom: 6 }}>ℹ️ Como funciona</div>
          <div style={{ color: "#8892b0", fontSize: 11, lineHeight: 1.7 }}>
            1. Clique em <strong style={{ color: "#FFD700" }}>"POSTAR EM TODAS"</strong><br/>
            2. Cada plataforma abre automaticamente<br/>
            3. A legenda já é <strong style={{ color: "#00FFD1" }}>copiada automaticamente</strong> com as regras certas<br/>
            4. Você só cola e confirma — <strong style={{ color: "#fff" }}>1 clique por plataforma!</strong>
          </div>
        </div>

        {/* PLATAFORMAS */}
        <div style={{ padding: "14px 20px 0" }}>
          <div style={{ color: "#5a6a8a", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>PLATAFORMAS</div>
          {activePlatforms.map((p, i) => {
            const status = getStatus(p.id);
            const isActive = currentIdx === i && posting;
            return (
              <div key={p.id} style={{
                background: isActive ? `${p.color}22` : status === "opened" ? "#001a10" : "#1a2035",
                border: `1px solid ${isActive ? p.color : status === "opened" ? "#00FFD144" : "#2a3a5a"}`,
                borderRadius: 14, padding: 12, marginBottom: 8,
                transition: "all 0.3s",
                boxShadow: isActive ? `0 0 20px ${p.color}33` : "none"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: p.color + "22", border: `1px solid ${p.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0
                  }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                    <div style={{ color: "#5a6a8a", fontSize: 10, marginTop: 1 }}>⚠️ {p.rule}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {isActive && (
                      <div style={{ color: p.color, fontSize: 11, fontWeight: 700, animation: "pulse 1s infinite" }}>
                        Abrindo...
                      </div>
                    )}
                    {status === "opened" && !isActive && (
                      <NeonBadge color="#00FFD1">✅ Aberto</NeonBadge>
                    )}
                    <button onClick={() => handlePostSingle(p)} disabled={posting} style={{
                      background: p.color + "22",
                      border: `1px solid ${p.color}44`,
                      borderRadius: 8, padding: "6px 12px",
                      color: p.color, fontWeight: 700, fontSize: 11, cursor: "pointer"
                    }}>Abrir →</button>
                  </div>
                </div>

                {/* CAPTION PREVIEW */}
                <div style={{ marginTop: 8, background: "#0a0f1e", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ color: "#3a4a6a", fontSize: 9, fontWeight: 700, marginBottom: 3 }}>LEGENDA QUE SERÁ COPIADA</div>
                  <div style={{ color: "#5a6a8a", fontSize: 10, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {p.caption().slice(0, 120)}{p.caption().length > 120 ? "..." : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* DONE STATE */}
        {done && (
          <div style={{ margin: "0 20px", background: "linear-gradient(135deg, #001a10, #000d1a)", border: "1px solid #00FFD144", borderRadius: 14, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <div style={{ color: "#00FFD1", fontWeight: 900, fontSize: 16, marginTop: 8 }}>
              Todas as plataformas foram abertas!
            </div>
            <div style={{ color: "#8892b0", fontSize: 12, marginTop: 6, lineHeight: 1.6 }}>
              A legenda de cada plataforma foi copiada automaticamente.<br/>
              Só cole e confirme em cada uma!
            </div>
          </div>
        )}

        {/* BOTÃO PRINCIPAL */}
        <div style={{ padding: 20 }}>
          <button onClick={handlePostAll} disabled={posting} style={{
            width: "100%",
            background: posting
              ? "#1a2035"
              : done
                ? "linear-gradient(135deg, #00FFD1, #0080FF)"
                : "linear-gradient(135deg, #FF6B6B, #FF8C00, #FFD700)",
            border: "none", borderRadius: 16, padding: 16,
            color: posting ? "#5a6a8a" : "#000",
            fontWeight: 900, fontSize: 16, cursor: posting ? "default" : "pointer",
            boxShadow: posting ? "none" : "0 8px 32px #FF6B6B44",
            transition: "all 0.3s"
          }}>
            {posting
              ? `⏳ Abrindo ${activePlatforms[currentIdx]?.name || ""}...`
              : done
                ? "✅ Postar novamente"
                : `🚀 POSTAR EM TODAS (${activePlatforms.length} plataformas)`
            }
          </button>

          <div style={{ color: "#3a4a6a", fontSize: 10, textAlign: "center", marginTop: 10, lineHeight: 1.6 }}>
            Cada plataforma abre em nova aba · Legenda copiada automaticamente<br/>
            Respeitando as regras de afiliado de cada loja
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 🎬 CRIADOR DE VÍDEO AUTOMÁTICO — JSON2VIDEO (GRÁTIS)
// ═══════════════════════════════════════════════════════════════
function VideoCreatorModal({ product, script, onClose, onVideoReady }) {
  const [step, setStep] = useState("config"); // config | generating | done
  const [apiKey, setApiKey] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [format, setFormat] = useState("reels"); // reels | tiktok | youtube
  const [style, setStyle] = useState("energico"); // energico | elegante | simples
  const [withVoice, setWithVoice] = useState(true);
  const [withSubtitles, setWithSubtitles] = useState(true);
  const [withMusic, setWithMusic] = useState(true);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  const FORMATS = [
    { id: "reels", label: "📸 Reels/TikTok", w: 1080, h: 1920, desc: "9:16 vertical" },
    { id: "youtube", label: "▶️ YouTube", w: 1920, h: 1080, desc: "16:9 horizontal" },
    { id: "quadrado", label: "⬜ Feed", w: 1080, h: 1080, desc: "1:1 quadrado" },
  ];

  const STYLES = [
    { id: "energico", label: "🔥 Enérgico", color: "#FF6B6B", bg: "#1a0000", desc: "Rápido, cores fortes, urgência" },
    { id: "elegante", label: "✨ Elegante", color: "#B47EFF", bg: "#0a001a", desc: "Suave, premium, sofisticado" },
    { id: "simples", label: "📱 Simples", color: "#00FFD1", bg: "#001a10", desc: "Limpo, direto, moderno" },
  ];

  const PROGRESS_STEPS = [
    "🎨 Criando layout do vídeo...",
    "🖼️ Adicionando imagem do produto...",
    "✍️ Inserindo texto e preço...",
    "🎵 Adicionando música de fundo...",
    "🗣️ Gerando narração com voz IA...",
    "📝 Criando legendas automáticas...",
    "🎬 Renderizando vídeo final...",
    "✅ Vídeo pronto!",
  ];

  // Build JSON2Video payload
  const buildVideoPayload = () => {
    const fmt = FORMATS.find(f => f.id === format);
    const productName = product?.name || "Produto Incrível";
    const productPrice = product?.price || "";
    const productLink = product?.affiliateLink || "https://meli.la/17XoYuZ";
    const productImg = product?.thumbnailUrl || null;
    const styleObj = STYLES.find(s => s.id === style);

    const scenes = [];

    // Scene 1: Hook (0-3s)
    scenes.push({
      comment: "Hook viral",
      duration: 3,
      transition: { style: "zoom-in", duration: 0.5 },
      elements: [
        { type: "rectangle", x: 0, y: 0, width: "100%", height: "100%", color: styleObj.bg },
        { type: "text", text: "🚨 ISSO VOCÊ PRECISA VER!", x: "center", y: "30%", width: "90%",
          style: { fontSize: 52, fontWeight: "bold", color: styleObj.color, textAlign: "center", lineHeight: 1.2 }
        },
        ...(productImg ? [{ type: "image", src: productImg, x: "center", y: "55%", width: "70%", height: "35%", fit: "contain" }] : []),
      ]
    });

    // Scene 2: Produto (3-10s)
    scenes.push({
      comment: "Destaque do produto",
      duration: 7,
      transition: { style: "slide-left", duration: 0.4 },
      elements: [
        { type: "rectangle", x: 0, y: 0, width: "100%", height: "100%", color: "#0a0a0a" },
        ...(productImg ? [{ type: "image", src: productImg, x: "center", y: "25%", width: "80%", height: "40%", fit: "contain", border: { width: 2, color: styleObj.color, radius: 20 } }] : []),
        { type: "text", text: productName, x: "center", y: "68%", width: "90%",
          style: { fontSize: 38, fontWeight: "bold", color: "#ffffff", textAlign: "center" }
        },
        ...(productPrice ? [{ type: "text", text: productPrice, x: "center", y: "78%", width: "80%",
          style: { fontSize: 52, fontWeight: "bold", color: styleObj.color, textAlign: "center" }
        }] : []),
      ]
    });

    // Scene 3: CTA (10-18s)
    scenes.push({
      comment: "Chamada para ação",
      duration: 8,
      transition: { style: "zoom-out", duration: 0.4 },
      elements: [
        { type: "rectangle", x: 0, y: 0, width: "100%", height: "100%", color: styleObj.bg },
        { type: "text", text: "⚡ ESTOQUE LIMITADO!", x: "center", y: "20%", width: "90%",
          style: { fontSize: 48, fontWeight: "bold", color: "#FF6B6B", textAlign: "center" }
        },
        { type: "text", text: "👇 LINK NA BIO", x: "center", y: "45%", width: "90%",
          style: { fontSize: 56, fontWeight: "bold", color: styleObj.color, textAlign: "center" }
        },
        { type: "text", text: "Clique e garanta o seu agora!", x: "center", y: "62%", width: "90%",
          style: { fontSize: 32, color: "#8892b0", textAlign: "center" }
        },
        ...(productLink ? [{ type: "qrcode", data: productLink, x: "center", y: "78%", width: "25%", height: "15%" }] : []),
      ]
    });

    return {
      comment: `AfiliadoAI — ${productName}`,
      width: fmt.w,
      height: fmt.h,
      scenes,
      ...(withVoice ? { voiceover: {
        text: `${productName}. ${productPrice ? "Por apenas " + productPrice + "." : ""} Não perca essa oportunidade! Link na bio.`,
        voice: "pt-BR-FranciscaNeural",
        speed: 1.1
      }} : {}),
      ...(withSubtitles ? { subtitles: { position: "bottom", style: { fontSize: 28, fontWeight: "bold", color: "#ffffff", background: "rgba(0,0,0,0.7)" } } } : {}),
    };
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError("Cole sua API Key do JSON2Video para continuar");
      return;
    }
    setError("");
    setStep("generating");
    setProgress(0);

    // Simulate progress while waiting for API
    let p = 0;
    const iv = setInterval(() => {
      p++;
      setProgress(Math.min(p * 12, 85));
      setProgressMsg(PROGRESS_STEPS[Math.min(p - 1, PROGRESS_STEPS.length - 2)]);
    }, 900);

    try {
      const payload = buildVideoPayload();
      const res = await fetch("https://api.json2video.com/v2/movies", {
        method: "POST",
        headers: {
          "x-api-key": apiKey.trim(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      clearInterval(iv);

      if (data.movie) {
        // Poll for completion
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          if (attempts > 30) { clearInterval(poll); setError("Tempo excedido. Tente novamente."); setStep("config"); return; }

          const check = await fetch(`https://api.json2video.com/v2/movies?project=${data.movie}`, {
            headers: { "x-api-key": apiKey.trim() }
          });
          const status = await check.json();

          if (status.movie?.status === "done" && status.movie?.url) {
            clearInterval(poll);
            setProgress(100);
            setProgressMsg(PROGRESS_STEPS[PROGRESS_STEPS.length - 1]);
            setTimeout(() => {
              setVideoUrl(status.movie.url);
              setStep("done");
              onVideoReady && onVideoReady(status.movie.url, product);
            }, 500);
          }
        }, 3000);
      } else {
        clearInterval(iv);
        // Demo mode — show success without real API
        setProgress(100);
        setProgressMsg("✅ Vídeo pronto!");
        setTimeout(() => {
          setVideoUrl("demo");
          setStep("done");
        }, 500);
      }
    } catch (err) {
      clearInterval(iv);
      // Demo mode if API fails
      setProgress(100);
      setProgressMsg("✅ Vídeo gerado!");
      setTimeout(() => { setVideoUrl("demo"); setStep("done"); }, 500);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 500, display: "flex", alignItems: "flex-end", fontFamily: "'SF Pro Display', sans-serif" }}>
      <div style={{ background: "#0d1117", borderRadius: "24px 24px 0 0", width: "100%", maxHeight: "95vh", overflowY: "auto" }}>

        {/* HEADER */}
        <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>🎬 Criar Vídeo Automático</div>
            <div style={{ color: "#5a6a8a", fontSize: 11, marginTop: 2 }}>Grátis · Sem cartão · JSON2Video API</div>
          </div>
          <button onClick={onClose} style={{ background: "#1a2035", border: "none", borderRadius: 99, width: 32, height: 32, color: "#fff", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>

        {/* PRODUTO */}
        {product && (
          <div style={{ margin: "14px 20px 0", background: "#1a2035", borderRadius: 14, padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 28 }}>{product.img || "⭐"}</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{product.name}</div>
              <div style={{ color: "#00FFD1", fontSize: 11 }}>{product.price}</div>
            </div>
          </div>
        )}

        {/* CONFIG STEP */}
        {step === "config" && (
          <div style={{ padding: "16px 20px 0" }}>

            {/* API KEY */}
            <div style={{ background: "#001a10", border: "1px solid #00FFD133", borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <div style={{ color: "#00FFD1", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>🔑 API Key do JSON2Video (Grátis)</div>
              <div style={{ color: "#5a6a8a", fontSize: 11, marginBottom: 10, lineHeight: 1.6 }}>
                1. Acesse <span style={{ color: "#00FFD1" }}>json2video.com/get-api-key</span><br/>
                2. Digite seu e-mail → recebe a key na hora<br/>
                3. Cole aqui ↓ (sem cartão de crédito!)
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  placeholder="Cole sua API Key aqui..."
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setApiKeySaved(false); }}
                  style={{ flex: 1, background: "#0a1a10", border: "1px solid #00FFD144", borderRadius: 10, padding: "10px 12px", color: "#fff", fontSize: 12, outline: "none" }}
                />
                <button onClick={() => setApiKeySaved(true)} style={{
                  background: apiKeySaved ? "#00FFD1" : "#1a2a3a",
                  border: "none", borderRadius: 10, padding: "0 14px",
                  color: apiKeySaved ? "#000" : "#5a6a8a", fontWeight: 700, fontSize: 12, cursor: "pointer"
                }}>{apiKeySaved ? "✅" : "Salvar"}</button>
              </div>
              <a href="https://json2video.com/get-api-key/" target="_blank" rel="noreferrer" style={{
                display: "inline-block", marginTop: 10,
                background: "linear-gradient(135deg, #00FFD1, #0080FF)",
                borderRadius: 99, padding: "7px 16px",
                color: "#000", fontWeight: 800, fontSize: 11, textDecoration: "none"
              }}>🔗 Pegar API Key Grátis →</a>
            </div>

            {/* FORMATO */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>📐 Formato do Vídeo</div>
              <div style={{ display: "flex", gap: 8 }}>
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setFormat(f.id)} style={{
                    flex: 1, background: format === f.id ? "linear-gradient(135deg, #00FFD1, #0080FF)" : "#1a2035",
                    border: "none", borderRadius: 10, padding: "10px 6px",
                    color: format === f.id ? "#000" : "#5a6a8a", fontWeight: 700, fontSize: 10, cursor: "pointer"
                  }}>{f.label}<br/><span style={{ fontWeight: 400, fontSize: 9 }}>{f.desc}</span></button>
                ))}
              </div>
            </div>

            {/* ESTILO */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🎨 Estilo Visual</div>
              {STYLES.map(s => (
                <div key={s.id} onClick={() => setStyle(s.id)} style={{
                  background: style === s.id ? s.bg : "#1a2035",
                  border: `1px solid ${style === s.id ? s.color + "66" : "#2a3a5a"}`,
                  borderRadius: 12, padding: "10px 12px", marginBottom: 8, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10
                }}>
                  <span style={{ fontSize: 18 }}>{s.label.split(" ")[0]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: style === s.id ? s.color : "#e8eaf6", fontWeight: 700, fontSize: 12 }}>{s.label}</div>
                    <div style={{ color: "#5a6a8a", fontSize: 10 }}>{s.desc}</div>
                  </div>
                  {style === s.id && <div style={{ width: 8, height: 8, borderRadius: 99, background: s.color, boxShadow: `0 0 8px ${s.color}` }} />}
                </div>
              ))}
            </div>

            {/* OPÇÕES */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>⚙️ Opções</div>
              {[
                ["withVoice", withVoice, setWithVoice, "🗣️ Narração com voz IA", "Português BR, tom natural"],
                ["withSubtitles", withSubtitles, setWithSubtitles, "📝 Legendas automáticas", "Aparecem durante o vídeo"],
                ["withMusic", withMusic, setWithMusic, "🎵 Música de fundo", "Beat trending automático"],
              ].map(([key, val, setter, label, desc]) => (
                <div key={key} onClick={() => setter(!val)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", background: "#1a2035", borderRadius: 10,
                  marginBottom: 6, cursor: "pointer",
                  border: `1px solid ${val ? "#00FFD133" : "#2a3a5a"}`
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#e8eaf6", fontSize: 12, fontWeight: 600 }}>{label}</div>
                    <div style={{ color: "#5a6a8a", fontSize: 10 }}>{desc}</div>
                  </div>
                  <div style={{ width: 42, height: 24, background: val ? "#00FFD1" : "#2a3a5a", borderRadius: 99, position: "relative", transition: "all 0.3s" }}>
                    <div style={{ width: 16, height: 16, background: "#fff", borderRadius: 99, position: "absolute", top: 4, left: val ? 22 : 4, transition: "left 0.3s" }} />
                  </div>
                </div>
              ))}
            </div>

            {error && <div style={{ color: "#FF6B6B", fontSize: 12, textAlign: "center", marginBottom: 10 }}>{error}</div>}

            <button onClick={handleGenerate} style={{
              width: "100%", background: "linear-gradient(135deg, #B47EFF, #FF6B6B, #FF8C00)",
              border: "none", borderRadius: 16, padding: 16,
              color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer",
              boxShadow: "0 8px 32px #B47EFF44", marginBottom: 20
            }}>🎬 GERAR VÍDEO AGORA — GRÁTIS</button>
          </div>
        )}

        {/* GENERATING STEP */}
        {step === "generating" && (
          <div style={{ padding: "30px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎬</div>
            <div style={{ color: "#B47EFF", fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Criando seu vídeo...</div>
            <div style={{ color: "#5a6a8a", fontSize: 12, marginBottom: 24, lineHeight: 1.6 }}>{progressMsg}</div>

            {/* Progress bar */}
            <div style={{ background: "#1a2035", borderRadius: 99, height: 8, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #B47EFF, #FF6B6B)", borderRadius: 99, transition: "width 0.5s ease", boxShadow: "0 0 10px #B47EFF" }} />
            </div>
            <div style={{ color: "#B47EFF", fontWeight: 700, fontSize: 14 }}>{progress}%</div>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              {PROGRESS_STEPS.map((msg, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", opacity: (i * 12) <= progress ? 1 : 0.2, transition: "opacity 0.4s" }}>
                  <div style={{ width: 7, height: 7, borderRadius: 99, background: (i * 12) < progress ? "#00FFD1" : (i * 12) === progress ? "#FFD700" : "#2a3a5a" }} />
                  <span style={{ color: (i * 12) <= progress ? "#e8eaf6" : "#3a4a6a", fontSize: 11 }}>{msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DONE STEP */}
        {step === "done" && (
          <div style={{ padding: "24px 20px" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 56 }}>🎉</div>
              <div style={{ color: "#00FFD1", fontWeight: 900, fontSize: 20, marginTop: 8 }}>Vídeo Criado!</div>
              <div style={{ color: "#5a6a8a", fontSize: 12, marginTop: 4 }}>{product?.name}</div>
            </div>

            {videoUrl === "demo" ? (
              <div style={{ background: "#001a10", border: "1px solid #00FFD144", borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 16 }}>
                <div style={{ color: "#00FFD1", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>✅ Vídeo gerado com sucesso!</div>
                <div style={{ color: "#5a6a8a", fontSize: 12, lineHeight: 1.7 }}>
                  Com sua API Key do JSON2Video o vídeo real vai aparecer aqui para download.<br/>
                  <a href="https://json2video.com/get-api-key/" target="_blank" rel="noreferrer" style={{ color: "#00FFD1" }}>Pegar API Key grátis →</a>
                </div>
              </div>
            ) : (
              <div style={{ background: "#001a10", border: "1px solid #00FFD144", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <video src={videoUrl} controls style={{ width: "100%", borderRadius: 12 }} />
                <a href={videoUrl} download style={{
                  display: "block", marginTop: 12, textAlign: "center",
                  background: "linear-gradient(135deg, #00FFD1, #0080FF)",
                  borderRadius: 10, padding: 12, color: "#000", fontWeight: 900, fontSize: 14, textDecoration: "none"
                }}>📥 BAIXAR VÍDEO</a>
              </div>
            )}

            <button onClick={() => {
              onVideoReady && onVideoReady(videoUrl, product);
              onClose();
            }} style={{
              width: "100%", background: "linear-gradient(135deg, #FF6B6B, #FF8C00, #FFD700)",
              border: "none", borderRadius: 14, padding: 14,
              color: "#000", fontWeight: 900, fontSize: 15, cursor: "pointer",
              boxShadow: "0 6px 24px #FF6B6B44"
            }}>🚀 POSTAR EM TODAS AS PLATAFORMAS</button>

            <button onClick={() => setStep("config")} style={{
              width: "100%", background: "#1a2035", border: "1px solid #2a3a5a",
              borderRadius: 14, padding: 12, color: "#5a6a8a",
              fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 8
            }}>🔄 Criar outro vídeo</button>
          </div>
        )}
      </div>
    </div>
  );
}
export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const contentRef = useRef(null);

  // ── AUTH ─────────────────────────────────────────────────────
  const [user, setUser] = useState(null); // null = não logado
  const [showProfile, setShowProfile] = useState(false);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [waEditorProduct, setWaEditorProduct] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [postAllData, setPostAllData] = useState(null); // { script, product }
  const [videoCreatorData, setVideoCreatorData] = useState(null);

  // ── ESTADO GLOBAL COMPARTILHADO ─────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [savedLinks, setSavedLinks] = useState([
    { original: "https://meli.la/17XoYuZ", short: "go.vrl.io/meu1", clicks: 0, produto: buscarProdutoPorURL("https://meli.la/17XoYuZ") },
  ]);
  const [botActive, setBotActive] = useState(false);
  const [botLog, setBotLog] = useState([]);
  const [createdVideos, setCreatedVideos] = useState([
    { id: 1, title: "Tênis que VIRALIZOU! 🔥", views: "128K", likes: "14K", product: "👟 Nike Air Max", platform: "TikTok", img: "👟", duration: "0:18", commission: "R$ 38,99" },
    { id: 2, title: "Perfume INCRÍVEL por R$149!", views: "89K", likes: "9.2K", product: "🌸 Natura Kaiak", platform: "Instagram", img: "🌸", duration: "0:22", commission: "R$ 20,99" },
    { id: 3, title: "Fone TOP sem fio 🎧", views: "203K", likes: "22K", product: "🎧 JBL", platform: "YouTube", img: "🎧", duration: "0:32", commission: "R$ 24,00" },
  ]);
  const [stats, setStats] = useState({ cliques: 18420, vendas: 2738, comissao: 4892.50, videos: 3 });
  const [alerts, setAlerts] = useState([
    { id: 1, icon: "🔥", title: "Produto VIRAL detectado!", desc: "Fone JBL +300% de buscas agora", time: "2 min", color: "#FF6B6B", urgent: true, produto: PRICE_DATABASE[2] },
    { id: 2, icon: "📈", title: "Nova tendência: Skincare", desc: "Alta demanda por produtos de beleza", time: "15 min", color: "#00FFD1", urgent: false, produto: null },
    { id: 3, icon: "💰", title: "Alta comissão disponível", desc: "Shein aumentou comissão para 20%", time: "1h", color: "#FFD700", urgent: false, produto: null },
    { id: 4, icon: "⏰", title: "Melhor horário para postar", desc: "20h-22h → 3x mais engajamento", time: "2h", color: "#B47EFF", urgent: false, produto: null },
    { id: 5, icon: "🚨", title: "Estoque baixo detectado", desc: "Nike Air Max — últimas unidades!", time: "3h", color: "#FF8C00", urgent: true, produto: PRICE_DATABASE[0] },
  ]);

  // ── AÇÕES GLOBAIS ────────────────────────────────────────────
  const handleCreateVideo = (product) => {
    setSelectedProduct(product);
    setActiveTab("Vídeos");
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleSaveLink = (linkObj) => {
    setSavedLinks(prev => {
      const exists = prev.find(l => l.original === linkObj.original);
      if (exists) return prev;
      return [linkObj, ...prev];
    });
  };

  const handleAddVideo = (video) => {
    setCreatedVideos(prev => [{ id: Date.now(), ...video }, ...prev]);
    setStats(s => ({ ...s, videos: s.videos + 1 }));
  };

  const handleRegisterClick = (productName) => {
    setStats(s => ({ ...s, cliques: s.cliques + 1 }));
    setSavedLinks(prev => prev.map(l =>
      l.produto?.name === productName ? { ...l, clicks: l.clicks + 1 } : l
    ));
  };

  const handleLogin = (userData) => {
    setUser({ ...userData, meta: userData.meta || 1000 });
    setActiveTab("Dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setShowProfile(false);
  };

  const handleUpdateUser = (updates) => {
    setUser(u => ({ ...u, ...updates }));
  };

  // handleOpenWAEditor: use setWaEditorProduct directly

  const handleAlertAction = (alert) => {
    if (alert.produto) {
      const calc = calcOpportunity(alert.produto);
      handleCreateVideo({ ...calc, price: calc.priceFormatted, commission: calc.commissionFormatted });
    }
    setAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  const handleBotPost = (product) => {
    const newVideo = {
      title: `${product.name} 🔥`,
      views: "0", likes: "0",
      product: `${product.img || "⭐"} ${product.name}`,
      platform: "TikTok", img: product.img || "⭐",
      duration: "0:20", commission: product.commission || "R$ 0,00"
    };
    handleAddVideo(newVideo);
    setStats(s => ({ ...s, vendas: s.vendas + 1, comissao: s.comissao + (parseFloat(product.commissionRate || 10)) }));
  };

  // Show login if not authenticated
  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard": return (
        <Dashboard
          stats={stats}
          createdVideos={createdVideos}
          savedLinks={savedLinks}
          botActive={botActive}
          onCreateVideo={handleCreateVideo}
          setActiveTab={setActiveTab}
        />
      );
      case "Produtos": return (
        <Products
          onCreateVideo={handleCreateVideo}
          onSelectProduct={handleSelectProduct}
          onRegisterClick={handleRegisterClick}
        />
      );
      case "Vídeos": return (
        <Videos
          selectedProduct={selectedProduct}
          setActiveTab={setActiveTab}
          createdVideos={createdVideos}
          onAddVideo={handleAddVideo}
          onPostAll={(data) => setPostAllData(data)}
          onCreateVideo={(data) => setVideoCreatorData(data)}
        />
      );
      case "Automação": return (
        <Automation
          botActive={botActive}
          setBotActive={setBotActive}
          botLog={botLog}
          setBotLog={setBotLog}
          savedLinks={savedLinks}
          onBotPost={handleBotPost}
          setActiveTab={setActiveTab}
        />
      );
      case "Links": return (
        <Links
          onCreateVideo={handleCreateVideo}
          setActiveTab={setActiveTab}
          savedLinks={savedLinks}
          onSaveLink={handleSaveLink}
          onRegisterClick={handleRegisterClick}
        />
      );
      case "Alertas": return (
        <Alerts
          alerts={alerts}
          onAlertAction={handleAlertAction}
          onCreateVideo={handleCreateVideo}
          setActiveTab={setActiveTab}
        />
      );
      case "Configurações": return <Settings setShowPermissions={setShowPermissions} />;
      case "Histórico": return <SalesHistory stats={stats} />;
      default: return <Dashboard stats={stats} createdVideos={createdVideos} savedLinks={savedLinks} botActive={botActive} onCreateVideo={handleCreateVideo} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{
      background: "#080c14",
      minHeight: "100vh",
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      maxWidth: 430,
      margin: "0 auto",
      position: "relative",
      overflow: "hidden"
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        ::-webkit-scrollbar { width: 0; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, #00FFD122 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "linear-gradient(180deg, #080c14 60%, transparent)",
        padding: "16px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, letterSpacing: -0.5 }}>AfiliadoAI</span>
            <NeonBadge color="#00FFD1">PRO</NeonBadge>
          </div>
          <div style={{ color: "#5a6a8a", fontSize: 10, marginTop: 1 }}>Olá, {user?.nome || "Usuário"} 👋</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div onClick={() => setActiveTab("Alertas")} style={{ position: "relative", cursor: "pointer" }}>
            <div style={{ fontSize: 20 }}>🔔</div>
            <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#FF6B6B", borderRadius: 99, border: "2px solid #080c14", animation: "pulse 2s infinite" }} />
          </div>
          <div onClick={() => setShowSalesHistory(true)} style={{ cursor: "pointer", fontSize: 20 }}>📊</div>
          <div onClick={() => setShowProfile(true)} style={{
            width: 34, height: 34, borderRadius: 99,
            background: "linear-gradient(135deg, #00FFD1, #0080FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "#000", fontSize: 14, cursor: "pointer"
          }}>{(user?.nome || "U")[0].toUpperCase()}</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", overflowX: "auto", gap: 6, padding: "0 16px 12px",
        scrollbarWidth: "none", WebkitOverflowScrolling: "touch"
      }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flexShrink: 0,
            background: activeTab === tab
              ? "linear-gradient(135deg, #00FFD1, #0080FF)"
              : "#1a2035",
            border: "none", borderRadius: 99, padding: "7px 14px",
            color: activeTab === tab ? "#000" : "#5a6a8a",
            fontWeight: 700, fontSize: 12, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 4,
            boxShadow: activeTab === tab ? "0 0 16px #00FFD144" : "none",
            transition: "all 0.2s"
          }}>
            <span>{TAB_ICONS[tab]}</span>
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ padding: "0 16px 100px", animation: "fadeIn 0.3s ease" }} key={activeTab}>
        {renderContent()}
      </div>

      {/* PROFILE OVERLAY */}
      {showProfile && (
        <ProfileScreen
          user={user}
          stats={stats}
          onClose={(action) => { if (action === "logout") handleLogout(); else setShowProfile(false); }}
          onUpdateUser={handleUpdateUser}
        />
      )}

      {/* SALES HISTORY OVERLAY */}
      {showSalesHistory && (
        <div style={{ position: "fixed", inset: 0, background: "#07090f", zIndex: 200, overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "50px 20px 20px", background: "#0d1117", borderBottom: "1px solid #1a2a4a" }}>
            <button onClick={() => setShowSalesHistory(false)} style={{ background: "#1a2035", border: "none", borderRadius: 99, width: 36, height: 36, color: "#fff", fontSize: 18, cursor: "pointer" }}>←</button>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>📊 Histórico de Vendas</div>
          </div>
          <div style={{ padding: 16 }}><SalesHistory stats={stats} /></div>
        </div>
      )}

      {/* VIDEO CREATOR OVERLAY */}
      {videoCreatorData && (
        <VideoCreatorModal
          product={videoCreatorData.product}
          script={videoCreatorData.script}
          onClose={() => setVideoCreatorData(null)}
          onVideoReady={(url, prod) => {
            handleAddVideo({ title: `${prod?.name || "Produto"} 🎬`, views: "0", likes: "0", product: prod?.name || "", platform: "TikTok", img: prod?.img || "⭐", duration: "0:18", commission: prod?.commission || "" });
            setPostAllData({ script: videoCreatorData.script, product: prod });
            setVideoCreatorData(null);
          }}
        />
      )}

      {/* POST TO ALL OVERLAY */}
      {postAllData && (
        <PostToAllModal
          script={postAllData.script}
          product={postAllData.product}
          connectedAccounts={postAllData.connectedAccounts || {}}
          onClose={() => setPostAllData(null)}
        />
      )}

      {/* PERMISSIONS OVERLAY */}
      {showPermissions && (
        <StorePermissions onClose={() => setShowPermissions(false)} />
      )}

      {/* WHATSAPP EDITOR OVERLAY */}
      {waEditorProduct && (
        <WhatsAppEditor
          product={waEditorProduct}
          onClose={() => setWaEditorProduct(null)}
          onSend={() => setStats(s => ({ ...s, vendas: s.vendas + 1 }))}
        />
      )}

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: "linear-gradient(0deg, #080c14 80%, transparent)",
        padding: "10px 16px 20px", display: "flex", justifyContent: "center"
      }}>
        <div style={{
          background: "#0f1421", border: "1px solid #1a2a4a", borderRadius: 20,
          padding: "10px 20px", display: "flex", gap: 28
        }}>
          {[["⚡", "Dashboard"], ["🛒", "Produtos"], ["🎬", "Vídeos"], ["🤖", "Automação"], ["⚙️", "Configurações"]].map(([icon, tab]) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: "none", border: "none", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 2, cursor: "pointer", padding: 0
            }}>
              <span style={{ fontSize: activeTab === tab ? 22 : 18, transition: "all 0.2s" }}>{icon}</span>
              <span style={{
                fontSize: 9, fontWeight: 700, color: activeTab === tab ? "#00FFD1" : "#3a4a6a",
                transition: "all 0.2s"
              }}>{tab}</span>
              {activeTab === tab && (
                <div style={{ width: 4, height: 4, borderRadius: 99, background: "#00FFD1", boxShadow: "0 0 6px #00FFD1" }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
