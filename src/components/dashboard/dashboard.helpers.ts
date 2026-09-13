import type { ScorePoint } from "@/types/dashboard";

export const RECENT_ITEMS_COUNT = 4;
export const RECENT_NOTES_COUNT = 5;
export const NOTES_FETCH_LIMIT = 10;
export const UPCOMING_SOON_DAYS = 7;
export const INTERVIEWS_WEEK_DAYS = 7;

export const buildScoreHistory = (
  interviews: {
    completedAt?: string | null;
    createdAt: string;
    overallScore?: number | null;
  }[]
): ScorePoint[] => {
  const points: ScorePoint[] = [];
  for (const interview of interviews) {
    if (
      interview.overallScore !== null &&
      interview.overallScore !== undefined
    ) {
      points.push({
        label: new Date(
          interview.completedAt ?? interview.createdAt
        ).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        score: interview.overallScore,
      });
    }
  }
  return points;
};

export const avgScore = (points: ScorePoint[]): number =>
  points.length
    ? Math.round(
        points.reduce((total, point) => total + point.score, 0) / points.length
      )
    : 0;
