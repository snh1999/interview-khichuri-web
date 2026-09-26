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
import { type IElementSize, useElementSize } from "@/hooks/useElementSize";

const SPARKLINE_PADDING_X = 6;
const SPARKLINE_PADDING_Y = 8;
const SPARKLINE_LABEL_SPACE = 14;

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

const buildSparklinePoints = (
  scores: IScorePoint[],
  size: IElementSize
): SparkPoint[] => {
  if (scores.length === 0 || size.width === 0) {
    return [];
  }

  const scoreValues = scores.map((s) => s.score);
  const max = Math.max(...scoreValues);
  const min = Math.min(...scoreValues);
  const range = max - min;

  const plotWidth = Math.max(size.width - SPARKLINE_PADDING_X * 2, 1);
  const plotBottom = Math.max(
    size.height - SPARKLINE_LABEL_SPACE - SPARKLINE_PADDING_Y,
    SPARKLINE_PADDING_Y
  );
  const plotHeight = Math.max(plotBottom - SPARKLINE_PADDING_Y, 1);

  // A single point has no span to divide, so it sits in the middle instead of
  // the left edge. An all-equal series centres too, rather than resting on the
  // floor of the plot as a zero-height range would suggest.
  const stepX = scores.length === 1 ? 0 : plotWidth / (scores.length - 1);

  return scores.map((s, i) => ({
    x: scores.length === 1 ? size.width / 2 : SPARKLINE_PADDING_X + i * stepX,
    y: plotBottom - (range === 0 ? 0.5 : (s.score - min) / range) * plotHeight,
  }));
};

const ScoreSparkline = ({
  points,
  size,
}: Readonly<{ points: IScorePoint[]; size: IElementSize }>) => {
  const sparkPoints = buildSparklinePoints(points, size);
  const lastPoint = sparkPoints.at(-1);
  const lastScore = points.at(-1);
  const tier: ScoreTier | null = lastScore ? scoreTier(lastScore.score) : null;
  // One point cannot show a trend, so the date labels wait for a second.
  const hasRange = sparkPoints.length >= 2;

  if (size.width === 0 || size.height === 0) {
    return null;
  }

  return (
    <svg
      aria-label="Mock interview score trend"
      className="absolute inset-0 size-full"
      role="img"
      viewBox={`0 0 ${size.width} ${size.height}`}
    >
      <polyline
        className={cn("fill-none", tier ? TIER_STROKE_CLASS[tier] : undefined)}
        points={sparkPoints.map((p) => `${p.x},${p.y}`).join(" ")}
        strokeWidth={2.5}
      />
      {lastPoint && tier ? (
        <>
          <circle
            className={cn("fill-none", TIER_STROKE_CLASS[tier])}
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={5}
          />
          <circle
            className={TIER_FILL_CLASS[tier]}
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={2.5}
          />
        </>
      ) : null}
      {hasRange ? (
        <>
          <text
            className="fill-muted-foreground"
            fontSize={9}
            textAnchor="start"
            x={0}
            y={size.height - 2}
          >
            {points.at(0)?.label}
          </text>
          <text
            className="fill-muted-foreground"
            fontSize={9}
            textAnchor="end"
            x={size.width}
            y={size.height - 2}
          >
            {lastScore?.label}
          </text>
        </>
      ) : null}
    </svg>
  );
};

export const ScoreProgress = ({
  points,
}: Readonly<{ points: IScorePoint[] }>) => {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const lastScore = points.at(-1);
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
              render={<Link to={`${SESSIONS_PAGE}?create=true`} />}
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
            {/* The graph is absolutely positioned so it fills the leftover card
                height without feeding that height back into its own measurement. */}
            <div className="relative min-h-20 flex-1" ref={ref}>
              <ScoreSparkline points={points} size={{ width, height }} />
            </div>
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
