import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isHydrating: boolean;

  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isHydrating: true,

  hydrate: async () => {
    try {
      set({ isHydrating: true });

      const token = await AsyncStorage.getItem("@barbermob:token");
      const userStr = await AsyncStorage.getItem("@barbermob:user");

      const user = userStr ? (JSON.parse(userStr) as User) : null;

      set({ token, user, isHydrating: false });
    } catch (e) {
      // se der erro, não quebra o app
      set({ token: null, user: null, isHydrating: false });
    }
  },

  setAuth: async (user, token) => {
    const tokenStr = String(token);

    await AsyncStorage.setItem("@barbermob:token", tokenStr);
    await AsyncStorage.setItem("@barbermob:user", JSON.stringify(user));

    set({ user, token: tokenStr });
  },

  clearAuth: async () => {
    await AsyncStorage.removeItem("@barbermob:token");
    await AsyncStorage.removeItem("@barbermob:user");
    set({ user: null, token: null });
  },
}));