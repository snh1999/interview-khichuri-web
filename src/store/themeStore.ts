import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import type {
  TThemeMode,
  TThemePreset,
} from "@/components/theme/themes.types.ts";
import { STORAGE_CURRENT_KEY } from "@/components/theme/themes.types.ts";
import { injectThemeVariables } from "@/lib/theme/theme-inject.ts";
import {
  BUILT_IN_ACCENTS,
  BUILT_IN_BASES,
  BUILT_IN_PRESETS,
} from "@/lib/theme/theme-preset.ts";
import { getSystemTheme } from "@/lib/utils.ts";

const ACCENT_KEYS = new Set([
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--accent",
  "--accent-foreground",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
]);

const getCompositeId = (baseId: string, accentId: string | null): string =>
  accentId ? `${baseId}+${accentId}` : baseId;

const [DEFAULT_BASE] = BUILT_IN_BASES;

const mergeVars = (
  base: TThemePreset,
  accent?: TThemePreset | null
): { light: Record<string, string>; dark: Record<string, string> } => {
  if (!accent) {
    return { light: { ...base.light }, dark: { ...base.dark } };
  }
  const light: Record<string, string> = { ...base.light };
  const dark: Record<string, string> = { ...base.dark };
  for (const key of ACCENT_KEYS) {
    if (key in accent.light) {
      light[key] = accent.light[key];
    }
    if (key in accent.dark) {
      dark[key] = accent.dark[key];
    }
  }
  return { light, dark };
};

export interface IThemeCustomizerHandle {
  theme: TThemeMode;
  setTheme: (theme: TThemeMode) => void;

  light: Record<string, string>;
  dark: Record<string, string>;
  radius: string;
  activeBaseId: string;
  activeAccentId: string | null;
  activePresetId: string | null;
  isDirty: boolean;
  builtInPresets: TThemePreset[];
  userPresets: TThemePreset[];

  updateLightVar: (variableName: string, oklchString: string) => void;
  updateDarkVar: (variableName: string, oklchString: string) => void;
  updateRadius: (radius: string) => void;

  setBasePreset: (presetId: string) => void;
  setAccentPreset: (presetId: string | null) => void;

  loadPreset: (preset: TThemePreset) => void;
  saveCurrentAsPreset: (name: string) => TThemePreset;
  deleteUserPreset: (id: string) => void;
  renameUserPreset: (id: string, name: string) => void;
  revertToPreset: () => void;

  exportPresets: () => void;
  importPresets: (file: File) => Promise<void>;
}

interface IPersistedState {
  theme: TThemeMode;
  light: Record<string, string>;
  dark: Record<string, string>;
  radius: string;
  activeBaseId: string;
  activeAccentId: string | null;
  activePresetId: string | null;
  userPresets: TThemePreset[];
}

const INITIAL_BASE = DEFAULT_BASE;

