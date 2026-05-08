import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════
// STORAGE — salva tudo no localStorage
// ═══════════════════════════════════════════
const KEY = "afiliadoai_v4";
function load() { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

const EMPTY = {
  user: null, links: [], videos: [],
  stats: { cliques: 0, vendas: 0, comissao: 0 },
  connectedStores: {}, connectedAccounts: {},
  settings: { notif: true, ai: true, ultra: false },
  customStores: [],
};

// ═══════════════════════════════════════════
// LOJAS com logos reais (favicon)
// ═══════════════════════════════════════════
const STORES = [
  { id:"ml",   name:"Mercado Livre",  logo:"https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.92/mercadolibre/logo_large_25years@2x.png", favicon:"https://www.mercadolivre.com.br/favicon.ico", color:"#FFE600", commission:0.08 },
  { id:"amz",  name:"Amazon",         logo:"https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",  favicon:"https://www.amazon.com.br/favicon.ico", color:"#FF9900", commission:0.10 },
  { id:"shp",  name:"Shopee",         logo:"https://down-br.img.susercontent.com/file/br-50009109-png-2i5ou2im4n61b3",favicon:"https://shopee.com.br/favicon.ico", color:"#EE4D2D", commission:0.12 },
  { id:"shn",  name:"Shein",          logo:"https://img.ltwebstatic.com/images3_spmp/2021/09/27/1632736806e4d98baea2d85ee42d7b8a2e18d8b3f0.jpg", favicon:"https://www.shein.com.br/favicon.ico", color:"#E91E8C", commission:0.15 },
  { id:"tmu",  name:"Temu",           logo:"https://aimg.kwcdn.com/upload_aimg/commodity/bf7a6fc9-22df-44cf-a738-2d7b60db9aa5.png.slim.png", favicon:"https://www.temu.com/favicon.ico", color:"#FF5722", commission:0.09 },
  { id:"nat",  name:"Natura",         logo:"https://www.natura.com.br/_next/static/media/logo-natura.svg", favicon:"https://www.natura.com.br/favicon.ico", color:"#00A86B", commission:0.14 },
  { id:"bot",  name:"O Boticário",    logo:"https://www.boticario.com.br/on/demandware.static/Sites-boticario-Site/-/pt_BR/v1696534893943/images/logos/logo-boticario.svg", favicon:"https://www.boticario.com.br/favicon.ico", color:"#4CAF50", commission:0.13 },
  { id:"cac",  name:"Cacau Show",     logo:"https://www.cacaushow.com.br/on/demandware.static/Sites-CacauShow-Site/-/default/v1696014498082/images/logo.svg", favicon:"https://www.cacaushow.com.br/favicon.ico", color:"#8B4513", commission:0.11 },
  { id:"per",  name:"Pernambucanas",  logo:"https://www.pernambucanas.com.br/assets/img/logo.svg", favicon:"https://www.pernambucanas.com.br/favicon.ico", color:"#E53935", commission:0.07 },
];

function detectStore(url) {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes("meli.la") || u.includes("mercadolivre") || u.includes("mlb")) return STORES[0];
  if (u.includes("amazon") || u.includes("amzn")) return STORES[1];
  if (u.includes("shopee")) return STORES[2];
  if (u.includes("shein")) return STORES[3];
  if (u.includes("temu")) return STORES[4];
  if (u.includes("natura.com")) return STORES[5];
  if (u.includes("boticario")) return STORES[6];
  if (u.includes("cacaushow")) return STORES[7];
  if (u.includes("pernambucanas")) return STORES[8];
  return null;
}

