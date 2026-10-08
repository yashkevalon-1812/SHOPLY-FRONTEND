import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Filter harmless external Razorpay SDK hardware probe warnings from console
if (typeof window !== 'undefined') {
  const origWarn = console.warn;
  const origError = console.error;

  console.warn = (...args) => {
    const str = args.map((a) => (typeof a === 'object' ? '' : String(a))).join(' ');
    if (
      str.includes('accelerometer') ||
      str.includes('devicemotion') ||
      str.includes('deviceorientation') ||
      str.includes('Permissions policy')
    ) {
      return;
    }
    origWarn.apply(console, args);
  };

  console.error = (...args) => {
    const str = args.map((a) => (typeof a === 'object' ? '' : String(a))).join(' ');
    if (
      str.includes('x-rtb-fingerprint-id') ||
      str.includes('request-id') ||
      str.includes('37857') ||
      str.includes('7070') ||
      str.includes('7071')
    ) {
      return;
    }
    origError.apply(console, args);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
