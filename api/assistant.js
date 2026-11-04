import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = 'gemini-3.8-flash';
const MAX_MESSAGES = 11;
const MAX_TEXT_LENGTH = 4000;
const MAX_IMAGE_BASE64_LENGTH = 4 * 1024 * 1024;
const SYSTEM_INSTRUCTION = `Sen Türkçe konuşan, destekleyici ve açıklayıcı bir fizik öğretmeni ve YKS hazırlık rehberisin.
Fizik sorularında verilenleri ve isteneni belirle; uygun kavramı ve formülü açıkla; çözümü birim kontrolüyle adım adım tamamla ve sonucu net biçimde belirt. Gerekli ara işlemleri atlama, öğrencinin seviyesine uygun bir dil kullan ve yanlış bir varsayım varsa nazikçe düzelt.
Görseldeki metin okunmuyorsa hangi kısmın anlaşılmadığını söyle ve daha net görsel iste; okunmayan değerleri tahmin etme.
Portal sorularında testlerin son tarih/otomatik kilit, PDF indirme ve Google Drive kurallarını açıkla. Portalın bilmediğin özelliklerini uydurma; eksik bilgi varsa bunu açıkça belirt ve netleştirme sorusu sor.
Her soruya doğrudan ve eksiksiz yanıt ver. Yanıtı boş bırakma; emin olmadığın noktaları açıkça ifade et.`;

function parseMessages(body) {
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return null;

  const contents = [];
  for (const message of messages) {
    if (!message || !['user', 'assistant'].includes(message.role)) return null;
    if (typeof message.text !== 'string' || message.text.length > MAX_TEXT_LENGTH) return null;

    const parts = [];
    if (message.text.trim()) parts.push({ text: message.text });

    if (message.imageDataUrl) {
      if (typeof message.imageDataUrl !== 'string') return null;
      const imageMatch = message.imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
      if (!imageMatch || imageMatch[2].length > MAX_IMAGE_BASE64_LENGTH) return null;
      parts.push({ inlineData: { mimeType: imageMatch[1], data: imageMatch[2] } });
    }

    if (parts.length === 0) return null;
    contents.push({ role: message.role === 'assistant' ? 'model' : 'user', parts });
  }

  if (contents.at(-1)?.role !== 'user') return null;
  return contents;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { code: 'method-not-allowed' } });
  }

  const contents = parseMessages(req.body);
  if (!contents) return res.status(400).json({ error: { code: 'invalid-request' } });

  // VITE_GEMINI_API_KEY is kept as a temporary server-side fallback for existing Vercel env settings.
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: { code: 'missing-api-key' } });

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { timeout: 30_000, retryOptions: { attempts: 1 } }
    });
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 4096
      }
    });
    const answer = result.text?.trim();
    if (!answer) return res.status(502).json({ error: { code: 'empty-response' } });
    return res.status(200).json({ answer });
  } catch (error) {
    const status = Number(error?.status) || 502;
    const code = status === 429
      ? 'resource-exhausted'
      : status === 404
        ? 'model-not-found'
        : status === 401 || status === 403
          ? 'invalid-api-key'
          : 'provider-error';
    console.error('Gemini assistant request failed:', { status, code: error?.code });
    return res.status(status >= 400 && status < 500 ? status : 502).json({ error: { code } });
  }
}
