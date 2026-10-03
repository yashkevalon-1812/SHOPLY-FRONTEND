import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'shoply_token';
const USER_KEY = 'shoply_user';

// Helper to retrieve token with fallbacks across storage engines
const getStoredToken = () => {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('velora_token') ||
    sessionStorage.getItem('velora_token') ||
    null
  );
};

// Helper to retrieve user profile with fallbacks
const getStoredUser = () => {
  try {
    const raw =
      localStorage.getItem(USER_KEY) ||
      sessionStorage.getItem(USER_KEY) ||
      localStorage.getItem('velora_user') ||
      sessionStorage.getItem('velora_user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && parsed._id ? parsed : null;
  } catch {
    return null;
  }
};

// Helper to safely persist auth state to both localStorage and sessionStorage
const persistAuthState = (tokenVal, userVal) => {
  if (tokenVal && typeof tokenVal === 'string') {
    localStorage.setItem(TOKEN_KEY, tokenVal);
    sessionStorage.setItem(TOKEN_KEY, tokenVal);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('velora_token');
    sessionStorage.removeItem('velora_token');
  }

  if (userVal && typeof userVal === 'object' && userVal._id) {
    const serialized = JSON.stringify(userVal);
    localStorage.setItem(USER_KEY, serialized);
    sessionStorage.setItem(USER_KEY, serialized);
  } else {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem('velora_user');
    sessionStorage.removeItem('velora_user');
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken);
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  // Sync token changes to persistent storage
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('velora_token');
      sessionStorage.removeItem('velora_token');
    }
  }, [token]);

  // Sync user profile object to persistent storage
  useEffect(() => {
    if (user) {
      const serialized = JSON.stringify(user);
      localStorage.setItem(USER_KEY, serialized);
      sessionStorage.setItem(USER_KEY, serialized);
    } else {
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem('velora_user');
      sessionStorage.removeItem('velora_user');
    }
  }, [user]);

  // Verify and sync user profile on initial mount if token is present
  useEffect(() => {
    const fetchUser = async () => {
      const currentToken = getStoredToken();
      if (!currentToken || typeof currentToken !== 'string') {
        setUser(null);
        persistAuthState(null, null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/profile');
        if (data && typeof data === 'object' && data._id) {
          setUser(data);
          persistAuthState(currentToken, data);
        } else {
          throw new Error('Invalid user profile response');
        }
      } catch (error) {
        // ONLY log out if the backend explicitly rejected the token with 401 Unauthorized
        if (error.response && error.response.status === 401) {
          console.warn('Authentication token expired or rejected by server. Logging out.');
          setToken(null);
          setUser(null);
          persistAuthState(null, null);
        } else {
          // If the backend is stopped, restarting, or network is temporarily offline:
          // DO NOT log out if we already have a valid cached user.
          console.warn('Backend server currently unreachable. Retaining active session:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (!data || typeof data !== 'object' || !data.token || typeof data.token !== 'string') {
      throw new Error(
        (data && typeof data === 'object' && data.message) ||
        'Authentication failed. Invalid user data received from API server.'
      );
    }
    persistAuthState(data.token, data);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (!data || typeof data !== 'object' || !data.token || typeof data.token !== 'string') {
      throw new Error(
        (data && typeof data === 'object' && data.message) ||
        'Registration failed. Invalid response received from API server.'
      );
    }
    persistAuthState(data.token, data);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    persistAuthState(null, null);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      persistAuthState(token, merged);
      return merged;
    });
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const { data } = await api.get('/auth/profile');
      if (data && typeof data === 'object' && data._id) {
        setUser(data);
        persistAuthState(token, data);
      }
    } catch (e) {
      if (e.response && e.response.status === 401) {
        logout();
      }
    }
  };

  const isAuthenticated = Boolean(user && user._id && token);
  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';
  const isApprovedSeller = isSeller && user?.sellerStatus === 'active';
  const isPendingSeller = isSeller && user?.sellerStatus === 'pending';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated,
        isAdmin,
        isSeller,
        isApprovedSeller,
        isPendingSeller,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
