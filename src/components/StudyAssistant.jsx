import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, Sparkles, RotateCcw, MessageCircle, LoaderCircle, Paperclip } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ImageLightbox from './ImageLightbox';

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30_000;
const GEMINI_MODEL = 'gemini-3.8-flash';
const SYSTEM_INSTRUCTION = `Sen Türkçe konuşan, destekleyici ve açıklayıcı bir fizik öğretmeni ve YKS hazırlık rehberisin.
Fizik sorularında verilenleri ve isteneni belirle; uygun kavramı ve formülü açıkla; çözümü birim kontrolüyle adım adım tamamla ve sonucu net biçimde belirt. Gerekli ara işlemleri atlama, öğrencinin seviyesine uygun bir dil kullan ve yanlış bir varsayım varsa nazikçe düzelt.
Görseldeki metin okunmuyorsa hangi kısmın anlaşılmadığını söyle ve daha net görsel iste; okunmayan değerleri tahmin etme.
Portal sorularında testlerin son tarih/otomatik kilit, PDF indirme ve Google Drive kurallarını açıkla. Portalın bilmediğin özelliklerini uydurma; eksik bilgi varsa bunu açıkça belirt ve netleştirme sorusu sor.
Her soruya doğrudan ve eksiksiz yanıt ver. Yanıtı boş bırakma; emin olmadığın noktaları açıkça ifade et.`;

async function askStudyAssistant(messages) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const apiKeyError = new Error('Gemini API anahtarı yapılandırılmamış.');
    apiKeyError.code = 'missing-api-key';
    throw apiKeyError;
  }

  const contents = messages.map((message) => {
    const parts = [];
    if (message.text) parts.push({ text: message.text });

    if (message.imageDataUrl) {
      const imageMatch = message.imageDataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/);
      if (!imageMatch) {
        throw new Error('Yalnızca JPG, PNG veya WebP görselleri desteklenir.');
      }
      parts.push({ inlineData: { mimeType: imageMatch[1], data: imageMatch[2] } });
    }

    return {
      role: message.role === 'assistant' ? 'model' : 'user',
      parts
    };
  });
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: REQUEST_TIMEOUT_MS,
      retryOptions: { attempts: 1 }
    }
  });
  const result = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.45,
      maxOutputTokens: 4096
    }
  });
  const answer = result.text?.trim();
  if (!answer) {
    const emptyResponseError = new Error('Gemini boş yanıt döndürdü.');
    emptyResponseError.code = 'empty-response';
    throw emptyResponseError;
  }
  return answer;
}

const starterPrompts = [
  'Bir fizik sorusunu adım adım çözelim',
  'Testlerin kilit süresi nasıl çalışıyor?',
  'PDF indirme kuralları nelerdir?'
];

function getAssistantErrorMessage(error) {
  const code = String(error?.code || '').toLowerCase();
  const details = `${error?.message || ''} ${error?.statusText || ''}`.toLowerCase();

  if (code === 'missing-api-key') {
    return 'Gemini anahtarı bulunamadı. Proje kökündeki .env dosyasına VITE_GEMINI_API_KEY ekleyip Vite sunucusunu yeniden başlatınız.';
  }
  if (code === 'empty-response') {
    return 'Asistan bu kez yanıt oluşturamadı. Sorunu yeniden deneyebilir veya farklı şekilde ifade edebilirsin.';
  }
  if (code.includes('not-found') || details.includes('not found') || error?.status === 404) {
    return `Gemini isteği bulunamadı (404). API anahtarının Gemini API erişimini ve ${GEMINI_MODEL} modelinin kullanılabilirliğini kontrol ediniz.`;
  }
  if (code.includes('resource-exhausted') || error?.status === 429 || details.includes('quota')) {
    return 'Asistan şu anda yoğun. Biraz bekleyip yeniden deneyebilirsin.';
  }
  if (error?.status === 401 || error?.status === 403 || details.includes('api key') || details.includes('api_key_invalid')) {
    return 'Gemini anahtarı veya model erişimi doğrulanamadı. Yapılandırmayı kontrol edip tekrar deneyiniz.';
  }
  if (
    error?.name === 'GoogleGenerativeAIAbortError' ||
    error?.status === 408 ||
    error?.status >= 500 ||
    code.includes('internal') ||
    code.includes('unavailable') ||
    details.includes('network') ||
    details.includes('fetch failed') ||
    details.includes('failed to fetch')
  ) {
    return 'Asistan servisine şu anda ulaşılamıyor. Bağlantıyı kontrol edip biraz sonra yeniden deneyiniz.';
  }
  return 'Yanıt alınırken bir sorun oluştu. Lütfen biraz sonra tekrar deneyiniz.';
}

