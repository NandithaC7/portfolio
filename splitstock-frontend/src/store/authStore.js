import { create } from "zustand";
import { persist } from "zustand/middleware";

import { auth as authApi, households as householdApi } from "../api/endpoints";
import { TOKEN_KEY, setUnauthorizedHandler } from "../api/client";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      households: [],
      currentHouseholdId: null,
      bootstrapped: false,

      isAuthenticated: () => Boolean(get().tokens?.access),

      currentHousehold: () => {
        const { households, currentHouseholdId } = get();
        return (
          households.find((h) => h.id === currentHouseholdId) ||
          households[0] ||
          null
        );
      },

      async login(credentials) {
        const data = await authApi.login(credentials);
        set({ user: data.user, tokens: data.tokens });
        await get().loadHouseholds();
        return data.user;
      },

      async register(payload) {
        const data = await authApi.register(payload);
        set({ user: data.user, tokens: data.tokens, households: [] });
        return data.user;
      },

      logout() {
        set({
          user: null,
          tokens: null,
          households: [],
          currentHouseholdId: null,
        });
      },

      async loadHouseholds() {
        const list = await householdApi.list();
        const { currentHouseholdId } = get();
        const stillValid = list.some((h) => h.id === currentHouseholdId);
        set({
          households: list,
          currentHouseholdId: stillValid
            ? currentHouseholdId
            : list[0]?.id ?? null,
        });
        return list;
      },

      setCurrentHousehold(id) {
        set({ currentHouseholdId: id });
      },

      async refreshUser() {
        const user = await authApi.me();
        set({ user });
        return user;
      },

      /** Restore the session on first paint: verify the token still works. */
      async bootstrap() {
        if (!get().tokens?.access) {
          set({ bootstrapped: true });
          return;
        }
        try {
          await get().refreshUser();
          await get().loadHouseholds();
        } catch {
          get().logout();
        } finally {
          set({ bootstrapped: true });
        }
      },
    }),
    {
      name: TOKEN_KEY,
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        currentHouseholdId: state.currentHouseholdId,
      }),
    }
  )
);

// A dead refresh token means the session is over — drop it rather than
// leaving the user staring at endless 401s.
setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