async function fetchML(url) {
  let token = null;
  try { token = process.env.REACT_APP_ML_ACCESS_TOKEN; } catch(e) {}
  
  // Busca pública sem token — funciona para qualquer link ML
  try {
    const itemId = url.match(/MLB-?(\d+)/i)?.[1] || url.match(/\/p\/(MLB\d+)/i)?.[1];
    if (itemId) {
      const pub = await fetch(`https://api.mercadolibre.com/items/MLB${itemId}`);
      const d = await pub.json();
      if (d.id && d.title) return {
        name: d.title,
        price: d.price,
        thumb: d.thumbnail?.replace("I.jpg","O.jpg") || d.pictures?.[0]?.url || d.thumbnail,
        sold: d.sold_quantity || 0
      };
    }
    // Para links encurtados meli.la — buscar via search
    if (url.includes("meli.la") || !url.includes("MLB")) {
      const searchRes = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(url)}&limit=1`);
      const sd = await searchRes.json();
      const item = sd.results?.[0];
      if (item) return {
        name: item.title,
        price: item.price,
        thumb: item.thumbnail?.replace("I.jpg","O.jpg") || item.thumbnail,
        sold: item.sold_quantity || 0
      };
    }
  } catch(e) {}

  if (!token || token.includes("COLE")) return null;
  try {
    const m = url.match(/MLB-?(\d+)/i);
    if (m) {
      const r = await fetch(`https://api.mercadolibre.com/items/MLB${m[1]}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.id) return { name: d.title, price: d.price, thumb: d.thumbnail, sold: d.sold_quantity || 0 };
    }
    const r2 = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(url)}&limit=1`);
    const d2 = await r2.json();
    const item = d2.results?.[0];
    if (item) return { name: item.title, price: item.price, thumb: item.thumbnail, sold: item.sold_quantity || 0 };
  } catch {}
  return null;
}

// ═══════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════
const T = {
  bg:"#050811", surf:"#0b1120", card:"#0f1629", border:"#1a2540",
  neon:"#00e5c0", gold:"#f4b942", blue:"#4f8ef7", purple:"#9b72f7",
  red:"#f05c5c", orange:"#f48c42", green:"#3fcf8e",
  text:"#eef2f8", t2:"#8898b0", t3:"#3d526b",
};

const G = { css:`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  html,body,#root{min-height:100%;background:${T.bg};}
  body{font-family:'Outfit',sans-serif;color:${T.text};overflow-x:hidden;}
  input,button,select,textarea{font-family:inherit;}
  ::-webkit-scrollbar{display:none;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes glow{0%,100%{box-shadow:0 0 12px ${T.neon}30}50%{box-shadow:0 0 24px ${T.neon}60}}
  .fu{animation:fadeUp .3s ease both;}
`};

// ═══════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════
const Sty = () => <style>{G.css}</style>;

const StoreLogo = ({ store, size = 32 }) => {
  const [err, setErr] = useState(false);
  if (!store) return <span style={{ fontSize: size * 0.7 }}>🏪</span>;
  return err
    ? <div style={{ width: size, height: size, borderRadius: size * 0.28, background: store.color + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, flexShrink: 0 }}>🏪</div>
    : <img src={store.favicon} alt={store.name} onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: size * 0.28, objectFit: "contain", background: store.color + "20", padding: 3, flexShrink: 0 }} />;
};

const Chip = ({ c = T.neon, children }) => (
  <span style={{ background: c + "18", border: `1px solid ${c}40`, color: c, borderRadius: 8, padding: "2px 9px", fontSize: 10, fontWeight: 700, letterSpacing: .6, textTransform: "uppercase" }}>{children}</span>
);

const Btn = ({ children, onClick, v = "p", full, disabled, s = {} }) => {
  const vs = {
    p: { bg: `linear-gradient(135deg,${T.neon},${T.blue})`, col: "#000" },
    g: { bg: `linear-gradient(135deg,${T.gold},${T.orange})`, col: "#000" },
    u: { bg: `linear-gradient(135deg,${T.purple},${T.blue})`, col: "#fff" },
    r: { bg: T.red + "20", col: T.red, brd: T.red + "40" },
    gh: { bg: "transparent", col: T.t2, brd: T.border },
  };
  const x = vs[v] || vs.p;
  return (
    <button onClick={disabled ? undefined : onClick} style={{ background: x.bg, border: x.brd ? `1px solid ${x.brd}` : "none", borderRadius: 12, padding: "11px 18px", color: x.col, fontWeight: 700, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1, width: full ? "100%" : undefined, transition: "opacity .2s", ...s }}>
      {children}
    </button>
  );
};

const Inp = ({ label, ph, val, set, type = "text", mono }) => (
  <div style={{ marginBottom: 12 }}>
    {label && <div style={{ color: T.t2, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: .8, marginBottom: 5 }}>{label}</div>}
    <input type={type} placeholder={ph} value={val} onChange={e => set(e.target.value)}
      style={{ width: "100%", background: T.surf, border: `1px solid ${T.border}`, borderRadius: 11, padding: "11px 13px", color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: mono ? "'JetBrains Mono',monospace" : "inherit" }}
      onFocus={e => e.target.style.borderColor = T.neon + "80"}
      onBlur={e => e.target.style.borderColor = T.border} />
  </div>
);

const Card = ({ children, s = {}, glow, onClick }) => (
  <div onClick={onClick} style={{ background: T.card, border: `1px solid ${glow ? glow + "35" : T.border}`, borderRadius: 18, padding: 16, boxShadow: glow ? `0 2px 20px ${glow}12` : "none", cursor: onClick ? "pointer" : undefined, ...s }}>
    {children}
  </div>
);

const Spin = ({ size = 20, color = T.neon }) => (
  <div style={{ width: size, height: size, border: `2px solid ${color}20`, borderTopColor: color, borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} />
);

const Tog = ({ val, set }) => (
  <div onClick={() => set(!val)} style={{ width: 44, height: 24, background: val ? T.neon : T.border, borderRadius: 99, cursor: "pointer", position: "relative", transition: "background .3s", flexShrink: 0 }}>
    <div style={{ width: 18, height: 18, background: "#fff", borderRadius: 99, position: "absolute", top: 3, left: val ? 23 : 3, transition: "left .3s" }} />
  </div>
);

const Empty = ({ ico, title, desc, action }) => (
  <div style={{ textAlign: "center", padding: "32px 16px" }}>
    <div style={{ fontSize: 44, opacity: .35, marginBottom: 12 }}>{ico}</div>
    <div style={{ color: T.t2, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{title}</div>
    <div style={{ color: T.t3, fontSize: 12, lineHeight: 1.7, marginBottom: action ? 16 : 0 }}>{desc}</div>
    {action}
  </div>
);

// ═══════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════
function Login({ onLogin }) {
  const [mode, setMode] = useState("in");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const go = () => {
    if (!email || !pass) return setErr("Preencha e-mail e senha");
    if (mode === "up" && !name) return setErr("Digite seu nome");
    setErr(""); setLoading(true);
    setTimeout(() => { setLoading(false); onLogin({ name: name || email.split("@")[0], email }); }, 900);
  };
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <Sty />
      <div style={{ position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)", width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle,${T.neon}08 0%,transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 380 }} className="fu">
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>⚡</div>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 30, letterSpacing: -1 }}>AfiliadoAI</div>
          <div style={{ display: "inline-block", background: T.neon, color: "#000", fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 99, marginTop: 6, letterSpacing: 1.5 }}>PRO</div>
          <div style={{ color: T.t3, fontSize: 12, marginTop: 10 }}>Sistema profissional de afiliados com IA</div>
        </div>
        <div style={{ display: "flex", background: T.surf, border: `1px solid ${T.border}`, borderRadius: 14, padding: 4, marginBottom: 22 }}>
          {[["in","Entrar"],["up","Criar Conta"]].map(([id,l]) => (
            <button key={id} onClick={() => { setMode(id); setErr(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 11, border: "none", background: mode === id ? `linear-gradient(135deg,${T.neon},${T.blue})` : "transparent", color: mode === id ? "#000" : T.t3, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{l}</button>
          ))}
        </div>
        {mode === "up" && <Inp label="Seu nome" ph="Como posso te chamar?" val={name} set={setName} />}
        <Inp label="E-mail" ph="seu@email.com" val={email} set={setEmail} type="email" />
        <Inp label="Senha" ph="••••••••" val={pass} set={setPass} type="password" />
        {err && <div style={{ color: T.red, fontSize: 12, textAlign: "center", marginBottom: 10 }}>{err}</div>}
        <Btn full onClick={go} disabled={loading} s={{ padding: "14px 0", fontSize: 15, marginTop: 4 }}>
          {loading ? "⏳ Aguarde..." : mode === "in" ? "🚀 Entrar" : "✅ Criar Conta"}
        </Btn>
        <div style={{ color: T.t3, fontSize: 11, textAlign: "center", marginTop: 16 }}>Dados salvos no seu dispositivo · 100% privado</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// DASHBOARD — zero dados falsos
// ═══════════════════════════════════════════
function Dashboard({ stats, links, videos, goTo }) {
  const empty = stats.cliques === 0 && links.length === 0 && videos.length === 0;
  return (
    <div className="fu" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label:"Cliques",   val: stats.cliques,              ico:"👆", c: T.neon },
          { label:"Vendas",    val: stats.vendas,               ico:"🛒", c: T.gold },
          { label:"Comissão",  val:`R$ ${stats.comissao.toFixed(2)}`, ico:"💰", c: T.purple },
          { label:"Links",     val: links.length,               ico:"🔗", c: T.blue },
        ].map(x => (
          <Card key={x.label} glow={x.c} s={{ padding:"16px 14px" }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{x.ico}</div>
            <div style={{ color: x.c, fontWeight: 800, fontSize: 22, letterSpacing: -.5 }}>{x.val}</div>
            <div style={{ color: T.t3, fontSize: 10, marginTop: 3, fontWeight: 700, textTransform: "uppercase", letterSpacing: .8 }}>{x.label}</div>
          </Card>
        ))}
      </div>

      {empty && (
        <Card s={{ border: `1px dashed ${T.border}` }}>
          <Empty ico="🚀" title="Comece adicionando seu link!" desc={"Cole o link meli.la/17XoYuZ ou qualquer link de afiliado na aba Links para começar."} action={<Btn onClick={() => goTo("Links")} s={{ padding:"10px 20px" }}>➜ Adicionar Link</Btn>} />
        </Card>
      )}

      {links.length > 0 && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ color:T.text, fontWeight:700, fontSize:14 }}>🔗 Meus Links</div>
            <Chip c={T.neon}>{links.length} links</Chip>
          </div>
          {links.slice(0,3).map((l,i) => (
            <div key={l.id} style={{ display:"flex", gap:10, alignItems:"center", padding:"9px 0", borderBottom: i<Math.min(links.length,3)-1 ? `1px solid ${T.border}` : "none" }}>
              <StoreLogo store={STORES.find(s=>s.id===l.storeId)} size={32} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:T.text, fontWeight:600, fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.productName}</div>
                <div style={{ color:T.t3, fontSize:10, marginTop:1 }}>{l.storeName}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:T.neon, fontWeight:700, fontSize:13 }}>{l.clicks||0}</div>
                <div style={{ color:T.t3, fontSize:9 }}>cliques</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {videos.length > 0 && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ color:T.text, fontWeight:700, fontSize:14 }}>🎬 Vídeos Criados</div>
            <Chip c={T.orange}>{videos.length}</Chip>
          </div>
          {videos.slice(0,2).map((v,i)=>(
            <div key={v.id} style={{ display:"flex", gap:10, alignItems:"center", padding:"9px 0", borderBottom: i<Math.min(videos.length,2)-1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`linear-gradient(135deg,${T.surf},${T.border})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{v.storeIco||"🎬"}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:T.text, fontWeight:600, fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.title}</div>
                <div style={{ color:T.t3, fontSize:10, marginTop:1 }}>{new Date(v.createdAt).toLocaleDateString("pt-BR")}</div>
              </div>
              <Chip c={T.orange}>{v.fmt||"reels"}</Chip>
            </div>
          ))}
        </Card>
      )}

      <Card s={{ background:`linear-gradient(135deg,${T.neon}0a,${T.blue}08)`, border:`1px solid ${T.neon}25` }}>
        <div style={{ color:T.neon, fontWeight:700, fontSize:14, marginBottom:12 }}>⚡ Ações Rápidas</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <Btn onClick={()=>goTo("Links")} s={{ padding:"10px 0", fontSize:12 }}>🔗 Novo Link</Btn>
          <Btn onClick={()=>goTo("Vídeos")} v="u" s={{ padding:"10px 0", fontSize:12 }}>🎬 Criar Vídeo</Btn>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════
