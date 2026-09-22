import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TAvatarVariant =
  | "marble"
  | "pixel"
  | "bauhaus"
  | "ring"
  | "beam"
  | "sunset"
  | "geometric"
  | "abstract";

interface IAvatarState {
  avatar: TAvatarVariant;
  setAvatar: (avatar: TAvatarVariant) => void;
}

export const useAppStore = create<IAvatarState>()(
  persist(
    (set) => ({
      avatar: "beam",
      setAvatar: (avatar) => set({ avatar }),
    }),
    { name: "app-store" }
  )
);
