import { create } from 'zustand';

const useAssistantStore = create((set, get) => ({
  historyByRole: {
    student: null,
    recruiter: null,
  },
  setHistory: (role, messages) =>
    set((state) => ({
      historyByRole: {
        ...state.historyByRole,
        [role]: Array.isArray(messages) ? messages : [],
      },
    })),
  appendMessage: (role, message) =>
    set((state) => {
      const current = state.historyByRole?.[role] || [];
      return {
        historyByRole: {
          ...state.historyByRole,
          [role]: [...current, message].slice(-30),
        },
      };
    }),
  getHistory: (role) => get().historyByRole?.[role] || null,
  clearAll: () =>
    set({
      historyByRole: { student: null, recruiter: null },
    }),
}));

export default useAssistantStore;
