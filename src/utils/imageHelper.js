import api from '../api/axios';

export const DEFAULT_PRODUCT_PLACEHOLDER =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

export const SVG_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='100%25' height='100%25'%3E%3Crect width='200' height='200' fill='%23f1f5f9'/%3E%3Cpath d='M70 120 L95 90 L125 125 L140 108 L160 135 L40 135 Z' fill='%23cbd5e1'/%3E%3Ccircle cx='80' cy='75' r='14' fill='%23cbd5e1'/%3E%3Ctext x='100' y='160' font-family='sans-serif' font-size='12' font-weight='bold' fill='%2394a3b8' text-anchor='middle'%3EShoply Product%3C/text%3E%3C/svg%3E";

/**
 * Gracefully handles image load errors:
 * 1. Checks if it's an external URL (Amazon CDN, etc.) that failed due to hotlinking/adblockers.
 * 2. Tries the backend image proxy first.
 * 3. Falls back safely to a clean, elegant product placeholder without infinite loops.
 */
export const handleImageError = (e, originalUrl) => {
  const target = e.currentTarget;
  target.onerror = null;

  const rawUrl = originalUrl || target.getAttribute('data-original-src') || target.src;

  if (
    rawUrl &&
    typeof rawUrl === 'string' &&
    rawUrl.startsWith('http') &&
    !target.src.includes('/image-proxy?url=')
  ) {
    try {
      const base = api.defaults?.baseURL || '/api';
      target.src = `${base.replace(/\/+$/, '')}/products/image-proxy?url=${encodeURIComponent(rawUrl)}`;
      target.onerror = () => {
        target.onerror = null;
        target.src = SVG_FALLBACK;
      };
      return;
    } catch {
      // Fall through to fallback
    }
  }

  target.src = SVG_FALLBACK;
};

export default handleImageError;
