export function extractYouTubeId(value) {
  const input = String(value || '').trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] || '';
      if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(parts[0])) {
        const id = parts[1] || '';
        if (/^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
      }

      const watchId = url.searchParams.get('v') || '';
      if (/^[a-zA-Z0-9_-]{11}$/.test(watchId)) return watchId;
    }
  } catch {
    return '';
  }

  return '';
}

export function getYouTubeThumbnailUrl(value) {
  const videoId = extractYouTubeId(value);
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(value) {
  const videoId = extractYouTubeId(value);
  if (!videoId) return '';

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : '';
  const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
  return `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1${originParam}`;
}
