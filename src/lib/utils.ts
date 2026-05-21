// eslint-disable-next-line unicorn/prevent-abbreviations
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,func-style,sonarjs/declarations-in-global-scope
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
