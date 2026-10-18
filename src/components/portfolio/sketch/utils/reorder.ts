import type { CanvasElement } from "../types";
import { getContainingFrame } from "./containment";

export type ReorderDirection = "up" | "down" | "top" | "bottom";

const ROOT_GROUP = "__root__";

/**
 * Reorders elements within their own sibling group (frame children vs. the
 * root canvas) instead of the whole flat array. A child can therefore never
 * cross its own frame, and "bring forward" on the topmost child swaps it with
 * the previous sibling rather than an unrelated element from another artboard.
 * Group members keep their existing array slots, so groups stay interleaved.
 * Returns `null` when nothing moved.
 */
export function reorderWithinGroups(
  elements: CanvasElement[],
  ids: string[],
  direction: ReorderDirection
): CanvasElement[] | null {
  const idSet = new Set(ids);
  if (idSet.size === 0 || !elements.some((el) => idSet.has(el.id))) {
    return null;
  }

  const groups = new Map<string, CanvasElement[]>();
  for (const el of elements) {
    const key = getContainingFrame(el, elements)?.id ?? ROOT_GROUP;
    const members = groups.get(key);
    if (members) {
      members.push(el);
    } else {
      groups.set(key, [el]);
    }
  }

  const next = [...elements];
  let changed = false;

  for (const members of groups.values()) {
    if (!members.some((el) => idSet.has(el.id))) {
      continue;
    }
    const reordered = reorderSublist(members, idSet, direction);
    if (!reordered) {
      continue;
    }
    changed = true;
    const memberIds = new Set(members.map((el) => el.id));
    const slots: number[] = [];
    for (const [index, el] of next.entries()) {
      if (memberIds.has(el.id)) {
        slots.push(index);
      }
    }
    slots.forEach((slot, i) => {
      next[slot] = reordered[i];
    });
  }

  return changed ? next : null;
}

function reorderSublist(
  members: CanvasElement[],
  idSet: Set<string>,
  direction: ReorderDirection
): CanvasElement[] | null {
  const selectedCount = members.filter((el) => idSet.has(el.id)).length;
  if (selectedCount === 0 || selectedCount === members.length) {
    return null;
  }

  const reordered =
    direction === "up" || direction === "down"
      ? shiftByOne(members, idSet, direction)
      : pushToExtreme(members, idSet, direction);

  return sameOrder(members, reordered) ? null : reordered;
}

function shiftByOne(
  members: CanvasElement[],
  idSet: Set<string>,
  direction: "up" | "down"
): CanvasElement[] {
  const reordered = [...members];
  const movingUp = direction === "up";
  const start = movingUp ? reordered.length - 2 : 1;
  const stop = movingUp ? -1 : reordered.length;
  const step = movingUp ? -1 : 1;

  for (let i = start; i !== stop; i += step) {
    const neighbour = movingUp ? i + 1 : i - 1;
    if (idSet.has(reordered[i].id) && !idSet.has(reordered[neighbour].id)) {
      [reordered[i], reordered[neighbour]] = [
        reordered[neighbour],
        reordered[i],
      ];
    }
  }
  return reordered;
}

function pushToExtreme(
  members: CanvasElement[],
  idSet: Set<string>,
  direction: "top" | "bottom"
): CanvasElement[] {
  const selected = members.filter((el) => idSet.has(el.id));
  const unselected = members.filter((el) => !idSet.has(el.id));
  return direction === "top"
    ? [...unselected, ...selected]
    : [...selected, ...unselected];
}

function sameOrder(a: CanvasElement[], b: CanvasElement[]): boolean {
  return a.length === b.length && a.every((el, i) => el.id === b[i]?.id);
}
