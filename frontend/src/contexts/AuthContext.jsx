import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

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
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(roleFromToken);

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
    setRole(roleFromToken());
    return data;
  };

  const isStaff = ['STAFF', 'MANAGER', 'ADMIN'].includes(role);
  const isAdmin = role === 'ADMIN';

  const register = async (data) => {
    return await authService.register(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, isStaff, isAdmin, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
