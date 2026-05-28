export const STORAGE_CURRENT_KEY = "khichuri-theme";

export type TThemeMode = "dark" | "light" | "system";
export type TResolvedTheme = "dark" | "light";

export type TThemeVariables = {
  light: Record<string, string>;
  dark: Record<string, string>;
  radius: string;
};

export type TThemePreset = TThemeVariables & {
  id: string;
  name: string;
  builtIn: boolean;
  createdAt: number;
};