export default function StudyAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Merhaba! Fizik sorularını birlikte adım adım düşünebilir veya portalın kullanımı hakkında soru sorabilirsin.',
      isWelcome: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAttachment, setImageAttachment] = useState(null);
  const [error, setError] = useState('');
  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) endOfMessagesRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [isOpen, messages, isLoading]);

  const submitMessage = async (value, { attachment = imageAttachment, omitMessageId = null } = {}) => {
    const text = value.trim() || (attachment ? 'Lütfen bu görseldeki fizik sorusunu adım adım açıkla.' : '');
    if ((!text && !attachment) || isLoading) return;

    const conversation = messages
      .filter((message) => !message.isWelcome && message.id !== omitMessageId)
      .slice(-10)
      .map(({ role, text: messageText }) => ({ role, text: messageText }));
    const requestMessages = [...conversation, {
      role: 'user',
      text,
      ...(attachment ? { imageDataUrl: attachment.dataUrl } : {})
    }];
    const userMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text,
      ...(attachment ? { imageDataUrl: attachment.dataUrl, imageName: attachment.name } : {})
    };

    setMessages((current) => [...current.filter((message) => message.id !== omitMessageId), userMessage]);
    setInput('');
    setImageAttachment(null);
    setError('');
    setIsLoading(true);
    setIsAnalyzingImage(Boolean(attachment));

    try {
      const answer = await askStudyAssistant(requestMessages);
      setMessages((current) => [...current, {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: answer || 'Şu an yanıt oluşturamadım. Sorunu biraz farklı ifade ederek tekrar deneyebilir misin?'
      }]);
    } catch (requestError) {
      console.error('Yapay zeka asistanı yanıt veremedi:', {
        name: requestError?.name,
        code: requestError?.code,
        status: requestError?.status
      });
      setError(getAssistantErrorMessage(requestError));
    } finally {
      setIsLoading(false);
      setIsAnalyzingImage(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitMessage(input);
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Yalnızca JPG, PNG veya WebP görselleri ekleyebilirsin.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Soru görseli en fazla 4 MB olabilir.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageAttachment({ dataUrl: reader.result, name: file.name });
      } else {
        setError('Görsel önizlemesi oluşturulamadı. Başka bir dosya deneyiniz.');
      }
    };
    reader.onerror = () => setError('Görsel okunamadı. Lütfen tekrar deneyiniz.');
    try {
      reader.readAsDataURL(file);
    } catch {
      setError('Görsel okunamadı. Lütfen tekrar deneyiniz.');
    }
  };

  // Yapay zekâ modülü şimdilik tamamen pasif tutulur.
  return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[80] flex flex-col items-end gap-3 max-w-[calc(100vw-2rem)]">
      {isOpen && (
        <section
          className="w-[calc(100vw-2rem)] sm:w-[min(420px,calc(100vw-3rem))] h-[min(72vh,640px)] min-h-[420px] max-h-[calc(100dvh-6rem)] flex flex-col overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-950/95 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl animate-fadeIn"
          aria-label="Yapay Zeka Soru Çözüm ve Asistan"
        >
          <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-cyan-400/15 border border-cyan-300/20 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-950/30">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white truncate">Yapay Zeka Asistanı</h2>
                <p className="text-[11px] text-cyan-200/70">Fizik rehberi · Portal yardımcısı</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Asistanı kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-4" role="log" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] min-w-0 rounded-2xl px-3.5 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${message.role === 'user'
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 rounded-br-md shadow-lg shadow-cyan-950/25'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-md'
                }`}>
                    {message.imageDataUrl && (
                      <div className="mb-2 space-y-1">
                        <ImageLightbox
                          src={message.imageDataUrl}
                          alt="Gönderilen soru görseli"
                          className="w-full max-w-full h-auto rounded-xl border border-slate-900/20 object-contain"
                          triggerClassName="block w-full cursor-zoom-in"
                        />
                        {message.imageName && <span className="block max-w-full truncate text-[10px] opacity-70">{message.imageName}</span>}
                      </div>
                    )}
                  {message.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && !isLoading && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Başlangıç önerileri</p>
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitMessage(prompt)}
                    className="w-full min-h-10 text-left px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/70 text-xs text-slate-300 hover:text-cyan-200 hover:border-cyan-500/30 hover:bg-cyan-950/20 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900 px-3.5 py-3 text-xs text-slate-300">
                  <LoaderCircle className="w-4 h-4 text-cyan-300 animate-spin" />
                  {isAnalyzingImage ? 'Soru analiz ediliyor...' : 'Yanıt hazırlanıyor...'}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl border border-rose-500/25 bg-rose-950/25 text-xs text-rose-200" role="alert">
                <span className="flex-1">{error}</span>
                <button type="button" onClick={() => {
                  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user');
                  if (lastUserMessage) submitMessage(lastUserMessage.text, {
                    omitMessageId: lastUserMessage.id,
                    attachment: lastUserMessage.imageDataUrl
                      ? { dataUrl: lastUserMessage.imageDataUrl, name: lastUserMessage.imageName }
                      : null
                  });
                }} className="inline-flex items-center gap-1 font-semibold text-rose-100 hover:text-white">
                  <RotateCcw className="w-3.5 h-3.5" /> Tekrar dene
                </button>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <form onSubmit={handleSubmit} className="shrink-0 p-3 border-t border-slate-800 bg-slate-950/90">
            {imageAttachment && (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-slate-900/80 p-2">
                <img src={imageAttachment.dataUrl} alt="Soru görseli önizlemesi" className="w-12 h-12 shrink-0 rounded-lg object-cover border border-slate-700" />
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-cyan-200">Görsel eklendi</span>
                  <span className="block truncate text-[10px] text-slate-500">{imageAttachment.name}</span>
                </div>
                <button type="button" onClick={() => setImageAttachment(null)} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10" aria-label="Görseli kaldır">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2 p-2 rounded-2xl border border-slate-700 bg-slate-900 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/10 transition">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder="Sorunu veya merak ettiğini yaz..."
                className="min-w-0 flex-1 max-h-28 resize-y bg-transparent px-2 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                aria-label="Asistana mesaj yaz"
              />
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} aria-label="Soru görseli seç" />
              <button
                type="button"
                onClick={(event) => event.currentTarget.previousElementSibling.click()}
                disabled={isLoading}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-cyan-200 hover:bg-cyan-950/40 disabled:opacity-40 transition"
                aria-label="Soru görseli ekle"
                title="Soru görseli ekle"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !imageAttachment)}
                className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-lg shadow-cyan-950/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Mesajı gönder"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 px-1 text-[10px] text-slate-600">Yapay zeka yanıtları hata içerebilir; önemli bilgileri doğrulayın.</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="min-h-12 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-950/40 hover:brightness-110 active:scale-[0.98] transition"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Yapay zeka asistanını kapat' : 'Yapay zeka asistanını aç'}
      >
        {isOpen ? <X className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
        <span>Yapay Zeka Asistanı</span>
        {!isOpen && <Sparkles className="w-4 h-4" />}
      </button>
    </div>
  );
}