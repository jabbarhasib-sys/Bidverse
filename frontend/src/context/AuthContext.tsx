import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { User, AuthState } from '../types';

interface AuthCtx extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const API = import.meta.env.VITE_API_URL;

const stored = () => {
  const token = localStorage.getItem('bv_token');
  const user  = localStorage.getItem('bv_user');
  return { token, user: user ? JSON.parse(user) as User : null };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(stored);

  const persist = (token: string, user: User) => {
    localStorage.setItem('bv_token', token);
    localStorage.setItem('bv_user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setState({ token, user });
  };

  const login = async (email: string, password: string) => {
    const { data } = await axios.post(`${API}/api/auth/login`, { email, password });
    persist(data.token, data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await axios.post(`${API}/api/auth/register`, { name, email, password });
    persist(data.token, data.user);
  };

  const logout = () => {
    localStorage.removeItem('bv_token');
    localStorage.removeItem('bv_user');
    delete axios.defaults.headers.common['Authorization'];
    setState({ token: null, user: null });
  };

  // Restore token on mount
  if (state.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
  }

  return <Ctx.Provider value={{ ...state, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
};
