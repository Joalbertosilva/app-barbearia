import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ProfileState = {
  avatarUri: string | null;
  setAvatarUri: (uri: string | null) => void;
  clearAvatar: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      avatarUri: null,
      setAvatarUri: (uri) => set({ avatarUri: uri }),
      clearAvatar: () => set({ avatarUri: null }),
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);