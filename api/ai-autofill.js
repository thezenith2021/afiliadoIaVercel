// ══════════════════════════════════════════════════════
// AI AUTOFILL — ARIA gera fila completa automaticamente
// Respeita regras de cada loja e plataforma
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
    const { links, platforms, days, startDate, intervalMinutes, connectedStores } = req.body;

    if (!links?.length) return res.status(400).json({ error: "Nenhum link fornecido" });

    const STORE_RULES = {
      ml:  "Mercado Livre: permitido em todas as plataformas. Obrigatório #publi ou #ad. Não prometer preço falso.",
      amz: "Amazon: proibido WhatsApp em massa. Obrigatório #ad. Usar apenas links amzn.to.",
      shp: "Shopee: permitido em todas. Usar #ShopeeAfiliado recomendado.",
      shn: "Shein: #ad obrigatório. Não prometer frete grátis sem verificar.",
      tmu: "Temu: #parceria obrigatório. Não comparar preço com concorrente.",
      nat: "Natura: #publi obrigatório. Foco em benefícios naturais.",
      bot: "Boticário: #publi obrigatório. Foco em fragrância e qualidade.",
      cac: "Cacau Show: #publi obrigatório. Foco em presente e ocasiões.",
      per: "Pernambucanas: #publi obrigatório. Foco em moda e preço.",
    };

    const PLATFORM_RULES = {
      tiktok:    "TikTok: máx 150 chars visíveis, hook nos 3s, 3-5 hashtags, CTA direto",
      instagram: "Instagram: #publi obrigatório, link na bio, emojis estratégicos",
      youtube:   "YouTube: descrição completa, avisar link afiliado, palavras-chave",
      facebook:  "Facebook: texto conversacional, não colocar link no texto principal",
      kwai:      "Kwai: texto curto, emojis agressivos, CTA urgente",
      telegram:  "Telegram: markdown aceito, pode ser mais longo, ideal grupos de oferta",
      twitter:   "X/Twitter: máx 260 chars, 1-2 hashtags, link encurtado",
    };

    const prompt = `Você é a ARIA, especialista em marketing de afiliados. Gere uma fila de posts otimizados.

## PRODUTOS DISPONÍVEIS:
${links.map((l,i) => `${i+1}. ${l.productName} | Loja: ${l.storeName} | Preço: ${l.price||"N/A"} | Comissão: ${l.commission||l.commRate||"N/A"} | Link: ${l.originalUrl}`).join("\n")}

## PLATAFORMAS SELECIONADAS:
${platforms.join(", ")}

## PERÍODO: ${days} dias | Intervalo: ${intervalMinutes} minutos entre posts

## REGRAS DAS LOJAS:
${links.map(l => STORE_RULES[l.storeId] || `${l.storeName}: #publi obrigatório`).filter((v,i,a)=>a.indexOf(v)===i).join("\n")}

## REGRAS DAS PLATAFORMAS:
${platforms.map(p => PLATFORM_RULES[p] || p+": texto adequado").join("\n")}

## INSTRUÇÃO:
Gere exatamente ${Math.min(days * platforms.length, 30)} posts otimizados.
Para cada post, retorne um JSON válido no array.

RESPONDA APENAS COM JSON VÁLIDO, sem texto antes ou depois:
{
  "posts": [
    {
      "platform": "tiktok",
      "linkIndex": 0,
      "text": "texto otimizado aqui",
      "hook": "hook de 3 segundos",
      "bestTime": "20:00",
      "note": "motivo da escolha"
    }
  ],
  "strategy": "resumo da estratégia em 1 frase"
}

Distribua os produtos de forma inteligente. Varie o estilo (urgência, benefício, curiosidade, social proof).
Respeite TODAS as regras. Cada texto deve ser único e otimizado para conversão.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const result = await response.json();
    if (result.error) return res.status(400).json({ error: result.error.message });

    const text = result.content?.[0]?.text || "";

    // Parse JSON from response
    let parsed;
    try {
      const clean = text.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch(e) {
      // Try to extract JSON from text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); }
        catch(e2) { return res.status(500).json({ error: "Erro ao processar resposta da IA", raw: text.slice(0,200) }); }
      } else {
        return res.status(500).json({ error: "IA não retornou JSON válido", raw: text.slice(0,200) });
      }
    }

    // Build queue items with scheduled times
    const start = startDate ? new Date(startDate) : new Date();
    const queueItems = (parsed.posts || []).map((post, i) => {
      // Parse best time
      const [h, m] = (post.bestTime || "20:00").split(":").map(Number);
      const scheduled = new Date(start);
      scheduled.setDate(scheduled.getDate() + Math.floor(i * intervalMinutes / (24 * 60)));
      scheduled.setHours(h, m, 0, 0);
      // Add interval offset within day
      scheduled.setMinutes(scheduled.getMinutes() + (i % platforms.length) * intervalMinutes);

      const link = links[post.linkIndex] || links[0];
      return {
        id: Date.now().toString() + i,
        linkId: link?.id || "",
        productName: link?.productName || "Produto",
        platform: post.platform,
        scheduledAt: scheduled.toISOString(),
        text: post.text,
        hook: post.hook,
        status: "pending",
        createdAt: new Date().toISOString(),
        note: post.note || "",
        aiGenerated: true,
      };
    });

    return res.status(200).json({
      queue: queueItems,
      strategy: parsed.strategy || "",
      total: queueItems.length,
    });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
