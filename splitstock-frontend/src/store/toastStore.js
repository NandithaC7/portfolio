import { create } from "zustand";

let nextId = 1;

export const useToastStore = create((set, get) => ({
  toasts: [],

  push({ title, body, tone = "brick", ttl = 7000 }) {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, title, body, tone }] }));
    if (ttl) {
      setTimeout(() => get().dismiss(id), ttl);
    }
    return id;
  },

  dismiss(id) {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export const toast = {
  restock: (title, body) => useToastStore.getState().push({ title, body, tone: "brick" }),
  done: (title, body) => useToastStore.getState().push({ title, body, tone: "moss" }),
  info: (title, body) => useToastStore.getState().push({ title, body, tone: "yolk" }),
};
