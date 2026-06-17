import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IState {
  lastSentAt: number | null;
  markSent: () => void;
}

export const useResendStore = create<IState>()(
  persist(
    (set) => ({
      lastSentAt: null,
      markSent: () => {
        set({ lastSentAt: Date.now() });
      },
    }),
    { name: "email-resend-timestamp" }
  )
);
