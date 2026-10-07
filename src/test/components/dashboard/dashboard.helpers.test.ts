import { describe, expect, it } from "vitest";
import {
  avgScore,
  buildScoreHistory,
  type IScorePoint,
  scoreTier,
  takeLatest,
  urgencyFor,
} from "@/components/dashboard/dashboard.helpers.ts";

describe("urgencyFor", () => {
  it("buckets days into urgent, soon and later", () => {
    expect(urgencyFor(0)).toBe("urgent");
    expect(urgencyFor(7)).toBe("soon");
    expect(urgencyFor(8)).toBe("later");
  });
});

describe("buildScoreHistory", () => {
  it("keeps only scored interviews, newest last", () => {
    const points = buildScoreHistory([
      {
        createdAt: "2024-02-01T00:00:00.000Z",
        overallScore: 70,
        completedAt: "2024-02-05T00:00:00.000Z",
      },
      { createdAt: "2024-01-01T00:00:00.000Z", overallScore: null },
      { createdAt: "2024-01-10T00:00:00.000Z", overallScore: 90 },
    ]);

    expect(points.map((point) => point.score)).toEqual([90, 70]);
    expect(points[0]?.date).toBeLessThan(points[1]?.date ?? 0);
  });

  it("labels points with the completed or created date", () => {
    const [point] = buildScoreHistory([
      { createdAt: "2024-03-03T00:00:00.000Z", overallScore: 55 },
    ]);

    const expected = new Date("2024-03-03T00:00:00.000Z").toLocaleDateString(
      undefined,
      { day: "numeric", month: "short" }
    );
    expect(point?.label).toBe(expected);
  });
});

describe("avgScore", () => {
  it("returns null without points and rounds the mean", () => {
    expect(avgScore([])).toBeNull();
    expect(
      avgScore([
        { date: 1, label: "a", score: 80 },
        { date: 2, label: "b", score: 61 },
      ])
    ).toBe(71);
  });

  it("rounds to the nearest integer", () => {
    const points: IScorePoint[] = [1, 1, 1, 2].map((score, index) => ({
      date: index,
      label: `${index}`,
      score,
    }));
    expect(avgScore(points)).toBe(1);
  });
});

describe("scoreTier", () => {
  it("maps scores to tiers", () => {
    expect(scoreTier(80)).toBe("success");
    expect(scoreTier(79)).toBe("warning");
    expect(scoreTier(60)).toBe("warning");
    expect(scoreTier(59)).toBe("danger");
  });
});

describe("takeLatest", () => {
  it("slices the trailing points", () => {
    const points: IScorePoint[] = [1, 2, 3, 4, 5].map((score, index) => ({
      date: index,
      label: `${index}`,
      score,
    }));

    expect(takeLatest(points, 2).map((point) => point.score)).toEqual([4, 5]);
    expect(takeLatest(points, 10)).toHaveLength(5);
  });
});
