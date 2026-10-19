import { cn } from "cn";
import type { IJob } from "@/api/jobs";
import { useProfile } from "@/api/profile/profiles";
import { FitCircle } from "@/components/jobs/FitCircle.tsx";
import {
  getScoreTone,
  SCORE_TEXT_CLASS,
} from "@/components/resume/resume.helpers";
import { Card, CardContent } from "@/components/ui/card.tsx";
import type {
  IScoreDimension,
  TDeterministicScore,
} from "@/lib/deterministic-score.ts";
import { profileFacts, scoreJob } from "@/lib/deterministic-score.ts";

const GROUPS: ReadonlyArray<{ title: string; keys: readonly string[] }> = [
  { keys: ["skills"], title: "Skills" },
  { keys: ["seniority"], title: "Seniority" },
  { keys: ["workType", "location"], title: "Work type" },
  { keys: ["role"], title: "Others" },
];

const groupScore = (
  sections: IScoreDimension[],
  keys: readonly string[]
): { score: number | null } => {
  const members = sections.filter(
    (section) => keys.includes(section.key) && section.score !== null
  );
  const weightSum = members.reduce((sum, section) => sum + section.weight, 0);
  const score =
    weightSum > 0
      ? Math.round(
          members.reduce(
            (sum, section) => sum + (section.score ?? 0) * section.weight,
            0
          ) / weightSum
        )
      : null;
  return {
    score,
  };
};

const FitScoreCard = ({
  score,
  title,
  unavailableMessage,
}: Readonly<{
  score: TDeterministicScore | null;
  title: string;
  unavailableMessage: string;
}>) => {
  const cards = score
    ? GROUPS.map((group) => ({
        title: group.title,
        ...groupScore(score.sections, group.keys),
      }))
    : [];

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 text-center sm:flex-row">
        <div className="flex flex-col gap-1 sm:basis-1/3">
          <span className="flex items-center justify-center gap-4">
            <span className="font-medium text-sm">{title}</span>
            {score ? <FitCircle score={score.overall} /> : null}
          </span>
          {score ? (
            <span
              className={cn(
                "font-semibold text-4xl",
                SCORE_TEXT_CLASS[getScoreTone(score.overall)]
              )}
            >
              {score.overall}%
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              {unavailableMessage}
            </span>
          )}
        </div>

        {score ? (
          <div className="grid grid-cols-2 gap-2 sm:flex-1 sm:grid-cols-4">
            {cards.map((card) => (
              <div
                className="flex flex-col gap-1 rounded-lg border bg-muted/60 p-2"
                key={card.title}
              >
                <span className="text-muted-foreground text-xs">
                  {card.title}
                </span>
                <span className="font-medium text-lg">
                  {card.score === null ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <>
                      {card.score}{" "}
                      <span className="text-muted-foreground text-xs">%</span>
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export const JobFitScore = ({ job }: Readonly<{ job: IJob }>) => {
  const { data: profile } = useProfile();

  const profileScore = scoreJob(profileFacts(profile), job);

  return (
    <div className="flex flex-col gap-4">
      <FitScoreCard
        score={profileScore.hasSignal ? profileScore : null}
        title="Profile fit"
        unavailableMessage="Not enough profile/job data to score."
      />
      <p className="text-muted-foreground text-xs">
        Heuristic estimate from the job title, skills and your profile. Not an
        AI review.
      </p>
    </div>
  );
};
