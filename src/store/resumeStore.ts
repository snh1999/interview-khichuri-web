import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IResumeStore {
  showGenerateFromProfile: boolean;
  setShowGenerateFromProfile: (show: boolean) => void;
}

export const useResumeStore = create<IResumeStore>()(
  persist(
    (set) => ({
      showGenerateFromProfile: true,
      setShowGenerateFromProfile: (show) =>
        set({ showGenerateFromProfile: show }),
    }),
    { name: "resume-store" }
  )
);
