import { useState, useEffect, useCallback } from "react";

// ══════════════════════════════════════════════════════
// STORAGE — localStorage com fallback seguro
// ══════════════════════════════════════════════════════
const KEY = "afiliadoai_final_v1";
const load = () => { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };

const EMPTY = {
  user: null,
  links: [],
  videos: [],
  scripts: [],
  stats: { cliques: 0, vendas: 0, comissao: 0 },
  connectedAccounts: {},
  bestTimes: { tiktok:"20:00", instagram:"19:30", youtube:"21:00", facebook:"18:00", kwai:"21:00", telegram:"10:00", twitter:"12:00" },
  settings: { notif: true, ai: true },
  customStores: [],
  connectedStores: {},
  queue: [],
  postLogs: [],
  mlTokens: null,
};

// ══════════════════════════════════════════════════════
// MERCADO LIVRE — busca pública sem token
// ══════════════════════════════════════════════════════
async function fetchProductML(url, accessToken) {
  try {
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    const idMatch = url.match(/MLB-?(\d+)/i);
    if (idMatch) {
      const r = await fetch(`https://api.mercadolibre.com/items/MLB${idMatch[1]}`, { headers });
      const d = await r.json();
      if (d.title) return {
        name: d.title, price: d.price,
        priceStr: `R$ ${d.price.toFixed(2).replace(".", ",")}`,
        thumb: (d.pictures?.[0]?.url || d.thumbnail || "").replace("I.jpg","O.jpg"),
        sold: d.sold_quantity || 0,
      };
    }
    const r2 = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(url)}&limit=1`, { headers });
    const d2 = await r2.json();
    const item = d2.results?.[0];
    if (item) return {
      name: item.title, price: item.price,
      priceStr: `R$ ${item.price.toFixed(2).replace(".", ",")}`,
      thumb: (item.thumbnail || "").replace("I.jpg","O.jpg"),
      sold: item.sold_quantity || 0,
    };
  } catch {}
  return null;
}

// ══════════════════════════════════════════════════════
// LOJAS — com logos reais
// ══════════════════════════════════════════════════════
const STORES = [
  { id:"ml",  name:"Mercado Livre", color:"#FFE600", commission:0.08, favicon:"https://www.mercadolivre.com.br/favicon.ico" },
  { id:"amz", name:"Amazon",        color:"#FF9900", commission:0.10, favicon:"https://www.amazon.com.br/favicon.ico" },
  { id:"shp", name:"Shopee",        color:"#EE4D2D", commission:0.12, favicon:"https://shopee.com.br/favicon.ico" },
  { id:"shn", name:"Shein",         color:"#E91E8C", commission:0.15, favicon:"https://www.shein.com.br/favicon.ico" },
  { id:"tmu", name:"Temu",          color:"#FF5722", commission:0.09, favicon:"https://www.temu.com/favicon.ico" },
  { id:"nat", name:"Natura",        color:"#00A86B", commission:0.14, favicon:"https://www.natura.com.br/favicon.ico" },
  { id:"bot", name:"O Boticário",   color:"#4CAF50", commission:0.13, favicon:"https://www.boticario.com.br/favicon.ico" },
  { id:"cac", name:"Cacau Show",    color:"#8B4513", commission:0.11, favicon:"https://www.cacaushow.com.br/favicon.ico" },
  { id:"per", name:"Pernambucanas", color:"#E53935", commission:0.07, favicon:"https://www.pernambucanas.com.br/favicon.ico" },
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

// ══════════════════════════════════════════════════════
// PLATAFORMAS SOCIAIS
// ══════════════════════════════════════════════════════
const PLATFORMS = [
  { id:"tiktok",    name:"TikTok",    icon:"🎵", color:"#FF0050", url:"https://www.tiktok.com/upload",         rule:"Usar #publi ou #ad obrigatório" },
  { id:"instagram", name:"Instagram", icon:"📸", color:"#E91E8C", url:"https://www.instagram.com/create/story", rule:"#publi obrigatório. Link na bio." },
  { id:"youtube",   name:"YouTube",   icon:"▶️",  color:"#FF0000", url:"https://studio.youtube.com",            rule:"Avisar link afiliado na descrição" },
  { id:"facebook",  name:"Facebook",  icon:"👤", color:"#1877F2", url:"https://www.facebook.com/reel/create",   rule:"Não impulsionar post com link afiliado" },
  { id:"kwai",      name:"Kwai",      icon:"🎬", color:"#FF6B00", url:"https://www.kwai.com/creator/upload",    rule:"Não prometer cashback falso" },
  { id:"telegram",  name:"Telegram",  icon:"✈️",  color:"#2AABEE", url:"https://web.telegram.org",              rule:"Não enviar spam em grupos" },
  { id:"twitter",   name:"X (Twitter)",icon:"𝕏", color:"#ffffff", url:"https://twitter.com/intent/tweet",      rule:"Máx 280 chars · Marcar #ad em posts pagos" },
];

// ══════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════
const C = {
  bg:"#04060e", s1:"#090f1e", s2:"#0e1628", card:"#111827",
  b1:"#1a2540", b2:"#243354",
  neon:"#00ddb4", gold:"#f4a918", blue:"#4b8ef8",
  purple:"#9b72f7", red:"#f05c5c", orange:"#f48c42",
  wa:"#25D366", tg:"#2AABEE",
  t1:"#eef2f8", t2:"#8898b0", t3:"#3d526b",
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  html,body,#root{min-height:100%;background:${C.bg};}
  body{font-family:'Outfit',sans-serif;color:${C.t1};overflow-x:hidden;}
  input,button,textarea,select{font-family:inherit;}
  ::-webkit-scrollbar{display:none;}
  @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .fu{animation:fu .3s ease both;}
  .pulse{animation:pulse 2s infinite;}
`;

const Sty = () => <style>{STYLES}</style>;

// ══════════════════════════════════════════════════════
// UI PRIMITIVES
// ══════════════════════════════════════════════════════
const Spin = ({ size=18, color=C.neon }) => (
  <div style={{ width:size, height:size, border:`2px solid ${color}20`, borderTopColor:color, borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }} />
);

const StoreLogo = ({ store, size=32 }) => {
  const [err, setErr] = useState(false);
  if (!store) return <div style={{ width:size, height:size, borderRadius:size*.28, background:C.b1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.5 }}>🏪</div>;
  return err
    ? <div style={{ width:size, height:size, borderRadius:size*.28, background:store.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.5 }}>🏪</div>
    : <img src={store.favicon} alt={store.name} onError={()=>setErr(true)} style={{ width:size, height:size, borderRadius:size*.28, objectFit:"contain", background:store.color+"15", padding:size*.08, flexShrink:0 }} />;
};

const ProductThumb = ({ thumb, store, size=44 }) => {
  const [err, setErr] = useState(false);
  const src = thumb ? `https://wsrv.nl/?url=${encodeURIComponent(thumb)}&w=${size*2}&h=${size*2}&fit=cover&output=jpg` : null;
  return (
    <div style={{ width:size, height:size, borderRadius:size*.25, overflow:"hidden", flexShrink:0, background:(store?.color||C.neon)+"18", border:`1px solid ${(store?.color||C.neon)}25`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      {src && !err ? <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={()=>setErr(true)} /> : <StoreLogo store={store} size={size*.7} />}
    </div>
  );
};

const Chip = ({ c=C.neon, children, s={} }) => (
  <span style={{ background:c+"1a", border:`1px solid ${c}45`, color:c, borderRadius:7, padding:"2px 9px", fontSize:10, fontWeight:700, letterSpacing:.6, textTransform:"uppercase", ...s }}>{children}</span>
);

const Btn = ({ children, onClick, v="p", full, dis, s={} }) => {
  const V = {
    p:  { bg:`linear-gradient(135deg,${C.neon},${C.blue})`,    c:"#000", b:"none" },
    g:  { bg:`linear-gradient(135deg,${C.gold},${C.orange})`,  c:"#000", b:"none" },
    u:  { bg:`linear-gradient(135deg,${C.purple},${C.blue})`,  c:"#fff", b:"none" },
    r:  { bg:C.red+"1a",   c:C.red,  b:`1px solid ${C.red}40` },
    gh: { bg:"transparent", c:C.t2,  b:`1px solid ${C.b2}` },
    wa: { bg:C.wa+"1a",    c:C.wa,   b:`1px solid ${C.wa}40` },
    tg: { bg:C.tg+"1a",    c:C.tg,   b:`1px solid ${C.tg}40` },
  };
  const x = V[v]||V.p;
  return (
    <button onClick={dis?undefined:onClick} style={{ background:x.bg, border:x.b, borderRadius:12, padding:"11px 18px", color:x.c, fontWeight:700, fontSize:13, cursor:dis?"not-allowed":"pointer", opacity:dis?.5:1, width:full?"100%":undefined, transition:"opacity .15s", ...s }}>
      {children}
    </button>
  );
};

const Inp = ({ label, ph, val, set, type="text", mono, hint }) => (
  <div style={{ marginBottom:12 }}>
    {label && <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:5 }}>{label}</div>}
    <input type={type} placeholder={ph} value={val} onChange={e=>set(e.target.value)}
      style={{ width:"100%", background:C.s1, border:`1px solid ${C.b1}`, borderRadius:11, padding:"11px 13px", color:C.t1, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:mono?"'JetBrains Mono',monospace":"inherit" }}
      onFocus={e=>e.target.style.borderColor=C.neon+"70"} onBlur={e=>e.target.style.borderColor=C.b1} />
    {hint && <div style={{ color:C.t3, fontSize:10, marginTop:4 }}>{hint}</div>}
  </div>
);

const Card = ({ children, s={}, glow, onClick }) => (
  <div onClick={onClick} style={{ background:C.card, border:`1px solid ${glow?glow+"35":C.b1}`, borderRadius:18, padding:16, boxShadow:glow?`0 2px 24px ${glow}12`:"none", cursor:onClick?"pointer":undefined, ...s }}>
    {children}
  </div>
);

const Empty = ({ ico, title, desc, action }) => (
  <div style={{ textAlign:"center", padding:"32px 16px" }}>
    <div style={{ fontSize:44, opacity:.3, marginBottom:12 }}>{ico}</div>
    <div style={{ color:C.t2, fontWeight:700, fontSize:15, marginBottom:6 }}>{title}</div>
    <div style={{ color:C.t3, fontSize:12, lineHeight:1.7, marginBottom:action?16:0 }}>{desc}</div>
    {action}
  </div>
);

const Tog = ({ val, set }) => (
  <div onClick={()=>set(!val)} style={{ width:44, height:24, background:val?C.neon:C.b1, borderRadius:99, cursor:"pointer", position:"relative", transition:"background .3s", flexShrink:0 }}>
    <div style={{ width:18, height:18, background:"#fff", borderRadius:99, position:"absolute", top:3, left:val?23:3, transition:"left .3s" }} />
  </div>
);

// ══════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════
function Login({ onLogin }) {
  const [mode, setMode] = useState("in");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false); const [err, setErr] = useState("");

  const go = () => {
    if (!email.trim()||!pass.trim()) return setErr("Preencha e-mail e senha");
    if (mode==="up"&&!name.trim()) return setErr("Digite seu nome");
    setErr(""); setLoading(true);
    setTimeout(()=>{ setLoading(false); onLogin({ name:name||email.split("@")[0], email, at:new Date().toISOString() }); }, 900);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <Sty />
      <div style={{ position:"fixed", top:-60, left:"50%", transform:"translateX(-50%)", width:380, height:380, borderRadius:"50%", background:`radial-gradient(circle,${C.neon}07,transparent 70%)`, pointerEvents:"none" }} />
      <div style={{ width:"100%", maxWidth:380 }} className="fu">
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <div style={{ width:68, height:68, background:`linear-gradient(135deg,${C.neon},${C.blue})`, borderRadius:22, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 16px", boxShadow:`0 8px 32px ${C.neon}40` }}>⚡</div>
          <div style={{ color:C.t1, fontWeight:900, fontSize:32, letterSpacing:-1 }}>AfiliadoAI</div>
          <span style={{ background:C.neon, color:"#000", fontSize:9, fontWeight:800, padding:"2px 10px", borderRadius:99, display:"inline-block", marginTop:6, letterSpacing:1.5 }}>PRO</span>
          <div style={{ color:C.t3, fontSize:12, marginTop:10 }}>Sistema profissional de afiliados com IA</div>
        </div>
        <div style={{ display:"flex", background:C.s1, border:`1px solid ${C.b1}`, borderRadius:14, padding:4, marginBottom:22 }}>
          {[["in","🔑 Entrar"],["up","✨ Criar Conta"]].map(([id,l])=>(
            <button key={id} onClick={()=>{setMode(id);setErr("");}} style={{ flex:1, padding:"10px 0", borderRadius:11, border:"none", background:mode===id?`linear-gradient(135deg,${C.neon},${C.blue})`:"transparent", color:mode===id?"#000":C.t3, fontWeight:700, fontSize:13, cursor:"pointer" }}>{l}</button>
          ))}
        </div>
        {mode==="up" && <Inp label="Seu nome" ph="Como posso te chamar?" val={name} set={setName} />}
        <Inp label="E-mail" ph="seu@email.com" val={email} set={setEmail} type="email" />
        <Inp label="Senha" ph="••••••••" val={pass} set={setPass} type="password" />
        {err && <div style={{ color:C.red, fontSize:12, textAlign:"center", marginBottom:10, padding:8, background:C.red+"15", borderRadius:8 }}>{err}</div>}
        <Btn full onClick={go} dis={loading} s={{ padding:"14px 0", fontSize:15, marginTop:4 }}>
          {loading ? <div style={{ display:"flex",gap:8,alignItems:"center",justifyContent:"center" }}><Spin size={16} color="#000"/>Aguarde...</div> : mode==="in"?"🚀 Entrar":"✅ Criar Conta"}
        </Btn>
        <div style={{ color:C.t3, fontSize:11, textAlign:"center", marginTop:16 }}>🔒 Dados salvos no dispositivo · 100% privado</div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════
// REGISTRAR VENDA — inspirado no Hotmart/Monetizze
// ══════════════════════════════════════════════════════
function RegisterSaleCard({ stats, updStats, links }) {
  const [show, setShow] = useState(false);
  const [val, setVal] = useState("");
  const [selLink, setSelLink] = useState("");
  const [saved, setSaved] = useState(false);

  const register = () => {
    const v = parseFloat(val.replace(",","."));
    if (!v || v <= 0) return;
    updStats({
      ...stats,
      vendas: stats.vendas + 1,
      comissao: stats.comissao + v,
    });
    setSaved(true); setVal(""); setSelLink("");
    setTimeout(() => { setSaved(false); setShow(false); }, 2000);
  };

  return (
    <Card glow={C.gold} s={{ border:`1px solid ${C.gold}30` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ color:C.gold, fontWeight:700, fontSize:14 }}>💰 Registrar Comissão</div>
          <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>Anote quando receber uma comissão</div>
        </div>
        <button onClick={()=>setShow(s=>!s)} style={{ background:show?C.s1:`linear-gradient(135deg,${C.gold},${C.orange})`, border:show?`1px solid ${C.b2}`:"none", borderRadius:99, padding:"7px 16px", color:show?C.t2:"#000", fontWeight:700, fontSize:12, cursor:"pointer" }}>
          {show?"✕ Fechar":"+ Registrar"}
        </button>
      </div>
      {show && (
        <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.b1}` }}>
          {saved ? (
            <div style={{ textAlign:"center", padding:"12px 0", color:C.neon, fontWeight:700, fontSize:15 }}>✅ Comissão registrada!</div>
          ) : (
            <>
              {links.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Produto (opcional)</div>
                  <select value={selLink} onChange={e=>setSelLink(e.target.value)} style={{ width:"100%", background:C.s1, border:`1px solid ${C.b1}`, borderRadius:10, padding:"9px 12px", color:selLink?C.t1:C.t3, fontSize:12, outline:"none" }}>
                    <option value="">Selecionar produto...</option>
                    {links.map(l=><option key={l.id} value={l.id}>{l.productName}{l.price?" — "+l.price:""}</option>)}
                  </select>
                </div>
              )}
              <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Valor da Comissão (R$) *</div>
              <div style={{ display:"flex", gap:8 }}>
                <input placeholder="Ex: 24,50" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&register()}
                  style={{ flex:1, background:C.s1, border:`1px solid ${C.gold}40`, borderRadius:10, padding:"10px 12px", color:C.t1, fontSize:14, fontWeight:700, outline:"none" }}/>
                <button onClick={register} style={{ background:`linear-gradient(135deg,${C.gold},${C.orange})`, border:"none", borderRadius:10, padding:"0 20px", color:"#000", fontWeight:800, fontSize:14, cursor:"pointer" }}>✓</button>
              </div>
              <div style={{ color:C.t3, fontSize:10, marginTop:6 }}>O valor é adicionado ao total de comissões do Dashboard</div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

// ══════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════
function Dashboard({ stats, links, videos, scripts, goTo, updStats }) {
  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[
          { l:"Cliques",  v:stats.cliques,                     ico:"👆", c:C.neon },
          { l:"Links",    v:links.length,                      ico:"🔗", c:C.blue },
          { l:"Roteiros", v:scripts.length,                    ico:"📝", c:C.purple },
          { l:"Vídeos",   v:videos.length,                     ico:"🎬", c:C.orange },
        ].map(x=>(
          <Card key={x.l} glow={x.c} s={{ padding:"16px 14px" }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{x.ico}</div>
            <div style={{ color:x.c, fontWeight:900, fontSize:24, letterSpacing:-.5 }}>{x.v}</div>
            <div style={{ color:C.t3, fontSize:10, marginTop:3, fontWeight:700, textTransform:"uppercase", letterSpacing:.8 }}>{x.l}</div>
          </Card>
        ))}
      </div>

      <Card glow={C.purple} s={{ background:`linear-gradient(135deg,${C.purple}12,${C.blue}08)`, border:`1px solid ${C.purple}35` }}>
        <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:12 }}>
          <div style={{ width:50, height:50, borderRadius:14, background:`linear-gradient(135deg,${C.purple},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0, boxShadow:`0 4px 20px ${C.purple}40` }}>💰</div>
          <div style={{ flex:1 }}>
            <div style={{ color:C.t3, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8 }}>Comissão Total Gerada</div>
            <div style={{ color:C.purple, fontWeight:900, fontSize:32, letterSpacing:-1, marginTop:2 }}>R$ {stats.comissao.toFixed(2)}</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          <div style={{ background:"rgba(0,0,0,.3)", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
            <div style={{ color:C.neon, fontWeight:800, fontSize:18 }}>{stats.cliques}</div>
            <div style={{ color:C.t3, fontSize:9, marginTop:2, textTransform:"uppercase", letterSpacing:.6 }}>Cliques</div>
          </div>
          <div style={{ background:"rgba(0,0,0,.3)", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
            <div style={{ color:C.gold, fontWeight:800, fontSize:18 }}>{stats.vendas}</div>
            <div style={{ color:C.t3, fontSize:9, marginTop:2, textTransform:"uppercase", letterSpacing:.6 }}>Vendas</div>
          </div>
          <div style={{ background:"rgba(0,0,0,.3)", borderRadius:10, padding:"8px 10px", textAlign:"center" }}>
            <div style={{ color:C.blue, fontWeight:800, fontSize:18 }}>{links.length}</div>
            <div style={{ color:C.t3, fontSize:9, marginTop:2, textTransform:"uppercase", letterSpacing:.6 }}>Links</div>
          </div>
        </div>
      </Card>

      {links.length===0 ? (
        <Card s={{ border:`1px dashed ${C.b2}` }}>
          <Empty ico="🚀" title="Comece adicionando seu link!" desc="Cole o link meli.la/17XoYuZ na aba Links para começar a rastrear cliques e ganhar comissões." action={<Btn onClick={()=>goTo("Links")} s={{ padding:"10px 20px" }}>➜ Adicionar Link</Btn>} />
        </Card>
      ) : (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={{ color:C.t1, fontWeight:700, fontSize:14 }}>🔗 Meus Links</div>
            <Chip>{links.length}</Chip>
          </div>
          {links.slice(0,3).map((l,i)=>(
            <div key={l.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:i<Math.min(links.length,3)-1?`1px solid ${C.b1}`:"none" }}>
              <ProductThumb thumb={l.thumb} store={STORES.find(s=>s.id===l.storeId)} size={36} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ color:C.t1, fontWeight:600, fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.productName}</div>
                {l.price && <div style={{ color:C.neon, fontSize:11, marginTop:1, fontWeight:700 }}>{l.price}</div>}
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ color:C.neon, fontWeight:800, fontSize:16 }}>{l.clicks||0}</div>
                <div style={{ color:C.t3, fontSize:9 }}>cliques</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Card s={{ background:`linear-gradient(135deg,${C.neon}08,${C.blue}06)`, border:`1px solid ${C.neon}20` }}>
        <div style={{ color:C.neon, fontWeight:700, fontSize:13, marginBottom:12 }}>⚡ Ações Rápidas</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <Btn onClick={()=>goTo("Links")} s={{ padding:"10px 0", fontSize:12 }}>🔗 Novo Link</Btn>
          <Btn onClick={()=>goTo("Mensagens")} v="wa" s={{ padding:"10px 0", fontSize:12 }}>💬 Mensagem</Btn>
          <Btn onClick={()=>goTo("Roteiros")} v="u" s={{ padding:"10px 0", fontSize:12 }}>📝 Roteiro</Btn>
          <Btn onClick={()=>{ goTo("Fila"); }} v="u" s={{ padding:"10px 0", fontSize:12, background:`linear-gradient(135deg,#9b72f7,#4b8ef8)` }}>🤖 Auto-Fila</Btn>
        </div>
      </Card>

      <RegisterSaleCard stats={stats} updStats={updStats} links={links} />
    </div>
  );
}

// ══════════════════════════════════════════════════════
// LINKS
// ══════════════════════════════════════════════════════
function Links({ links, addLink, updateLink, delLink, stats, updStats, goTo, setSelProd, mlTokens, setMlTokens }) {
  const [url, setUrl] = useState(""); const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(""); const [result, setResult] = useState(null);
  const [showQR, setShowQR] = useState(null); const [copied, setCopied] = useState(null);

  const analyze = async () => {
    const u = url.trim(); if (!u) return;
    setLoading(true); setResult(null);
    for (let i=0;i<3;i++) {
      setPhase(["🔍 Detectando loja...","📦 Buscando produto...","💰 Calculando comissão..."][i]);
      await new Promise(r=>setTimeout(r,650));
    }
    const store = detectStore(u);
    let prod = null;
    if (u.includes("meli.la")||u.includes("mercadolivre")||u.includes("MLB")||store?.id==="ml") {
      const token = await mlGetValidToken(mlTokens, setMlTokens);
      prod = await fetchProductML(u, token);
    }
    setPhase("✅ Pronto!"); await new Promise(r=>setTimeout(r,300));
    const rate = store?.commission||0.10;
    const comm = prod?.price ? prod.price*rate : null;
    setResult({
      id:Date.now().toString(), originalUrl:u,
      productName: prod?.name||(store?`Produto ${store.name}`:"Produto Afiliado"),
      thumb: prod?.thumb||null,
      price: prod?.priceStr||null, priceRaw: prod?.price||null,
      commission: comm?`R$ ${comm.toFixed(2).replace(".",",")}`:null,
      commRate:`${(rate*100).toFixed(0)}%`, commVal:comm||0,
      storeId:store?.id||"out", storeName:store?.name||"Loja",
      storeColor:store?.color||C.neon, clicks:0, createdAt:new Date().toISOString(),
    });
    setLoading(false);
  };

  const saveLink = (r=result) => {
    if (!r) return;
    if (!links.find(l=>l.originalUrl===r.originalUrl)) addLink(r);
    setUrl(""); setResult(null);
  };

  const openLink = (l) => {
    updateLink({...l, clicks:(l.clicks||0)+1});
    updStats({...stats, cliques:stats.cliques+1});
    window.open(l.originalUrl,"_blank");
  };

  const sendWA = (l) => {
    const msg=`🔥 *${l.productName}*${l.price?"\n💲 Por apenas *"+l.price+"*":""}\n💰 Oferta exclusiva!\n\n👉 ${l.originalUrl}\n\n⚠️ _Estoque limitado!_ 🚨`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
  };

  const sendTG = (l) => {
    const msg=`🔥 ${l.productName}${l.price?" — "+l.price:""}\n\n👉 ${l.originalUrl}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(l.originalUrl)}&text=${encodeURIComponent(msg)}`,"_blank");
  };

  const copy = (txt,id) => { navigator.clipboard?.writeText(txt).catch(()=>{}); setCopied(id); setTimeout(()=>setCopied(null),2000); };
  const qrSrc = (u) => `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(u)}&bgcolor=111827&color=00ddb4&format=png`;

  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card glow={C.neon}>
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${C.neon}25,${C.blue}15)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🔗</div>
          <div>
            <div style={{ color:C.t1, fontWeight:700, fontSize:15 }}>Analisador de Link</div>
            <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>Cola o link → IA detecta produto e calcula comissão</div>
          </div>
        </div>
        <div style={{ position:"relative" }}>
          <input placeholder="https://meli.la/17XoYuZ ou qualquer link..." value={url} onChange={e=>setUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&analyze()}
            style={{ width:"100%", background:C.s1, border:`1px solid ${url?C.neon+"55":C.b1}`, borderRadius:11, padding:"11px 40px 11px 13px", color:C.t1, fontSize:13, outline:"none", boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor=C.neon+"80"} onBlur={e=>e.target.style.borderColor=url?C.neon+"55":C.b1} />
          {url && <button onClick={()=>{setUrl("");setResult(null);}} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.t3, cursor:"pointer", fontSize:16 }}>✕</button>}
        </div>
        <Btn full onClick={analyze} dis={loading||!url.trim()} s={{ marginTop:10 }}>
          {loading ? <div style={{ display:"flex",gap:8,alignItems:"center",justifyContent:"center" }}><Spin size={16}/>{phase}</div> : "⚡ ANALISAR LINK"}
        </Btn>
        <div style={{ marginTop:10, background:C.neon+"08", borderRadius:10, padding:"8px 12px", display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:14 }}>💡</span>
          <span style={{ color:C.t3, fontSize:11 }}>Tente: <span style={{ color:C.neon, cursor:"pointer", fontWeight:600 }} onClick={()=>setUrl("https://meli.la/17XoYuZ")}>https://meli.la/17XoYuZ</span></span>
        </div>
      </Card>

      {result && (
        <Card glow={result.storeColor} s={{ border:`1px solid ${result.storeColor}45` }} className="fu">
          <Chip c={result.storeColor}>✅ Produto Identificado</Chip>
          <div style={{ display:"flex", gap:12, margin:"14px 0 12px", alignItems:"center" }}>
            <ProductThumb thumb={result.thumb} store={STORES.find(s=>s.id===result.storeId)} size={64} />
            <div style={{ flex:1 }}>
              <div style={{ color:C.t1, fontWeight:700, fontSize:14, lineHeight:1.3 }}>{result.productName}</div>
              <div style={{ color:result.storeColor, fontSize:12, marginTop:4, fontWeight:600 }}>{result.storeName}</div>
              {result.price && <div style={{ color:C.neon, fontWeight:900, fontSize:22, marginTop:4 }}>{result.price}</div>}
              {result.commission && <div style={{ color:C.gold, fontSize:12, marginTop:2 }}>💰 {result.commission} comissão ({result.commRate})</div>}
              {!result.price && <div style={{ color:C.t3, fontSize:11, marginTop:4 }}>⚠️ Configure API do ML para ver preço real</div>}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:8 }}>
            <Btn onClick={()=>saveLink()} s={{ padding:"9px 0", fontSize:11 }}>💾 Salvar</Btn>
            <Btn onClick={()=>{ saveLink(); setSelProd(result); goTo("Roteiros"); }} v="u" s={{ padding:"9px 0", fontSize:11 }}>📝 Roteiro</Btn>
            <Btn onClick={()=>{ saveLink(); setSelProd(result); goTo("Vídeos"); }} v="g" s={{ padding:"9px 0", fontSize:11 }}>🎬 Vídeo</Btn>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <Btn onClick={()=>sendWA(result)} v="wa" s={{ padding:"9px 0", fontSize:12 }}>💬 WhatsApp</Btn>
            <Btn onClick={()=>sendTG(result)} v="tg" s={{ padding:"9px 0", fontSize:12 }}>✈️ Telegram</Btn>
          </div>
        </Card>
      )}

      {links.length===0 ? (
        <Card s={{ border:`1px dashed ${C.b2}` }}><Empty ico="🔗" title="Nenhum link ainda" desc="Analise seu primeiro link de afiliado acima." /></Card>
      ) : (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ color:C.t1, fontWeight:700, fontSize:14 }}>📊 Meus Links</div>
            <Chip>{links.length}</Chip>
          </div>
          {links.map((l,i)=>(
            <div key={l.id} style={{ paddingBottom:i<links.length-1?14:0, marginBottom:i<links.length-1?14:0, borderBottom:i<links.length-1?`1px solid ${C.b1}`:"none" }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <ProductThumb thumb={l.thumb} store={STORES.find(s=>s.id===l.storeId)} size={46} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:C.t1, fontWeight:600, fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.productName}</div>
                  <div style={{ color:C.t3, fontSize:10, marginTop:1 }}>{l.storeName} · {new Date(l.createdAt).toLocaleDateString("pt-BR")}</div>
                  {l.price && <div style={{ color:C.neon, fontWeight:700, fontSize:13, marginTop:3 }}>{l.price}</div>}
                  {l.commission && <div style={{ color:C.gold, fontSize:11, marginTop:1 }}>💰 {l.commission}</div>}
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ color:C.neon, fontWeight:900, fontSize:20 }}>{l.clicks||0}</div>
                  <div style={{ color:C.t3, fontSize:9 }}>cliques</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:5, marginTop:10, flexWrap:"wrap" }}>
                <button onClick={()=>openLink(l)} style={{ flex:1, minWidth:50, background:(l.storeColor||C.neon)+"18", border:`1px solid ${(l.storeColor||C.neon)}35`, borderRadius:9, padding:"7px 0", color:l.storeColor||C.neon, fontWeight:700, fontSize:10, cursor:"pointer" }}>🌐 Abrir</button>
                <button onClick={()=>copy(l.originalUrl,l.id)} style={{ flex:1, minWidth:50, background:C.s1, border:`1px solid ${C.b1}`, borderRadius:9, padding:"7px 0", color:copied===l.id?C.neon:C.t2, fontWeight:700, fontSize:10, cursor:"pointer" }}>{copied===l.id?"✅":"📋 Copiar"}</button>
                <button onClick={()=>sendWA(l)} style={{ flex:1, minWidth:50, background:C.wa+"18", border:`1px solid ${C.wa}35`, borderRadius:9, padding:"7px 0", color:C.wa, fontWeight:700, fontSize:10, cursor:"pointer" }}>💬 WA</button>
                <button onClick={()=>sendTG(l)} style={{ flex:1, minWidth:50, background:C.tg+"18", border:`1px solid ${C.tg}35`, borderRadius:9, padding:"7px 0", color:C.tg, fontWeight:700, fontSize:10, cursor:"pointer" }}>✈️ TG</button>
                <button onClick={()=>setShowQR(showQR===l.id?null:l.id)} style={{ flex:1, minWidth:50, background:C.s1, border:`1px solid ${C.b1}`, borderRadius:9, padding:"7px 0", color:C.t2, fontWeight:700, fontSize:10, cursor:"pointer" }}>📱 QR</button>
                <button onClick={()=>delLink(l.id)} style={{ background:C.red+"18", border:`1px solid ${C.red}30`, borderRadius:9, padding:"7px 10px", color:C.red, fontWeight:700, fontSize:10, cursor:"pointer" }}>🗑</button>
              </div>
              {showQR===l.id && (
                <div style={{ marginTop:10, textAlign:"center", background:C.s1, borderRadius:12, padding:14 }}>
                  <img src={qrSrc(l.originalUrl)} alt="QR" style={{ borderRadius:10 }} />
                  <div style={{ color:C.t3, fontSize:10, marginTop:6 }}>Escaneie para abrir</div>
                  <button onClick={()=>copy(l.originalUrl,l.id+"q")} style={{ marginTop:8, background:C.neon+"18", border:`1px solid ${C.neon}35`, borderRadius:8, padding:"6px 16px", color:C.neon, fontSize:11, fontWeight:700, cursor:"pointer" }}>📋 Copiar Link</button>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// WHATSAPP + TELEGRAM
// ══════════════════════════════════════════════════════
function Mensagens({ links }) {
  const [selLink, setSelLink] = useState(null);
  const [tpl, setTpl] = useState("oferta");
  const [custom, setCustom] = useState("");
  const [preview, setPreview] = useState(false);
  const [channel, setChannel] = useState("wa");

  const TPL = {
    oferta:  l=>`🔥 *Oferta IMPERDÍVEL!*\n\n🛍️ *${l.productName}*${l.price?"\n💲 Por apenas *"+l.price+"*":""}\n💰 Oferta exclusiva!\n\n👉 ${l.originalUrl}\n\n⚠️ _Estoque limitado!_ 🚨`,
    casual:  l=>`Ei! Olha esse produto incrível 👀\n\n${l.productName}${l.price?" — "+l.price:""}\n\n👉 ${l.originalUrl}`,
    urgente: l=>`🚨 *ÚLTIMAS HORAS!*\n\n*${l.productName}*${l.price?"\nPor apenas *"+l.price+"*":""}\n\n⏰ Só hoje!\n👉 ${l.originalUrl}`,
    presente:l=>`🎁 Presente perfeito!\n\n*${l.productName}*${l.price?"\n"+l.price:""}\n\n✅ Qualidade garantida\n👉 ${l.originalUrl}`,
  };

  const link = links.find(l=>l.id===selLink)||links[0];
  const msg = link?(tpl==="custom"?custom:TPL[tpl]?.(link)||""):"";

  const send = () => {
    if (!msg||!link) return;
    if (channel==="wa") window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
    else window.open(`https://t.me/share/url?url=${encodeURIComponent(link.originalUrl)}&text=${encodeURIComponent(msg)}`,"_blank");
  };

  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card glow={channel==="wa"?C.wa:C.tg} s={{ border:`1px solid ${(channel==="wa"?C.wa:C.tg)+"30"}` }}>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <button onClick={()=>setChannel("wa")} style={{ flex:1, background:channel==="wa"?C.wa+"20":"transparent", border:`1px solid ${channel==="wa"?C.wa+"50":C.b1}`, borderRadius:12, padding:"10px 0", color:channel==="wa"?C.wa:C.t3, fontWeight:700, fontSize:13, cursor:"pointer" }}>💬 WhatsApp</button>
          <button onClick={()=>setChannel("tg")} style={{ flex:1, background:channel==="tg"?C.tg+"20":"transparent", border:`1px solid ${channel==="tg"?C.tg+"50":C.b1}`, borderRadius:12, padding:"10px 0", color:channel==="tg"?C.tg:C.t3, fontWeight:700, fontSize:13, cursor:"pointer" }}>✈️ Telegram</button>
        </div>

        {links.length===0 ? (
          <div style={{ color:C.t3, fontSize:12, textAlign:"center", padding:12 }}>Adicione links primeiro</div>
        ) : (
          <>
            <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Produto</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
              {links.map(l=>(
                <div key={l.id} onClick={()=>setSelLink(l.id)} style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 12px", background:(selLink===l.id||(!selLink&&l===links[0]))?C.neon+"10":C.s1, border:`1px solid ${(selLink===l.id||(!selLink&&l===links[0]))?C.neon+"40":C.b1}`, borderRadius:12, cursor:"pointer" }}>
                  <ProductThumb thumb={l.thumb} store={STORES.find(s=>s.id===l.storeId)} size={30} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:C.t1, fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.productName}</div>
                    {l.price && <div style={{ color:C.neon, fontSize:11 }}>{l.price}</div>}
                  </div>
                  {(selLink===l.id||(!selLink&&l===links[0])) && <span style={{ color:C.neon }}>✓</span>}
                </div>
              ))}
            </div>

            <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Modelo</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:14 }}>
              {[["oferta","🔥 Oferta"],["casual","😊 Casual"],["urgente","⏰ Urgente"],["presente","🎁 Presente"],["custom","✏️ Custom"]].map(([id,l])=>(
                <button key={id} onClick={()=>setTpl(id)} style={{ background:tpl===id?`linear-gradient(135deg,${C.neon}18,${C.blue}12)`:"transparent", border:`1px solid ${tpl===id?C.neon+"50":C.b1}`, borderRadius:10, padding:"8px 0", color:tpl===id?C.neon:C.t3, fontWeight:700, fontSize:11, cursor:"pointer" }}>{l}</button>
              ))}
            </div>

            {tpl==="custom" && (
              <textarea placeholder="Escreva sua mensagem..." value={custom} onChange={e=>setCustom(e.target.value)} rows={5}
                style={{ width:"100%", background:C.s1, border:`1px solid ${C.b1}`, borderRadius:11, padding:"11px 13px", color:C.t1, fontSize:12, outline:"none", resize:"none", boxSizing:"border-box", marginBottom:12, lineHeight:1.6 }} />
            )}

            <button onClick={()=>setPreview(p=>!p)} style={{ width:"100%", background:"none", border:`1px solid ${C.b2}`, borderRadius:10, padding:"8px 0", color:C.t2, fontSize:12, fontWeight:600, cursor:"pointer", marginBottom:preview&&msg?10:0 }}>
              {preview?"▲ Ocultar prévia":"▼ Ver prévia"}
            </button>

            {preview && msg && (
              <div style={{ background:C.s1, border:`1px solid ${(channel==="wa"?C.wa:C.tg)+"30"}`, borderRadius:12, padding:12, marginBottom:12, marginTop:10 }}>
                <pre style={{ color:C.t2, fontSize:11, lineHeight:1.8, whiteSpace:"pre-wrap", fontFamily:"'Outfit',sans-serif" }}>{msg}</pre>
              </div>
            )}

            <Btn full onClick={send} v={channel==="wa"?"wa":"tg"} dis={!msg} s={{ padding:"13px 0", fontSize:14 }}>
              {channel==="wa"?"💬 ABRIR WHATSAPP":"✈️ ABRIR TELEGRAM"}
            </Btn>
          </>
        )}
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ROTEIROS
// ══════════════════════════════════════════════════════
function Roteiros({ links, selProd, setSelProd, scripts, addScript, delScript, goTo }) {
  const [gen, setGen] = useState(false); const [msg, setMsg] = useState("");
  const prod = selProd||links[0]||null;

  const generate = async () => {
    if (!prod) return; setGen(true);
    for (let i=0;i<3;i++) { setMsg(["🔍 Analisando produto...","✍️ Criando roteiro...","🎯 Adicionando CTAs..."][i]); await new Promise(r=>setTimeout(r,600)); }
    const s = `🎬 ROTEIRO VIRAL — ${prod.productName}
━━━━━━━━━━━━━━━━━━━━━
⚡ [0-3s] HOOK:
"Para tudo! Você PRECISA ver isso!"
Zoom no produto + expressão surpresa

🛍️ [3-10s] PRODUTO:
Mostrar ${prod.productName}
${prod.price?"Destaque: "+prod.price+" 🔥":"Preço incrível!"}
Música trending ao fundo 🎵

💥 [10-16s] BENEFÍCIOS:
✅ Melhor preço garantido
✅ Entrega rápida no Brasil
✅ Link exclusivo na bio

🔥 [16-20s] CTA:
"LINK NA BIO — corre!"
"Estoque acabando hoje!"
Aponta para cima ⬆️

📍 ${prod.originalUrl}

#viral #afiliado #oferta #${prod.storeName?.toLowerCase().replace(" ","")||"produto"}`;
    addScript({ id:Date.now().toString(), productName:prod.productName, storeId:prod.storeId, text:s, createdAt:new Date().toISOString() });
    setGen(false); setMsg("");
  };

  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {prod ? (
        <Card glow={prod.storeColor||C.neon} s={{ border:`1px solid ${(prod.storeColor||C.neon)+"40"}` }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <ProductThumb thumb={prod.thumb} store={STORES.find(s=>s.id===prod.storeId)} size={46} />
            <div style={{ flex:1 }}>
              <div style={{ color:C.t1, fontWeight:700, fontSize:13 }}>{prod.productName}</div>
              {prod.price && <div style={{ color:C.neon, fontWeight:700, fontSize:13, marginTop:2 }}>{prod.price}</div>}
            </div>
            <Btn onClick={()=>setSelProd(null)} v="gh" s={{ padding:"6px 12px", fontSize:11 }}>Trocar</Btn>
          </div>
        </Card>
      ) : (
        <Card s={{ border:`1px dashed ${C.b2}` }}>
          <Empty ico="📝" title="Selecione um produto" desc="Adicione um link na aba Links para criar roteiros." action={<Btn onClick={()=>goTo("Links")} s={{ padding:"9px 18px" }}>➜ Links</Btn>} />
        </Card>
      )}

      {prod && (
        <Card glow={C.purple}>
          <div style={{ color:C.t1, fontWeight:700, fontSize:14, marginBottom:4 }}>🤖 Gerador de Roteiro Viral</div>
          <div style={{ color:C.t3, fontSize:11, marginBottom:14 }}>IA cria roteiro com hook, benefícios e CTA pronto para qualquer plataforma</div>
          <Btn full onClick={generate} dis={gen} v="u" s={{ padding:"12px 0" }}>
            {gen ? <div style={{ display:"flex",gap:8,alignItems:"center",justifyContent:"center" }}><Spin size={16} color="#fff"/>{msg}</div> : "🤖 GERAR ROTEIRO VIRAL"}
          </Btn>
        </Card>
      )}

      {scripts.length>0 && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ color:C.t1, fontWeight:700, fontSize:14 }}>📋 Meus Roteiros</div>
            <Chip c={C.purple}>{scripts.length}</Chip>
          </div>
          {scripts.map((s,i)=>(
            <div key={s.id} style={{ paddingBottom:i<scripts.length-1?14:0, marginBottom:i<scripts.length-1?14:0, borderBottom:i<scripts.length-1?`1px solid ${C.b1}`:"none" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div>
                  <div style={{ color:C.t1, fontWeight:600, fontSize:13 }}>{s.productName}</div>
                  <div style={{ color:C.t3, fontSize:10, marginTop:1 }}>{new Date(s.createdAt).toLocaleDateString("pt-BR")}</div>
                </div>
                <button onClick={()=>delScript(s.id)} style={{ background:C.red+"18", border:`1px solid ${C.red}30`, borderRadius:8, padding:"4px 8px", color:C.red, fontSize:11, cursor:"pointer" }}>🗑</button>
              </div>
              <pre style={{ color:C.t2, fontSize:11, lineHeight:1.8, whiteSpace:"pre-wrap", fontFamily:"'Outfit',sans-serif", background:C.s1, borderRadius:10, padding:12, maxHeight:200, overflowY:"auto" }}>{s.text}</pre>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <button onClick={()=>navigator.clipboard?.writeText(s.text)} style={{ flex:1, background:C.s1, border:`1px solid ${C.b1}`, borderRadius:9, padding:"7px 0", color:C.t2, fontSize:11, fontWeight:700, cursor:"pointer" }}>📋 Copiar</button>
                <button onClick={()=>{ const l=links.find(x=>x.productName===s.productName)||links[0]; if(l){setSelProd(l);goTo("Vídeos");} }} style={{ flex:1, background:C.gold+"18", border:`1px solid ${C.gold}35`, borderRadius:9, padding:"7px 0", color:C.gold, fontSize:11, fontWeight:700, cursor:"pointer" }}>🎬 Vídeo</button>
                <button onClick={()=>{ const l=links.find(x=>x.productName===s.productName)||links[0]; if(l){ const msg=`🔥 ${s.productName}\n\n${s.text.slice(0,200)}...\n\n👉 ${l.originalUrl}`; window.open("https://wa.me/?text="+encodeURIComponent(msg),"_blank"); }}} style={{ flex:1, background:C.wa+"18", border:`1px solid ${C.wa}35`, borderRadius:9, padding:"7px 0", color:C.wa, fontSize:11, fontWeight:700, cursor:"pointer" }}>💬 WA</button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// VÍDEOS
// ══════════════════════════════════════════════════════
function Videos({ videos, links, selProd, goTo, addVideo, delVideo }) {
  const [apiKey, setApiKey] = useState(()=>{ try{return localStorage.getItem("j2v_key")||"";}catch{return "";} });
  const [apiSaved, setApiSaved] = useState(()=>{ try{return !!localStorage.getItem("j2v_key");}catch{return false;} });
  const [creating, setCreating] = useState(false); const [prog, setProg] = useState(0); const [msg, setMsg] = useState("");
  const [fmt, setFmt] = useState("reels"); const [watching, setWatching] = useState(null);
  const [viralTab, setViralTab] = useState("criar"); // criar | buscar
  const [viralSearch, setViralSearch] = useState("");
  const [viralResults, setViralResults] = useState([]);
  const [viralLoading, setViralLoading] = useState(false);

  const [captionCopied, setCaptionCopied] = useState(false);

  const prod = selProd||links[0]||null;
  const isVercel = typeof window!=="undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("claudeusercontent");

  const saveKey = () => { if (!apiKey.trim()) return; try{localStorage.setItem("j2v_key",apiKey.trim());}catch{} setApiSaved(true); };

  const createVideo = async () => {
    if (!apiKey.trim()) { setMsg("⚠️ Cole sua API Key e clique Salvar!"); setTimeout(()=>setMsg(""),4000); return; }
    if (!isVercel) { setMsg("⚠️ Criação de vídeo funciona no Vercel. Suba o app!"); setTimeout(()=>setMsg(""),6000); return; }
    setCreating(true); setProg(0);
    const steps=["🎨 Criando cenas...","🖼️ Produto...","✍️ Textos...","🎵 Música...","🗣️ Narração...","📝 Legendas...","🎬 Renderizando..."];
    let p=0; const iv=setInterval(()=>{ p=Math.min(p+12,85); setProg(p); setMsg(steps[Math.min(Math.floor(p/13),steps.length-1)]); },900);
    const dims=fmt==="reels"?{w:1080,h:1920}:fmt==="yt"?{w:1920,h:1080}:{w:1080,h:1080};
    const payload={
      comment:`AfiliadoAI — ${prod?.productName||"Produto"}`, width:dims.w, height:dims.h,
      scenes:[
        { duration:4, elements:[
          {type:"rectangle",x:0,y:0,width:"100%",height:"100%",color:"#04060e"},
          {type:"text",text:"🔥 OFERTA INCRÍVEL!",x:"center",y:"28%",width:"90%",style:{fontSize:58,fontWeight:"bold",color:"#00ddb4",textAlign:"center"}},
          ...(prod?.thumb?[{type:"image",src:prod.thumb,x:"center",y:"60%",width:"65%",height:"30%",fit:"contain"}]:[]),
        ]},
        { duration:8, elements:[
          {type:"rectangle",x:0,y:0,width:"100%",height:"100%",color:"#090f1e"},
          ...(prod?.thumb?[{type:"image",src:prod.thumb,x:"center",y:"22%",width:"72%",height:"36%",fit:"contain"}]:[]),
          {type:"text",text:prod?.productName||"Produto",x:"center",y:"68%",width:"90%",style:{fontSize:34,fontWeight:"bold",color:"#eef2f8",textAlign:"center"}},
          ...(prod?.price?[{type:"text",text:prod.price,x:"center",y:"80%",width:"90%",style:{fontSize:48,fontWeight:"bold",color:"#00ddb4",textAlign:"center"}}]:[]),
        ]},
        { duration:8, elements:[
          {type:"rectangle",x:0,y:0,width:"100%",height:"100%",color:"#04060e"},
          {type:"text",text:"👇 LINK NA BIO",x:"center",y:"35%",width:"90%",style:{fontSize:54,fontWeight:"bold",color:"#00ddb4",textAlign:"center"}},
          {type:"text",text:"Garanta antes de acabar!",x:"center",y:"52%",width:"90%",style:{fontSize:28,color:"#8898b0",textAlign:"center"}},
        ]},
      ],
      voiceover:{text:`${prod?.productName||"Produto"}${prod?.price?", por apenas "+prod.price:""}. Não perca! Link na bio.`,voice:"pt-BR-FranciscaNeural",speed:1.1},
      subtitles:{position:"bottom",style:{fontSize:26,fontWeight:"bold",color:"#fff",background:"rgba(0,0,0,.75)"}},
    };
    try {
      setMsg("📡 Enviando...");
      const res=await fetch("/api/create-video",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiKey:apiKey.trim(),payload})});
      clearInterval(iv);
      if (!res.ok) { const t=await res.text(); setCreating(false); setProg(0); setMsg("❌ Erro: "+t.slice(0,80)); setTimeout(()=>setMsg(""),6000); return; }
      const data=await res.json();
      if (data.error) { setCreating(false); setProg(0); setMsg("❌ "+data.error); setTimeout(()=>setMsg(""),6000); return; }
      if (data.movie) {
        setMsg("⏳ Renderizando... 1-2 min");
        let att=0;
        const poll=setInterval(async()=>{
          att++; if(att>60){clearInterval(poll);setCreating(false);setMsg("⚠️ Tempo excedido. Verifique no painel JSON2Video.");setTimeout(()=>setMsg(""),8000);return;}
          try {
            const cr=await fetch(`/api/check-video?project=${data.movie}&apiKey=${encodeURIComponent(apiKey.trim())}`);
            const st=await cr.json();
            const url=st.movie?.url||st.url; const status=st.movie?.status||st.status;
            if ((status==="done"||status==="ready")&&url) {
              clearInterval(poll); setProg(100); setMsg("✅ Vídeo pronto!");
              setTimeout(()=>{ addVideo({id:Date.now().toString(),title:prod?.productName||"Vídeo",thumb:prod?.thumb||null,videoUrl:url,fmt,createdAt:new Date().toISOString()}); setCreating(false); setProg(0); setMsg(""); },800);
            } else if (status==="error"||status==="failed") { clearInterval(poll); setCreating(false); setProg(0); setMsg("❌ Erro na renderização."); setTimeout(()=>setMsg(""),5000); }
            else { setProg(Math.min(85+att,98)); setMsg("🎬 Renderizando "+Math.min(85+att,98)+"%"); }
          } catch {}
        },3000);
      }
    } catch(e) { clearInterval(iv); setCreating(false); setProg(0); setMsg("❌ "+e.message); setTimeout(()=>setMsg(""),6000); }
  };

  const dl = (v) => { if(!v.videoUrl) return; const a=document.createElement("a"); a.href=v.videoUrl; a.download=`${v.title||"video"}.mp4`; a.target="_blank"; a.click(); };

  // Buscar vídeos virais relacionados ao produto
  const searchViralVideos = async () => {
    if (!viralSearch.trim() && !prod) return;
    setViralLoading(true); setViralResults([]); 
    const query = viralSearch.trim() || prod?.productName || "produto viral";
    // Use YouTube search API via public endpoint (no key needed for basic search)
    // We search multiple sources and return structured results
    const searches = [
      { platform:"TikTok",    icon:"🎵", color:"#FF0050", searchUrl:`https://www.tiktok.com/search?q=${encodeURIComponent(query)}`, embedBase:"https://www.tiktok.com" },
      { platform:"YouTube",   icon:"▶️",  color:"#FF0000", searchUrl:`https://www.youtube.com/results?search_query=${encodeURIComponent(query+" afiliado oferta")}`, embedBase:"https://www.youtube.com" },
      { platform:"Instagram", icon:"📸", color:"#E91E8C", searchUrl:`https://www.instagram.com/explore/tags/${encodeURIComponent(query.replace(/ /g,""))}`, embedBase:"https://www.instagram.com" },
    ];
    // Generate ready-to-use caption for each platform
    const link = prod?.originalUrl || "https://meli.la/17XoYuZ";
    const name = prod?.productName || query;
    const price = prod?.price || "";
    const captions = {
      tiktok:    `🔥 ${name}${price?" por "+price:""}\n\n👉 Link na bio!\n\n#viral #afiliado #oferta #compras #${query.split(" ")[0].toLowerCase()}`,
      youtube:   `${name}${price?" — "+price:""}\n\nLink do produto: ${link}\n\n✅ Link de afiliado — ganho comissão se você comprar pelo link.\n\n#oferta #afiliado`,
      instagram: `✨ ${name}${price?" por "+price:""}\n\n👉 Link na bio!\n\n#publi #reels #viral #oferta`,
    };
    // Simulate loading (real implementation needs backend scraping)
    await new Promise(r => setTimeout(r, 1500));
    setViralResults(searches.map(s => ({
      ...s,
      caption: captions[s.platform.toLowerCase()] || `${name}\n${link}`,
      query,
    })));
    setViralLoading(false);
  };

  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {watching && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.97)",zIndex:300,display:"flex",flexDirection:"column" }}>
          <div style={{ display:"flex",justifyContent:"space-between",padding:"16px 20px" }}>
            <div style={{ color:C.t1,fontWeight:700,fontSize:14 }}>{watching.title}</div>
            <button onClick={()=>setWatching(null)} style={{ background:C.s2,border:"none",borderRadius:99,width:34,height:34,color:C.t1,cursor:"pointer",fontSize:18 }}>✕</button>
          </div>
          <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
            {watching.videoUrl?<video src={watching.videoUrl} controls autoPlay playsInline style={{ maxWidth:"100%",maxHeight:"75vh",borderRadius:14 }}/>:<Empty ico="🎬" title="Vídeo indisponível" desc=""/>}
          </div>
          <div style={{ padding:"12px 20px 28px" }}><Btn full onClick={()=>dl(watching)} v="g" s={{ padding:"13px 0",fontSize:14 }}>📥 Baixar Vídeo</Btn></div>
        </div>
      )}

      {prod ? (
        <Card glow={prod.storeColor||C.neon} s={{ border:`1px solid ${(prod.storeColor||C.neon)+"40"}` }}>
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <ProductThumb thumb={prod.thumb} store={STORES.find(s=>s.id===prod.storeId)} size={46} />
            <div style={{ flex:1 }}>
              <div style={{ color:C.t1,fontWeight:700,fontSize:13 }}>{prod.productName}</div>
              {prod.price&&<div style={{ color:C.neon,fontWeight:700,fontSize:13,marginTop:2 }}>{prod.price}</div>}
            </div>
          </div>
        </Card>
      ) : (
        <Card s={{ border:`1px dashed ${C.b2}` }}>
          <Empty ico="🎬" title="Selecione um produto" desc="Adicione um link para criar vídeos." action={<Btn onClick={()=>goTo("Links")} s={{ padding:"9px 18px" }}>➜ Links</Btn>} />
        </Card>
      )}

      {prod && (
        <>
        {/* TABS */}
        <div style={{ display:"flex", background:C.s1, border:`1px solid ${C.b1}`, borderRadius:14, padding:4, gap:4 }}>
          <button onClick={()=>setViralTab("criar")} style={{ flex:1, padding:"9px 0", borderRadius:11, border:"none", background:viralTab==="criar"?`linear-gradient(135deg,${C.neon},${C.blue})`:"transparent", color:viralTab==="criar"?"#000":C.t3, fontWeight:700, fontSize:12, cursor:"pointer" }}>🎬 Criar Vídeo</button>
          <button onClick={()=>setViralTab("buscar")} style={{ flex:1, padding:"9px 0", borderRadius:11, border:"none", background:viralTab==="buscar"?`linear-gradient(135deg,${C.purple},${C.blue})`:"transparent", color:viralTab==="buscar"?"#fff":C.t3, fontWeight:700, fontSize:12, cursor:"pointer" }}>🔍 Viral + Link</button>
        </div>

        {/* BUSCAR VÍDEO VIRAL */}
        {viralTab==="buscar" && (
        <Card glow={C.purple}>
          <div style={{ display:"flex", gap:10, marginBottom:14 }}>
            <div style={{ width:44,height:44,borderRadius:12,background:`linear-gradient(135deg,${C.purple}25,${C.blue}15)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>🔍</div>
            <div>
              <div style={{ color:C.t1, fontWeight:700, fontSize:15 }}>Vídeo Viral + Meu Link</div>
              <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>Busca vídeos virais e gera legenda com seu link de afiliado</div>
            </div>
          </div>
          <div style={{ position:"relative", marginBottom:10 }}>
            <input placeholder={`Buscar por: ${prod?.productName||"produto"}...`} value={viralSearch} onChange={e=>setViralSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchViralVideos()}
              style={{ width:"100%",background:C.s1,border:`1px solid ${viralSearch?C.purple+"55":C.b1}`,borderRadius:11,padding:"11px 40px 11px 13px",color:C.t1,fontSize:13,outline:"none",boxSizing:"border-box" }} />
            {viralSearch&&<button onClick={()=>setViralSearch("")} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:C.t3,cursor:"pointer",fontSize:16 }}>✕</button>}
          </div>
          <Btn full onClick={searchViralVideos} dis={viralLoading} v="u" s={{ marginBottom:14 }}>
            {viralLoading?<div style={{ display:"flex",gap:8,alignItems:"center",justifyContent:"center" }}><Spin size={16} color="#fff"/>Buscando...</div>:"🔍 BUSCAR VÍDEOS VIRAIS"}
          </Btn>
          {viralResults.length===0&&!viralLoading&&(
            <div style={{ background:C.purple+"08",border:`1px solid ${C.purple}20`,borderRadius:12,padding:12 }}>
              <div style={{ color:C.purple,fontWeight:700,fontSize:12,marginBottom:8 }}>💡 Como funciona:</div>
              <div style={{ color:C.t3,fontSize:11,lineHeight:1.8 }}>
                1. Clique em <strong style={{ color:C.t1 }}>Buscar Vídeos Virais</strong><br/>
                2. Abre TikTok, YouTube e Instagram com o produto<br/>
                3. Encontre um vídeo viral de inspiração<br/>
                4. <strong style={{ color:C.neon }}>Copie a legenda pronta</strong> com seu link incluído<br/>
                5. Grave seu vídeo no estilo do viral e poste!
              </div>
              <div style={{ marginTop:8,background:C.red+"10",border:`1px solid ${C.red}25`,borderRadius:8,padding:"8px 10px" }}>
                <div style={{ color:C.red,fontSize:10,fontWeight:700 }}>⚠️ Não reposte vídeos de outros. Use só como inspiração.</div>
              </div>
            </div>
          )}
          {viralResults.length>0&&(
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {viralResults.map((r,i)=>(
                <div key={i} style={{ background:C.s1,border:`1px solid ${C.b1}`,borderRadius:14,overflow:"hidden" }}>
                  <div style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex",gap:10,alignItems:"center",marginBottom:10 }}>
                      <div style={{ width:36,height:36,borderRadius:10,background:r.color+"20",border:`1px solid ${r.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{r.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ color:C.t1,fontWeight:700,fontSize:13 }}>{r.platform}</div>
                        <div style={{ color:C.t3,fontSize:10 }}>Vídeos virais de "{r.query}"</div>
                      </div>
                      <button onClick={()=>window.open(r.searchUrl,"_blank")} style={{ background:r.color+"20",border:`1px solid ${r.color}40`,borderRadius:10,padding:"7px 14px",color:r.color,fontWeight:700,fontSize:11,cursor:"pointer" }}>🔍 Abrir</button>
                    </div>
                    <div style={{ background:C.card,borderRadius:10,padding:"10px 12px" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                        <div style={{ color:r.color,fontSize:10,fontWeight:700 }}>📋 LEGENDA COM SEU LINK:</div>
                        <button onClick={()=>{ navigator.clipboard?.writeText(r.caption); setCaptionCopied(i); setTimeout(()=>setCaptionCopied(null),2000); }}
                          style={{ background:captionCopied===i?C.neon+"20":C.s1,border:`1px solid ${captionCopied===i?C.neon+"50":C.b1}`,borderRadius:8,padding:"4px 10px",color:captionCopied===i?C.neon:C.t2,fontWeight:700,fontSize:10,cursor:"pointer" }}>
                          {captionCopied===i?"✅ Copiado!":"📋 Copiar"}
                        </button>
                      </div>
                      <pre style={{ color:C.t2,fontSize:11,lineHeight:1.7,whiteSpace:"pre-wrap",fontFamily:"'Outfit',sans-serif" }}>{r.caption}</pre>
                    </div>
                    {prod?.originalUrl&&(
                      <div style={{ marginTop:8,display:"flex",gap:6,alignItems:"center",background:C.neon+"08",border:`1px solid ${C.neon}20`,borderRadius:8,padding:"6px 10px" }}>
                        <span style={{ fontSize:12 }}>🔗</span>
                        <span style={{ color:C.neon,fontSize:11,fontFamily:"'JetBrains Mono',monospace",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{prod.originalUrl}</span>
                        <button onClick={()=>navigator.clipboard?.writeText(prod.originalUrl)} style={{ background:"none",border:"none",color:C.t3,cursor:"pointer",fontSize:12 }}>📋</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ background:C.gold+"10",border:`1px solid ${C.gold}25`,borderRadius:12,padding:12 }}>
                <div style={{ color:C.gold,fontWeight:700,fontSize:12,marginBottom:6 }}>🎬 Processo:</div>
                <div style={{ color:C.t3,fontSize:11,lineHeight:1.9 }}>
                  <strong style={{ color:C.t1 }}>1.</strong> Abra uma plataforma e encontre um vídeo viral<br/>
                  <strong style={{ color:C.t1 }}>2.</strong> Copie a legenda pronta ↑ com seu link<br/>
                  <strong style={{ color:C.t1 }}>3.</strong> Grave seu vídeo inspirado no viral<br/>
                  <strong style={{ color:C.t1 }}>4.</strong> Poste com a legenda — link de afiliado já está! ✅
                </div>
              </div>
            </div>
          )}
        </Card>
        )}

        {/* CRIAR VÍDEO */}
        {viralTab==="criar" && (
        <Card glow={C.purple}>
          <div style={{ color:C.t1,fontWeight:700,fontSize:14,marginBottom:4 }}>🎬 Criar Vídeo</div>
          <div style={{ color:C.t3,fontSize:11,marginBottom:14 }}>
            Grátis · <a href="https://json2video.com/get-api-key/" target="_blank" rel="noreferrer" style={{ color:C.neon }}>Pegar API Key gratuita →</a>
          </div>
          <div style={{ display:"flex",gap:6,marginBottom:14 }}>
            {[["reels","📱 Reels"],["yt","▶️ YouTube"],["sq","⬜ Feed"]].map(([id,lb])=>(
              <button key={id} onClick={()=>setFmt(id)} style={{ flex:1,background:fmt===id?`linear-gradient(135deg,${C.purple}25,${C.blue}18)`:C.s1,border:`1px solid ${fmt===id?C.purple+"60":C.b1}`,borderRadius:10,padding:"8px 4px",color:fmt===id?C.purple:C.t3,fontWeight:700,fontSize:11,cursor:"pointer" }}>{lb}</button>
            ))}
          </div>
          <div style={{ display:"flex",gap:8,marginBottom:6 }}>
            <input placeholder="Cole sua API Key JSON2Video..." value={apiKey} onChange={e=>{setApiKey(e.target.value);setApiSaved(false);}}
              style={{ flex:1,background:C.s1,border:`1px solid ${apiSaved?C.neon+"55":C.b1}`,borderRadius:11,padding:"10px 12px",color:C.t1,fontSize:12,outline:"none",fontFamily:"'JetBrains Mono',monospace" }}/>
            <button onClick={saveKey} style={{ background:apiSaved?C.neon+"20":`linear-gradient(135deg,${C.neon},${C.blue})`,border:apiSaved?`1px solid ${C.neon}40`:"none",borderRadius:11,padding:"0 14px",color:apiSaved?C.neon:"#000",fontWeight:800,fontSize:12,cursor:"pointer",flexShrink:0 }}>
              {apiSaved?"✅":"💾 Salvar"}
            </button>
          </div>
          {apiSaved&&<div style={{ color:C.neon,fontSize:10,marginBottom:10 }}>✅ API Key salva!</div>}
          {!isVercel&&<div style={{ color:C.gold,fontSize:11,marginBottom:10,padding:"7px 10px",background:C.gold+"12",borderRadius:8 }}>⚠️ Funciona apenas no Vercel</div>}
          {msg&&!creating&&<div style={{ color:msg.startsWith("❌")?C.red:msg.startsWith("⚠️")?C.gold:C.neon,fontSize:12,marginBottom:10,padding:"8px 10px",background:(msg.startsWith("❌")?C.red:C.gold)+"12",borderRadius:8 }}>{msg}</div>}
          {creating?(
            <div style={{ textAlign:"center",padding:"20px 0" }}>
              <Spin size={40} color={C.purple}/>
              <div style={{ color:C.purple,fontSize:13,fontWeight:700,marginTop:10 }}>{msg}</div>
              <div style={{ background:C.s1,borderRadius:99,height:6,overflow:"hidden",marginTop:12 }}>
                <div style={{ width:`${prog}%`,height:"100%",background:`linear-gradient(90deg,${C.purple},${C.blue})`,borderRadius:99,transition:"width .5s ease" }}/>
              </div>
              <div style={{ color:C.t3,fontSize:11,marginTop:6 }}>{prog}%</div>
            </div>
          ):(
            <Btn full onClick={createVideo} v="u" s={{ padding:"12px 0" }}>🎬 CRIAR VÍDEO AGORA</Btn>
          )}
        </Card>
        )}
        </>
      )}

      <Card>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div style={{ color:C.t1,fontWeight:700,fontSize:14 }}>📺 Meus Vídeos</div>
          <Chip c={C.orange}>{videos.length}</Chip>
        </div>
        {videos.length===0?(
          <Empty ico="🎬" title="Nenhum vídeo ainda" desc="Crie seu primeiro vídeo viral acima."/>
        ):(
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {videos.map(v=>(
              <div key={v.id} style={{ background:C.s1,borderRadius:14,overflow:"hidden",border:`1px solid ${C.b1}` }}>
                <div style={{ height:88,background:`linear-gradient(135deg,${C.s2},${C.b1})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",cursor:"pointer" }} onClick={()=>setWatching(v)}>
                  {v.thumb?<img src={`https://wsrv.nl/?url=${encodeURIComponent(v.thumb)}&w=300&h=100&fit=cover`} alt="" style={{ height:"100%",width:"100%",objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>:<span style={{ fontSize:36,opacity:.3 }}>🎬</span>}
                  <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:38,height:38,borderRadius:"50%",background:"rgba(0,0,0,.65)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>▶️</div>
                  <Chip c={C.orange} s={{ position:"absolute",top:8,right:8 }}>{v.fmt==="reels"?"Reels":v.fmt==="yt"?"YouTube":"Feed"}</Chip>
                </div>
                <div style={{ padding:"10px 12px" }}>
                  <div style={{ color:C.t1,fontWeight:700,fontSize:13,marginBottom:4 }}>{v.title}</div>
                  <div style={{ color:C.t3,fontSize:10,marginBottom:8 }}>{new Date(v.createdAt).toLocaleDateString("pt-BR")}</div>
                  <div style={{ display:"flex",gap:8 }}>
                    <button onClick={()=>setWatching(v)} style={{ flex:1,background:C.blue+"18",border:`1px solid ${C.blue}35`,borderRadius:10,padding:"8px 0",color:C.blue,fontWeight:700,fontSize:12,cursor:"pointer" }}>▶️ Ver</button>
                    <button onClick={()=>dl(v)} style={{ flex:2,background:`linear-gradient(135deg,${C.gold}20,${C.orange}20)`,border:`1px solid ${C.gold}35`,borderRadius:10,padding:"8px 0",color:C.gold,fontWeight:700,fontSize:12,cursor:"pointer" }}>📥 Baixar</button>
                    <button onClick={()=>delVideo(v.id)} style={{ background:C.red+"18",border:`1px solid ${C.red}30`,borderRadius:10,padding:"8px 10px",color:C.red,fontWeight:700,fontSize:12,cursor:"pointer" }}>🗑</button>
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

// ══════════════════════════════════════════════════════
// CONTAS — plataformas sociais
// ══════════════════════════════════════════════════════
function Contas({ accs, setAccs, bestTimes, setBestTimes }) {
  const [exp, setExp] = useState(null); const [inp, setInp] = useState({});

  const save = (id) => { if (!inp[id]?.trim()) return; setAccs({...accs,[id]:inp[id].trim()}); setExp(null); };
  const rem = (id) => { const n={...accs}; delete n[id]; setAccs(n); };
  const cnt = Object.keys(accs).length;

  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {cnt>0 && (
        <Card glow={C.neon} s={{ background:`linear-gradient(135deg,${C.neon}08,${C.blue}06)`, border:`1px solid ${C.neon}25` }}>
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <div style={{ fontSize:28 }}>✅</div>
            <div>
              <div style={{ color:C.neon,fontWeight:700,fontSize:14 }}>{cnt} conta{cnt>1?"s":""} conectada{cnt>1?"s":""}</div>
              <div style={{ color:C.t3,fontSize:11,marginTop:2 }}>Salvas no dispositivo</div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div style={{ color:C.t1,fontWeight:700,fontSize:14,marginBottom:12 }}>⏰ Melhores Horários</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
          {PLATFORMS.filter(p=>bestTimes[p.id]!==undefined).map(p=>(
            <div key={p.id} style={{ background:C.s1,borderRadius:10,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontSize:14 }}>{p.icon}</span>
              <input type="time" value={bestTimes[p.id]||"20:00"} onChange={e=>setBestTimes({...bestTimes,[p.id]:e.target.value})}
                style={{ background:"none",border:"none",color:C.neon,fontSize:13,fontWeight:700,outline:"none",width:60,textAlign:"right" }}/>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ color:C.t1,fontWeight:700,fontSize:14,marginBottom:14 }}>📱 Minhas Contas</div>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {PLATFORMS.map(p=>{
            const con=accs[p.id]; const open=exp===p.id;
            return (
              <div key={p.id} style={{ background:C.s1,border:`1px solid ${con?p.color+"40":C.b1}`,borderRadius:14,overflow:"hidden",transition:"border-color .2s" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 12px",cursor:"pointer" }} onClick={()=>setExp(open?null:p.id)}>
                  <div style={{ width:36,height:36,borderRadius:10,background:p.color+"20",border:`1px solid ${p.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{p.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ color:C.t1,fontWeight:700,fontSize:13 }}>{p.name}</div>
                    {con?<div style={{ color:p.color,fontSize:11,marginTop:1 }}>✅ {con}</div>:<div style={{ color:C.t3,fontSize:11,marginTop:1 }}>Toque para conectar</div>}
                  </div>
                  <div style={{ color:C.t2,fontSize:16 }}>{open?"↑":"↓"}</div>
                </div>
                {open && (
                  <div style={{ padding:"0 12px 12px",borderTop:`1px solid ${C.b1}` }}>
                    <div style={{ color:C.t3,fontSize:10,margin:"8px 0 6px" }}>⚠️ {p.rule}</div>
                    <input placeholder={`@sua_conta_${p.name.toLowerCase()}`} value={inp[p.id]||""} onChange={e=>setInp(i=>({...i,[p.id]:e.target.value}))}
                      style={{ width:"100%",background:C.card,border:`1px solid ${p.color}40`,borderRadius:10,padding:"9px 12px",color:C.t1,fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:8 }}/>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={()=>save(p.id)} style={{ flex:1,background:`linear-gradient(135deg,${p.color},${p.color}99)`,border:"none",borderRadius:10,padding:9,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer" }}>✅ Salvar</button>
                      <button onClick={()=>window.open(p.url,"_blank")} style={{ flex:1,background:C.s1,border:`1px solid ${C.b2}`,borderRadius:10,padding:9,color:C.t2,fontWeight:700,fontSize:12,cursor:"pointer" }}>🌐 Abrir</button>
                      {con&&<button onClick={()=>rem(p.id)} style={{ background:C.red+"20",border:`1px solid ${C.red}30`,borderRadius:10,padding:"9px 12px",color:C.red,fontWeight:700,fontSize:12,cursor:"pointer" }}>🗑</button>}
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

// ══════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════
function Config({ settings, setSetts, customStores, setCustomStores, connectedStores, setConnectedStores, mlTokens, setMlTokens, onLogout }) {
  const [addStore, setAddStore] = useState(false);
  const [sf, setSf] = useState({ name:"", comm:"", ico:"🛒", color:C.neon });
  const ICONS=["🛒","📦","🛍️","👗","🏷️","🌿","💄","🍫","🏪","💅","👠","🎁","🧴","📱","💻","🎮","🍕","☕","🌺","💍"];
  const COLORS=[C.neon,C.gold,C.purple,C.red,C.orange,C.blue,"#E91E8C","#00A86B","#FF5722","#1877F2"];
  const allStores=[...STORES,...customStores];

  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <Card>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div style={{ color:C.t1,fontWeight:700,fontSize:14 }}>🏪 Lojas Afiliadas</div>
          <button onClick={()=>setAddStore(s=>!s)} style={{ background:addStore?C.s1:`linear-gradient(135deg,${C.neon},${C.blue})`,border:addStore?`1px solid ${C.b2}`:"none",borderRadius:99,padding:"6px 14px",color:addStore?C.t2:"#000",fontWeight:700,fontSize:12,cursor:"pointer" }}>{addStore?"✕ Fechar":"+ Nova"}</button>
        </div>
        {addStore && (
          <div style={{ background:C.s1,borderRadius:12,padding:14,marginBottom:14,border:`1px solid ${sf.color+"40"}` }}>
            <div style={{ display:"flex",gap:8,marginBottom:10,alignItems:"center" }}>
              <div style={{ width:40,height:40,borderRadius:10,background:sf.color+"20",border:`1px solid ${sf.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{sf.ico}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>{COLORS.map(c=><div key={c} onClick={()=>setSf(f=>({...f,color:c}))} style={{ width:20,height:20,borderRadius:99,background:c,cursor:"pointer",border:sf.color===c?"2px solid #fff":"2px solid transparent" }}/>)}</div>
              </div>
            </div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:10 }}>{ICONS.map(ic=><div key={ic} onClick={()=>setSf(f=>({...f,ico:ic}))} style={{ width:30,height:30,borderRadius:7,background:sf.ico===ic?sf.color+"25":C.card,border:`1px solid ${sf.ico===ic?sf.color:C.b1}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer" }}>{ic}</div>)}</div>
            <Inp label="Nome *" ph="Ex: Magazine Luiza..." val={sf.name} set={v=>setSf(f=>({...f,name:v}))}/>
            <Inp label="Comissão %" ph="Ex: 12" val={sf.comm} set={v=>setSf(f=>({...f,comm:v}))}/>
            <Btn full onClick={()=>{ if(!sf.name.trim())return; setCustomStores([...customStores,{id:"c_"+Date.now(),name:sf.name,icon:sf.ico,color:sf.color,commission:parseFloat(sf.comm)/100||0.10,custom:true,favicon:null}]); setSf({name:"",comm:"",ico:"🛒",color:C.neon}); setAddStore(false); }}>✅ Adicionar</Btn>
          </div>
        )}
        {allStores.map((s,i)=>(
          <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<allStores.length-1?`1px solid ${C.b1}`:"none" }}>
            <StoreLogo store={s} size={34}/>
            <div style={{ flex:1 }}>
              <div style={{ color:C.t1,fontWeight:600,fontSize:13 }}>{s.name}</div>
              <div style={{ color:s.color,fontSize:11,marginTop:1 }}>💰 {((s.commission||0)*100).toFixed(0)}% comissão</div>
            </div>
            <div style={{ display:"flex",gap:6 }}>
              <button onClick={()=>setConnectedStores(c=>({...c,[s.id]:!c[s.id]}))} style={{ background:connectedStores[s.id]?`linear-gradient(135deg,${C.neon},${C.blue})`:C.s1,border:connectedStores[s.id]?"none":`1px solid ${C.b2}`,borderRadius:8,padding:"5px 12px",color:connectedStores[s.id]?"#000":C.t3,fontWeight:700,fontSize:11,cursor:"pointer" }}>
                {connectedStores[s.id]?"✅ Ativa":"Conectar"}
              </button>
              {s.custom&&<button onClick={()=>setCustomStores(customStores.filter(c=>c.id!==s.id))} style={{ background:C.red+"18",border:`1px solid ${C.red}30`,borderRadius:8,padding:"5px 8px",color:C.red,fontSize:11,cursor:"pointer" }}>🗑</button>}
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ color:C.t1,fontWeight:700,fontSize:14,marginBottom:14 }}>⚙️ Preferências</div>
        {[{k:"notif",l:"🔔 Notificações",d:"Alertas de atividade"},{k:"ai",l:"🤖 IA Ativa",d:"Análise inteligente"}].map(item=>(
          <div key={item.k} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.b1}` }}>
            <div>
              <div style={{ color:C.t1,fontSize:13,fontWeight:600 }}>{item.l}</div>
              <div style={{ color:C.t3,fontSize:11,marginTop:2 }}>{item.d}</div>
            </div>
            <Tog val={settings[item.k]} set={v=>setSetts({...settings,[item.k]:v})}/>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ color:C.t1,fontWeight:700,fontSize:13,marginBottom:10 }}>🔑 APIs</div>
        <div style={{ color:C.t3,fontSize:11,lineHeight:1.7 }}>
          <div style={{ marginBottom:6 }}>• <strong style={{ color:C.t2 }}>JSON2Video:</strong> Cole na aba Vídeos · <a href="https://json2video.com/get-api-key/" target="_blank" rel="noreferrer" style={{ color:C.neon }}>Pegar grátis →</a></div>
          <div>• <strong style={{ color:"#9b72f7" }}>IA (ARIA):</strong> Configure ANTHROPIC_API_KEY no Vercel</div>
        </div>

        {/* ML OAuth Connect */}
        <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.b1}` }}>
          <div style={{ color:C.t1, fontWeight:700, fontSize:13, marginBottom:8 }}>🛒 Mercado Livre — Token Automático</div>
          {mlTokens && mlTokens.access_token ? (
            <div>
              <div style={{ background:"#FFE60012", border:"1px solid #FFE60030", borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
                <div style={{ color:"#FFE600", fontWeight:700, fontSize:12 }}>✅ Conta ML conectada!</div>
                {mlTokens.user_id && <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>User ID: {mlTokens.user_id}</div>}
                <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>
                  {mlTokenExpired(mlTokens) ? "⚠️ Token expirado — renovando..." : "✅ Token válido · Renovação automática ativa"}
                </div>
              </div>
              <button onClick={()=>setMlTokens(null)} style={{ background:C.red+"18", border:`1px solid ${C.red}30`, borderRadius:10, padding:"7px 14px", color:C.red, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                🔌 Desconectar
              </button>
            </div>
          ) : (
            <div>
              <div style={{ color:C.t3, fontSize:11, lineHeight:1.7, marginBottom:10 }}>
                Conecte sua conta ML para buscar preços reais. O token renova automaticamente a cada 6 horas — sem precisar refazer.
              </div>
              <div style={{ background:C.gold+"10", border:`1px solid ${C.gold}25`, borderRadius:10, padding:"9px 12px", marginBottom:10 }}>
                <div style={{ color:C.gold, fontSize:11, fontWeight:700, marginBottom:4 }}>⚙️ Configure no Vercel:</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.t3, lineHeight:2 }}>
                  ML_CLIENT_ID = seu_client_id<br/>
                  ML_CLIENT_SECRET = seu_client_secret<br/>
                  ML_REDIRECT_URI = https://seu-app.vercel.app
                </div>
                <a href="https://developers.mercadolivre.com.br" target="_blank" rel="noreferrer" style={{ color:C.neon, fontSize:11, display:"inline-block", marginTop:6 }}>Criar app ML Developers →</a>
              </div>
              <button onClick={()=>{
                try {
                  const redirectUri = encodeURIComponent(window.location.origin);
                  window.open("https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=SEU_CLIENT_ID&redirect_uri=" + redirectUri, "_blank");
                } catch(e) {}
              }} style={{ background:"linear-gradient(135deg,#FFE600,#FF9900)", border:"none", borderRadius:10, padding:"10px 20px", color:"#000", fontWeight:800, fontSize:13, cursor:"pointer", width:"100%" }}>
                🛒 Conectar Mercado Livre
              </button>
            </div>
          )}
        </div>
      </Card>

      <Btn full onClick={onLogout} v="r" s={{ padding:"13px 0" }}>🚪 Sair da Conta</Btn>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════
const TABS = [
  { id:"Dashboard", ico:"⚡", lbl:"Início" },
  { id:"Links",     ico:"🔗", lbl:"Links" },
  { id:"Mensagens", ico:"💬", lbl:"Mensagens" },
  { id:"Roteiros",  ico:"📝", lbl:"Roteiros" },
  { id:"Vídeos",    ico:"🎬", lbl:"Vídeos" },
  { id:"Fila",      ico:"📋", lbl:"Fila" },
  { id:"IA",        ico:"🤖", lbl:"IA" },
  { id:"Contas",    ico:"📱", lbl:"Contas" },
];



// ══════════════════════════════════════════════════════
// IA MANAGER — ARIA · Claude Sonnet 4
// ══════════════════════════════════════════════════════
function renderMD(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g,'<strong style="color:#eef2f8;font-weight:700">$1</strong>')
    .replace(/^#{1,3} (.+)$/gm,'<div style="color:#9b72f7;font-weight:800;font-size:14px;margin:12px 0 5px;padding-bottom:4px;border-bottom:1px solid #1a2540">$1</div>')
    .replace(/^[-*] (.+)$/gm,'<div style="display:flex;gap:7px;margin:3px 0;align-items:flex-start"><span style="color:#00ddb4;flex-shrink:0;margin-top:2px">▸</span><span>$1</span></div>')
    .replace(/^(\d+)\. (.+)$/gm,'<div style="display:flex;gap:7px;margin:3px 0"><span style="color:#9b72f7;font-weight:700;flex-shrink:0">$1.</span><span>$2</span></div>')
    .replace(/`(.+?)`/g,'<code style="background:#1a2540;color:#00ddb4;padding:1px 6px;border-radius:4px;font-family:monospace;font-size:11px">$1</code>');
}

function AIResponse({ text }) {
  return (
    <div style={{ color:C.t2, fontSize:12, lineHeight:1.9 }}
      dangerouslySetInnerHTML={{ __html: renderMD(text) }} />
  );
}

function AIManager({ stats, links, videos, scripts, queue, connectedAccounts }) {
  const [tab, setTab] = useState("chat");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [messages, setMessages] = useState([{
    role:"ai",
    text:"Olá! Sou a **ARIA** — sua gestora de IA powered by Claude Sonnet.\n\nPosso:\n- Auditar seu app completo e encontrar onde você perde dinheiro\n- Analisar qualquer oferta e dar nota de potencial (0-10)\n- Criar plano de conteúdo de 7 dias personalizado\n- Otimizar textos para cada plataforma\n- Diagnosticar qualquer problema do seu negócio\n\nComo posso te ajudar hoje?"
  }]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [selLinkId, setSelLinkId] = useState("");
  const [selPlatform, setSelPlatform] = useState("instagram");

  const isVercel = typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("claudeusercontent");

  const LOADING_MSGS = {
    full_audit: ["🔍 Auditando seus dados...", "📊 Calculando métricas...", "🎯 Identificando oportunidades...", "📝 Escrevendo diagnóstico..."],
    analyze_offer: ["🔍 Pesquisando o produto...", "📈 Analisando potencial de mercado...", "🎯 Calculando score...", "✍️ Preparando estratégia..."],
    dashboard_insights: ["📊 Lendo seus dados...", "🧠 Processando padrões...", "💡 Gerando insights..."],
    generate_content_plan: ["📅 Analisando seus produtos...", "🗓️ Montando calendário...", "✍️ Criando plano de 7 dias..."],
    optimize_text: ["✨ Analisando texto...", "🎯 Otimizando para conversão...", "📝 Criando variações..."],
    diagnose: ["🔍 Analisando problema...", "🧠 Identificando causa raiz...", "💊 Prescrevendo solução..."],
    chat: ["🤔 Pensando...", "🧠 Analisando...", "✍️ Respondendo..."],
  };

  const callAI = async (mode, data) => {
    if (!isVercel) return "⚠️ A ARIA funciona apenas no **Vercel**. Configure `ANTHROPIC_API_KEY` nas variáveis de ambiente do Vercel e faça o deploy.";
    try {
      const msgs = LOADING_MSGS[mode] || LOADING_MSGS.chat;
      let mi = 0;
      setLoadingMsg(msgs[0]);
      const iv = setInterval(() => { mi = (mi+1) % msgs.length; setLoadingMsg(msgs[mi]); }, 1800);
      const res = await fetch("/api/ai-manager", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ mode, data })
      });
      clearInterval(iv); setLoadingMsg("");
      const json = await res.json();
      if (json.error) return "❌ " + json.error;
      return json.response;
    } catch(e) { return "❌ Erro: " + e.message; }
  };

  const sendChat = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setInput("");
    setMessages(m => [...m, { role:"user", text:msg }]);
    setLoading(true);
    const resp = await callAI("chat", { message:msg, context:{ links:links.length, cliques:stats.cliques, comissao:stats.comissao, vendas:stats.vendas } });
    setMessages(m => [...m, { role:"ai", text:resp }]);
    setLoading(false);
  };

  const runAudit = async () => {
    setResult({ loading:true, type:"audit" });
    const resp = await callAI("full_audit", { stats, links, videos, scripts, queue, connectedAccounts });
    setResult({ loading:false, type:"audit", text:resp });
  };

  const analyzeOffer = async () => {
    const link = links.find(l=>l.id===selLinkId)||links[0];
    if (!link) return;
    setResult({ loading:true, type:"offer", link });
    const resp = await callAI("analyze_offer", link);
    setResult({ loading:false, type:"offer", link, text:resp });
  };

  const getInsights = async () => {
    setResult({ loading:true, type:"insights" });
    const resp = await callAI("dashboard_insights", { stats, links, videos, queue, scripts });
    setResult({ loading:false, type:"insights", text:resp });
  };

  const genPlan = async () => {
    setResult({ loading:true, type:"plan" });
    const resp = await callAI("generate_content_plan", { links, platforms:PLATFORMS.map(p=>p.name) });
    setResult({ loading:false, type:"plan", text:resp });
  };

  const optimizeText = async () => {
    const link = links.find(l=>l.id===selLinkId)||links[0];
    if (!link) return;
    setResult({ loading:true, type:"optimize" });
    const tplTexts = {
      tiktok: `🔥 ${link.productName}\n#viral #afiliado #oferta`,
      instagram: `✨ ${link.productName}${link.price?" por "+link.price:""}\n#publi #reels`,
      youtube: `${link.productName} — Vale a pena? REVIEW\nLink: ${link.originalUrl}`,
      twitter: `🔥 ${link.productName}${link.price?" "+link.price:""} ${link.originalUrl} #oferta`,
      facebook: `🔥 ${link.productName}${link.price?" por "+link.price:""}`,
      kwai: `${link.productName}${link.price?" "+link.price:""} #viral`,
      telegram: `*${link.productName}*${link.price?"\n💲 "+link.price:""}\n\n${link.originalUrl}`,
    };
    const resp = await callAI("optimize_text", { platform:selPlatform, productName:link.productName, price:link.price, text:tplTexts[selPlatform]||link.productName });
    setResult({ loading:false, type:"optimize", text:resp });
  };

  const ResultBox = ({ r }) => (
    <div style={{ background:C.s1, borderRadius:14, overflow:"hidden", border:`1px solid ${C.purple}30` }}>
      <div style={{ display:"flex", gap:8, alignItems:"center", padding:"12px 14px", borderBottom:`1px solid ${C.b1}`, background:C.purple+"08" }}>
        <span style={{ fontSize:18 }}>🤖</span>
        <span style={{ color:C.purple, fontWeight:700, fontSize:13 }}>ARIA — Análise Concluída</span>
        <button onClick={()=>navigator.clipboard?.writeText(r.text)} style={{ marginLeft:"auto", background:C.neon+"15", border:`1px solid ${C.neon}30`, borderRadius:7, padding:"3px 10px", color:C.neon, fontSize:10, cursor:"pointer" }}>📋 Copiar</button>
      </div>
      <div style={{ padding:14, maxHeight:420, overflowY:"auto" }}>
        <AIResponse text={r.text} />
      </div>
      <div style={{ padding:"8px 14px", borderTop:`1px solid ${C.b1}` }}>
        <button onClick={()=>setResult(null)} style={{ background:"none", border:`1px solid ${C.b2}`, borderRadius:8, padding:"6px 14px", color:C.t3, fontSize:11, cursor:"pointer" }}>← Nova análise</button>
      </div>
    </div>
  );

  const LoadingBox = ({ msg }) => (
    <div style={{ textAlign:"center", padding:"28px 0" }}>
      <div style={{ width:52, height:52, background:`linear-gradient(135deg,${C.purple},${C.blue})`, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 14px", boxShadow:`0 4px 20px ${C.purple}40` }}>🤖</div>
      <div style={{ color:C.purple, fontWeight:700, fontSize:14, marginBottom:6 }}>ARIA pensando...</div>
      <div style={{ color:C.t3, fontSize:12, marginBottom:16 }}>{msg || "Analisando..."}</div>
      <div style={{ display:"flex", gap:4, justifyContent:"center" }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:C.purple, animation:`pulse 1.4s ${i*0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Header ARIA */}
      <Card glow={C.purple} s={{ background:`linear-gradient(135deg,${C.purple}12,${C.blue}08)`, border:`1px solid ${C.purple}40` }}>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ width:52, height:52, borderRadius:16, background:`linear-gradient(135deg,${C.purple},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, boxShadow:`0 4px 24px ${C.purple}50` }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ color:C.t1, fontWeight:900, fontSize:16, letterSpacing:-.5 }}>ARIA</div>
              <Chip c={C.purple}>Claude Sonnet</Chip>
            </div>
            <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>Advanced Revenue Intelligence Assistant</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:isVercel?C.neon:C.t3, boxShadow:isVercel?`0 0 8px ${C.neon}`:"none" }} className={isVercel?"pulse":""} />
            <div style={{ color:isVercel?C.neon:C.t3, fontSize:9, fontWeight:700 }}>{isVercel?"ONLINE":"OFFLINE"}</div>
          </div>
        </div>
        {!isVercel && (
          <div style={{ marginTop:10, background:C.gold+"12", border:`1px solid ${C.gold}35`, borderRadius:10, padding:"9px 12px" }}>
            <div style={{ color:C.gold, fontWeight:700, fontSize:12, marginBottom:3 }}>⚠️ Para ativar a ARIA no Vercel:</div>
            <div style={{ color:C.t3, fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>ANTHROPIC_API_KEY = sua-chave</div>
            <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color:C.blue, fontSize:11 }}>Pegar chave grátis → console.anthropic.com</a>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
        {[["chat","💬","Chat"],["audit","🔎","Auditoria"],["offer","⭐","Oferta"],["insights","📊","Insights"],["plan","📅","Plano"],["optimize","✨","Otimizar"]].map(([id,ico,l])=>(
          <button key={id} onClick={()=>{ setTab(id); setResult(null); }} style={{ flex:"1 1 80px", padding:"8px 4px", borderRadius:11, border:`1px solid ${tab===id?C.purple+"60":C.b1}`, background:tab===id?`linear-gradient(135deg,${C.purple}25,${C.blue}18)`:"transparent", color:tab===id?C.purple:C.t3, fontWeight:700, fontSize:11, cursor:"pointer", transition:"all .2s" }}>
            {ico} {l}
          </button>
        ))}
      </div>

      {/* ── CHAT ── */}
      {tab==="chat" && (
        <Card s={{ padding:0 }}>
          <div style={{ maxHeight:400, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:10 }}>
            {messages.map((m,i)=>(
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", flexDirection:m.role==="user"?"row-reverse":"row" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, background:m.role==="user"?`linear-gradient(135deg,${C.neon},${C.blue})`:`linear-gradient(135deg,${C.purple},${C.blue})`, color:"#000", fontWeight:800 }}>
                  {m.role==="user"?"V":"A"}
                </div>
                <div style={{ background:m.role==="user"?C.neon+"12":C.s1, border:`1px solid ${m.role==="user"?C.neon+"25":C.b1}`, borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", padding:"10px 13px", maxWidth:"82%" }}>
                  <AIResponse text={m.text} />
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${C.purple},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#000", flexShrink:0 }}>A</div>
                <div style={{ background:C.s1, border:`1px solid ${C.b1}`, borderRadius:"14px 14px 14px 4px", padding:"10px 14px", display:"flex", gap:8, alignItems:"center" }}>
                  <Spin size={14} color={C.purple}/>
                  <span style={{ color:C.t3, fontSize:11 }}>{loadingMsg || "ARIA pensando..."}</span>
                </div>
              </div>
            )}
          </div>
          <div style={{ borderTop:`1px solid ${C.b1}`, padding:"10px 12px", display:"flex", gap:8 }}>
            <input placeholder="Pergunte qualquer coisa para a ARIA..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!loading&&sendChat()}
              style={{ flex:1, background:C.s1, border:`1px solid ${C.b1}`, borderRadius:11, padding:"10px 12px", color:C.t1, fontSize:12, outline:"none" }}
              onFocus={e=>e.target.style.borderColor=C.purple+"70"} onBlur={e=>e.target.style.borderColor=C.b1} />
            <button onClick={sendChat} disabled={loading||!input.trim()} style={{ width:42, height:42, background:loading||!input.trim()?"#1a2540":`linear-gradient(135deg,${C.purple},${C.blue})`, border:"none", borderRadius:11, cursor:loading||!input.trim()?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, transition:"all .2s" }}>
              {loading?<Spin size={16} color="#fff"/>:<span style={{ color:"#fff", fontWeight:800 }}>→</span>}
            </button>
          </div>
          <div style={{ padding:"0 12px 10px", display:"flex", gap:5, flexWrap:"wrap" }}>
            {["Como aumento minhas vendas?","Qual produto focar agora?","Por que não tenho cliques?","Crie um script de vendas"].map(s=>(
              <button key={s} onClick={()=>setInput(s)} style={{ background:C.purple+"12", border:`1px solid ${C.purple}25`, borderRadius:99, padding:"4px 10px", color:C.purple, fontSize:10, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>{s}</button>
            ))}
          </div>
        </Card>
      )}

      {/* ── AUDITORIA COMPLETA ── */}
      {tab==="audit" && (
        <Card>
          <div style={{ color:C.t1, fontWeight:800, fontSize:15, marginBottom:4 }}>🔎 Auditoria Completa do App</div>
          <div style={{ color:C.t3, fontSize:11, marginBottom:14 }}>A ARIA analisa TUDO — dados, links, fila, performance — e entrega um diagnóstico cirúrgico com plano de ação</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            {[
              { l:"Cliques", v:stats.cliques, c:C.neon, ico:"👆" },
              { l:"Vendas", v:stats.vendas, c:C.gold, ico:"🛒" },
              { l:"Comissão", v:`R$ ${stats.comissao.toFixed(2)}`, c:C.purple, ico:"💰" },
              { l:"Conversão", v:`${stats.cliques>0?((stats.vendas/stats.cliques)*100).toFixed(1):0}%`, c:C.blue, ico:"📈" },
            ].map(x=>(
              <div key={x.l} style={{ background:C.s1, borderRadius:12, padding:"12px 14px", border:`1px solid ${x.c}20` }}>
                <div style={{ fontSize:18, marginBottom:6 }}>{x.ico}</div>
                <div style={{ color:x.c, fontWeight:800, fontSize:20 }}>{x.v}</div>
                <div style={{ color:C.t3, fontSize:10, marginTop:3, textTransform:"uppercase", letterSpacing:.6 }}>{x.l}</div>
              </div>
            ))}
          </div>
          {result?.loading && result?.type==="audit" ? <LoadingBox msg={loadingMsg} />
          : result?.type==="audit" ? <ResultBox r={result} />
          : (
            <>
              <div style={{ background:C.purple+"08", border:`1px solid ${C.purple}20`, borderRadius:12, padding:12, marginBottom:14 }}>
                <div style={{ color:C.t2, fontSize:11, lineHeight:1.8 }}>
                  A ARIA vai analisar:<br/>
                  ▸ Todos os seus links e comissões<br/>
                  ▸ Taxa de conversão real<br/>
                  ▸ Onde você está perdendo dinheiro<br/>
                  ▸ Plataformas conectadas<br/>
                  ▸ Fila de posts e roteiros<br/>
                  ▸ Roadmap de 30 dias personalizado
                </div>
              </div>
              <Btn full onClick={runAudit} v="u" s={{ padding:"13px 0", fontSize:14 }}>🔎 INICIAR AUDITORIA COMPLETA</Btn>
            </>
          )}
        </Card>
      )}

      {/* ── ANÁLISE DE OFERTA ── */}
      {tab==="offer" && (
        <Card>
          <div style={{ color:C.t1, fontWeight:800, fontSize:15, marginBottom:4 }}>⭐ Analisar Oferta</div>
          <div style={{ color:C.t3, fontSize:11, marginBottom:14 }}>Score de potencial 0-10 + estratégia completa de promoção</div>
          {links.length===0 ? (
            <Empty ico="🔍" title="Nenhum link" desc="Adicione links na aba Links primeiro." />
          ) : (
            <>
              <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Selecione a oferta</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
                {links.map(l=>(
                  <div key={l.id} onClick={()=>setSelLinkId(l.id)} style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 12px", background:(selLinkId===l.id||(l===links[0]&&!selLinkId))?C.purple+"12":C.s1, border:`1px solid ${(selLinkId===l.id||(l===links[0]&&!selLinkId))?C.purple+"45":C.b1}`, borderRadius:12, cursor:"pointer" }}>
                    <ProductThumb thumb={l.thumb} store={STORES.find(s=>s.id===l.storeId)} size={38} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:C.t1, fontSize:12, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.productName}</div>
                      <div style={{ color:C.t3, fontSize:10, marginTop:1 }}>{l.storeName}{l.price?" · "+l.price:""}{l.commission?" · "+l.commission:""} · {l.clicks||0} cliques</div>
                    </div>
                    {(selLinkId===l.id||(l===links[0]&&!selLinkId)) && <div style={{ width:20, height:20, borderRadius:"50%", background:C.purple, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>✓</div>}
                  </div>
                ))}
              </div>
              {result?.loading && result?.type==="offer" ? <LoadingBox msg={loadingMsg} />
              : result?.type==="offer" ? <ResultBox r={result} />
              : <Btn full onClick={analyzeOffer} v="u" s={{ padding:"13px 0", fontSize:14 }}>⭐ ANALISAR OFERTA COM ARIA</Btn>}
            </>
          )}
        </Card>
      )}

      {/* ── INSIGHTS ── */}
      {tab==="insights" && (
        <Card>
          <div style={{ color:C.t1, fontWeight:800, fontSize:15, marginBottom:4 }}>📊 Insights de Performance</div>
          <div style={{ color:C.t3, fontSize:11, marginBottom:14 }}>A ARIA lê seus números reais e diz exatamente o que fazer</div>
          {result?.loading && result?.type==="insights" ? <LoadingBox msg={loadingMsg} />
          : result?.type==="insights" ? <ResultBox r={result} />
          : (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:14 }}>
                {[
                  { l:"Cliques totais", v:stats.cliques, c:C.neon },
                  { l:"Vendas", v:stats.vendas, c:C.gold },
                  { l:"Comissão", v:`R$ ${stats.comissao.toFixed(2)}`, c:C.purple },
                  { l:"Taxa conversão", v:`${stats.cliques>0?((stats.vendas/stats.cliques)*100).toFixed(1):0}%`, c:C.blue },
                ].map(x=>(
                  <div key={x.l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 12px", background:C.s1, borderRadius:10 }}>
                    <span style={{ color:C.t2, fontSize:12 }}>{x.l}</span>
                    <span style={{ color:x.c, fontWeight:800, fontSize:14 }}>{x.v}</span>
                  </div>
                ))}
              </div>
              <Btn full onClick={getInsights} v="u" s={{ padding:"13px 0", fontSize:14 }}>📊 GERAR INSIGHTS COM ARIA</Btn>
            </>
          )}
        </Card>
      )}

      {/* ── PLANO 7 DIAS ── */}
      {tab==="plan" && (
        <Card>
          <div style={{ color:C.t1, fontWeight:800, fontSize:15, marginBottom:4 }}>📅 Plano de Conteúdo 7 Dias</div>
          <div style={{ color:C.t3, fontSize:11, marginBottom:14 }}>Calendário completo: produto, plataforma, formato, horário e hook de cada post</div>
          {result?.loading && result?.type==="plan" ? <LoadingBox msg={loadingMsg} />
          : result?.type==="plan" ? <ResultBox r={result} />
          : (
            <>
              {links.length > 0 && (
                <div style={{ marginBottom:14 }}>
                  <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Produtos que serão incluídos</div>
                  {links.slice(0,4).map(l=>(
                    <div key={l.id} style={{ display:"flex", gap:8, alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${C.b1}` }}>
                      <ProductThumb thumb={l.thumb} store={STORES.find(s=>s.id===l.storeId)} size={28} />
                      <span style={{ color:C.t2, fontSize:12, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.productName}</span>
                      {l.price && <span style={{ color:C.neon, fontSize:11, fontWeight:700, flexShrink:0 }}>{l.price}</span>}
                    </div>
                  ))}
                </div>
              )}
              <Btn full onClick={genPlan} v="u" s={{ padding:"13px 0", fontSize:14 }}>📅 CRIAR PLANO DE 7 DIAS</Btn>
            </>
          )}
        </Card>
      )}

      {/* ── OTIMIZAR TEXTO ── */}
      {tab==="optimize" && (
        <Card>
          <div style={{ color:C.t1, fontWeight:800, fontSize:15, marginBottom:4 }}>✨ Otimizar Texto</div>
          <div style={{ color:C.t3, fontSize:11, marginBottom:14 }}>2 versões otimizadas + dica exclusiva para cada plataforma</div>
          {links.length > 0 && (
            <div style={{ marginBottom:12 }}>
              <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Produto</div>
              <select value={selLinkId||links[0]?.id} onChange={e=>setSelLinkId(e.target.value)}
                style={{ width:"100%", background:C.s1, border:`1px solid ${C.b1}`, borderRadius:10, padding:"9px 12px", color:C.t1, fontSize:12, outline:"none" }}>
                {links.map(l=><option key={l.id} value={l.id}>{l.productName}{l.price?" — "+l.price:""}</option>)}
              </select>
            </div>
          )}
          <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:8 }}>Plataforma alvo</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:14 }}>
            {PLATFORMS.map(p=>(
              <button key={p.id} onClick={()=>setSelPlatform(p.id)} style={{ display:"flex", alignItems:"center", gap:7, background:selPlatform===p.id?p.color+"20":C.s1, border:`1px solid ${selPlatform===p.id?p.color+"55":C.b1}`, borderRadius:10, padding:"8px 10px", cursor:"pointer", transition:"all .2s" }}>
                <span style={{ fontSize:16 }}>{p.icon}</span>
                <span style={{ color:selPlatform===p.id?p.color:C.t3, fontWeight:700, fontSize:11 }}>{p.name}</span>
                {selPlatform===p.id && <div style={{ marginLeft:"auto", width:16, height:16, borderRadius:"50%", background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>✓</div>}
              </button>
            ))}
          </div>
          {result?.loading && result?.type==="optimize" ? <LoadingBox msg={loadingMsg} />
          : result?.type==="optimize" ? <ResultBox r={result} />
          : <Btn full onClick={optimizeText} dis={links.length===0} v="u" s={{ padding:"13px 0", fontSize:14 }}>✨ OTIMIZAR PARA {PLATFORMS.find(p=>p.id===selPlatform)?.name?.toUpperCase()}</Btn>}
        </Card>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════
// FILA DE POSTAGEM — Agendamento + Logs
// ══════════════════════════════════════════════════════
function buildPostText(link, platform, customText) {
  if (customText) return customText;
  const name = link?.productName || "Produto";
  const price = link?.price ? `\n💲 ${link.price}` : "";
  const url = link?.originalUrl || "";
  const templates = {
    tiktok:    `🔥 ${name}${price}\n\n👉 Link na bio!\n\n#viral #afiliado #oferta #compras`,
    instagram: `✨ ${name}${price}\n\n👉 Link na bio!\n\n#publi #reels #viral #oferta`,
    youtube:   `${name}${price}\n\nLink do produto: ${url}\n\n✅ Link de afiliado — ganho comissão se você comprar.`,
    facebook:  `🔥 ${name}${price}\n\n👉 ${url}\n\n#oferta #viral`,
    kwai:      `${name}${price}\n\n👉 ${url}\n\n#viral #oferta`,
    telegram:  `🔥 *${name}*${price}\n\n👉 ${url}`,
    twitter:   `🔥 ${name}${price} 👉 ${url} #oferta #afiliado`,
  };
  return templates[platform] || `${name}${price}\n\n${url}`;
}

function buildOpenUrl(platform, text, link) {
  const url = link?.originalUrl || "";
  const enc = encodeURIComponent;
  switch(platform) {
    case "tiktok":    return "https://www.tiktok.com/upload";
    case "instagram": return "https://www.instagram.com/create/story";
    case "youtube":   return "https://studio.youtube.com";
    case "facebook":  return "https://www.facebook.com/reel/create";
    case "kwai":      return "https://www.kwai.com/creator/upload";
    case "telegram":  return `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`;
    case "twitter":   return `https://twitter.com/intent/tweet?text=${enc(text.slice(0,260))}`;
    default:          return "#";
  }
}

function Fila({ queue, setQueue, postLogs, setPostLogs, links, scripts }) {
  const [tab, setTab] = useState("fila"); // fila | novo | logs
  const [form, setForm] = useState({
    linkId: "", platforms: [], scheduledAt: "", interval: "30",
    useInterval: false, customText: "", note: ""
  });
  const [notification, setNotification] = useState(null);
  const [autoFill, setAutoFill] = useState({ days:3, platforms:["tiktok","instagram","telegram"], interval:"60", startDate:"" });
  const [autoFillResult, setAutoFillResult] = useState(null);

  const isVercel = typeof window !== "undefined" &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("claudeusercontent");

  const handleAutoFill = async () => {
    if (!autoFill.platforms.length || links.length === 0) return;
    setAutoFillResult({ loading:true, msg:"🤖 ARIA analisando seus produtos...", prog:10 });
    const steps = [
      { msg:"🔍 Escolhendo produtos ideais...", prog:25 },
      { msg:"✍️ Criando textos otimizados...", prog:50 },
      { msg:"🎯 Adaptando para cada plataforma...", prog:70 },
      { msg:"📅 Agendando com intervalos...", prog:85 },
      { msg:"✅ Finalizando fila...", prog:95 },
    ];
    let si = 0;
    const iv = setInterval(() => {
      if (si < steps.length) { setAutoFillResult(r => ({ ...r, ...steps[si] })); si++; }
    }, 1800);
    try {
      const res = await fetch("/api/ai-autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          links,
          platforms: autoFill.platforms,
          days: autoFill.days,
          startDate: autoFill.startDate || new Date().toISOString(),
          intervalMinutes: parseInt(autoFill.interval),
        })
      });
      clearInterval(iv);
      const data = await res.json();
      if (data.error) { setAutoFillResult({ loading:false, error:data.error }); return; }
      // Add to queue
      setQueue(prev => [...prev, ...data.queue].sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
      setAutoFillResult({ loading:false, done:true, total:data.queue.length, strategy:data.strategy });
    } catch(e) {
      clearInterval(iv);
      setAutoFillResult({ loading:false, error:e.message });
    }
  };

  // Check for due posts every 30s
  useEffect(() => {
    const check = () => {
      const now = new Date();
      queue.forEach(item => {
        if (item.status === "pending") {
          const due = new Date(item.scheduledAt);
          const diff = (due - now) / 1000 / 60; // minutes
          if (diff <= 0 && diff > -2) {
            setNotification(item);
          }
        }
      });
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [queue]);

  const selLink = links.find(l => l.id === form.linkId) || links[0];

  const addToQueue = () => {
    if (!form.platforms.length) return;
    const baseTime = form.scheduledAt ? new Date(form.scheduledAt) : new Date();
    const intervalMin = parseInt(form.interval) || 30;
    const newItems = form.platforms.map((pid, i) => {
      const t = new Date(baseTime.getTime() + (form.useInterval ? i * intervalMin * 60000 : 0));
      return {
        id: Date.now().toString() + i,
        linkId: selLink?.id || "",
        productName: selLink?.productName || "Produto",
        platform: pid,
        scheduledAt: t.toISOString(),
        text: buildPostText(selLink, pid, form.customText),
        status: "pending",
        createdAt: new Date().toISOString(),
        note: form.note,
      };
    });
    setQueue([...queue, ...newItems].sort((a,b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
    setForm({ linkId:"", platforms:[], scheduledAt:"", interval:"30", useInterval:false, customText:"", note:"" });
    setTab("fila");
  };

  const markDone = (item) => {
    setQueue(queue.map(q => q.id === item.id ? {...q, status:"done", doneAt:new Date().toISOString()} : q));
    setPostLogs([{ id:Date.now().toString(), ...item, status:"done", doneAt:new Date().toISOString() }, ...postLogs]);
  };

  const markSkipped = (item) => {
    setQueue(queue.map(q => q.id === item.id ? {...q, status:"skipped"} : q));
    setPostLogs([{ id:Date.now().toString(), ...item, status:"skipped" }, ...postLogs]);
  };

  const deleteItem = (id) => setQueue(queue.filter(q => q.id !== id));
  const clearDone = () => setQueue(queue.filter(q => q.status === "pending"));

  const pending = queue.filter(q => q.status === "pending");
  const done = queue.filter(q => q.status !== "pending");

  const getPlatform = (id) => PLATFORMS.find(p => p.id === id);

  const formatTime = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = (d - now) / 1000 / 60;
    if (diff < 0) return "Atrasado " + Math.abs(Math.round(diff)) + "min";
    if (diff < 60) return "Em " + Math.round(diff) + " min";
    if (diff < 1440) return "Hoje " + d.toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"});
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"});
  };

  const isOverdue = (iso) => new Date(iso) < new Date();

  return (
    <div className="fu" style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* Notification popup */}
      {notification && (
        <div style={{ position:"fixed", top:70, left:16, right:16, zIndex:200, background:`linear-gradient(135deg,${C.gold}20,${C.orange}15)`, border:`1px solid ${C.gold}50`, borderRadius:16, padding:16, boxShadow:`0 8px 32px rgba(0,0,0,.5)` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ color:C.gold, fontWeight:800, fontSize:14, marginBottom:4 }}>⏰ Hora de Postar!</div>
              <div style={{ color:C.t2, fontSize:12 }}>{notification.productName} → {getPlatform(notification.platform)?.name}</div>
            </div>
            <button onClick={()=>setNotification(null)} style={{ background:"none", border:"none", color:C.t3, cursor:"pointer", fontSize:18 }}>✕</button>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <button onClick={()=>{ navigator.clipboard?.writeText(notification.text).catch(()=>{}); window.open(buildOpenUrl(notification.platform, notification.text, links.find(l=>l.id===notification.linkId)), "_blank"); markDone(notification); setNotification(null); }}
              style={{ flex:2, background:`linear-gradient(135deg,${C.neon},${C.blue})`, border:"none", borderRadius:10, padding:"9px 0", color:"#000", fontWeight:800, fontSize:12, cursor:"pointer" }}>
              🚀 Abrir e Postar
            </button>
            <button onClick={()=>{ markSkipped(notification); setNotification(null); }}
              style={{ flex:1, background:C.s1, border:`1px solid ${C.b1}`, borderRadius:10, padding:"9px 0", color:C.t3, fontWeight:700, fontSize:12, cursor:"pointer" }}>
              Pular
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", background:C.s1, border:`1px solid ${C.b1}`, borderRadius:14, padding:4, gap:4 }}>
        {[["fila","📋 Fila"],["auto","🤖 Auto"],["novo","➕ Manual"],["logs","📊 Logs"]].map(([id,l])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:"9px 0", borderRadius:11, border:"none", background:tab===id?id==="auto"?`linear-gradient(135deg,${C.purple},${C.blue})`:`linear-gradient(135deg,${C.neon},${C.blue})`:"transparent", color:tab===id?"#000":C.t3, fontWeight:700, fontSize:id==="auto"?11:12, cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      {/* ── FILA ── */}
      {tab==="fila" && (
        <>
          {pending.length === 0 ? (
            <Card s={{ border:`1px dashed ${C.b2}` }}>
              <Empty ico="📋" title="Fila vazia" desc="Agende posts na aba Agendar para ver aqui." action={<Btn onClick={()=>setTab("novo")} s={{ padding:"9px 18px" }}>➜ Agendar</Btn>} />
            </Card>
          ) : (
            <Card>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ color:C.t1, fontWeight:700, fontSize:14 }}>📋 Fila de Posts</div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <Chip c={C.neon}>{pending.length} pendente{pending.length>1?"s":""}</Chip>
                  {done.length>0 && <button onClick={clearDone} style={{ background:C.red+"18", border:`1px solid ${C.red}30`, borderRadius:8, padding:"3px 10px", color:C.red, fontSize:10, fontWeight:700, cursor:"pointer" }}>Limpar feitos</button>}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {pending.map((item) => {
                  const plt = getPlatform(item.platform);
                  const overdue = isOverdue(item.scheduledAt);
                  const link = links.find(l=>l.id===item.linkId);
                  return (
                    <div key={item.id} style={{ background:overdue?`${C.gold}0a`:C.s1, border:`1px solid ${overdue?C.gold+"50":C.b1}`, borderRadius:14, overflow:"hidden" }}>
                      <div style={{ padding:"12px 12px 0" }}>
                        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                          <div style={{ width:34, height:34, borderRadius:9, background:(plt?.color||C.neon)+"20", border:`1px solid ${(plt?.color||C.neon)}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{plt?.icon||"📱"}</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ color:C.t1, fontWeight:700, fontSize:13 }}>{plt?.name} — {item.productName}</div>
                            <div style={{ color:overdue?C.gold:C.t3, fontSize:11, marginTop:1, fontWeight:overdue?700:400 }}>{formatTime(item.scheduledAt)}</div>
                          </div>
                          <button onClick={()=>deleteItem(item.id)} style={{ background:"none", border:"none", color:C.t3, cursor:"pointer", fontSize:16, flexShrink:0 }}>✕</button>
                        </div>
                        <div style={{ margin:"8px 0", background:C.card, borderRadius:8, padding:"7px 10px" }}>
                          <div style={{ color:C.t3, fontSize:9, fontWeight:700, marginBottom:3 }}>TEXTO DO POST</div>
                          <div style={{ color:C.t2, fontSize:11, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{item.text.slice(0,120)}{item.text.length>120?"...":""}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:0, borderTop:`1px solid ${C.b1}` }}>
                        <button onClick={()=>{ navigator.clipboard?.writeText(item.text).catch(()=>{}); window.open(buildOpenUrl(item.platform, item.text, link), "_blank"); markDone(item); }}
                          style={{ flex:2, background:"none", border:"none", borderRight:`1px solid ${C.b1}`, padding:"10px 0", color:C.neon, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                          🚀 Postar Agora
                        </button>
                        <button onClick={()=>{ navigator.clipboard?.writeText(item.text).catch(()=>{}); }}
                          style={{ flex:1, background:"none", border:"none", borderRight:`1px solid ${C.b1}`, padding:"10px 0", color:C.t2, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                          📋 Copiar
                        </button>
                        <button onClick={()=>markSkipped(item)}
                          style={{ flex:1, background:"none", border:"none", padding:"10px 0", color:C.t3, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                          Pular
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}


      {/* ── AUTO FILL ARIA ── */}
      {tab==="auto" && (
        <Card glow={C.purple} s={{ border:`1px solid ${C.purple}35` }}>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
            <div style={{ width:46, height:46, borderRadius:14, background:`linear-gradient(135deg,${C.purple},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0, boxShadow:`0 4px 20px ${C.purple}40` }}>🤖</div>
            <div>
              <div style={{ color:C.t1, fontWeight:800, fontSize:15 }}>ARIA Auto-Fila</div>
              <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>IA gera textos otimizados e agenda tudo automaticamente</div>
            </div>
          </div>

          {!isVercel && (
            <div style={{ background:C.gold+"12", border:`1px solid ${C.gold}30`, borderRadius:10, padding:"9px 12px", marginBottom:14 }}>
              <div style={{ color:C.gold, fontSize:11, fontWeight:700 }}>⚠️ Configure ANTHROPIC_API_KEY no Vercel para usar</div>
            </div>
          )}

          {/* Days selector */}
          <div style={{ marginBottom:12 }}>
            <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Quantos dias de conteúdo?</div>
            <div style={{ display:"flex", gap:6 }}>
              {[1,3,5,7].map(d=>(
                <button key={d} onClick={()=>setAutoFill(f=>({...f,days:d}))} style={{ flex:1, background:autoFill.days===d?`linear-gradient(135deg,${C.purple},${C.blue})`:C.s1, border:`1px solid ${autoFill.days===d?C.purple:C.b1}`, borderRadius:10, padding:"9px 0", color:autoFill.days===d?"#fff":C.t3, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                  {d} {d===1?"dia":"dias"}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div style={{ marginBottom:12 }}>
            <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Plataformas</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {PLATFORMS.map(p=>{
                const sel = autoFill.platforms.includes(p.id);
                return (
                  <button key={p.id} onClick={()=>setAutoFill(f=>({ ...f, platforms: sel ? f.platforms.filter(x=>x!==p.id) : [...f.platforms, p.id] }))}
                    style={{ display:"flex", alignItems:"center", gap:6, background:sel?p.color+"20":C.s1, border:`1px solid ${sel?p.color+"55":C.b1}`, borderRadius:10, padding:"8px 10px", cursor:"pointer" }}>
                    <span style={{ fontSize:16 }}>{p.icon}</span>
                    <span style={{ color:sel?p.color:C.t3, fontWeight:700, fontSize:11, flex:1, textAlign:"left" }}>{p.name}</span>
                    {sel && <span style={{ color:p.color, fontSize:12 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interval */}
          <div style={{ marginBottom:12 }}>
            <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Intervalo entre posts</div>
            <div style={{ display:"flex", gap:6 }}>
              {[["30","30min"],["60","1h"],["120","2h"],["240","4h"]].map(([v,l])=>(
                <button key={v} onClick={()=>setAutoFill(f=>({...f,interval:v}))} style={{ flex:1, background:autoFill.interval===v?`linear-gradient(135deg,${C.neon},${C.blue})`:C.s1, border:`1px solid ${autoFill.interval===v?C.neon:C.b1}`, borderRadius:10, padding:"8px 0", color:autoFill.interval===v?"#000":C.t3, fontWeight:700, fontSize:11, cursor:"pointer" }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Start date */}
          <div style={{ marginBottom:14 }}>
            <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Início</div>
            <input type="datetime-local" value={autoFill.startDate} onChange={e=>setAutoFill(f=>({...f,startDate:e.target.value}))}
              style={{ width:"100%", background:C.s1, border:`1px solid ${C.b1}`, borderRadius:10, padding:"9px 12px", color:C.t1, fontSize:12, outline:"none", boxSizing:"border-box" }} />
          </div>

          {/* Products summary */}
          {links.length > 0 && (
            <div style={{ background:C.neon+"08", border:`1px solid ${C.neon}20`, borderRadius:10, padding:"9px 12px", marginBottom:14 }}>
              <div style={{ color:C.neon, fontSize:11, fontWeight:700, marginBottom:4 }}>✅ Produtos que serão usados:</div>
              {links.slice(0,4).map(l=>(
                <div key={l.id} style={{ color:C.t3, fontSize:11, marginTop:2 }}>▸ {l.productName}{l.price?" — "+l.price:""}</div>
              ))}
              {links.length > 4 && <div style={{ color:C.t3, fontSize:10, marginTop:2 }}>+{links.length-4} mais...</div>}
            </div>
          )}

          {/* Preview */}
          {autoFill.platforms.length > 0 && (
            <div style={{ background:C.purple+"08", border:`1px solid ${C.purple}20`, borderRadius:10, padding:"9px 12px", marginBottom:14 }}>
              <div style={{ color:C.purple, fontSize:11, fontWeight:700, marginBottom:4 }}>📋 A ARIA vai gerar:</div>
              <div style={{ color:C.t3, fontSize:11 }}>▸ {Math.min(autoFill.days * autoFill.platforms.length, 30)} posts únicos e otimizados</div>
              <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>▸ Textos adaptados para cada plataforma</div>
              <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>▸ Respeitando regras de cada loja</div>
              <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>▸ Agendados com intervalo de {autoFill.interval}min</div>
              <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>▸ Você só aperta o botão "Postar Agora" no horário</div>
            </div>
          )}

          {autoFillResult?.loading ? (
            <div style={{ textAlign:"center", padding:"24px 0" }}>
              <div style={{ width:50, height:50, background:`linear-gradient(135deg,${C.purple},${C.blue})`, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 12px" }}>🤖</div>
              <div style={{ color:C.purple, fontWeight:700, fontSize:14, marginBottom:4 }}>ARIA gerando seus posts...</div>
              <div style={{ color:C.t3, fontSize:12, marginBottom:14 }}>{autoFillResult.msg}</div>
              <div style={{ background:C.s1, borderRadius:99, height:5, overflow:"hidden" }}>
                <div style={{ width:`${autoFillResult.prog||0}%`, height:"100%", background:`linear-gradient(90deg,${C.purple},${C.blue})`, borderRadius:99, transition:"width .5s ease" }} />
              </div>
            </div>
          ) : autoFillResult?.done ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:10 }}>🎉</div>
              <div style={{ color:C.neon, fontWeight:800, fontSize:16, marginBottom:6 }}>Fila gerada com sucesso!</div>
              <div style={{ color:C.t2, fontSize:13, marginBottom:6 }}>{autoFillResult.total} posts prontos para postar</div>
              {autoFillResult.strategy && (
                <div style={{ background:C.purple+"12", border:`1px solid ${C.purple}25`, borderRadius:10, padding:"10px 12px", marginBottom:14, textAlign:"left" }}>
                  <div style={{ color:C.purple, fontSize:11, fontWeight:700, marginBottom:4 }}>🎯 Estratégia da ARIA:</div>
                  <div style={{ color:C.t2, fontSize:12, lineHeight:1.6 }}>{autoFillResult.strategy}</div>
                </div>
              )}
              <Btn full onClick={()=>{ setAutoFillResult(null); setTab("fila"); }} s={{ padding:"12px 0" }}>📋 Ver Fila Gerada →</Btn>
              <button onClick={()=>setAutoFillResult(null)} style={{ width:"100%", marginTop:8, background:"none", border:`1px solid ${C.b2}`, borderRadius:10, padding:"9px 0", color:C.t3, fontSize:12, cursor:"pointer" }}>Gerar nova fila</button>
            </div>
          ) : (
            <Btn full onClick={handleAutoFill} dis={!autoFill.platforms.length || links.length===0 || !isVercel}
              v="u" s={{ padding:"13px 0", fontSize:14 }}>
              🤖 ARIA — GERAR FILA AUTOMÁTICA
            </Btn>
          )}
          {links.length===0 && <div style={{ color:C.red, fontSize:11, textAlign:"center", marginTop:8 }}>⚠️ Adicione links na aba Links primeiro</div>}
        </Card>
      )}

      {/* ── AGENDAR ── */}
      {tab==="novo" && (
        <Card glow={C.neon}>
          <div style={{ color:C.t1, fontWeight:700, fontSize:14, marginBottom:14 }}>➕ Agendar Posts</div>

          {/* Link */}
          {links.length > 0 ? (
            <div style={{ marginBottom:12 }}>
              <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Produto</div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {links.map(l=>(
                  <div key={l.id} onClick={()=>setForm(f=>({...f,linkId:l.id}))} style={{ display:"flex", gap:10, alignItems:"center", padding:"9px 12px", background:(form.linkId===l.id||(!form.linkId&&l===links[0]))?C.neon+"12":C.s1, border:`1px solid ${(form.linkId===l.id||(!form.linkId&&l===links[0]))?C.neon+"40":C.b1}`, borderRadius:11, cursor:"pointer" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:C.t1, fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.productName}</div>
                      {l.price && <div style={{ color:C.neon, fontSize:11 }}>{l.price}</div>}
                    </div>
                    {(form.linkId===l.id||(!form.linkId&&l===links[0])) && <span style={{ color:C.neon }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color:C.t3, fontSize:12, marginBottom:12, textAlign:"center", padding:10 }}>Adicione links primeiro na aba Links</div>
          )}

          {/* Platforms */}
          <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Plataformas (pode selecionar várias)</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:14 }}>
            {PLATFORMS.map(p=>{
              const sel = form.platforms.includes(p.id);
              return (
                <button key={p.id} onClick={()=>setForm(f=>({ ...f, platforms: sel ? f.platforms.filter(x=>x!==p.id) : [...f.platforms, p.id] }))}
                  style={{ display:"flex", alignItems:"center", gap:7, background:sel?p.color+"20":C.s1, border:`1px solid ${sel?p.color+"60":C.b1}`, borderRadius:10, padding:"8px 10px", cursor:"pointer" }}>
                  <span style={{ fontSize:16 }}>{p.icon}</span>
                  <span style={{ color:sel?p.color:C.t3, fontWeight:700, fontSize:11, flex:1, textAlign:"left" }}>{p.name}</span>
                  {sel && <span style={{ color:p.color, fontSize:12 }}>✓</span>}
                </button>
              );
            })}
          </div>

          {/* Date/time */}
          <Inp label="Data e hora do primeiro post" ph="" val={form.scheduledAt} set={v=>setForm(f=>({...f,scheduledAt:v}))} type="datetime-local" />

          {/* Interval toggle */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.b1}`, marginBottom:12 }}>
            <div>
              <div style={{ color:C.t1, fontSize:13, fontWeight:600 }}>⏱ Intervalo automático entre plataformas</div>
              <div style={{ color:C.t3, fontSize:11, marginTop:2 }}>Espaça os posts para evitar spam</div>
            </div>
            <Tog val={form.useInterval} set={v=>setForm(f=>({...f,useInterval:v}))} />
          </div>

          {form.useInterval && (
            <div style={{ marginBottom:12 }}>
              <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Intervalo entre posts (minutos)</div>
              <div style={{ display:"flex", gap:6 }}>
                {["15","30","60","120"].map(v=>(
                  <button key={v} onClick={()=>setForm(f=>({...f,interval:v}))} style={{ flex:1, background:form.interval===v?`linear-gradient(135deg,${C.neon},${C.blue})`:C.s1, border:`1px solid ${form.interval===v?C.neon:C.b1}`, borderRadius:9, padding:"8px 0", color:form.interval===v?"#000":C.t3, fontWeight:700, fontSize:12, cursor:"pointer" }}>
                    {v==="60"?"1h":v==="120"?"2h":v+"min"}
                  </button>
                ))}
              </div>
              {form.platforms.length > 1 && form.scheduledAt && (
                <div style={{ marginTop:8, background:C.neon+"08", borderRadius:8, padding:"7px 10px" }}>
                  <div style={{ color:C.t3, fontSize:10, fontWeight:700, marginBottom:4 }}>PRÉVIA DO AGENDAMENTO:</div>
                  {form.platforms.map((pid, i) => {
                    const plt = getPlatform(pid);
                    const t = new Date(new Date(form.scheduledAt).getTime() + i * parseInt(form.interval) * 60000);
                    return (
                      <div key={pid} style={{ color:C.t2, fontSize:11, display:"flex", gap:6, marginBottom:2 }}>
                        <span>{plt?.icon}</span>
                        <span>{plt?.name}</span>
                        <span style={{ color:C.neon, marginLeft:"auto" }}>{t.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Custom text */}
          <div style={{ marginBottom:14 }}>
            <div style={{ color:C.t2, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>Texto personalizado (opcional)</div>
            <textarea placeholder="Deixe em branco para usar o template automático de cada plataforma..." value={form.customText} onChange={e=>setForm(f=>({...f,customText:e.target.value}))} rows={3}
              style={{ width:"100%", background:C.s1, border:`1px solid ${C.b1}`, borderRadius:11, padding:"10px 12px", color:C.t1, fontSize:12, outline:"none", resize:"none", boxSizing:"border-box", lineHeight:1.6 }} />
          </div>

          <Inp label="Nota (opcional)" ph="Ex: Campanha Black Friday..." val={form.note} set={v=>setForm(f=>({...f,note:v}))} />

          <Btn full onClick={addToQueue} dis={!form.platforms.length} s={{ padding:"12px 0" }}>
            📋 ADICIONAR À FILA ({form.platforms.length} post{form.platforms.length!==1?"s":""})
          </Btn>
        </Card>
      )}

      {/* ── LOGS ── */}
      {tab==="logs" && (
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ color:C.t1, fontWeight:700, fontSize:14 }}>📊 Histórico de Posts</div>
            <div style={{ display:"flex", gap:6 }}>
              <Chip c={C.neon}>{postLogs.filter(l=>l.status==="done").length} feitos</Chip>
              <Chip c={C.t3}>{postLogs.filter(l=>l.status==="skipped").length} pulados</Chip>
            </div>
          </div>
          {postLogs.length === 0 ? (
            <Empty ico="📊" title="Nenhum post registrado" desc="Os posts que você marcar como feito aparecerão aqui." />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {postLogs.slice(0,20).map((log) => {
                const plt = getPlatform(log.platform);
                return (
                  <div key={log.id} style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 12px", background:C.s1, borderRadius:12, border:`1px solid ${log.status==="done"?C.neon+"25":C.b1}` }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:(plt?.color||C.t3)+"20", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{plt?.icon||"📱"}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ color:C.t1, fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{plt?.name} — {log.productName}</div>
                      <div style={{ color:C.t3, fontSize:10, marginTop:1 }}>{log.doneAt ? new Date(log.doneAt).toLocaleDateString("pt-BR")+" "+new Date(log.doneAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) : "—"}</div>
                    </div>
                    <Chip c={log.status==="done"?C.neon:C.t3}>{log.status==="done"?"✅ Feito":"⏭ Pulado"}</Chip>
                  </div>
                );
              })}
              {postLogs.length > 20 && <div style={{ color:C.t3, fontSize:11, textAlign:"center", padding:8 }}>+{postLogs.length-20} registros anteriores</div>}
            </div>
          )}
          {postLogs.length > 0 && (
            <button onClick={()=>setPostLogs([])} style={{ width:"100%", marginTop:12, background:C.red+"15", border:`1px solid ${C.red}30`, borderRadius:10, padding:"8px 0", color:C.red, fontWeight:700, fontSize:12, cursor:"pointer" }}>
              🗑 Limpar histórico
            </button>
          )}
        </Card>
      )}
    </div>
  );
}


// ══════════════════════════════════════════════════════
// MERCADO LIVRE — Token Manager com auto-refresh
// ══════════════════════════════════════════════════════
async function mlRefreshToken(refresh_token) {
  try {
    const res = await fetch("/api/ml-refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch(e) {
    return null;
  }
}

function mlTokenExpired(tokens) {
  if (!tokens?.expires_at) return true;
  // Renova se faltar menos de 30 minutos
  return Date.now() > tokens.expires_at - 30 * 60 * 1000;
}

async function mlGetValidToken(tokens, setTokens) {
  if (!tokens) return process.env.REACT_APP_ML_ACCESS_TOKEN || null;
  if (!mlTokenExpired(tokens)) return tokens.access_token;
  if (!tokens.refresh_token) return tokens.access_token;
  // Renova automaticamente
  const newTokens = await mlRefreshToken(tokens.refresh_token);
  if (newTokens) { setTokens(newTokens); return newTokens.access_token; }
  return tokens.access_token; // fallback
}

export default function App() {
  const [st, setSt] = useState(()=>{ const s=load(); return s?{...EMPTY,...s}:EMPTY; });
  const [tab, setTab] = useState("Dashboard");
  const [selProd, setSelProd] = useState(null);
  const mlTokens = st.mlTokens;
  const setMlTokens = (tokens) => up({ mlTokens: tokens });

  useEffect(()=>{ save(st); },[st]);

  const up = useCallback(p=>setSt(s=>({...s,...p})),[]);
  const login = u => up({user:u});
  const logout = () => { try{localStorage.removeItem(KEY);}catch{} setSt(EMPTY); };
  const goTo = t => setTab(t);

  if (!st.user) return <Login onLogin={login}/>;

  const addLink = l => up({links:[l,...st.links]});
  const updateLink = l => up({links:st.links.map(x=>x.id===l.id?l:x)});
  const delLink = id => up({links:st.links.filter(l=>l.id!==id)});
  const addVideo = v => up({videos:[v,...st.videos]});
  const delVideo = id => up({videos:st.videos.filter(v=>v.id!==id)});
  const addScript = s => up({scripts:[s,...(st.scripts||[])]});
  const delScript = id => up({scripts:(st.scripts||[]).filter(s=>s.id!==id)});
  const updStats = s => up({stats:s});

  const render = () => {
    switch(tab) {
      case "Dashboard": return <Dashboard stats={st.stats} links={st.links} videos={st.videos} scripts={st.scripts||[]} goTo={goTo} updStats={updStats}/>;
      case "Links":     return <Links links={st.links} addLink={addLink} updateLink={updateLink} delLink={delLink} stats={st.stats} updStats={updStats} goTo={goTo} setSelProd={setSelProd} mlTokens={mlTokens} setMlTokens={setMlTokens}/>;
      case "Mensagens": return <Mensagens links={st.links}/>;
      case "Roteiros":  return <Roteiros links={st.links} selProd={selProd} setSelProd={setSelProd} scripts={st.scripts||[]} addScript={addScript} delScript={delScript} goTo={goTo}/>;
      case "Vídeos":    return <Videos videos={st.videos} links={st.links} selProd={selProd} goTo={goTo} addVideo={addVideo} delVideo={delVideo}/>;
      case "Fila":      return <Fila queue={st.queue||[]} setQueue={q=>up({queue:q})} postLogs={st.postLogs||[]} setPostLogs={l=>up({postLogs:l})} links={st.links} scripts={st.scripts||[]} />;
      case "IA":        return <AIManager stats={st.stats} links={st.links} videos={st.videos} scripts={st.scripts||[]} queue={st.queue||[]} connectedAccounts={st.connectedAccounts||{}} />;
      case "Contas":    return <Contas accs={st.connectedAccounts} setAccs={a=>up({connectedAccounts:a})} bestTimes={st.bestTimes} setBestTimes={t=>up({bestTimes:t})}/>;
      case "Config":    return <Config settings={st.settings} setSetts={s=>up({settings:s})} customStores={st.customStores||[]} setCustomStores={c=>up({customStores:c})} connectedStores={st.connectedStores||{}} setConnectedStores={f=>up({connectedStores:typeof f==="function"?f(st.connectedStores):f})} mlTokens={mlTokens} setMlTokens={setMlTokens} onLogout={logout}/>;
      default: return null;
    }
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", maxWidth:430, margin:"0 auto", fontFamily:"'Outfit',sans-serif" }}>
      <Sty/>
      <div style={{ position:"fixed", top:-60, left:"50%", transform:"translateX(-50%)", width:380, height:380, borderRadius:"50%", background:`radial-gradient(circle,${C.neon}06,transparent 70%)`, pointerEvents:"none", zIndex:0 }}/>
      <div style={{ position:"sticky", top:0, zIndex:50, background:C.bg+"ee", backdropFilter:"blur(14px)", borderBottom:`1px solid ${C.b1}`, padding:"14px 20px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:26, height:26, background:`linear-gradient(135deg,${C.neon},${C.blue})`, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚡</div>
              <span style={{ color:C.t1, fontWeight:900, fontSize:18, letterSpacing:-.5 }}>AfiliadoAI</span>
              <span style={{ background:C.neon, color:"#000", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:99, letterSpacing:1.2 }}>PRO</span>
            </div>
            <div style={{ color:C.t3, fontSize:10, marginTop:1, marginLeft:34 }}>Olá, {st.user.name} 👋</div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {st.stats.cliques > 0 && (
              <div style={{ background:C.neon+"18", border:`1px solid ${C.neon}30`, borderRadius:99, padding:"4px 10px", display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:C.neon }} className="pulse"/>
                <span style={{ color:C.neon, fontSize:10, fontWeight:700 }}>{st.stats.cliques} cliques</span>
              </div>
            )}
            <div onClick={()=>setTab("Config")} style={{ width:34, height:34, borderRadius:99, background:`linear-gradient(135deg,${C.neon},${C.blue})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#000", fontSize:14, cursor:"pointer" }}>
              {st.user.name[0].toUpperCase()}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:6, padding:"12px 16px 0", overflowX:"auto", scrollbarWidth:"none" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{ flexShrink:0, display:"flex", alignItems:"center", gap:5, background:tab===t.id?`linear-gradient(135deg,${C.neon}18,${C.blue}12)`:"transparent", border:`1px solid ${tab===t.id?C.neon+"50":C.b1}`, borderRadius:99, padding:"7px 14px", color:tab===t.id?C.neon:C.t3, fontWeight:700, fontSize:12, cursor:"pointer", transition:"all .2s" }}>
            <span style={{ fontSize:14 }}>{t.ico}</span><span>{t.lbl}</span>
          </button>
        ))}
      </div>
      <div style={{ padding:"16px 16px 100px", position:"relative", zIndex:1 }} key={tab}>
        {render()}
      </div>
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.bg+"f2", backdropFilter:"blur(16px)", borderTop:`1px solid ${C.b1}`, padding:"10px 4px 22px", zIndex:50 }}>
        <div style={{ display:"flex" }}>
          {[...TABS,{id:"Config",ico:"⚙️",lbl:"Config"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer", padding:"4px 0" }}>
              <span style={{ fontSize:tab===t.id?21:17, transition:"font-size .2s" }}>{t.ico}</span>
              <span style={{ fontSize:9, fontWeight:700, color:tab===t.id?C.neon:C.t3 }}>{t.lbl}</span>
              {tab===t.id && <div style={{ width:4, height:4, borderRadius:99, background:C.neon, boxShadow:`0 0 6px ${C.neon}` }}/>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
