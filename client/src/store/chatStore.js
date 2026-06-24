import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  messages: [],
  profile: null,
  recommendations: null,
  sessionId: null,
  phase: 'greeting',
  isStreaming: false,
  startTime: null,

  setSessionId: (id) => set({ sessionId: id }),

  addMessage: (message) =>
    set(state => ({ messages: [...state.messages, message] })),

  updateLastMessage: (content) =>
    set(state => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = { ...messages[messages.length - 1], content };
      }
      return { messages };
    }),

  setProfile: (profile) => set({ profile }),

  setRecommendations: (recommendations) => set({ recommendations }),

  setPhase: (phase) => set({ phase }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  startTimer: () => set({ startTime: Date.now() }),

  getElapsedTime: () => {
    const { startTime } = get();
    if (!startTime) return null;
    return Math.round((Date.now() - startTime) / 1000);
  },

  reset: () => set({
    messages: [],
    profile: null,
    recommendations: null,
    sessionId: null,
    phase: 'greeting',
    isStreaming: false,
    startTime: null,
  }),
}));

export default useChatStore;
