import type { CanvasElement, FrameElement, PenElement } from "../types";

/**
 * Checks if a canvas element is contained inside a target frame.
 * Checks explicit frameId association or geometric bounds (center-point or bounding box containment).
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
export function isElementContainedInFrame(
  element: CanvasElement,
  frame: FrameElement
): boolean {
  if (!(element && frame) || element.id === frame.id) {
    return false;
  }

  if (element.frameId === frame.id) {
    return true;
  }

  let elX = element.x;
  let elY = element.y;
  let elW = element.width || 0;
  let elH = element.height || 0;

  if (element.type === "line" || element.type === "arrow") {
    const endX = element.endX ?? element.x;
    const endY = element.endY ?? element.y;
    const minX = Math.min(element.x, endX);
    const maxX = Math.max(element.x, endX);
    const minY = Math.min(element.y, endY);
    const maxY = Math.max(element.y, endY);
    elX = minX;
    elY = minY;
    elW = maxX - minX;
    elH = maxY - minY;
  } else if (element.type === "pen") {
    const pen = element as PenElement;
    if (Array.isArray(pen.points) && pen.points.length > 0) {
      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      for (const pt of pen.points) {
        if (pt.x < minX) {
          minX = pt.x;
        }
        if (pt.x > maxX) {
          maxX = pt.x;
        }
        if (pt.y < minY) {
          minY = pt.y;
        }
        if (pt.y > maxY) {
          maxY = pt.y;
        }
      }
      elX = minX;
      elY = minY;
      elW = maxX - minX;
      elH = maxY - minY;
    }
  }

  const centerX = elX + elW / 2;
  const centerY = elY + elH / 2;

  const frameLeft = frame.x;
  const frameTop = frame.y;
  const frameRight = frame.x + frame.width;
  const frameBottom = frame.y + frame.height;

  if (
    elX >= frameLeft &&
    elX + elW <= frameRight &&
    elY >= frameTop &&
    elY + elH <= frameBottom
  ) {
    return true;
  }

  // 2. Center of element is inside frame bounds, provided element is not substantially larger than frame
  const isReasonableChildSize =
    elW <= frame.width * 1.1 && elH <= frame.height * 1.1;
  if (
    isReasonableChildSize &&
    centerX >= frameLeft &&
    centerX <= frameRight &&
    centerY >= frameTop &&
    centerY <= frameBottom
  ) {
    return true;
  }

  return false;
}

/**
 * Resolves the frame that owns an element: explicit `frameId` first, then the
 * first frame whose bounds contain it. Frames themselves never have a parent.
 */
export function getContainingFrame(
  element: CanvasElement,
  elements: CanvasElement[]
): FrameElement | null {
  if (!element || element.type === "frame") {
    return null;
  }
  if (element.frameId) {
    const byId = elements.find(
      (el) => el.type === "frame" && el.id === element.frameId
    );
    if (byId) {
      return byId as FrameElement;
    }
  }
  for (const el of elements) {
    if (
      el.type === "frame" &&
      isElementContainedInFrame(element, el as FrameElement)
    ) {
      return el as FrameElement;
    }
  }
  return null;
}

export interface EffectiveElementState {
  locked: boolean;
  visible: boolean;
}

/**
 * An element inherits lock and visibility from its owning frame, so locking or
 * hiding a page applies to every subcomponent without mutating each child.
 */
export function getEffectiveElementState(
  element: CanvasElement,
  elements: CanvasElement[]
): EffectiveElementState {
  const frame = getContainingFrame(element, elements);
  return {
    locked: Boolean(element.locked) || Boolean(frame?.locked),
    visible: element.visible !== false && frame?.visible !== false,
  };
}

export function getEffectiveElementStateMap(
  elements: CanvasElement[]
): Map<string, EffectiveElementState> {
  const frames = elements.filter(
    (el): el is FrameElement => el.type === "frame"
  );
  const map = new Map<string, EffectiveElementState>();
  for (const el of elements) {
    const frame =
      el.type === "frame"
        ? null
        : frames.find(
            (f) => el.frameId === f.id || isElementContainedInFrame(el, f)
          );
    map.set(el.id, {
      locked: Boolean(el.locked) || Boolean(frame?.locked),
      visible: el.visible !== false && frame?.visible !== false,
    });
  }
  return map;
}

export function getLockedElementIds(elements: CanvasElement[]): Set<string> {
  const locked = new Set<string>();
  for (const [id, state] of getEffectiveElementStateMap(elements)) {
    if (state.locked) {
      locked.add(id);
    }
  }
  return locked;
}

/**
 * Given a list of all elements and an array of selected element IDs,
 * returns all selected elements plus any elements contained inside any selected frames.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
export function getElementsWithContainedChildren(
  elements: CanvasElement[],
  selectedIds: string[]
): CanvasElement[] {
  if (
    // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
    !elements ||
    elements.length === 0 ||
    !selectedIds ||
    selectedIds.length === 0
  ) {
    return [];
  }

  const idSet = new Set(selectedIds);
  const resultElementsMap = new Map<string, CanvasElement>();

  const selectedFrames: FrameElement[] = [];
  for (const el of elements) {
    if (idSet.has(el.id)) {
      resultElementsMap.set(el.id, el);
      if (el.type === "frame") {
        selectedFrames.push(el as FrameElement);
      }
    }
  }

  if (selectedFrames.length > 0) {
    for (const el of elements) {
      if (resultElementsMap.has(el.id)) {
        continue;
      }
      for (const frame of selectedFrames) {
        if (isElementContainedInFrame(el, frame)) {
          resultElementsMap.set(el.id, el);
          break;
        }
      }
    }
  }

  // Return in original z-index / array order for consistency
  return elements.filter((el) => resultElementsMap.has(el.id));
}
