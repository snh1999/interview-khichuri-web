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

interface IAppState {
  avatar: TAvatarVariant;
  pageHeader: string | null;
  setAvatar: (avatar: TAvatarVariant) => void;
  setPageHeader: (pageHeader: string | null) => void;
}

export const useAppStore = create<IAppState>()(
  persist(
    (set) => ({
      avatar: "beam",
      pageHeader: null,
      setAvatar: (avatar) => set({ avatar }),
      setPageHeader: (pageHeader) => set({ pageHeader }),
    }),
    {
      name: "app-store",
      partialize: (state) => ({ avatar: state.avatar }),
    }
  )
);
