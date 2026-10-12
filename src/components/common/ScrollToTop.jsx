import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Ensures that whenever any route, query parameter, or hash changes
 * (including clicking any footer link, category, or page navigation),
 * the window instantly resets and opens directly at the top.
 */
export const ScrollToTop = () => {
  const location = useLocation();

  const resetScroll = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
    const root = document.getElementById('root');
    if (root) {
      root.scrollTop = 0;
    }
  };

  // Prevent browser's native scroll restoration from restoring bottom position on route change
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Instant scroll before browser paint
  useLayoutEffect(() => {
    resetScroll();
  }, [location.pathname, location.search, location.hash, location.key]);

  // Guaranteed scroll after paint, requestAnimationFrame, and progressive timeouts to beat async data/images
  useEffect(() => {
    resetScroll();
    const rafId = requestAnimationFrame(resetScroll);
    const timer1 = setTimeout(resetScroll, 10);
    const timer2 = setTimeout(resetScroll, 50);
    const timer3 = setTimeout(resetScroll, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search, location.hash, location.key]);

  return null;
};

export default ScrollToTop;
