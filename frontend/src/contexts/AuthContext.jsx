import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (phoneNumber, password) => {
    const res = await authService.login(phoneNumber, password);
    const data = res.data;
    const token = data.result?.token || data.token;
    const userData = data.result?.user || data.user || data.result;

    if (token) localStorage.setItem('token', token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    return data;
  };

  // supports both role: "STAFF" and roles: ["STAFF"] shapes from backend
  const role = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : null) || null;
  const isStaff = ['STAFF', 'MANAGER', 'ADMIN'].includes(role);

  const register = async (data) => {
    return await authService.register(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, isStaff, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
