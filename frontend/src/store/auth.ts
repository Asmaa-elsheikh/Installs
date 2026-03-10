import { create } from 'zustand';
import type { User } from '../types';
import api from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (business_name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  setUser: (user) => set({ user }),
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user });
  },
  signup: async (business_name, email, password) => {
    const { data } = await api.post('/auth/signup', { business_name, email, password });
    localStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
  loadMe: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null });
    } finally {
      set({ loading: false });
    }
  },
}));
