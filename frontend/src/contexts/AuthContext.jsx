import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext(null);

// Backend gui vai trong truong "scope" cua JWT, khong gui kem trong user.
export function roleFromToken() {
  try {
    const token = localStorage.getItem('token');
    return JSON.parse(atob(token.split('.')[1])).scope || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(roleFromToken);

  const fetchAndStoreProfile = async () => {
    const res = await userService.getProfile();
    const userData = res.data?.result;
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    setRole(roleFromToken());
    return userData;
  };

  const login = async (phoneNumber, password) => {
    setLoading(true);
    try {
      const res = await authService.login(phoneNumber, password);
      const data = res.data;
      const token = data.result?.token || data.token;

      if (token) localStorage.setItem('token', token);
      await fetchAndStoreProfile();
      return data;
    } finally {
      setLoading(false);
    }
  };

  const isStaff = ['STAFF', 'MANAGER', 'ADMIN'].includes(role);
  const isAdmin = role === 'ADMIN';

  const register = async (data) => {
    return await authService.register(data);
  };

  const updateUser = (data) => {
    setUser((prev) => {
      const merged = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user?.userId) {
      fetchAndStoreProfile().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, isStaff, isAdmin, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
