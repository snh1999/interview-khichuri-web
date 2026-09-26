import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TApiKeyProvider } from "@/api/keys";

export type TAvatarVariant =
  | "marble"
  | "pixel"
  | "bauhaus"
  | "ring"
  | "beam"
  | "sunset"
  | "geometric"
  | "abstract";

export interface IDefaultAiProvider {
  provider: TApiKeyProvider;
  model?: string | null;
}

interface IAppState {
  avatar: TAvatarVariant;
  pageHeader: string | null;
  defaultAiProvider: IDefaultAiProvider | null;
  skipAiDialog: boolean;
  userId: string | null;
  setAvatar: (avatar: TAvatarVariant) => void;
  setPageHeader: (pageHeader: string | null) => void;
  setDefaultAiProvider: (defaultAiProvider: IDefaultAiProvider | null) => void;
  setSkipAiDialog: (skipAiDialog: boolean) => void;
  setUserId: (userId: string | null) => void;
}

export const useAppStore = create<IAppState>()(
  persist(
    (set) => ({
      avatar: "beam",
      pageHeader: null,
      defaultAiProvider: null,
      skipAiDialog: false,
      userId: null,
      setAvatar: (avatar) => set({ avatar }),
      setPageHeader: (pageHeader) => set({ pageHeader }),
      setDefaultAiProvider: (defaultAiProvider) => set({ defaultAiProvider }),
      setSkipAiDialog: (skipAiDialog) => set({ skipAiDialog }),
      setUserId: (userId) => set({ userId }),
    }),
    {
      name: "app-store",
      // `useLocalDataOnLogin` is the app's only hydration entry point, so that  the stored values of whoever is logging in land before the tree mounts.
      skipHydration: true,
      partialize: (state) => ({
        avatar: state.avatar,
        defaultAiProvider: state.defaultAiProvider,
        skipAiDialog: state.skipAiDialog,
        userId: state.userId,
      }),
    }
  )
);
