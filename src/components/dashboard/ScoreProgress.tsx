import type { ScorePoint } from "@/components/dashboard/dashboard.helpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SPARKLINE_HEIGHT = 80;
const SPARKLINE_WIDTH = 280;
const SPARKLINE_Y_BASE = 70;
const SPARKLINE_Y_AMPLITUDE = 60;

const buildSparklinePoints = (scores: ScorePoint[]): string => {
  if (scores.length === 0) {
    return "";
  }
  const scoreValues = scores.map((s) => s.score);
  const max = Math.max(...scoreValues);
  const min = Math.min(...scoreValues);
  const range = max - min || 1;
  const stepX = SPARKLINE_WIDTH / Math.max(scores.length - 1, 1);

  return scores
    .map((s, i) => {
      const x = i * stepX;
      const y =
        SPARKLINE_Y_BASE - ((s.score - min) / range) * SPARKLINE_Y_AMPLITUDE;
      return `${x},${y}`;
    })
    .join(" ");
};

export const ScoreProgress = ({
  points,
}: Readonly<{ points: ScorePoint[] }>) => (
  <Card>
    <CardHeader>
      <CardTitle className="font-semibold text-md">Score progress</CardTitle>
    </CardHeader>
    <CardContent>
      {points.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No completed mock interviews yet.
        </p>
      ) : (
        <>
          <svg
            aria-label="Mock interview score trend"
            className="h-20 w-full"
            role="img"
            viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
          >
            <polyline
              className="fill-none stroke-emerald-500"
              points={buildSparklinePoints(points)}
              strokeWidth={2.5}
            />
          </svg>
          <p className="mt-2 font-mono text-muted-foreground text-xs">
            last {points.length} mock interviews
          </p>
        </>
      )}
    </CardContent>
  </Card>
);
