import { create } from 'zustand';

const STORAGE_KEY = 'hyperone_customer_token';
const PROFILE_KEY = 'hyperone_customer_data';

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem(STORAGE_KEY) || null,
  customer: (() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch { return null; }
  })(),

  setAuth: (token, customer) => {
    localStorage.setItem(STORAGE_KEY, token);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(customer));
    set({ token, customer });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
    set({ token: null, customer: null });
  },

  isAuthenticated: () => !!get().token,
}));

export default useAuthStore;