export const useThemeStore = create<IThemeCustomizerHandle>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        theme: getSystemTheme(),
        light: { ...INITIAL_BASE.light },
        dark: { ...INITIAL_BASE.dark },
        radius: INITIAL_BASE.radius,
        activeBaseId: INITIAL_BASE.id,
        activeAccentId: null,
        activePresetId: INITIAL_BASE.id,
        isDirty: false,
        builtInPresets: BUILT_IN_PRESETS,
        userPresets: [] as TThemePreset[],

        setTheme: (theme) => set({ theme }),

        setBasePreset: (presetId) => {
          const base = BUILT_IN_BASES.find((b) => b.id === presetId);
          if (!base) {
            return;
          }
          const { activeAccentId } = get();
          const accent = activeAccentId
            ? BUILT_IN_ACCENTS.find((a) => a.id === activeAccentId)
            : null;

          const { light, dark } = mergeVars(base, accent);

          set({
            activeBaseId: presetId,
            light,
            dark,
            radius: accent?.radius ?? base.radius,
            activePresetId: getCompositeId(presetId, activeAccentId),
            isDirty: false,
          });
        },

        setAccentPreset: (presetId) => {
          const { activeBaseId } = get();
          const base = BUILT_IN_BASES.find((b) => b.id === activeBaseId);
          if (!base) {
            return;
          }
          const accent = presetId
            ? BUILT_IN_ACCENTS.find((a) => a.id === presetId)
            : null;

          const { light, dark } = mergeVars(base, accent);

          set({
            activeAccentId: presetId,
            light,
            dark,
            radius: accent?.radius ?? base.radius,
            activePresetId: getCompositeId(activeBaseId, presetId),
            isDirty: false,
          });
        },

        updateLightVar: (variableName, oklchString) =>
          set((state) => ({
            light: { ...state.light, [variableName]: oklchString },
            isDirty: true,
          })),

        updateDarkVar: (variableName, oklchString) =>
          set((state) => ({
            dark: { ...state.dark, [variableName]: oklchString },
            isDirty: true,
          })),

        updateRadius: (radius) => set({ radius, isDirty: true }),

        loadPreset: (preset) => {
          const base = BUILT_IN_BASES.find((b) => b.id === preset.id);
          const accent = BUILT_IN_ACCENTS.find((a) => a.id === preset.id);
          if (accent) {
            set({
              light: { ...preset.light },
              dark: { ...preset.dark },
              radius: preset.radius,
              activeBaseId: "builtin-zinc",
              activeAccentId: accent.id,
              activePresetId: getCompositeId("builtin-zinc", accent.id),
              isDirty: false,
            });
          } else if (base) {
            const currentAccentId = get().activeAccentId;
            const accentVar = currentAccentId
              ? BUILT_IN_ACCENTS.find((a) => a.id === currentAccentId)
              : null;
            const { light, dark } = mergeVars(base, accentVar);
            set({
              light,
              dark,
              radius: accentVar?.radius ?? base.radius,
              activeBaseId: base.id,
              activeAccentId: currentAccentId,
              activePresetId: getCompositeId(base.id, currentAccentId),
              isDirty: false,
            });
          } else {
            // user preset
            set({
              light: { ...preset.light },
              dark: { ...preset.dark },
              radius: preset.radius,
              activePresetId: preset.id,
              isDirty: false,
            });
          }
        },

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
          const { activeBaseId, activeAccentId, userPresets, activePresetId } =
            get();

          // User preset revert, load from stored snapshot
          if (
            activePresetId &&
            userPresets.some((p) => p.id === activePresetId)
          ) {
            const preset = userPresets.find((p) => p.id === activePresetId);
            if (!preset) {
              return;
            }
            set({
              light: { ...preset.light },
              dark: { ...preset.dark },
              radius: preset.radius,
              isDirty: false,
            });
            return;
          }

          // Built-in revert, recompute from base + accent
          const base = BUILT_IN_BASES.find((b) => b.id === activeBaseId);
          if (!base) {
            return;
          }
          const accent = activeAccentId
            ? BUILT_IN_ACCENTS.find((a) => a.id === activeAccentId)
            : null;
          const { light, dark } = mergeVars(base, accent);

          set({
            light,
            dark,
            radius: accent?.radius ?? base.radius,
            isDirty: false,
            activePresetId: getCompositeId(activeBaseId, activeAccentId),
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
            const existingIds = new Set(state.userPresets.map((p) => p.id));
            const incoming = parsed.filter((p) => !existingIds.has(p.id));
            return { userPresets: [...state.userPresets, ...incoming] };
          });
        },
      }),
      {
        name: STORAGE_CURRENT_KEY,
        version: 1,
        partialize: (state): IPersistedState => ({
          light: state.light,
          dark: state.dark,
          radius: state.radius,
          activeBaseId: state.activeBaseId,
          activeAccentId: state.activeAccentId,
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
  ([light, dark, radius]) => {
    injectThemeVariables({ light, dark, radius });
  },
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
