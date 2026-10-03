import axios from 'axios';

// Ensure baseURL is normalized without trailing slash
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || '/api';
const baseURL = rawBaseURL.trim().replace(/\/+$/, '');

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
    return Promise.reject(error);
  }
);

export default api;