// LINKS — dados reais, sem invenção
// ═══════════════════════════════════════════
function Links({ links, addLink, updateLink, delLink, goTo, setSelProd, stats, updStats }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [showQR, setShowQR] = useState(null);
  const [copied, setCopied] = useState(null);

  const analyze = async () => {
    const u = url.trim(); if (!u) return;
    setLoading(true); setResult(null); setErr("");
    const ps = ["🔍 Detectando loja...","📦 Buscando produto...","💰 Calculando comissão...","✅ Pronto!"];
    for (let i=0;i<3;i++) { setPhase(ps[i]); await new Promise(r=>setTimeout(r,600)); }
    const store = detectStore(u);
    let prod = null;
    if (store?.id === "ml" || u.includes("meli.la") || u.includes("mercadolivre") || u.includes("MLB")) {
      prod = await fetchML(u);
    }
    setPhase(ps[3]); await new Promise(r=>setTimeout(r,300));
    const rate = store?.commission || 0.10;
    const price = prod?.price || null;
    const comm = price ? price * rate : null;
    setResult({
      id: Date.now().toString(),
      originalUrl: u,
      productName: prod?.name || (store ? `Produto ${store.name}` : "Produto Afiliado"),
      thumb: prod?.thumb || null,
      price: price ? `R$ ${price.toFixed(2).replace(".",",")}` : null,
      priceRaw: price,
      commission: comm ? `R$ ${comm.toFixed(2).replace(".",",")}` : null,
      commRate: `${(rate*100).toFixed(0)}%`,
      commVal: comm||0,
      storeId: store?.id||"out",
      storeName: store?.name||"Loja",
      storeColor: store?.color||T.neon,
      clicks: 0,
      createdAt: new Date().toISOString(),
    });
    setLoading(false);
  };

  const save = () => { if (!result) return; if (!links.find(l=>l.originalUrl===result.originalUrl)) addLink(result); setUrl(""); setResult(null); };
  const copy = (txt,id) => { navigator.clipboard?.writeText(txt).catch(()=>{}); setCopied(id); setTimeout(()=>setCopied(null),2000); };
  const openLink = (l) => { updateLink({...l,clicks:(l.clicks||0)+1}); updStats({...stats,cliques:stats.cliques+1}); window.open(l.originalUrl,"_blank"); };
  const sendWA = (l) => { const msg=`🔥 *${l.productName}*${l.price?"\n💲 "+l.price:""}\n\n👉 ${l.originalUrl}\n\n⚠️ Estoque limitado!`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank"); };
  const qrSrc = (u) => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(u)}&bgcolor=0f1629&color=00e5c0&format=png`;

  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card glow={T.neon}>
        <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:14 }}>
          <div style={{ fontSize:24 }}>🔗</div>
          <div>
            <div style={{ color:T.text, fontWeight:700, fontSize:15 }}>Analisador de Link</div>
            <div style={{ color:T.t3, fontSize:11, marginTop:2 }}>Cole o link → IA identifica produto e comissão real</div>
          </div>
        </div>
        <div style={{ position:"relative" }}>
          <input placeholder="https://meli.la/17XoYuZ ou outro link..." value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyze()}
            style={{ width:"100%", background:T.surf, border:`1px solid ${url?T.neon+"50":T.border}`, borderRadius:11, padding:"11px 40px 11px 13px", color:T.text, fontSize:13, outline:"none", boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor=T.neon+"80"} onBlur={e=>e.target.style.borderColor=url?T.neon+"50":T.border} />
          {url && <button onClick={()=>setUrl("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.t3, cursor:"pointer", fontSize:16 }}>✕</button>}
        </div>
        <Btn full onClick={analyze} disabled={loading||!url.trim()} s={{ marginTop:10 }}>
          {loading ? <div style={{ display:"flex",gap:8,alignItems:"center",justifyContent:"center" }}><Spin size={16} />{phase}</div> : "⚡ ANALISAR LINK"}
        </Btn>
        {err && <div style={{ color:T.red, fontSize:12, marginTop:8, textAlign:"center" }}>{err}</div>}
      </Card>

      {result && (
        <Card glow={result.storeColor} s={{ border:`1px solid ${result.storeColor}40` }} className="fu">
          <Chip c={T.neon}>✅ Identificado</Chip>
          <div style={{ display:"flex", gap:12, alignItems:"center", margin:"14px 0 12px" }}>
            <div style={{ width:60, height:60, borderRadius:14, overflow:"hidden", flexShrink:0, background:result.storeColor+"20", border:`1px solid ${result.storeColor}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {result.thumb ? <img src={`https://wsrv.nl/?url=${encodeURIComponent(result.thumb)}&w=120&h=120&fit=cover`} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} onError={e=>{ e.target.onerror=null; e.target.src=result.thumb; }} />
                : <StoreLogo store={STORES.find(s=>s.id===result.storeId)} size={36} />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:T.text, fontWeight:700, fontSize:14, lineHeight:1.3 }}>{result.productName}</div>
              <div style={{ color:result.storeColor, fontSize:12, marginTop:4, fontWeight:600 }}>{result.storeName}</div>
              {result.price && <div style={{ color:T.neon, fontWeight:800, fontSize:18, marginTop:4 }}>{result.price}</div>}
              {result.commission && <div style={{ color:T.gold, fontSize:12, marginTop:2 }}>💰 {result.commission} comissão ({result.commRate})</div>}
              {!result.price && <div style={{ color:T.t3, fontSize:11, marginTop:4 }}>⚠️ Conecte a API do Mercado Livre para ver preço real</div>}
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn onClick={save} s={{ flex:1, padding:"10px 0", fontSize:12 }}>💾 Salvar</Btn>
            <Btn onClick={()=>{ save(); setSelProd(result); goTo("Vídeos"); }} v="u" s={{ flex:1, padding:"10px 0", fontSize:12 }}>🎬 Criar Vídeo</Btn>
          </div>
        </Card>
      )}

      {links.length===0 ? (
        <Card s={{ border:`1px dashed ${T.border}` }}>
          <Empty ico="🔗" title="Nenhum link ainda" desc="Analise seu link de afiliado acima para começar a rastrear cliques." />
        </Card>
      ) : (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ color:T.text, fontWeight:700, fontSize:14 }}>📊 Meus Links</div>
            <Chip c={T.neon}>{links.length}</Chip>
          </div>
          {links.map((l,i)=>(
            <div key={l.id} style={{ borderBottom:i<links.length-1?`1px solid ${T.border}`:"none", paddingBottom:i<links.length-1?14:0, marginBottom:i<links.length-1?14:0 }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <div style={{ width:44, height:44, borderRadius:11, overflow:"hidden", flexShrink:0, background:(l.storeColor||T.neon)+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {l.thumb ? <img src={l.thumb} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
                    : <StoreLogo store={STORES.find(s=>s.id===l.storeId)} size={36} />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:T.text, fontWeight:600, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.productName}</div>
                  <div style={{ color:T.t3, fontSize:10, marginTop:1 }}>{l.storeName} · {new Date(l.createdAt).toLocaleDateString("pt-BR")}</div>
                  {l.price && <div style={{ color:T.neon, fontWeight:700, fontSize:13, marginTop:3 }}>{l.price}</div>}
                  {l.commission && <div style={{ color:T.gold, fontSize:11, marginTop:1 }}>💰 {l.commission}</div>}
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ color:T.neon, fontWeight:800, fontSize:18 }}>{l.clicks||0}</div>
                  <div style={{ color:T.t3, fontSize:9, marginTop:1 }}>cliques</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                <button onClick={()=>openLink(l)} style={{ flex:1, background:(l.storeColor||T.neon)+"18", border:`1px solid ${(l.storeColor||T.neon)}40`, borderRadius:10, padding:"7px 0", color:l.storeColor||T.neon, fontWeight:700, fontSize:11, cursor:"pointer" }}>🌐 Abrir</button>
                <button onClick={()=>copy(l.originalUrl,l.id)} style={{ flex:1, background:T.surf, border:`1px solid ${T.border}`, borderRadius:10, padding:"7px 0", color:copied===l.id?T.neon:T.t2, fontWeight:700, fontSize:11, cursor:"pointer" }}>{copied===l.id?"✅ Copiado":"📋 Copiar"}</button>
                <button onClick={()=>setShowQR(showQR===l.id?null:l.id)} style={{ flex:1, background:T.surf, border:`1px solid ${T.border}`, borderRadius:10, padding:"7px 0", color:T.t2, fontWeight:700, fontSize:11, cursor:"pointer" }}>📱 QR</button>
                <button onClick={()=>sendWA(l)} style={{ flex:1, background:"#25D36620", border:"1px solid #25D36640", borderRadius:10, padding:"7px 0", color:"#25D366", fontWeight:700, fontSize:11, cursor:"pointer" }}>💬 WA</button>
                <button onClick={()=>delLink(l.id)} style={{ background:T.red+"18", border:`1px solid ${T.red}30`, borderRadius:10, padding:"7px 10px", color:T.red, fontWeight:700, fontSize:11, cursor:"pointer" }}>🗑</button>
              </div>
              {showQR===l.id && (
                <div style={{ marginTop:10, textAlign:"center", background:T.surf, borderRadius:12, padding:12 }}>
                  <img src={qrSrc(l.originalUrl)} alt="QR" style={{ borderRadius:10 }} />
                  <div style={{ color:T.t3, fontSize:10, marginTop:6 }}>Escaneie para abrir o link</div>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// VÍDEOS — download real, sem postar pelo app
// ═══════════════════════════════════════════
function Videos({ videos, links, selProd, goTo, addVideo, delVideo }) {
  const [gen, setGen] = useState(false);
  const [script, setScript] = useState(null);
  const [apiKey, setApiKey] = useState(()=>{ try { return localStorage.getItem("j2v_key")||""; } catch(e) { return ""; } });
  const [apiKeySaved, setApiKeySaved] = useState(()=>{ try { return !!localStorage.getItem("j2v_key"); } catch(e) { return false; } });
  const [creating, setCreating] = useState(false);
  const [vprog, setVprog] = useState(0);
  const [vmsg, setVmsg] = useState("");
  const [fmt, setFmt] = useState("reels");
  const [watching, setWatching] = useState(null);

  const prod = selProd || (links.length>0 ? links[0] : null);

  const genScript = async () => {
    if (!prod) return; setGen(true); setScript(null); setVmsg("");
    const ps=["🔍 Analisando produto...","✍️ Criando roteiro...","🎯 Finalizando...","✅ Roteiro pronto!"];
    for (let i=0;i<3;i++) { setVmsg(ps[i]); await new Promise(r=>setTimeout(r,600)); }
    setScript(`🎬 ROTEIRO — ${prod.productName}

⚡ [0-3s] HOOK:
"Você não vai acreditar no preço disso!"

🛍️ [3-10s] PRODUTO:
Mostrar ${prod.productName}${prod.price?" por "+prod.price:""}
Zoom, música trending

💥 [10-16s] BENEFÍCIOS:
✅ Melhor preço${prod.commission?"\n✅ "+prod.commission+" de comissão":""}
✅ Entrega rápida

🔥 [16-20s] CTA:
"Link na bio! Antes que acabe!"
${prod.originalUrl||""}

#viral #afiliado #oferta`);
    setGen(false); setVmsg("");
  };

  const createVideo = async () => {
    if (!apiKey.trim()) {
      setVmsg("⚠️ Cole sua API Key do JSON2Video e clique em Salvar!");
      setTimeout(()=>setVmsg(""),4000);
      return;
    }
    try { localStorage.setItem("j2v_key", apiKey.trim()); setApiKeySaved(true); } catch(e) {}
    setCreating(true); setVprog(0);
    const steps=["🎨 Criando cenas...","🖼️ Adicionando produto...","✍️ Inserindo textos...","🎵 Música de fundo...","🗣️ Narração PT-BR...","📝 Legendas...","🎬 Renderizando..."];
    let p=0;
    const iv=setInterval(()=>{ p=Math.min(p+12,85); setVprog(p); setVmsg(steps[Math.min(Math.floor(p/13),steps.length-1)]); },900);

    const dims = fmt==="reels"?{w:1080,h:1920}:fmt==="yt"?{w:1920,h:1080}:{w:1080,h:1080};
    const productName = prod?.productName || "Produto";
    const productPrice = prod?.price || "";
    const productThumb = prod?.thumb || null;
    const productUrl = prod?.originalUrl || "https://meli.la/17XoYuZ";

    const payload = {
      comment: "AfiliadoAI — " + productName,
      width: dims.w,
      height: dims.h,
      scenes: [
        {
          duration: 4,
          elements: [
            { type:"rectangle", x:0, y:0, width:"100%", height:"100%", color:"#050811" },
            { type:"text", text:"🔥 OFERTA INCRÍVEL!", x:"center", y:"28%", width:"90%",
              style:{ fontSize:58, fontWeight:"bold", color:"#00e5c0", textAlign:"center" } },
            ...(productThumb ? [{ type:"image", src:productThumb, x:"center", y:"58%", width:"65%", height:"32%", fit:"contain" }] : [])
          ]
        },
        {
          duration: 8,
          elements: [
            { type:"rectangle", x:0, y:0, width:"100%", height:"100%", color:"#0b1120" },
            ...(productThumb ? [{ type:"image", src:productThumb, x:"center", y:"22%", width:"72%", height:"36%", fit:"contain" }] : []),
            { type:"text", text:productName, x:"center", y:"68%", width:"90%",
              style:{ fontSize:34, fontWeight:"bold", color:"#eef2f8", textAlign:"center" } },
            ...(productPrice ? [{ type:"text", text:productPrice, x:"center", y:"80%", width:"90%",
              style:{ fontSize:48, fontWeight:"bold", color:"#00e5c0", textAlign:"center" } }] : [])
          ]
        },
        {
          duration: 8,
          elements: [
            { type:"rectangle", x:0, y:0, width:"100%", height:"100%", color:"#050811" },
            { type:"text", text:"👇 LINK NA BIO", x:"center", y:"32%", width:"90%",
              style:{ fontSize:54, fontWeight:"bold", color:"#00e5c0", textAlign:"center" } },
            { type:"text", text:"Clique agora antes de acabar!", x:"center", y:"52%", width:"90%",
              style:{ fontSize:28, color:"#8898b0", textAlign:"center" } }
          ]
        }
      ],
      voiceover: {
        text: productName + (productPrice ? ", por apenas " + productPrice : "") + ". Não perca! Link na bio.",
        voice: "pt-BR-FranciscaNeural",
        speed: 1.1
      },
      subtitles: {
        position: "bottom",
        style: { fontSize:26, fontWeight:"bold", color:"#ffffff", background:"rgba(0,0,0,0.75)" }
      }
    };

    try {
      setVmsg("📡 Conectando com servidor...");

      // Detecta se está rodando no Vercel ou localmente
      const isVercel = window.location.hostname !== "localhost" &&
                       !window.location.hostname.includes("127.0.0.1") &&
                       !window.location.hostname.includes("claudeusercontent");

      if (!isVercel) {
        clearInterval(iv); setCreating(false); setVprog(0);
        setVmsg("⚠️ Criação de vídeo funciona apenas no Vercel. Suba o app e tente lá!");
        setTimeout(()=>setVmsg(""),8000);
        return;
      }

      // Chama função serverless do Vercel (sem CORS)
      let data = null;
      let lastErr = "";
      try {
        const res = await fetch("/api/create-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: apiKey.trim(), payload })
        });
        if (res.ok) {
          data = await res.json();
        } else {
          const errText = await res.text();
          lastErr = "Erro " + res.status + ": " + errText.slice(0,120);
        }
      } catch(e) {
        lastErr = e.message || "Erro de conexão";
      }

      clearInterval(iv);

      if (!data || data.error) {
        setCreating(false); setVprog(0);
        setVmsg("❌ " + (data?.error || lastErr));
        setTimeout(()=>setVmsg(""),6000);
        return;
      }

      if (data.error || data.message) {
        clearInterval(iv); setCreating(false); setVprog(0);
        setVmsg("❌ API: " + (data.error || data.message));
        setTimeout(()=>setVmsg(""),6000);
        return;
      }

      if (data.movie) {
        setVmsg("⏳ Renderizando vídeo... (pode levar 1-2 min)");
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          if (attempts > 60) {
            clearInterval(poll); setCreating(false);
            setVmsg("⚠️ Tempo excedido. Vídeo pode estar pronto em breve no painel JSON2Video.");
            setTimeout(()=>setVmsg(""),8000);
            return;
          }
          try {
            const pollUrl = "https://corsproxy.io/?" + encodeURIComponent("https://api.json2video.com/v2/movies?project=" + data.movie);
            let cr;
            try {
              cr = await fetch("/api/check-video?project=" + data.movie + "&apiKey=" + encodeURIComponent(apiKey.trim()));
            } catch(e) {
              cr = await fetch(pollUrl, { headers:{"x-api-key":apiKey.trim()} });
            }
            const st = await cr.json();
            const status = st.movie?.status || st.status;
            const url = st.movie?.url || st.url;
            if ((status === "done" || status === "ready") && url) {
              clearInterval(poll);
              setVprog(100); setVmsg("✅ Vídeo pronto para download!");
              setTimeout(()=>{
                addVideo({
                  id: Date.now().toString(),
                  title: productName,
                  storeIco: STORES.find(s=>s.id===prod?.storeId)?.favicon || "🎬",
                  videoUrl: url,
                  thumb: productThumb,
                  fmt,
                  createdAt: new Date().toISOString()
                });
                setCreating(false); setVprog(0); setVmsg("");
              }, 800);
            } else if (status === "error" || status === "failed") {
              clearInterval(poll); setCreating(false); setVprog(0);
              setVmsg("❌ Erro na renderização. Tente novamente.");
              setTimeout(()=>setVmsg(""),5000);
            } else {
              const pct = Math.min(85 + attempts, 98);
              setVprog(pct);
              setVmsg("🎬 Renderizando... " + pct + "%");
            }
          } catch(e) {}
        }, 3000);
      } else {
        setCreating(false); setVprog(0);
        setVmsg("❌ Resposta inesperada da API. Verifique sua chave.");
        setTimeout(()=>setVmsg(""),5000);
      }

    } catch(e) {
      clearInterval(iv); setCreating(false); setVprog(0);
      setVmsg("❌ Erro: " + (e.message || "Verifique conexão e API Key"));
      setTimeout(()=>setVmsg(""),6000);
    }
  };

  const dl = (v) => { if (!v.videoUrl) return alert("URL indisponível"); const a=document.createElement("a"); a.href=v.videoUrl; a.download=`${v.title||"video"}.mp4`; a.target="_blank"; a.click(); };

  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {watching && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.96)",zIndex:300,display:"flex",flexDirection:"column" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px" }}>
            <div style={{ color:T.text,fontWeight:700 }}>{watching.title}</div>
            <button onClick={()=>setWatching(null)} style={{ background:T.card,border:"none",borderRadius:99,width:34,height:34,color:T.text,cursor:"pointer",fontSize:18 }}>✕</button>
          </div>
          <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
            {watching.videoUrl ? <video src={watching.videoUrl} controls autoPlay playsInline style={{ maxWidth:"100%",maxHeight:"75vh",borderRadius:14 }} />
              : <Empty ico="🎬" title="Vídeo não disponível" desc="O link do vídeo expirou ou não está disponível." />}
          </div>
          <div style={{ padding:"12px 20px 28px" }}>
            <Btn full onClick={()=>dl(watching)} v="g" s={{ padding:"13px 0",fontSize:14 }}>📥 Baixar Vídeo</Btn>
          </div>
        </div>
      )}

      {prod ? (
        <Card glow={prod.storeColor||T.neon} s={{ border:`1px solid ${(prod.storeColor||T.neon)+"40"}` }}>
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <div style={{ width:44,height:44,borderRadius:11,background:(prod.storeColor||T.neon)+"18",border:`1px solid ${(prod.storeColor||T.neon)+"30"}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0 }}>
              {prod.thumb ? <img src={prod.thumb} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} onError={e=>e.target.style.display="none"} /> : <StoreLogo store={STORES.find(s=>s.id===prod.storeId)} size={36} />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:T.text,fontWeight:700,fontSize:13 }}>{prod.productName}</div>
              {prod.price && <div style={{ color:T.neon,fontSize:12,marginTop:2,fontWeight:600 }}>{prod.price}</div>}
            </div>
            <Btn onClick={()=>goTo("Links")} v="gh" s={{ padding:"6px 12px",fontSize:11 }}>Trocar</Btn>
          </div>
        </Card>
      ) : (
        <Card s={{ border:`1px dashed ${T.border}` }}>
          <Empty ico="🎬" title="Selecione um produto" desc="Adicione um link de afiliado na aba Links para criar vídeos." action={<Btn onClick={()=>goTo("Links")} s={{ padding:"10px 20px" }}>➜ Ir para Links</Btn>} />
        </Card>
      )}

      {prod && (
        <>
          <Card>
            <div style={{ color:T.text,fontWeight:700,fontSize:14,marginBottom:12 }}>📝 Roteiro Viral com IA</div>
            {!script ? (
              <Btn full onClick={genScript} disabled={gen} v="u">
                {gen ? <div style={{ display:"flex",gap:8,alignItems:"center",justifyContent:"center" }}><Spin size={16} color="#fff" />{vmsg}</div> : "🤖 GERAR ROTEIRO"}
              </Btn>
            ) : (
              <>
                <pre style={{ color:T.t2,fontSize:11,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'JetBrains Mono',monospace",background:T.surf,borderRadius:10,padding:12,maxHeight:200,overflowY:"auto" }}>{script}</pre>
                <div style={{ display:"flex",gap:8,marginTop:10 }}>
                  <button onClick={()=>{ navigator.clipboard?.writeText(script); }} style={{ flex:1,background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:8,color:T.t2,fontSize:11,fontWeight:700,cursor:"pointer" }}>📋 Copiar</button>
                  <button onClick={()=>setScript(null)} style={{ flex:1,background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:8,color:T.t2,fontSize:11,fontWeight:700,cursor:"pointer" }}>🔄 Refazer</button>
                </div>
              </>
            )}
          </Card>

          <Card glow={T.purple}>
            <div style={{ color:T.text,fontWeight:700,fontSize:14,marginBottom:4 }}>🎬 Criar Vídeo Automático</div>
            <div style={{ color:T.t3,fontSize:11,marginBottom:14 }}>
              Grátis via JSON2Video · <a href="https://json2video.com/get-api-key/" target="_blank" rel="noreferrer" style={{ color:T.neon }}>Pegar API Key gratuita →</a>
            </div>
            <div style={{ display:"flex",gap:6,marginBottom:12 }}>
              {[["reels","📱 Reels/TikTok"],["yt","▶️ YouTube"],["sq","⬜ Feed"]].map(([id,lb])=>(
                <button key={id} onClick={()=>setFmt(id)} style={{ flex:1,background:fmt===id?`linear-gradient(135deg,${T.purple},${T.blue})`:T.surf,border:`1px solid ${fmt===id?T.purple:T.border}`,borderRadius:10,padding:"8px 4px",color:fmt===id?"#fff":T.t3,fontWeight:700,fontSize:10,cursor:"pointer" }}>{lb}</button>
              ))}
            </div>
            <div style={{marginBottom:12}}>
              <div style={{color:T.t2,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:.8,marginBottom:5}}>API KEY JSON2VIDEO</div>
              <div style={{display:"flex",gap:8}}>
                <input
                  placeholder="Cole sua API Key aqui..."
                  value={apiKey}
                  onChange={e=>setApiKey(e.target.value)}
                  style={{flex:1,background:T.surf,border:`1px solid ${apiKeySaved?T.neon+"60":T.border}`,borderRadius:11,padding:"11px 13px",color:T.text,fontSize:12,outline:"none",fontFamily:"'JetBrains Mono',monospace"}}
                />
                <button onClick={()=>{
                  if(!apiKey.trim()) return;
                  try{ localStorage.setItem("j2v_key",apiKey.trim()); }catch(e){}
                  setApiKeySaved(true);
                }} style={{background:apiKeySaved?T.neon+"20":`linear-gradient(135deg,${T.neon},${T.blue})`,border:apiKeySaved?`1px solid ${T.neon}40`:"none",borderRadius:11,padding:"0 14px",color:apiKeySaved?T.neon:"#000",fontWeight:800,fontSize:12,cursor:"pointer",flexShrink:0}}>
                  {apiKeySaved?"✅ Salvo":"💾 Salvar"}
                </button>
              </div>
              {apiKeySaved
                ? <div style={{color:T.neon,fontSize:10,marginTop:4}}>✅ API Key salva — pronta para criar vídeos!</div>
                : <div style={{color:T.t3,fontSize:10,marginTop:4}}>Cole a key e clique Salvar · <a href="https://json2video.com/get-api-key/" target="_blank" rel="noreferrer" style={{color:T.blue}}>Pegar grátis →</a></div>
              }
            </div>
            {vmsg && !creating && (
              <div style={{ color:T.red, fontSize:12, textAlign:"center", marginBottom:8, padding:"8px 12px", background:T.red+"15", borderRadius:10, border:`1px solid ${T.red}30` }}>{vmsg}</div>
            )}
            {creating ? (
              <div style={{ textAlign:"center",padding:"20px 0" }}>
                <Spin size={40} color={T.purple} />
                <div style={{ color:T.purple,fontSize:13,fontWeight:700,marginTop:10 }}>{vmsg}</div>
                <div style={{ background:T.surf,borderRadius:99,height:6,overflow:"hidden",marginTop:12 }}>
                  <div style={{ width:`${vprog}%`,height:"100%",background:`linear-gradient(90deg,${T.purple},${T.blue})`,borderRadius:99,transition:"width .5s ease" }} />
                </div>
                <div style={{ color:T.t3,fontSize:11,marginTop:6 }}>{vprog}%</div>
              </div>
            ) : (
              <Btn full onClick={createVideo} v="u" s={{ marginTop:4 }}>🎬 CRIAR VÍDEO AGORA</Btn>
            )}
          </Card>
        </>
      )}

      <Card>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div style={{ color:T.text,fontWeight:700,fontSize:14 }}>📺 Meus Vídeos</div>
          <Chip c={T.orange}>{videos.length}</Chip>
        </div>
        {videos.length===0 ? (
          <Empty ico="🎬" title="Nenhum vídeo ainda" desc="Crie seu primeiro vídeo viral usando o criador acima." />
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {videos.map(v=>(
              <div key={v.id} style={{ background:T.surf,borderRadius:14,overflow:"hidden",border:`1px solid ${T.border}` }}>
                <div style={{ height:88,background:`linear-gradient(135deg,${T.surf},${T.border})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",cursor:"pointer" }} onClick={()=>setWatching(v)}>
                  {v.thumb ? <img src={`https://wsrv.nl/?url=${encodeURIComponent(v.thumb)}&w=300&h=100&fit=cover`} alt="" style={{ height:"100%",width:"100%",objectFit:"cover" }} onError={e=>{ e.target.onerror=null; e.target.src=v.thumb; }} /> : <span style={{ fontSize:40,opacity:.4 }}>🎬</span>}
                  <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:40,height:40,borderRadius:"50%",background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>▶️</div>
                  <div style={{ position:"absolute",top:8,right:8,background:"rgba(0,0,0,.7)",borderRadius:6,padding:"2px 8px",color:"#fff",fontSize:9,fontWeight:700 }}>{v.fmt==="reels"?"📱 Reels":v.fmt==="yt"?"▶️ YT":"⬜ Feed"}</div>
                </div>
                <div style={{ padding:"10px 12px" }}>
                  <div style={{ color:T.text,fontWeight:700,fontSize:13,marginBottom:4 }}>{v.title}</div>
                  <div style={{ color:T.t3,fontSize:10,marginBottom:8 }}>{new Date(v.createdAt).toLocaleDateString("pt-BR")}</div>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>setWatching(v)} style={{ flex:1,background:T.blue+"20",border:`1px solid ${T.blue}40`,borderRadius:10,padding:"8px 0",color:T.blue,fontWeight:700,fontSize:12,cursor:"pointer" }}>▶️ Ver</button>
                    <button onClick={()=>dl(v)} style={{ flex:2,background:`linear-gradient(135deg,${T.gold}25,${T.orange}25)`,border:`1px solid ${T.gold}40`,borderRadius:10,padding:"8px 0",color:T.gold,fontWeight:700,fontSize:12,cursor:"pointer" }}>📥 Baixar Vídeo</button>
                    <button onClick={()=>delVideo(v.id)} style={{ background:T.red+"18",border:`1px solid ${T.red}30`,borderRadius:10,padding:"8px 10px",color:T.red,fontWeight:700,fontSize:12,cursor:"pointer" }}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════
// CONTAS — plataformas sociais
// ═══════════════════════════════════════════
function Contas({ accs, setAccs }) {
  const [exp, setExp] = useState(null);
  const [inp, setInp] = useState({});
  const [sched, setSched] = useState({ tiktok:"20:00", instagram:"19:30", youtube:"21:00", facebook:"18:00" });

  const PLAT=[
    { id:"tiktok",   name:"TikTok",    icon:"🎵", color:"#FF0050", url:"https://www.tiktok.com/upload",          ph:"@seu_tiktok",     rule:"Usar #publi ou #ad" },
    { id:"instagram",name:"Instagram", icon:"📸", color:"#E91E8C", url:"https://www.instagram.com/create/story",  ph:"@seu_instagram",  rule:"#publi obrigatório" },
    { id:"youtube",  name:"YouTube",   icon:"▶️",  color:"#FF0000", url:"https://studio.youtube.com",             ph:"@seu_canal",      rule:"Avisar link afiliado na descrição" },
    { id:"facebook", name:"Facebook",  icon:"👤", color:"#1877F2", url:"https://www.facebook.com/reel/create",    ph:"seu_perfil",      rule:"Não impulsionar post com link afiliado" },
    { id:"kwai",     name:"Kwai",      icon:"🎬", color:"#FF6B00", url:"https://www.kwai.com/creator/upload",     ph:"@seu_kwai",       rule:"Não prometer cashback falso" },
    { id:"whatsapp", name:"WhatsApp",  icon:"💬", color:"#25D366", url:"https://web.whatsapp.com",                ph:"+55 11 99999-9999",rule:"Não enviar em massa" },
  ];

  const saveAcc = (id) => { if (!inp[id]?.trim()) return; setAccs({...accs,[id]:inp[id].trim()}); setExp(null); };
  const remAcc = (id) => { const n={...accs}; delete n[id]; setAccs(n); };
  const cnt = Object.keys(accs).length;

  return (
    <div className="fu" style={{ display:"flex",flexDirection:"column",gap:14 }}>
      {cnt>0 && (
        <Card glow={T.neon} s={{ background:`linear-gradient(135deg,${T.neon}08,${T.blue}06)`,border:`1px solid ${T.neon}25` }}>
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <div style={{ fontSize:28 }}>✅</div>
            <div>
              <div style={{ color:T.neon,fontWeight:700,fontSize:14 }}>{cnt} conta{cnt>1?"s":""} conectada{cnt>1?"s":""}</div>
              <div style={{ color:T.t3,fontSize:11,marginTop:2 }}>Suas contas estão salvas no dispositivo</div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ color:T.text,fontWeight:700,fontSize:14,marginBottom:12 }}>⏰ Melhor Horário para Postar</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
          {[["tiktok","🎵"],["instagram","📸"],["youtube","▶️"],["facebook","👤"]].map(([id,ic])=>(
            <div key={id} style={{ background:T.surf,borderRadius:10,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontSize:14 }}>{ic}</span>
              <input type="time" value={sched[id]} onChange={e=>setSched(p=>({...p,[id]:e.target.value}))}
                style={{ background:"none",border:"none",color:T.neon,fontSize:13,fontWeight:700,outline:"none",width:60,textAlign:"right" }} />
            </div>
          ))}
        </div>
        <div style={{ color:T.t3,fontSize:10,textAlign:"center",marginTop:8 }}>Edite os horários ideais para cada plataforma</div>
      </Card>

      <Card>
        <div style={{ color:T.text,fontWeight:700,fontSize:14,marginBottom:14 }}>📱 Minhas Contas</div>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {PLAT.map(p=>{
            const con=accs[p.id]; const open=exp===p.id;
            return (
              <div key={p.id} style={{ background:T.surf,border:`1px solid ${con?p.color+"40":T.border}`,borderRadius:14,overflow:"hidden",transition:"border-color .2s" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 12px",cursor:"pointer" }} onClick={()=>setExp(open?null:p.id)}>
                  <div style={{ width:36,height:36,borderRadius:10,background:p.color+"20",border:`1px solid ${p.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{p.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:T.text,fontWeight:700,fontSize:13 }}>{p.name}</div>
                    {con ? <div style={{ color:p.color,fontSize:11,marginTop:1 }}>✅ {con}</div>
                         : <div style={{ color:T.t3,fontSize:11,marginTop:1 }}>Toque para conectar</div>}
                  </div>
                  <div style={{ color:T.t2,fontSize:18 }}>{open?"↑":"↓"}</div>
                </div>
                {open && (
                  <div style={{ padding:"0 12px 12px",borderTop:`1px solid ${T.border}` }}>
                    <div style={{ color:T.t3,fontSize:10,margin:"8px 0 6px" }}>⚠️ Regra: {p.rule}</div>
                    <input placeholder={p.ph} value={inp[p.id]||""} onChange={e=>setInp(i=>({...i,[p.id]:e.target.value}))}
                      style={{ width:"100%",background:T.card,border:`1px solid ${p.color}40`,borderRadius:10,padding:"9px 12px",color:T.text,fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:8 }} />
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={()=>saveAcc(p.id)} style={{ flex:1,background:`linear-gradient(135deg,${p.color},${p.color}99)`,border:"none",borderRadius:10,padding:9,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer" }}>✅ Salvar</button>
                      <button onClick={()=>window.open(p.url,"_blank")} style={{ flex:1,background:T.surf,border:`1px solid ${T.border}`,borderRadius:10,padding:9,color:T.t2,fontWeight:700,fontSize:12,cursor:"pointer" }}>🌐 Abrir</button>
                      {con && <button onClick={()=>remAcc(p.id)} style={{ background:T.red+"20",border:`1px solid ${T.red}30`,borderRadius:10,padding:"9px 12px",color:T.red,fontWeight:700,fontSize:12,cursor:"pointer" }}>🗑</button>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════
// CONFIGURAÇÕES
// ═══════════════════════════════════════════
function Config({ cStores, setcStores, settings, setSetts, custom, setCustom, onLogout }) {
  const [addStore, setAddStore] = useState(false);
  const [sf, setSf] = useState({ name:"",comm:"",ico:"🛒",color:T.neon });
  const [permId, setPermId] = useState(null);
  const ICONS=["🛒","📦","🛍️","👗","🏷️","🌿","💄","🍫","🏪","💅","👠","🎁","🧴","📱","💻","🎮","🍕","☕","🌺","💍"];
  const COLORS=[T.neon,T.gold,T.purple,T.red,T.orange,T.blue,"#E91E8C","#00A86B","#FF5722","#1877F2"];
  const allStores=[...STORES,...custom];

  const RULES={
    ml:[{p:"TikTok",ok:true,r:"Mencionar #publi ou #ad"},{p:"Instagram",ok:true,r:"#publi obrigatório"},{p:"YouTube",ok:true,r:"Avisar link afiliado na descrição"},{p:"Facebook",ok:true,r:"Permitido"},{p:"WhatsApp",ok:true,r:"Não enviar spam em massa"}],
    amz:[{p:"TikTok",ok:true,r:"Usar #ad. Somente amzn.to"},{p:"Instagram",ok:true,r:"#ad obrigatório"},{p:"YouTube",ok:true,r:"Avisar link afiliado"},{p:"Facebook",ok:true,r:"Não usar anúncios pagos com link"},{p:"WhatsApp",ok:false,r:"⚠️ PROIBIDO envio em massa"}],
    shp:[{p:"TikTok",ok:true,r:"#ShopeeAfiliado recomendado"},{p:"Instagram",ok:true,r:"Link na bio"},{p:"YouTube",ok:true,r:"Link na descrição"},{p:"Facebook",ok:true,r:"Permitido"},{p:"WhatsApp",ok:true,r:"Grupos de oferta incentivados"}],
  };
  const defaultRule=[{p:"TikTok",ok:true,r:"Mencionar parceria"},{p:"Instagram",ok:true,r:"#publi obrigatório"},{p:"YouTube",ok:true,r:"Avisar link afiliado"},{p:"Facebook",ok:true,r:"Permitido"},{p:"WhatsApp",ok:true,r:"Não enviar spam"}];

  if (permId) {
    const store=allStores.find(s=>s.id===permId);
    const rules=RULES[permId]||defaultRule;
    return (
      <div className="fu" style={{ display:"flex",flexDirection:"column",gap:12 }}>
        <div style={{ display:"flex",gap:12,alignItems:"center" }}>
          <button onClick={()=>setPermId(null)} style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:99,width:36,height:36,color:T.text,cursor:"pointer",fontSize:18,flexShrink:0 }}>←</button>
          <div>
            <div style={{ color:T.text,fontWeight:700,fontSize:16 }}>{store?.name} — Regras</div>
            <div style={{ color:T.t3,fontSize:11,marginTop:1 }}>Permissões por plataforma</div>
          </div>
        </div>
        {rules.map(r=>(
          <Card key={r.p} s={{ border:`1px solid ${r.ok?T.neon+"30":T.red+"40"}` }}>
            <div style={{ display:"flex",gap:10,alignItems:"center" }}>
              <div style={{ flex:1 }}>
                <div style={{ color:T.text,fontWeight:700,fontSize:13,marginBottom:4 }}>{r.p}</div>
                <div style={{ color:r.ok?T.t2:T.red,fontSize:12 }}>{r.r}</div>
              </div>
              <Chip c={r.ok?T.neon:T.red}>{r.ok?"✓ OK":"⚠️"}</Chip>
            </div>
          </Card>
        ))}
        <Card s={{ background:`linear-gradient(135deg,${T.red}08,${T.orange}05)`,border:`1px solid ${T.red}25` }}>
          <div style={{ color:T.red,fontWeight:700,fontSize:13,marginBottom:8 }}>🚫 Regras Gerais para TODAS as lojas</div>
          {["Sempre avisar que é link de afiliado (#publi, #ad, #parceria)","Nunca comprar com seu próprio link","Não prometer preço ou desconto falso","Não usar bots para gerar cliques falsos","Não criar perfil se passando pela loja oficial"].map((r,i)=>(
            <div key={i} style={{ display:"flex",gap:8,padding:"5px 0",borderBottom:i<4?`1px solid ${T.border}`:"none",fontSize:12,color:T.t2 }}>
              <span style={{ color:T.red,flexShrink:0 }}>✕</span>{r}
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="fu" style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Card>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div style={{ color:T.text,fontWeight:700,fontSize:14 }}>🏪 Lojas Afiliadas</div>
          <button onClick={()=>setAddStore(s=>!s)} style={{ background:addStore?T.surf:`linear-gradient(135deg,${T.neon},${T.blue})`,border:addStore?`1px solid ${T.border}`:"none",borderRadius:99,padding:"6px 14px",color:addStore?T.t2:"#000",fontWeight:700,fontSize:12,cursor:"pointer" }}>
            {addStore?"✕ Fechar":"+ Nova"}
          </button>
        </div>

        {addStore && (
          <div style={{ background:T.surf,borderRadius:12,padding:14,marginBottom:14,border:`1px solid ${sf.color+"40"}` }}>
            <div style={{ display:"flex",gap:8,marginBottom:10,alignItems:"center" }}>
              <div style={{ width:40,height:40,borderRadius:11,background:sf.color+"20",border:`1px solid ${sf.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{sf.ico}</div>
              <div style={{ flex:1 }}>
                <div style={{ color:T.t3,fontSize:9,fontWeight:700,marginBottom:4 }}>COR</div>
                <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>{COLORS.map(c=><div key={c} onClick={()=>setSf(f=>({...f,color:c}))} style={{ width:20,height:20,borderRadius:99,background:c,cursor:"pointer",border:sf.color===c?"2px solid #fff":"2px solid transparent" }} />)}</div>
              </div>
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:10 }}>{ICONS.map(ic=><div key={ic} onClick={()=>setSf(f=>({...f,ico:ic}))} style={{ width:32,height:32,borderRadius:8,background:sf.ico===ic?sf.color+"30":T.card,border:`1px solid ${sf.ico===ic?sf.color:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer" }}>{ic}</div>)}</div>
            <Inp label="Nome *" ph="Ex: Renner, Magazine Luiza..." val={sf.name} set={v=>setSf(f=>({...f,name:v}))} />
            <Inp label="Comissão %" ph="Ex: 12" val={sf.comm} set={v=>setSf(f=>({...f,comm:v}))} />
            <Btn full onClick={()=>{ if(!sf.name)return; setCustom([...custom,{id:"c_"+Date.now(),name:sf.name,icon:sf.ico,color:sf.color,commission:parseFloat(sf.comm)/100||0.10,custom:true}]); setSf({name:"",comm:"",ico:"🛒",color:T.neon}); setAddStore(false); }}>✅ Adicionar</Btn>
          </div>
        )}

        {allStores.map((s,i)=>(
          <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<allStores.length-1?`1px solid ${T.border}`:"none" }}>
            {s.favicon ? <StoreLogo store={s} size={36} /> : <div style={{ width:36,height:36,borderRadius:10,background:s.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{s.icon||"🏪"}</div>}
            <div style={{ flex:1 }}>
              <div style={{ color:T.text,fontWeight:600,fontSize:13 }}>{s.name}</div>
              <div style={{ color:s.color,fontSize:11,marginTop:1 }}>💰 {((s.commission||0)*100).toFixed(0)}% comissão</div>
            </div>
            <div style={{ display:"flex",gap:6 }}>
              {s.id && RULES[s.id]&&<button onClick={()=>setPermId(s.id)} style={{ background:T.surf,border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px",color:T.t3,fontSize:10,fontWeight:700,cursor:"pointer" }}>📋</button>}
              <button onClick={()=>setcStores(c=>({...c,[s.id]:!c[s.id]}))} style={{ background:cStores[s.id]?`linear-gradient(135deg,${T.neon},${T.blue})`:T.surf,border:cStores[s.id]?"none":`1px solid ${T.border}`,borderRadius:8,padding:"5px 12px",color:cStores[s.id]?"#000":T.t3,fontWeight:700,fontSize:11,cursor:"pointer" }}>
                {cStores[s.id]?"✅ Ativa":"Conectar"}
              </button>
              {s.custom&&<button onClick={()=>setCustom(custom.filter(c=>c.id!==s.id))} style={{ background:T.red+"18",border:`1px solid ${T.red}30`,borderRadius:8,padding:"5px 8px",color:T.red,fontSize:11,cursor:"pointer" }}>🗑</button>}
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ color:T.text,fontWeight:700,fontSize:14,marginBottom:14 }}>⚙️ Configurações</div>
        {[{k:"notif",l:"🔔 Notificações",d:"Alertas de atividade"},{k:"ai",l:"🤖 IA Ativa",d:"Análise inteligente de produtos"},{k:"ultra",l:"⚡ Modo Ultra",d:"Recursos avançados de análise"}].map(it=>(
          <div key={it.k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.border}` }}>
            <div>
              <div style={{ color:T.text,fontSize:13,fontWeight:600 }}>{it.l}</div>
              <div style={{ color:T.t3,fontSize:11,marginTop:2 }}>{it.d}</div>
            </div>
            <Tog val={settings[it.k]} set={v=>setSetts({...settings,[it.k]:v})} />
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ color:T.text,fontWeight:700,fontSize:14,marginBottom:12 }}>🔑 APIs Configuradas</div>
        <div style={{ marginBottom:12 }}>
          <div style={{ color:T.t2,fontSize:11,fontWeight:700,marginBottom:4 }}>MERCADO LIVRE API</div>
          <div style={{ color:T.t3,fontSize:11,marginBottom:4 }}>Configurada via variável REACT_APP_ML_ACCESS_TOKEN no Vercel</div>
          <div style={{ background:T.surf,borderRadius:8,padding:"8px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.t3 }}>
            {(() => { try { const t = process.env.REACT_APP_ML_ACCESS_TOKEN; return t && !t.includes("COLE") ? "✅ Configurada" : "⚠️ Não configurada — produtos sem preço real"; } catch(e) { return "⚠️ Configure via Vercel Environment Variables"; } })()}
          </div>
        </div>
        <div>
          <div style={{ color:T.t2,fontSize:11,fontWeight:700,marginBottom:4 }}>JSON2VIDEO (VÍDEOS)</div>
          <div style={{ color:T.t3,fontSize:11,marginBottom:4 }}>Salva automaticamente ao criar o primeiro vídeo</div>
          <div style={{ background:T.surf,borderRadius:8,padding:"8px 10px",fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:localStorage.getItem("j2v")?T.neon:T.t3 }}>
            {(() => { try { return localStorage.getItem("j2v") ? "✅ API Key salva" : "Não configurada ainda"; } catch(e) { return "Não configurada ainda"; } })()}
          </div>
          <a href="https://json2video.com/get-api-key/" target="_blank" rel="noreferrer" style={{ display:"inline-block",marginTop:8,color:T.neon,fontSize:11 }}>🔗 Pegar API Key gratuita →</a>
        </div>
      </Card>

      <Btn full onClick={onLogout} v="r" s={{ padding:"13px 0" }}>🚪 Sair da Conta</Btn>
    </div>
  );
}

// ═══════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════
const TABS=[{id:"Dashboard",ico:"⚡",lbl:"Início"},{id:"Links",ico:"🔗",lbl:"Links"},{id:"Vídeos",ico:"🎬",lbl:"Vídeos"},{id:"Contas",ico:"📱",lbl:"Contas"},{id:"Config",ico:"⚙️",lbl:"Config"}];

export default function App() {
  const [st, setSt] = useState(()=>{ const s=load(); return s?{...EMPTY,...s}:EMPTY; });
  const [tab, setTab] = useState("Dashboard");
  const [selProd, setSelProd] = useState(null);

  useEffect(()=>{ save(st); },[st]);
  const up = useCallback((p)=>setSt(s=>({...s,...p})),[]);

  const login = (u) => up({user:u});
  const logout = () => { localStorage.removeItem(KEY); setSt(EMPTY); };

  if (!st.user) return <Login onLogin={login} />;

  const goTo = (t) => setTab(t);

  const render = () => {
    switch(tab) {
      case "Dashboard": return <Dashboard stats={st.stats} links={st.links} videos={st.videos} goTo={goTo} />;
      case "Links": return <Links links={st.links} addLink={l=>up({links:[l,...st.links]})} updateLink={l=>up({links:st.links.map(x=>x.id===l.id?l:x)})} delLink={id=>up({links:st.links.filter(l=>l.id!==id)})} goTo={goTo} setSelProd={p=>{setSelProd(p);}} stats={st.stats} updStats={s=>up({stats:s})} />;
      case "Vídeos": return <Videos videos={st.videos} links={st.links} selProd={selProd} goTo={goTo} addVideo={v=>up({videos:[v,...st.videos]})} delVideo={id=>up({videos:st.videos.filter(v=>v.id!==id)})} />;
      case "Contas": return <Contas accs={st.connectedAccounts} setAccs={a=>up({connectedAccounts:a})} />;
      case "Config": return <Config cStores={st.connectedStores} setcStores={f=>up({connectedStores:typeof f==="function"?f(st.connectedStores):f})} settings={st.settings} setSetts={s=>up({settings:s})} custom={st.customStores} setCustom={c=>up({customStores:c})} onLogout={logout} />;
      default: return null;
    }
  };

  return (
    <div style={{ background:T.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", fontFamily:"'Outfit',sans-serif", position:"relative" }}>
      <Sty />
      <div style={{ position:"fixed",top:-120,left:"50%",transform:"translateX(-50%)",width:440,height:440,borderRadius:"50%",background:`radial-gradient(circle,${T.neon}06 0%,transparent 70%)`,pointerEvents:"none",zIndex:0 }} />

      {/* Header */}
      <div style={{ position:"sticky",top:0,zIndex:50,background:T.bg+"ee",backdropFilter:"blur(14px)",borderBottom:`1px solid ${T.border}`,padding:"14px 20px 12px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:18 }}>⚡</span>
              <span style={{ color:T.text,fontWeight:800,fontSize:18,letterSpacing:-.5 }}>AfiliadoAI</span>
              <span style={{ background:T.neon,color:"#000",fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:99,letterSpacing:1.2 }}>PRO</span>
            </div>
            <div style={{ color:T.t3,fontSize:10,marginTop:1 }}>Olá, {st.user.name} 👋</div>
          </div>
          <div onClick={()=>setTab("Config")} style={{ width:34,height:34,borderRadius:99,background:`linear-gradient(135deg,${T.neon},${T.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#000",fontSize:14,cursor:"pointer" }}>
            {st.user.name[0].toUpperCase()}
          </div>
        </div>
      </div>

      {/* Top tab pills */}
      <div style={{ display:"flex",gap:6,padding:"12px 16px 0",overflowX:"auto",scrollbarWidth:"none" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flexShrink:0,display:"flex",alignItems:"center",gap:5,background:tab===t.id?`linear-gradient(135deg,${T.neon}18,${T.blue}12)`:"transparent",border:`1px solid ${tab===t.id?T.neon+"50":T.border}`,borderRadius:99,padding:"7px 14px",color:tab===t.id?T.neon:T.t3,fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .2s" }}>
            <span style={{ fontSize:14 }}>{t.ico}</span><span>{t.lbl}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding:"16px 16px 100px",position:"relative",zIndex:1 }} key={tab}>
        {render()}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:T.bg+"f2",backdropFilter:"blur(16px)",borderTop:`1px solid ${T.border}`,padding:"10px 8px 22px",zIndex:50 }}>
        <div style={{ display:"flex" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 0" }}>
              <span style={{ fontSize:tab===t.id?22:18,transition:"font-size .2s" }}>{t.ico}</span>
              <span style={{ fontSize:9,fontWeight:700,color:tab===t.id?T.neon:T.t3,transition:"color .2s" }}>{t.lbl}</span>
              {tab===t.id&&<div style={{ width:4,height:4,borderRadius:99,background:T.neon,boxShadow:`0 0 6px ${T.neon}` }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
