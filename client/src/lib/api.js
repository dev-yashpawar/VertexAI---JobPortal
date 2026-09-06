import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

// Assuming server runs on 5000 in dev
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  config.headers.Pragma = 'no-cache';
  config.headers.Expires = '0';

  if ((config.method || 'get').toLowerCase() === 'get') {
    config.params = {
      ...(config.params || {}),
      _ts: Date.now(),
    };
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    // Optionally handle generic unauthorized logic (e.g. force logout)
    useAuthStore.getState().logout();
  }
  return Promise.reject(error);
});

export default api;
