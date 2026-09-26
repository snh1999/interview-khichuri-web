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
  setAvatar: (avatar: TAvatarVariant) => void;
  setPageHeader: (pageHeader: string | null) => void;
  setDefaultAiProvider: (defaultAiProvider: IDefaultAiProvider | null) => void;
  setSkipAiDialog: (skipAiDialog: boolean) => void;
}

export const useAppStore = create<IAppState>()(
  persist(
    (set) => ({
      avatar: "beam",
      pageHeader: null,
      defaultAiProvider: null,
      skipAiDialog: false,
      setAvatar: (avatar) => set({ avatar }),
      setPageHeader: (pageHeader) => set({ pageHeader }),
      setDefaultAiProvider: (defaultAiProvider) => set({ defaultAiProvider }),
      setSkipAiDialog: (skipAiDialog) => set({ skipAiDialog }),
    }),
    {
      name: "app-store",
      partialize: (state) => ({
        avatar: state.avatar,
        defaultAiProvider: state.defaultAiProvider,
        skipAiDialog: state.skipAiDialog,
      }),
    }
  )
);
