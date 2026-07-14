import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "@/types";

interface AuthState {
  session: Session | null;
  /** True once the persisted state has rehydrated (avoids auth flicker/guards firing early). */
  hydrated: boolean;
  setSession: (session: Session) => void;
  clearSession: () => void;
  setActiveSchool: (schoolId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      hydrated: false,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
      setActiveSchool: (schoolId) =>
        set((state) =>
          state.session
            ? { session: { ...state.session, activeSchoolId: schoolId } }
            : state,
        ),
    }),
    {
      name: "fobs.auth",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
