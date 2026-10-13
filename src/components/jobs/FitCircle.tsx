import { cn } from "cn";
import {
  getScoreTone,
  SCORE_TEXT_CLASS,
  type TScoreTone,
} from "@/components/resume/resume.helpers.ts";
import { CircularProgress } from "@/components/ui/custom/CircularProgress.tsx";
import { gradeFrom } from "@/lib/deterministic-score.ts";

const TRACK_CLASS: Record<TScoreTone, string> = {
  emerald: "text-signal-success/10",
  amber: "text-signal-warning/10",
  rose: "text-signal-danger/10",
};

export const FitCircle = ({ score }: { score: number }) => {
  const tone = getScoreTone(score);
  const grade = gradeFrom(score);

  return (
    <CircularProgress
      className={cn("shrink-0", SCORE_TEXT_CLASS[tone])}
      labelClassName={cn("font-semibold text-[10px]", SCORE_TEXT_CLASS[tone])}
      progressBgClassName={TRACK_CLASS[tone]}
      progressClassName={SCORE_TEXT_CLASS[tone]}
      renderLabel={gradeFrom}
      showLabel
      size={30}
      strokeWidth={3}
      title={`Profile fit ${grade} (${score})`}
      value={score}
    />
  );
};
