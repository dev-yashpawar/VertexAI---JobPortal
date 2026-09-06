import { create } from 'zustand';

const LEGACY_AUTH_KEYS = ['user', 'token'];

const clearLegacyAuthStorage = () => {
  LEGACY_AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
};

const getSessionUser = () => {
  const storedUser = sessionStorage.getItem('user');
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    sessionStorage.removeItem('user');
    return null;
  }
};

clearLegacyAuthStorage();

const useAuthStore = create((set) => ({
  user: getSessionUser(),
  isAuthenticated: !!sessionStorage.getItem('token'),
  token: sessionStorage.getItem('token') || null,
  
  login: (userData, token) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    set({ user: userData, isAuthenticated: true, token });
  },
  
  logout: () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, token: null });
  },
  
  updateUser: (data) => {
    set((state) => {
      const updatedUser = { ...state.user, ...data };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  }
}));

export default useAuthStore;
