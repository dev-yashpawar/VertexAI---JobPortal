import { create } from 'zustand';
import api from '../lib/api';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notifications');
      set({ 
        notifications: data, 
        unreadCount: data.filter(n => !n.isRead).length,
        loading: false 
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      const { notifications } = get();
      const updated = notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      );
      set({ 
        notifications: updated, 
        unreadCount: updated.filter(n => !n.isRead).length 
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      const { notifications } = get();
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      set({ 
        notifications: updated, 
        unreadCount: 0 
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const { notifications } = get();
      const updated = notifications.filter(n => n._id !== id);
      set({ 
        notifications: updated, 
        unreadCount: updated.filter(n => !n.isRead).length 
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }
}));

export default useNotificationStore;
