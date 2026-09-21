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
  emerald: "text-signal-success",
  amber: "text-signal-warning",
  rose: "text-signal-danger",
};

export const SCORE_FILL_CLASS: Record<TScoreTone, string> = {
  emerald: "bg-signal-success",
  amber: "bg-signal-warning",
  rose: "bg-signal-danger",
};

export const SCORE_SUMMARY_CLASS: Record<TScoreTone, string> = {
  emerald:
    "border-signal-success/30 bg-signal-success/10 text-signal-success-foreground",
  amber:
    "border-signal-warning/30 bg-signal-warning/10 text-signal-warning-foreground",
  rose: "border-signal-danger/30 bg-signal-danger/10 text-signal-danger-foreground",
};

export const ITEM_TONE_CLASS: Record<TScoreItemTone, string> = {
  good: "border-signal-success/30 bg-signal-success/10 text-signal-success-foreground",
  bad: "border-signal-danger/30 bg-signal-danger/10 text-signal-danger-foreground",
  warn: "border-signal-warning/30 bg-signal-warning/10 text-signal-warning-foreground",
  info: "border-border bg-muted text-muted-foreground",
};
