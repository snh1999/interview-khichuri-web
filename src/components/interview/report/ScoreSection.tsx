import type { IInterview } from "@/api/sessions/interviews.ts";

interface IScoreProps {
  label: string;
  value: number;
}

const ScoreBadge = ({ label, value }: IScoreProps) => (
  <div className="flex flex-col items-center gap-1 rounded-lg border p-3">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span className="gap-2 font-semibold text-xl">
      {value}
      <span className="ml-1 text-muted-foreground text-sm">%</span>
    </span>
  </div>
);

interface IProps {
  interview: IInterview;
}
export const ScoreSection = ({ interview }: IProps) => (
  <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
    <ScoreBadge label="Overall" value={interview.overallScore ?? 0} />
    <ScoreBadge label="Technical" value={interview.technicalScore ?? 0} />
    <ScoreBadge
      label="Communication"
      value={interview.communicationScore ?? 0}
    />
    <ScoreBadge
      label="Problem Solving"
      value={interview.problemSolvingScore ?? 0}
    />
    <ScoreBadge
      label="Leadership Fit"
      value={interview.leadershipFitScore ?? 0}
    />
  </div>
);
