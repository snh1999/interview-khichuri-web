// eslint-disable-next-line unicorn/prevent-abbreviations
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";
import type { TResolvedTheme } from "@/components/theme/themes.types.ts";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,func-style,sonarjs/declarations-in-global-scope
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const errorCast = error as {
      error?: { message?: string };
      message?: string;
    };
    return (
      errorCast.error?.message ?? errorCast.message ?? "Something went wrong"
    );
  }
  return "Something went wrong";
};

export const getSystemTheme = (): TResolvedTheme => {
  if (globalThis.matchMedia("(prefers-color-scheme: dark)").matches)
    return "dark";
  return "light";
};
