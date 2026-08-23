import { endOfDay, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";
import {
  getEffectiveEndDate,
  spansMultipleDays,
  timeToY,
} from "../calendar.helpers";
import type { TCustomEvent } from "../calendar.types";

interface ClippedTimedEvent {
  event: TCustomEvent;
  segStart: Date;
  segEnd: Date;
  startsBeforeView: boolean;
  endsAfterView: boolean;
}

interface SegmentCluster {
  laneEnds: Date[];
  latestEnd: Date;
}

export interface SpanningBarLayout {
  event: TCustomEvent;
  startIdx: number;
  endIdx: number;
  lane: number;
  laneCount: number;
  startsBeforeView: boolean;
  endsAfterView: boolean;
  topPx: number;
  heightPx: number;
}

const MS_PER_DAY = 86_400_000;

export const buildSpanningBarLayouts = (
  timedEvents: TCustomEvent[],
  days: Date[]
): SpanningBarLayout[] => {
  const lastDay = days.at(-1);
  if (days.length === 0 || !lastDay) {
    return [];
  }
  const viewStart = startOfDay(days[0]);
  const viewEnd = endOfDay(lastDay);

  const dayIndexOf = (date: Date) =>
    Math.max(
      0,
      Math.min(
        days.length - 1,
        Math.round(
          (startOfDay(date).getTime() - viewStart.getTime()) / MS_PER_DAY
        )
      )
    );

  const clipped: ClippedTimedEvent[] = timedEvents
    .filter((event) => spansMultipleDays(event))
    .filter((event) => {
      const end = getEffectiveEndDate(event);
      return !(isBefore(end, viewStart) || isAfter(event.startDate, viewEnd));
    })
    .map((event) => {
      const end = getEffectiveEndDate(event);
      return {
        event,
        segStart: isBefore(event.startDate, viewStart)
          ? viewStart
          : event.startDate,
        segEnd: isAfter(end, viewEnd) ? viewEnd : end,
        startsBeforeView: isBefore(event.startDate, viewStart),
        endsAfterView: isAfter(end, viewEnd),
      };
    })
    .sort((a, b) => a.segStart.getTime() - b.segStart.getTime());

  // Greedy interval partitioning; each run of overlapping events ("cluster")
  // shares a lane count so bars split their span's width instead of stacking.
  const assigned: {
    clipped: ClippedTimedEvent;
    cluster: SegmentCluster;
    lane: number;
  }[] = [];
  const clusters: SegmentCluster[] = [];

  for (const item of clipped) {
    const previous = clusters.at(-1);
    let cluster: SegmentCluster;
    if (!previous || item.segStart.getTime() >= previous.latestEnd.getTime()) {
      cluster = { laneEnds: [], latestEnd: item.segStart };
      clusters.push(cluster);
    } else {
      cluster = previous;
    }

    let lane = cluster.laneEnds.findIndex(
      (laneEnd) => laneEnd.getTime() <= item.segStart.getTime()
    );
    if (lane === -1) {
      cluster.laneEnds.push(item.segEnd);
      lane = cluster.laneEnds.length - 1;
    } else {
      cluster.laneEnds[lane] = item.segEnd;
    }
    if (item.segEnd.getTime() > cluster.latestEnd.getTime()) {
      cluster.latestEnd = item.segEnd;
    }
    assigned.push({ clipped: item, cluster, lane });
  }

  return assigned.map(({ clipped: item, cluster, lane }) => {
    const startIdx = dayIndexOf(item.segStart);
    const endIdx = dayIndexOf(item.segEnd);
    return {
      event: item.event,
      startIdx,
      endIdx,
      lane,
      laneCount: cluster.laneEnds.length,
      startsBeforeView: item.startsBeforeView,
      endsAfterView: item.endsAfterView,
      topPx: timeToY(item.segStart),
      heightPx: Math.max(16, timeToY(item.segEnd) - timeToY(item.segStart)),
    };
  });
};

interface PositionedChip {
  event: TCustomEvent;
  top: number;
  bottom: number;
}

interface LaidOutChip extends PositionedChip {
  lane: number;
}

export interface DayChipLayout {
  event: TCustomEvent;
  leftPct: number;
  widthPct: number;
}

const CHIP_MIN_HEIGHT_PX = 16;

// Same cluster/lane packing as the multi-day bars, applied vertically within
// one day column so simultaneous chips split the column width instead of
// stacking on top of each other.
export const buildDayChipLayouts = (
  singleDayEvents: TCustomEvent[],
  day: Date
): DayChipLayout[] => {
  const items: PositionedChip[] = singleDayEvents
    .filter((event) => isSameDay(event.startDate, day))
    .map((event) => ({
      event,
      top: timeToY(event.startDate),
      bottom: Math.max(
        timeToY(event.endDate),
        timeToY(event.startDate) + CHIP_MIN_HEIGHT_PX
      ),
    }))
    .sort((a, b) => a.top - b.top || a.bottom - b.bottom);

  const layouts: DayChipLayout[] = [];
  let cluster: LaidOutChip[] = [];
  let laneBottoms: number[] = [];
  let clusterBottom = Number.NEGATIVE_INFINITY;

  const flushCluster = () => {
    if (cluster.length === 0) {
      return;
    }
    const laneCount = laneBottoms.length;
    for (const item of cluster) {
      layouts.push({
        event: item.event,
        leftPct: (item.lane / laneCount) * 100,
        widthPct: 100 / laneCount,
      });
    }
    cluster = [];
    laneBottoms = [];
    clusterBottom = Number.NEGATIVE_INFINITY;
  };

  for (const item of items) {
    if (cluster.length > 0 && item.top >= clusterBottom) {
      flushCluster();
    }
    let lane = laneBottoms.findIndex((bottom) => bottom <= item.top);
    if (lane === -1) {
      lane = laneBottoms.length;
    }
    laneBottoms[lane] = item.bottom;
    clusterBottom = Math.max(clusterBottom, item.bottom);
    cluster.push({ ...item, lane });
  }
  flushCluster();

  return layouts;
};
