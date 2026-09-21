import { PlusCircleIcon } from "@phosphor-icons/react";
import { cn } from "cn";
import { Link } from "react-router";
import { SESSIONS_PAGE } from "@/app.constants";
import type { IScorePoint } from "@/components/dashboard/dashboard.helpers";
import {
  type ScoreTier,
  scoreTier,
} from "@/components/dashboard/dashboard.helpers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SPARKLINE_HEIGHT = 80;
const SPARKLINE_WIDTH = 280;
const SPARKLINE_Y_BASE = 70;
const SPARKLINE_Y_AMPLITUDE = 60;
const SPARKLINE_LABEL_Y = SPARKLINE_HEIGHT - 2;

interface SparkPoint {
  x: number;
  y: number;
}

const TIER_STROKE_CLASS: Record<ScoreTier, string> = {
  success: "stroke-signal-success-foreground",
  warning: "stroke-signal-warning-foreground",
  danger: "stroke-signal-danger-foreground",
};

const TIER_FILL_CLASS: Record<ScoreTier, string> = {
  success: "fill-signal-success-foreground",
  warning: "fill-signal-warning-foreground",
  danger: "fill-signal-danger-foreground",
};

const TIER_TEXT_CLASS: Record<ScoreTier, string> = {
  success: "text-signal-success-foreground",
  warning: "text-signal-warning-foreground",
  danger: "text-signal-danger-foreground",
};

const buildSparklinePoints = (scores: IScorePoint[]): SparkPoint[] => {
  if (scores.length === 0) {
    return [];
  }
  const scoreValues = scores.map((s) => s.score);
  const max = Math.max(...scoreValues);
  const min = Math.min(...scoreValues);
  const range = max - min || 1;
  const stepX = SPARKLINE_WIDTH / Math.max(scores.length - 1, 1);

  return scores.map((s, i) => ({
    x: i * stepX,
    y: SPARKLINE_Y_BASE - ((s.score - min) / range) * SPARKLINE_Y_AMPLITUDE,
  }));
};

export const ScoreProgress = ({
  points,
}: Readonly<{ points: IScorePoint[] }>) => {
  const sparkPoints = buildSparklinePoints(points);
  const lastPoint = sparkPoints.at(-1);
  const lastScore = points.at(-1);
  const firstPoint = sparkPoints.length >= 2 ? points.at(0) : undefined;
  const lastLabeledPoint = sparkPoints.length >= 2 ? points.at(-1) : undefined;
  const tier: ScoreTier | null = lastScore ? scoreTier(lastScore.score) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold text-base">
          Score progress
        </CardTitle>
        {points.length === 0 ? (
          <CardAction>
            <Button
              nativeButton={false}
              render={<Link to={`${SESSIONS_PAGE}?start=1`} />}
              size="sm"
              variant="outline"
            >
              <PlusCircleIcon weight="bold" /> New session
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-1 flex-col",
          points.length === 0 && "justify-center"
        )}
      >
        {points.length === 0 ? (
          <Alert className="border-none text-center">
            <AlertTitle>No mock interviews yet</AlertTitle>
            <AlertDescription>
              Start a prep session to run your first scored mock.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <svg
              aria-label="Mock interview score trend"
              className="h-20 w-full"
              role="img"
              viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
            >
              <polyline
                className={cn(
                  "fill-none",
                  tier ? TIER_STROKE_CLASS[tier] : undefined
                )}
                points={sparkPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                strokeWidth={2.5}
              />
              {lastPoint && tier ? (
                <circle
                  className={cn("fill-none", TIER_STROKE_CLASS[tier])}
                  cx={lastPoint.x}
                  cy={lastPoint.y}
                  r={5}
                />
              ) : null}
              {lastPoint && tier ? (
                <circle
                  className={TIER_FILL_CLASS[tier]}
                  cx={lastPoint.x}
                  cy={lastPoint.y}
                  r={2.5}
                />
              ) : null}
              {firstPoint && lastLabeledPoint ? (
                <>
                  <text
                    className="fill-muted-foreground"
                    fontSize={9}
                    textAnchor="start"
                    x={0}
                    y={SPARKLINE_LABEL_Y}
                  >
                    {firstPoint.label}
                  </text>
                  <text
                    className="fill-muted-foreground"
                    fontSize={9}
                    textAnchor="end"
                    x={SPARKLINE_WIDTH}
                    y={SPARKLINE_LABEL_Y}
                  >
                    {lastLabeledPoint.label}
                  </text>
                </>
              ) : null}
            </svg>
            <p className="mt-2 flex items-center gap-1.5 font-mono text-muted-foreground text-xs">
              last {points.length} mock interviews
              {lastScore && tier ? (
                <span className={cn("font-medium", TIER_TEXT_CLASS[tier])}>
                  · {lastScore.score}%
                </span>
              ) : null}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
