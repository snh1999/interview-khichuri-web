import type { IThemeVariables } from "@/components/theme/themes.types";
import { STORAGE_CURRENT_KEY } from "@/components/theme/themes.types";

const STYLE_TAG_ID = "khichuri-theme-override";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isValidTheme = (object: unknown): object is IThemeVariables => {
  if (!isPlainObject(object)) {
    return false;
  }
  if (!isPlainObject(object.light)) {
    return false;
  }
  if (!isPlainObject(object.dark)) {
    return false;
  }

  return typeof object.radius === "string";
};

const sanitizeVariableName = (key: string): string => {
  const withPrefix = key.startsWith("--") ? key : `--${key}`;
  return withPrefix.replaceAll(/[^\w-]/gu, "");
};

const sanitizeVariableValue = (value: unknown): string =>
  String(value).replaceAll(/[;{}]/gu, "");
export const injectThemeVariables = ({
  light,
  dark,
  radius,
}: IThemeVariables): void => {
  let element = document.querySelector(`#${STYLE_TAG_ID}`);
  if (!element) {
    element = document.createElement("style");
    element.id = STYLE_TAG_ID;
    document.head.append(element);
  }

  const buildBlock = (variables: Record<string, string>) =>
    Object.entries(variables)
      .map(
        ([key, value]) =>
          `  ${sanitizeVariableName(key)}: ${sanitizeVariableValue(value)};`
      )
      .join("\n");

  const lightVariables = buildBlock(light);
  const darkVariables = buildBlock(dark);

  // Appended after index.css link → same specificity, wins by cascade order
  element.textContent = `:root {\n${lightVariables}\n  --radius: ${sanitizeVariableValue(radius)};\n}\n.dark {\n${darkVariables}\n}`;
};

export const removeThemeOverride = (): void => {
  document.querySelector(`#${STYLE_TAG_ID}`)?.remove();
};

// Runs synchronously when this module is first imported — before React renders.
// Injects the last-used theme so that there is no flash on page load.
const initThemeOnLoad = (): void => {
  if (typeof document === "undefined") {
    return;
  }
  try {
    const rawTheme = localStorage.getItem(STORAGE_CURRENT_KEY);
    if (!rawTheme) {
      return;
    }
    const parsed: unknown = JSON.parse(rawTheme);

    if (!isPlainObject(parsed)) {
      return;
    }
    const state = parsed.state ?? parsed;
    if (isValidTheme(state)) {
      injectThemeVariables(state);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Theme init failed", error);
  }
};

initThemeOnLoad();
