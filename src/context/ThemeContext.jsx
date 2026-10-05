import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

const applyThemeToDOM = (themeMode) => {
  const isDark = themeMode === 'dark';
  const root = document.documentElement;
  const body = document.body;

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
    if (body) {
      body.classList.add('dark');
      body.setAttribute('data-theme', 'dark');
    }
  } else {
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
    root.style.colorScheme = 'light';
    if (body) {
      body.classList.remove('dark');
      body.removeAttribute('data-theme');
    }
  }

  try {
    localStorage.setItem('shoply_theme', themeMode);
    localStorage.setItem('velora_theme', themeMode);
  } catch {
    // ignore local storage restrictions
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem('shoply_theme') || localStorage.getItem('velora_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Apply immediately on mount and on every theme change
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Keep all open tabs synchronized if theme changes in another window/tab
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'shoply_theme' || e.key === 'velora_theme') {
        const val = e.newValue;
        if (val === 'dark' || val === 'light') {
          setTheme(val);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyThemeToDOM(next);
      return next;
    });
  }, []);

  const setThemeMode = useCallback((mode) => {
    if (mode === 'dark' || mode === 'light') {
      applyThemeToDOM(mode);
      setTheme(mode);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
