import axios from 'axios';

// Live Render Backend API Endpoint
const LIVE_RENDER_API = 'https://shoply-backend-d9gk.onrender.com/api';

const isLocalOrLan = (hostname) => {
  if (!hostname) return true;
  return (
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
};

const resolveBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // 1. If explicit absolute HTTP/HTTPS URL is provided, use it
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. If running on local machine or local Wi-Fi / LAN (e.g. testing on mobile phone via 192.168.x.x)
  if (typeof window !== 'undefined' && window.location.hostname && isLocalOrLan(window.location.hostname)) {
    return (envUrl || '/api').trim().replace(/\/+$/, '');
  }

  // 3. If running in a live production deployment (outside localhost and LAN)
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    !isLocalOrLan(window.location.hostname)
  ) {
    return LIVE_RENDER_API;
  }

  return (envUrl || '/api').trim().replace(/\/+$/, '');
};

const baseURL = resolveBaseURL();

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer token to every request if present
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('shoply_token') ||
      sessionStorage.getItem('shoply_token') ||
      localStorage.getItem('velora_token') ||
      sessionStorage.getItem('velora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for validating API responses and catching static SPA rewrites
api.interceptors.response.use(
  (response) => {
    // Detect static server rewrite returning HTML instead of backend API JSON
    const contentType = response.headers?.['content-type'] || '';
    const isHtmlString =
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!doctype') ||
        response.data.trim().startsWith('<html') ||
        contentType.includes('text/html'));

    if (isHtmlString) {
      const error = new Error(
        'Backend API unreachable: Received static HTML instead of JSON. Ensure your backend service is running and VITE_API_BASE_URL is configured in your hosting environment.'
      );
      error.isHtmlFallback = true;
      error.response = response;
      return Promise.reject(error);
    }

    return response;
  },
  (error) => {
    // Graceful handling of 401 Unauthorized (expired or invalid token)
    if (error.response?.status === 401) {
      const reqUrl = error.config?.url || '';
      const isAuthAttempt =
        reqUrl.includes('/auth/login') ||
        reqUrl.includes('/auth/register') ||
        reqUrl.includes('/auth/forgot-password') ||
        reqUrl.includes('/auth/reset-password');

      if (!isAuthAttempt) {
        try {
          localStorage.removeItem('shoply_token');
          localStorage.removeItem('shoply_user');
          sessionStorage.removeItem('shoply_token');
          sessionStorage.removeItem('shoply_user');
          localStorage.removeItem('velora_token');
          sessionStorage.removeItem('velora_token');
          localStorage.removeItem('velora_user');
          sessionStorage.removeItem('velora_user');
        } catch (_) {}

        if (typeof window !== 'undefined' && window.location) {
          const pathname = window.location.pathname || '/';
          if (!pathname.includes('/login') && !pathname.includes('/register')) {
            if (pathname.startsWith('/seller')) {
              window.location.href = '/seller/login?expired=true';
            } else {
              window.location.href = `/login?redirect=${encodeURIComponent(
                pathname + window.location.search
              )}&expired=true`;
            }
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
