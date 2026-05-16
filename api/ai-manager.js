// ══════════════════════════════════════════════════════
// AI MANAGER — Claude Sonnet 4 · Especialista em Afiliados
// ══════════════════════════════════════════════════════
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const KEY = process.env.ANTHROPIC_API_KEY;
  if (!KEY) return res.status(400).json({ error: "Configure ANTHROPIC_API_KEY no Vercel" });

  try {
    const { mode, data } = req.body;

    // ── SYSTEM PROMPT — Especialista de alto nível ──
    const SYSTEM = `Você é ARIA — Advanced Revenue Intelligence Assistant — a IA gestora do AfiliadoAI PRO.

Você é uma especialista de alto nível em:
- Marketing de afiliados no Brasil (Mercado Livre, Amazon, Shopee, Shein, Hotmart, Monetizze)
- Criação de conteúdo viral para TikTok, Instagram Reels, YouTube Shorts, Facebook, Kwai, Telegram, X
- Análise de dados de performance e otimização de conversão
- Tendências de consumo no mercado brasileiro
- Psicologia do consumidor e técnicas de copywriting
- SEO para vídeos e posts em redes sociais
- Timing e frequência ideal de postagem por plataforma
- Análise de concorrência e posicionamento de produto

Suas responsabilidades como gestora do app:
1. ANALISAR dados reais do usuário e identificar gargalos
2. DIAGNOSTICAR problemas de performance com precisão cirúrgica  
3. PRESCREVER ações concretas, priorizadas por impacto
4. OTIMIZAR textos e roteiros para conversão máxima
5. PREVER tendências e oportunidades antes dos concorrentes
6. PROTEGER o usuário de erros comuns de afiliados

Regras de comunicação:
- Seja direta, objetiva e orientada a resultados
- Use dados e números sempre que possível
- Priorize ações por ROI (retorno sobre investimento de tempo)
- Alerte sobre riscos reais (banimento, baixa conversão, etc)
- Fale como uma consultora sênior de R$500/hora, não como um chatbot
- Responda sempre em português do Brasil
- Use markdown para organizar (negrito, listas, títulos)
- Limite respostas a no máximo 600 palavras para manter foco`;

    let userMessage = "";
    let maxTokens = 1200;

    switch(mode) {

      // ── ANÁLISE COMPLETA DO APP ──
      case "full_audit":
        maxTokens = 1500;
        userMessage = `Faça uma auditoria completa do meu app de afiliados e me dê um diagnóstico preciso:

## DADOS DO APP
**Performance:**
- Cliques totais: ${data.stats?.cliques || 0}
- Vendas registradas: ${data.stats?.vendas || 0}
- Comissão gerada: R$ ${(data.stats?.comissao || 0).toFixed(2)}
- Taxa de conversão: ${data.stats?.cliques > 0 ? ((data.stats?.vendas / data.stats?.cliques) * 100).toFixed(1) : 0}%

**Conteúdo criado:**
- Links de afiliado: ${data.links?.length || 0}
- Vídeos criados: ${data.videos?.length || 0}
- Roteiros gerados: ${data.scripts?.length || 0}
- Posts na fila: ${data.queue?.length || 0}

**Links ativos:**
${(data.links || []).map(l => `- ${l.productName} (${l.storeName}) | Preço: ${l.price || "N/A"} | Comissão: ${l.commission || l.commRate || "N/A"} | Cliques: ${l.clicks || 0}`).join("\n") || "Nenhum link cadastrado"}

**Plataformas conectadas:** ${Object.keys(data.connectedAccounts || {}).join(", ") || "Nenhuma"}

## PRECISO QUE VOCÊ:
1. **Diagnóstico geral** — Como está minha operação? (nota de 0-10)
2. **Maiores problemas** — O que está me custando dinheiro agora?
3. **Quick wins** — 3 ações que posso fazer HOJE para aumentar receita
4. **Plano de 30 dias** — Roadmap prioritário com metas realistas
5. **Alertas** — Riscos que preciso mitigar urgentemente`;
        break;

      // ── ANÁLISE DE OFERTA ──
      case "analyze_offer":
        maxTokens = 1200;
        userMessage = `Analise esta oferta de afiliado como uma especialista em conversão:

**Produto:** ${data.productName}
**Loja:** ${data.storeName}
**Preço:** ${data.price || "não informado"}
**Comissão:** ${data.commission || data.commRate || "não informada"}
**Cliques já registrados:** ${data.clicks || 0}
**Link:** ${data.originalUrl}

## QUERO UMA ANÁLISE COMPLETA:

**1. SCORE DE OPORTUNIDADE (0-10):**
Avalie: demanda do mercado, potencial de conversão, sazonalidade, concorrência, comissão vs esforço

**2. ANÁLISE DO PRODUTO:**
- Público-alvo ideal (quem compra isso?)
- Problema que resolve
- Objeções mais comuns do comprador
- Diferencial competitivo

**3. ESTRATÉGIA DE PROMOÇÃO:**
- Top 3 plataformas para este produto (com justificativa)
- Melhor formato de conteúdo (vídeo curto, post, story?)
- Horário de pico para este nicho
- Hashtags estratégicas

**4. ROTEIRO DE HOOK (3 opções):**
Crie 3 hooks de abertura virais para este produto (máx 10 palavras cada)

**5. ALERTAS:**
Riscos, sazonalidade, restrições da loja sobre este tipo de produto`;
        break;

      // ── INSIGHTS DO DASHBOARD ──
      case "dashboard_insights":
        maxTokens = 1200;
        const convRate = data.stats?.cliques > 0
          ? ((data.stats?.vendas / data.stats?.cliques) * 100).toFixed(1)
          : 0;
        const avgComm = data.stats?.vendas > 0
          ? (data.stats?.comissao / data.stats?.vendas).toFixed(2)
          : 0;
        userMessage = `Analise meu dashboard de afiliado e me dê insights acionáveis:

## MÉTRICAS ATUAIS
- Cliques: ${data.stats?.cliques || 0}
- Vendas: ${data.stats?.vendas || 0}
- Comissão total: R$ ${(data.stats?.comissao || 0).toFixed(2)}
- Taxa de conversão: ${convRate}%
- Comissão média por venda: R$ ${avgComm}
- Links ativos: ${data.links?.length || 0}
- Vídeos: ${data.videos?.length || 0}

## TOP LINKS POR CLIQUES
${(data.links || []).sort((a,b)=>(b.clicks||0)-(a.clicks||0)).slice(0,5).map((l,i)=>`${i+1}. ${l.productName} — ${l.clicks||0} cliques | ${l.storeName} | ${l.price||"s/preço"}`).join("\n") || "Nenhum ainda"}

Dê-me:
1. **O que os números dizem** — leitura honesta da situação atual
2. **Seu produto estrela** — qual tem mais potencial e por quê
3. **Gargalo principal** — onde estou perdendo dinheiro
4. **Meta realista para 30 dias** — baseada nos dados atuais
5. **3 ações de alto impacto** — priorizadas por potencial de retorno`;
        break;

      // ── OTIMIZAR TEXTO ──
      case "optimize_text":
        maxTokens = 800;
        const platformRules = {
          tiktok: "TikTok: máx 150 chars visíveis, hook nos 3 primeiros segundos, trending sounds, 3-5 hashtags relevantes, CTA claro no final",
          instagram: "Instagram: #publi obrigatório, quebras de linha para legibilidade, 5-10 hashtags no primeiro comentário ou caption, emoji estratégico, CTA com link na bio",
          youtube: "YouTube: descrição longa, palavras-chave no início, links clicáveis, avisar sobre link afiliado, timestamps se relevante",
          facebook: "Facebook: texto conversacional, pergunta para engajamento, não colocar link direto no texto (colocar no primeiro comentário), imagem chama mais atenção que link",
          kwai: "Kwai: texto curto e direto, emojis agressivos, CTA urgente, #viral obrigatório",
          telegram: "Telegram: markdown suportado (*negrito*, _itálico_), links clicáveis, pode ser mais longo, ideal para grupos de oferta",
          twitter: "X/Twitter: máx 280 chars, link encurtado, 1-2 hashtags, tom direto e impactante"
        };
        userMessage = `Reescreva este texto para máxima conversão no ${data.platform}:

**Produto:** ${data.productName}
**Preço:** ${data.price || "N/A"}
**Texto atual:**
${data.text}

**Regras obrigatórias para ${data.platform}:**
${platformRules[data.platform] || "Texto direto e persuasivo"}

Crie:
1. **Versão A** — Foco em URGÊNCIA e escassez
2. **Versão B** — Foco em BENEFÍCIO e transformação
3. **Dica de ouro** — Um insight específico para converter mais nesta plataforma`;
        break;

      // ── PLANO DE CONTEÚDO 7 DIAS ──
      case "generate_content_plan":
        maxTokens = 1500;
        userMessage = `Crie um plano de conteúdo de 7 dias para maximizar minhas vendas como afiliado:

**Meus produtos:**
${(data.links || []).slice(0,6).map(l=>`- ${l.productName} (${l.storeName}${l.price?", "+l.price:""}${l.commission?", comissão "+l.commission:""})`).join("\n") || "Nenhum produto cadastrado ainda"}

**Plataformas disponíveis:** ${data.platforms?.join(", ") || "TikTok, Instagram, YouTube, Facebook, Kwai, Telegram, X"}

Para cada dia crie:
| Campo | Detalhe |
|-------|---------|
| Produto | Qual promover |
| Plataforma | Onde postar (primária + secundária) |
| Formato | Vídeo 15s / Reels / Story / Post / Thread |
| Horário | Hora exata de publicação |
| Hook | Abertura dos primeiros 3 segundos |
| Objetivo | Cliques / Vendas / Seguidores |

Ao final: **Estratégia da semana** — o fio condutor que une todos os posts`;
        break;

      // ── DIAGNÓSTICO DE PROBLEMA ──
      case "diagnose":
        maxTokens = 1000;
        userMessage = `Estou tendo este problema no meu negócio de afiliados:

"${data.problem}"

**Contexto do meu app:**
- Cliques: ${data.context?.cliques || 0}
- Vendas: ${data.context?.vendas || 0}
- Links: ${data.context?.links || 0}
- Plataformas: ${data.context?.platforms || "não informadas"}

Faça um diagnóstico preciso:
1. **Causa raiz** — Por que isso está acontecendo?
2. **Urgência** — É crítico ou pode esperar?
3. **Solução imediata** — O que fazer agora (próximas 2 horas)
4. **Solução definitiva** — Como resolver de vez
5. **Como prevenir** — Para não acontecer de novo`;
        break;

      // ── CHAT LIVRE ──
      case "chat":
      default:
        maxTokens = 800;
        userMessage = `${data.message}

**Contexto atual do meu app:**
- Links salvos: ${data.context?.links || 0}
- Cliques totais: ${data.context?.cliques || 0}
- Comissão gerada: R$ ${(data.context?.comissao || 0).toFixed(2)}
- Vendas: ${data.context?.vendas || 0}`;
        break;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: SYSTEM,
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const result = await response.json();
    if (result.error) return res.status(400).json({ error: result.error.message });
    const text = result.content?.[0]?.text || "Sem resposta";
    return res.status(200).json({ response: text, mode });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
