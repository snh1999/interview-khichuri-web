import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface IInterviewPanes {
  camera: boolean;
  avatar: boolean;
  chat: boolean;
}

interface IInterviewStore {
  panes: IInterviewPanes;
  toggleCamera: () => void;
  toggleAvatar: () => void;
  toggleChat: () => void;
}

const DEFAULT_PANES: IInterviewPanes = {
  camera: true,
  avatar: true,
  chat: true,
};

export const useInterviewStore = create<IInterviewStore>()(
  persist(
    (set) => ({
      panes: { ...DEFAULT_PANES },

      toggleCamera: () =>
        set((state) => ({
          panes: { ...state.panes, camera: !state.panes.camera },
        })),

      toggleAvatar: () =>
        set((state) => {
          const avatar = !state.panes.avatar;
          return {
            panes: {
              ...state.panes,
              avatar,
              chat: avatar ? state.panes.chat : true,
            },
          };
        }),

      toggleChat: () =>
        set((state) => {
          const chat = !state.panes.chat;
          return {
            panes: {
              ...state.panes,
              chat,
              avatar: chat ? state.panes.avatar : true,
            },
          };
        }),
    }),
    { name: "interview-panes", version: 1 }
  )
);
