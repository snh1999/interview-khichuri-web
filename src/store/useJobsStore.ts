import { create } from "zustand";
import type { TJobStatus } from "@/api/jobs";
import type {
  TDateFilterChange,
  TJobDatePresetKey,
  TJobDateTypeSelection,
} from "@/components/jobs/filters/jobDatePresets";

interface IJobDateFields {
  dateType: TJobDateTypeSelection;
  datePreset: TJobDatePresetKey | undefined;
  dateFrom: string | undefined;
  dateTo: string | undefined;
}

interface IJobFiltersState extends IJobDateFields {
  search: string;
  status: TJobStatus | undefined;
  setSearch: (search: string) => void;
  setStatus: (status: TJobStatus | undefined) => void;
  setDateChange: (change: TDateFilterChange | undefined) => void;
  resetAll: () => void;
}

const DATE_FIELDS_DEFAULT: IJobDateFields = {
  dateType: "all",
  datePreset: undefined,
  dateFrom: undefined,
  dateTo: undefined,
};

export const useJobsStore = create<IJobFiltersState>((set) => ({
  search: "",
  status: undefined,
  ...DATE_FIELDS_DEFAULT,

  setSearch: (search) => set({ search }),

  setStatus: (status) => set({ status }),

  setDateChange: (change) => {
    if (!change) {
      set(DATE_FIELDS_DEFAULT);
      return;
    }
    if (change.kind === "preset") {
      set({
        datePreset: change.key,
        dateFrom: undefined,
        dateTo: undefined,
        dateType: change.type,
      });
      return;
    }
    set({
      datePreset: undefined,
      dateFrom: change.from,
      dateTo: change.to,
      dateType: change.type,
    });
  },

  resetAll: () =>
    set({
      search: "",
      status: undefined,
      ...DATE_FIELDS_DEFAULT,
    }),
}));
