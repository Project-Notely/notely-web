import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      set => ({
        user: null,
        isAuthenticated: false,

        login: (user: User) => {
          set({
            user,
            isAuthenticated: true,
          });
        },

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
          });
        },

        setUser: (user: User) => {
          set({
            user,
            isAuthenticated: true,
          });
        },
      }),
      {
        name: "auth-storage",
        partialize: state => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: "AuthStore" }
  )
);
