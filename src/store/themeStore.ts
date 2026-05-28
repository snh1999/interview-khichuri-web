/* eslint-disable @typescript-eslint/strict-void-return */
import { shallow } from "zustand/shallow";
import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { BUILT_IN_PRESETS } from "@/lib/theme/theme-preset.ts";
import { injectThemeVariables } from "@/lib/theme/theme-inject.ts";
import { STORAGE_CURRENT_KEY } from "@/components/theme/themes.types.ts";
import { getSystemTheme } from "@/lib/utils.ts";
import type {
  TThemeMode,
  TThemePreset,
} from "@/components/theme/themes.types.ts";

export type ThemeCustomizerHandle = {
  theme: TThemeMode;
  setTheme: (theme: TThemeMode) => void;

  light: Record<string, string>;
  dark: Record<string, string>;
  radius: string;
  activePresetId: string | null;
  isDirty: boolean;
  builtInPresets: TThemePreset[];
  userPresets: TThemePreset[];

  updateLightVar: (variableName: string, oklchString: string) => void;
  updateDarkVar: (variableName: string, oklchString: string) => void;
  updateRadius: (radius: string) => void;

  loadPreset: (preset: TThemePreset) => void;
  saveCurrentAsPreset: (name: string) => TThemePreset;
  deleteUserPreset: (id: string) => void;
  renameUserPreset: (id: string, name: string) => void;
  revertToPreset: () => void;

  exportPresets: () => void;
  importPresets: (file: File) => Promise<void>;
};

type PersistedState = {
  theme: TThemeMode;
  light: Record<string, string>;
  dark: Record<string, string>;
  radius: string;
  activePresetId: string | null;
  userPresets: TThemePreset[];
};

const [DEFAULT] = BUILT_IN_PRESETS;

export const useThemeStore = create<ThemeCustomizerHandle>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        theme: getSystemTheme(),
        light: { ...DEFAULT.light },
        dark: { ...DEFAULT.dark },
        radius: DEFAULT.radius,
        activePresetId: DEFAULT.id,
        isDirty: false,
        builtInPresets: BUILT_IN_PRESETS,
        userPresets: [] as TThemePreset[],

        setTheme: (theme) => set({ theme }),
        updateLightVar: (variableName, oklchString) =>
          set((state) => ({
            light: { ...state.light, [variableName]: oklchString },
            isDirty: true,
            activePresetId: null,
          })),

        updateDarkVar: (variableName, oklchString) =>
          set((state) => ({
            dark: { ...state.dark, [variableName]: oklchString },
            isDirty: true,
            activePresetId: null,
          })),

        updateRadius: (radius) =>
          set({ radius, isDirty: true, activePresetId: null }),

        loadPreset: (preset) =>
          set({
            light: { ...preset.light },
            dark: { ...preset.dark },
            radius: preset.radius,
            activePresetId: preset.id,
            isDirty: false,
          }),

        saveCurrentAsPreset: (name) => {
          const { light, dark, radius } = get();
          const preset: TThemePreset = {
            name,
            radius,
            id: crypto.randomUUID(),
            light: { ...light },
            dark: { ...dark },
            builtIn: false,
            createdAt: Date.now(),
          };
          set((state) => ({
            userPresets: [...state.userPresets, preset],
            activePresetId: preset.id,
            isDirty: false,
          }));
          return preset;
        },

        deleteUserPreset: (id) =>
          set((state) => ({
            userPresets: state.userPresets.filter((preset) => preset.id !== id),
            activePresetId:
              state.activePresetId === id ? null : state.activePresetId,
          })),

        renameUserPreset: (id, name) =>
          set((state) => ({
            userPresets: state.userPresets.map((preset) =>
              preset.id === id ? { ...preset, name } : preset
            ),
          })),

        revertToPreset: () => {
          const { activePresetId, builtInPresets, userPresets } = get();
          if (!activePresetId) return;
          const preset = [...builtInPresets, ...userPresets].find(
            (oldPreset) => oldPreset.id === activePresetId
          );
          if (!preset) return;
          set({
            light: { ...preset.light },
            dark: { ...preset.dark },
            radius: preset.radius,
            isDirty: false,
          });
        },

        exportPresets: () => {
          const { userPresets } = get();
          const blob = new Blob([JSON.stringify(userPresets, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const aElement = document.createElement("a");
          aElement.href = url;
          aElement.download = "khichuri-themes.json";
          aElement.click();
          URL.revokeObjectURL(url);
        },

        importPresets: async (file) => {
          const text = await file.text();
          const parsed = JSON.parse(text) as TThemePreset[];
          if (!Array.isArray(parsed)) {
            throw new TypeError("Invalid theme file format");
          }
          set((state) => {
            const existingIds = new Set(
              state.userPresets.map((preset) => preset.id)
            );
            const incoming = parsed.filter(
              (preset) => !existingIds.has(preset.id)
            );
            return { userPresets: [...state.userPresets, ...incoming] };
          });
        },
      }),
      {
        name: STORAGE_CURRENT_KEY,
        partialize: (state): PersistedState => ({
          light: state.light,
          dark: state.dark,
          radius: state.radius,
          activePresetId: state.activePresetId,
          userPresets: state.userPresets,
          theme: state.theme,
        }),
      }
    )
  )
);

// without shallow, would trigger unnecessary changes on each array
useThemeStore.subscribe(
  (state) => [state.light, state.dark, state.radius] as const,
  ([light, dark, radius]) => injectThemeVariables({ light, dark, radius }),
  { equalityFn: shallow }
);

useThemeStore.subscribe(
  (state) => state.theme,
  (theme) => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(resolved);
  },
  { fireImmediately: true }
);
