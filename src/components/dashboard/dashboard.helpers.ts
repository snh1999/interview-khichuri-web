import { URGENT_DAYS_THRESHOLD } from "@/app.constants";

export type UpcomingUrgency = "urgent" | "soon" | "later";

export const urgencyFor = (days: number): UpcomingUrgency => {
  if (days <= URGENT_DAYS_THRESHOLD) {
    return "urgent";
  }
  if (days <= UPCOMING_SOON_DAYS) {
    return "soon";
  }
  return "later";
};

export const RECENT_ITEMS_COUNT = 4;
export const RECENT_NOTES_COUNT = 5;
export const NOTES_FETCH_LIMIT = 10;
export const UPCOMING_SOON_DAYS = 7;
export const UPCOMING_MAX_ITEMS = 5;
export const INTERVIEWS_WEEK_DAYS = 7;

export const buildScoreHistory = (
  interviews: {
    completedAt?: string | null;
    createdAt: string;
    overallScore?: number | null;
  }[]
): IScorePoint[] => {
  const points: IScorePoint[] = [];
  for (const interview of interviews) {
    if (
      interview.overallScore !== null &&
      interview.overallScore !== undefined
    ) {
      const date = new Date(interview.completedAt ?? interview.createdAt);
      points.push({
        label: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        date: date.getTime(),
        score: interview.overallScore,
      });
    }
  }
  return points.sort((a, b) => a.date - b.date);
};

export const avgScore = (points: IScorePoint[]): number | null =>
  points.length
    ? Math.round(
        points.reduce((total, point) => total + point.score, 0) / points.length
      )
    : null;

export type ScoreTier = "success" | "warning" | "danger";

export const scoreTier = (score: number): ScoreTier => {
  if (score >= 80) {
    return "success";
  }
  if (score >= 60) {
    return "warning";
  }
  return "danger";
};

export const takeLatest = (
  points: IScorePoint[],
  count: number
): IScorePoint[] => points.slice(-count);

export interface IDashboardStats {
  activeJobs: number;
  interviewsThisWeek: number;
  avgMockScore: number | null;
  urgentDeadlines: number;
}

export interface IScorePoint {
  label: string;
  date: number;
  score: number;
}

export interface IUpcomingItem {
  id: string;
  label: string;
  href: string;
  daysAway: number;
  urgency: UpcomingUrgency;
}
