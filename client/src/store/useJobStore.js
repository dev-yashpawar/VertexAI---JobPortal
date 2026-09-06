import { create } from 'zustand';
import api from '../lib/api';

const useJobStore = create((set, get) => ({
  jobs: [],
  savedJobs: [],
  loading: false,
  error: null,

  fetchJobs: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/student/jobs');
      set({ jobs: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchSavedJobs: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/student/jobs/saved');
      set({ savedJobs: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  toggleSaveJob: async (jobId) => {
    try {
      const res = await api.post('/student/jobs/save', { jobId });
      if (res.data.saved) {
        set((state) => ({
          savedJobs: [...state.savedJobs, state.jobs.find(j => j._id === jobId)]
        }));
      } else {
        set((state) => ({
          savedJobs: state.savedJobs.filter(j => j._id !== jobId)
        }));
      }
      return res.data.saved;
    } catch (err) {
      console.error('Failed to toggle save job', err);
      throw err;
    }
  }
}));

export default useJobStore;
