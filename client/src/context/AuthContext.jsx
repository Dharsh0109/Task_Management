import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || '');
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed', error);
    }

    localStorage.removeItem('accessToken');
    setAccessToken('');
    setUser(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
        setAccessToken('');
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [accessToken]);

  const value = useMemo(() => ({
    user,
    accessToken,
    setUser,
    setAccessToken,
    logout,
    loading,
  }), [user, accessToken, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
