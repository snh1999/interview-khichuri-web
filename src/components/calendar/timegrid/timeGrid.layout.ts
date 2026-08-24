import { endOfDay, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";
import {
  coversWholeDay,
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

interface SegmentDraft {
  event: TCustomEvent;
  dayIdx: number;
  segStart: Date;
  segEnd: Date;
  isFirst: boolean;
  isLast: boolean;
  startsBeforeView: boolean;
  endsAfterView: boolean;
}

export interface SpanningSegmentLayout {
  event: TCustomEvent;
  dayIdx: number;
  isFirst: boolean;
  isLast: boolean;
  startsBeforeView: boolean;
  endsAfterView: boolean;
  leftPct: number;
  widthPct: number;
  topPx: number;
  heightPx: number;
}

const MS_PER_DAY = 86_400_000;
const SEGMENT_MIN_HEIGHT_PX = 16;

export const buildSpanningSegments = (
  timedEvents: TCustomEvent[],
  days: Date[]
): SpanningSegmentLayout[] => {
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

  // One draft per partially-covered day so each piece sits at the event's
  // real hours on that day; fully-covered days render in the all-day row.
  const draftsByDay = new Map<number, SegmentDraft[]>();
  for (const item of clipped) {
    const startIdx = dayIndexOf(item.segStart);
    const endIdx = dayIndexOf(item.segEnd);

    for (let idx = startIdx; idx <= endIdx; idx += 1) {
      if (coversWholeDay(item.event, days[idx])) {
        continue;
      }
      const dayStart = startOfDay(days[idx]);
      const dayEnd = endOfDay(days[idx]);
      const bucket = draftsByDay.get(idx) ?? [];
      bucket.push({
        event: item.event,
        dayIdx: idx,
        segStart: isBefore(item.segStart, dayStart) ? dayStart : item.segStart,
        segEnd: isAfter(item.segEnd, dayEnd) ? dayEnd : item.segEnd,
        isFirst: idx === startIdx,
        isLast: idx === endIdx,
        startsBeforeView: item.startsBeforeView,
        endsAfterView: item.endsAfterView,
      });
      draftsByDay.set(idx, bucket);
    }
  }

  // Lane packing runs per day among the segments actually rendered there;
  // event-span-wide lanes would keep reserving width on days whose
  // neighbours were lifted into the all-day row.
  return [...draftsByDay.entries()].flatMap(([dayIdx, drafts]) => {
    drafts.sort(
      (a, b) =>
        a.segStart.getTime() - b.segStart.getTime() ||
        b.segEnd.getTime() - a.segEnd.getTime()
    );

    const layouts: SpanningSegmentLayout[] = [];
    let cluster: { draft: SegmentDraft; lane: number }[] = [];
    let laneEnds: Date[] = [];
    let clusterLatest = Number.NEGATIVE_INFINITY;

    const flushCluster = () => {
      if (cluster.length === 0) {
        return;
      }
      const slicePct = (1 / days.length) * (100 / laneEnds.length);
      for (const { draft, lane } of cluster) {
        layouts.push({
          event: draft.event,
          dayIdx,
          isFirst: draft.isFirst,
          isLast: draft.isLast,
          startsBeforeView: draft.startsBeforeView,
          endsAfterView: draft.endsAfterView,
          leftPct: (dayIdx / days.length) * 100 + slicePct * lane,
          widthPct: slicePct,
          topPx: timeToY(draft.segStart),
          heightPx: Math.max(
            SEGMENT_MIN_HEIGHT_PX,
            timeToY(draft.segEnd) - timeToY(draft.segStart)
          ),
        });
      }
      cluster = [];
      laneEnds = [];
      clusterLatest = Number.NEGATIVE_INFINITY;
    };

    for (const draft of drafts) {
      if (cluster.length > 0 && draft.segStart.getTime() >= clusterLatest) {
        flushCluster();
      }
      let lane = laneEnds.findIndex(
        (end) => end.getTime() <= draft.segStart.getTime()
      );
      if (lane === -1) {
        laneEnds.push(draft.segEnd);
        lane = laneEnds.length - 1;
      } else {
        laneEnds[lane] = draft.segEnd;
      }
      clusterLatest = Math.max(clusterLatest, draft.segEnd.getTime());
      cluster.push({ draft, lane });
    }
    flushCluster();

    return layouts;
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
