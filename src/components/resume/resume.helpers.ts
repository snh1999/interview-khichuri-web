export type TScoreTone = "emerald" | "amber" | "rose";
export type TScoreItemTone = "good" | "bad" | "info" | "warn";

export const getScoreTone = (score: number): TScoreTone => {
  if (score >= 80) {
    return "emerald";
  }
  if (score >= 60) {
    return "amber";
  }
  return "rose";
};

export const SCORE_TEXT_CLASS: Record<TScoreTone, string> = {
  emerald: "text-emerald-500 dark:text-emerald-400",
  amber: "text-amber-500 dark:text-amber-400",
  rose: "text-rose-500 dark:text-rose-400",
};

export const SCORE_FILL_CLASS: Record<TScoreTone, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

export const SCORE_SUMMARY_CLASS: Record<TScoreTone, string> = {
  emerald:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  amber:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  rose: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export const ITEM_TONE_CLASS: Record<TScoreItemTone, string> = {
  good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  bad: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};
