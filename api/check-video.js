// Vercel Serverless Function — verifica status do vídeo
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { project, apiKey } = req.query;
    if (!project || !apiKey) return res.status(400).json({ error: "Parâmetros obrigatórios" });

    const response = await fetch(`https://api.json2video.com/v2/movies?project=${project}`, {
      headers: { "x-api-key": apiKey }
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
