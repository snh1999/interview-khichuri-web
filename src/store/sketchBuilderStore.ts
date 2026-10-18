import { create } from "zustand";
import { generateSafeId } from "@/lib/utils";
import type {
  CanvasElement,
  ElementChanges,
  GeneratedDesign,
  LineElement,
  MoodboardItem,
  PenElement,
  Point,
  Portfolio,
  StampType,
  ThemeConfig,
  ToolType,
  ViewMode,
} from "../components/portfolio/sketch/types";
import {
  getElementsWithContainedChildren,
  getLockedElementIds,
} from "../components/portfolio/sketch/utils/containment";
import { createEmptyPortfolio } from "../components/portfolio/sketch/utils/defaultPortfolios";
import { reorderWithinGroups } from "../components/portfolio/sketch/utils/reorder";
import { useBuilderStore } from "./useBuilderStore";

export function cloneAndOffsetElements(
  elements: CanvasElement[],
  offset = 24,
  baseZIndex?: number
): { clonedElements: CanvasElement[]; idMap: Map<string, string> } {
  const idMap = new Map<string, string>();
  const clonedElements: CanvasElement[] = [];

  for (const el of elements) {
    const newId = generateSafeId("el");
    idMap.set(el.id, newId);
  }

  for (const [index, el] of elements.entries()) {
    const newId = idMap.get(el.id) ?? generateSafeId("el");
    const clone = cloneState(el);
    clone.id = newId;
    clone.x += offset;
    clone.y += offset;
    if (clone.type === "line" || clone.type === "arrow") {
      const lineEl = clone as LineElement;
      lineEl.endX = (lineEl.endX ?? lineEl.x) + offset;
      lineEl.endY = (lineEl.endY ?? lineEl.y) + offset;
    }
    if (clone.type === "pen" && Array.isArray((clone as PenElement).points)) {
      (clone as PenElement).points = (clone as PenElement).points.map(
        (pt: Point) => ({
          x: pt.x + offset,
          y: pt.y + offset,
        })
      );
    }
    if (clone.frameId && idMap.has(clone.frameId)) {
      clone.frameId = idMap.get(clone.frameId);
    }
    if (typeof baseZIndex === "number") {
      clone.zIndex = baseZIndex + index + 1;
    }
    clonedElements.push(clone);
  }

  return { clonedElements, idMap };
}

/**
 * Keeps a line/arrow's stored endpoints (and a pen's point cloud) in step with
 * its start/box. The renderer trusts `endX/endY` over `width/height`, so a pure
 * box edit (resize handle, Geometry editor) would otherwise leave the visible
 * shape untouched. Endpoints already present in `changes` are authoritative.
 */
export function withConsistentGeometry(
  el: CanvasElement,
  changes: ElementChanges
): ElementChanges {
  if (el.type === "line" || el.type === "arrow") {
    if (changes.endX !== undefined || changes.endY !== undefined) {
      return changes;
    }
    return withConsistentLine(el as LineElement, changes);
  }
  if (el.type === "pen") {
    return translatePen(el as PenElement, changes);
  }
  return changes;
}

function withConsistentLine(
  line: LineElement,
  changes: ElementChanges
): ElementChanges {
  const nextX = changes.x ?? line.x;
  const nextY = changes.y ?? line.y;
  let endX = line.endX ?? line.x + line.width;
  let endY = line.endY ?? line.y + line.height;

  if (changes.x !== undefined) {
    endX += changes.x - line.x;
  }
  if (changes.y !== undefined) {
    endY += changes.y - line.y;
  }
  if (changes.width !== undefined && line.width !== 0) {
    endX = nextX + (endX - nextX) * (changes.width / line.width);
  }
  if (changes.height !== undefined && line.height !== 0) {
    endY = nextY + (endY - nextY) * (changes.height / line.height);
  }

  return { ...changes, endX, endY };
}

// Pen resizing is not modelled here; only pure translations move the cloud.
function translatePen(
  pen: PenElement,
  changes: ElementChanges
): ElementChanges {
  const { x, y } = changes;
  if (x === undefined && y === undefined) {
    return changes;
  }
  if (changes.width !== undefined || changes.height !== undefined) {
    return changes;
  }
  const { points } = pen;
  const dx = x === undefined ? 0 : x - pen.x;
  const dy = y === undefined ? 0 : y - pen.y;
  return {
    ...changes,
    points: points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })),
  };
}

interface HistorySnapshot {
  elements: CanvasElement[];
  theme: ThemeConfig;
  moodboard: MoodboardItem[];
}
interface SketchBuilderState {
  // The live canvas editing buffer for the portfolio at the current route.
  // Portfolio records + CRUD live in react-query (`api/portfolio/idb.ts`).
  draft: Portfolio | null;
  viewMode: ViewMode;
  isSidebarOpen: boolean;

  currentTool: ToolType;
  selectedStamp: StampType;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  fontSize: number;
  roughness: number;
  cornerRadius: number;

  selectedElementIds: string[];

  // Undo / Redo History (scoped to the current draft)
  history: {
    past: HistorySnapshot[];
    future: HistorySnapshot[];
  };

  activeFrameIdForAi: string | null;
  activeGeneratedDesign: GeneratedDesign | null;
  isAiModalOpen: boolean;
  aiModalTargetFrameId: string | null;
  aiModalMode: "new" | "append";

  getCurrentPortfolio: () => Portfolio;
  setDraft: (portfolio: Portfolio | null) => void;
  patchDraft: (updates: Partial<Portfolio>) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  openAiModal: (frameId?: string | null, mode?: "new" | "append") => void;
  closeAiModal: () => void;

  setCurrentTool: (tool: ToolType) => void;
  setSelectedStamp: (stamp: StampType) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setOpacity: (opacity: number) => void;
  setFontSize: (size: number) => void;
  setRoughness: (roughness: number) => void;
  setCornerRadius: (radius: number) => void;

  selectElements: (ids: string[]) => void;
  toggleElementSelection: (id: string) => void;
  clearSelection: () => void;

  addElement: (element: CanvasElement) => void;
  addElements: (elements: CanvasElement[]) => void;
  updateElement: (
    id: string,
    updates: ElementChanges,
    shouldRecordHistory?: boolean
  ) => void;
  updateElements: (updates: { id: string; changes: ElementChanges }[]) => void;
  deleteElement: (id: string) => void;
  deleteSelectedElements: () => void;
  duplicateSelectedElements: () => void;
  reorderElement: (
    id: string,
    direction: "up" | "down" | "top" | "bottom"
  ) => void;
  reorderElements: (
    ids: string[],
    direction: "up" | "down" | "top" | "bottom"
  ) => void;
  alignSelectedElements: (
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom"
  ) => void;

  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  resetViewport: () => void;
  /** Live pixel size of the canvas viewport, kept current by the Canvas itself. */
  canvasSize: { width: number; height: number };
  setCanvasSize: (size: { width: number; height: number }) => void;

  undo: () => void;
  redo: () => void;
  recordHistory: () => void;

  addMoodboardImage: (item: MoodboardItem) => void;
  removeMoodboardImage: (id: string) => void;
  setTheme: (theme: ThemeConfig) => void;
  updateThemeColors: (
    colors: Partial<ThemeConfig>,
    shouldRecordHistory?: boolean
  ) => void;

  setActiveFrameForAi: (frameId: string | null) => void;
  applyGeneratedDesign: (
    design: GeneratedDesign,
    mode?: "new" | "append",
    targetId?: string
  ) => void;
  setActiveGeneratedDesign: (design: GeneratedDesign | null) => void;

  clipboard: CanvasElement[];
  copySelectedElements: () => void;
  pasteElements: () => void;
}

const MAX_HISTORY = 30;
const nowIso = (): string => new Date().toISOString();
let themeHistoryTimer: ReturnType<typeof setTimeout> | null = null;

// Deep clone helper preserving primitive values safely without live reference leakage
const cloneState = <T>(data: T): T => {
  try {
    if (typeof structuredClone === "function") {
      return structuredClone(data);
    }
    return JSON.parse(JSON.stringify(data));
  } catch {
    return JSON.parse(JSON.stringify(data));
  }
};

const snapshotOf = (draft: Portfolio): HistorySnapshot => ({
  elements: cloneState(draft.elements),
  theme: cloneState(draft.theme),
  moodboard: cloneState(draft.moodboard),
});

export const useSketchBuilderStore = create<SketchBuilderState>()(
  (set, get) => {
    const patch = (updater: (draft: Portfolio) => Portfolio) => {
      const { draft } = get();
      if (!draft) {
        return;
      }
      set({ draft: updater(draft) });
    };

    return {
      draft: null,
      viewMode: "canvas",
      isSidebarOpen: true,
      canvasSize: { width: 0, height: 0 },

      currentTool: "select",
      selectedStamp: "card",
      strokeColor: "#334155",
      fillColor: "#f8fafc",
      strokeWidth: 2,
      opacity: 1,
      fontSize: 16,
      roughness: 0,
      cornerRadius: 12,

      selectedElementIds: [],
      clipboard: [],

      history: {
        past: [],
        future: [],
      },

      activeFrameIdForAi: null,
      activeGeneratedDesign: null,
      isAiModalOpen: false,
      aiModalTargetFrameId: null,
      aiModalMode: "new",

      getCurrentPortfolio: () => get().draft ?? FALLBACK_EMPTY_PORTFOLIO,

      setDraft: (portfolio) =>
        set((state) => {
          if (!portfolio) {
            return { draft: null };
          }
          // Same portfolio re-seeded (e.g. the persist hook wrote it back): keep
          // the live selection/history. A different id is a fresh editing session.
          if (state.draft?.id === portfolio.id) {
            return { draft: portfolio };
          }
          return {
            draft: portfolio,
            selectedElementIds: [],
            activeFrameIdForAi: null,
            activeGeneratedDesign: null,
            history: { past: [], future: [] },
          };
        }),

      patchDraft: (updates) =>
        patch((draft) => ({ ...draft, ...updates, updatedAt: nowIso() })),

      setViewMode: (mode) => set({ viewMode: mode }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      openAiModal: (frameId, mode) =>
        set({
          isAiModalOpen: true,
          aiModalTargetFrameId: frameId ?? null,
          aiModalMode: mode ?? "new",
        }),
      closeAiModal: () =>
        set({ isAiModalOpen: false, aiModalTargetFrameId: null }),

      setCurrentTool: (tool) => set({ currentTool: tool }),
      setSelectedStamp: (stamp) =>
        set({ selectedStamp: stamp, currentTool: "stamp" }),
      setStrokeColor: (color) => set({ strokeColor: color }),
      setFillColor: (color) => set({ fillColor: color }),
      setStrokeWidth: (width) => set({ strokeWidth: width }),
      setOpacity: (opacity) => set({ opacity }),
      setFontSize: (fontSize) => set({ fontSize }),
      setRoughness: (roughness) => set({ roughness }),
      setCornerRadius: (cornerRadius) => set({ cornerRadius }),

      selectElements: (ids) => set({ selectedElementIds: ids }),
      toggleElementSelection: (id) => {
        const { selectedElementIds } = get();
        if (selectedElementIds.includes(id)) {
          set({
            selectedElementIds: selectedElementIds.filter(
              (item) => item !== id
            ),
          });
        } else {
          set({ selectedElementIds: [...selectedElementIds, id] });
        }
      },
      clearSelection: () => set({ selectedElementIds: [] }),

      copySelectedElements: () => {
        const { selectedElementIds, draft } = get();
        if (selectedElementIds.length === 0 || !draft) {
          return;
        }

        const selected = getElementsWithContainedChildren(
          draft.elements,
          selectedElementIds
        );
        if (selected.length > 0) {
          set({ clipboard: cloneState(selected) });
        }
      },

      pasteElements: () => {
        const { clipboard, draft } = get();
        if (!clipboard || clipboard.length === 0 || !draft) {
          return;
        }

        get().recordHistory();
        const maxZ = draft.elements.reduce(
          (max, el) => Math.max(max, el.zIndex || 0),
          0
        );
        const { clonedElements: pastedElements } = cloneAndOffsetElements(
          clipboard,
          24,
          maxZ
        );

        patch((d) => ({
          ...d,
          elements: [...d.elements, ...pastedElements],
          updatedAt: nowIso(),
        }));
        set({ selectedElementIds: pastedElements.map((el) => el.id) });
      },

      recordHistory: () => {
        const { draft } = get();
        if (!draft) {
          return;
        }
        const snapshot = snapshotOf(draft);
        const currentHistory = get().history;

        set({
          history: {
            past: [...currentHistory.past.slice(-(MAX_HISTORY - 1)), snapshot],
            future: [],
          },
        });
      },

      undo: () => {
        const { draft, history } = get();
        if (!draft || history.past.length === 0) {
          return;
        }

        const previous = history.past.at(-1);
        if (!previous) {
          return;
        }
        const newPast = history.past.slice(0, history.past.length - 1);
        const currentSnapshot = snapshotOf(draft);

        set({
          draft: {
            ...draft,
            updatedAt: nowIso(),
            elements: previous.elements,
            theme: previous.theme,
            moodboard: previous.moodboard
              ? previous.moodboard
              : draft.moodboard,
          },
          history: {
            past: newPast,
            future: [currentSnapshot, ...history.future],
          },
          selectedElementIds: [],
        });
      },

      redo: () => {
        const { draft, history } = get();
        if (!draft || history.future.length === 0) {
          return;
        }

        // biome-ignore lint/style/useDestructuring: reads single named field; full destructure hurts readability here
        const next = history.future[0];
        if (!next) {
          return;
        }
        const newFuture = history.future.slice(1);
        const currentSnapshot = snapshotOf(draft);

        set({
          draft: {
            ...draft,
            updatedAt: nowIso(),
            elements: next.elements,
            theme: next.theme,
            moodboard: next.moodboard ? next.moodboard : draft.moodboard,
          },
          history: {
            past: [...history.past, currentSnapshot],
            future: newFuture,
          },
          selectedElementIds: [],
        });
      },

      addElement: (element) => {
        if (!get().draft) {
          return;
        }
        get().recordHistory();

        patch((d) => ({
          ...d,
          elements: [...d.elements, element],
          updatedAt: nowIso(),
        }));
        set({ selectedElementIds: [element.id] });
      },

      addElements: (newElements) => {
        if (newElements.length === 0 || !get().draft) {
          return;
        }
        get().recordHistory();

        // If frames are inserted (e.g. from template), select only the frame(s) to avoid cascade side-effects
        const frames = newElements.filter((el) => el.type === "frame");
        const selectedIds =
          frames.length > 0
            ? frames.map((f) => f.id)
            : newElements.map((el) => el.id);

        patch((d) => ({
          ...d,
          elements: [...d.elements, ...newElements],
          updatedAt: nowIso(),
        }));
        set({ selectedElementIds: selectedIds });
      },

      updateElement: (id, updates, shouldRecordHistory = false) => {
        const { draft } = get();
        if (!draft) {
          return;
        }
        const isLockChange =
          "locked" in updates && Object.keys(updates).length === 1;
        if (!isLockChange && getLockedElementIds(draft.elements).has(id)) {
          return;
        }
        if (shouldRecordHistory) {
          get().recordHistory();
        }
        const updatedElements = draft.elements.map((el) =>
          el.id === id
            ? ({
                ...el,
                ...withConsistentGeometry(el, updates),
              } as CanvasElement)
            : el
        );

        patch((d) => ({
          ...d,
          elements: updatedElements,
          updatedAt: nowIso(),
        }));
      },

      updateElements: (updates) => {
        const { draft } = get();
        if (!draft) {
          return;
        }
        const locked = getLockedElementIds(draft.elements);
        const allowedUpdates = updates.filter(
          (update) =>
            !locked.has(update.id) ||
            ("locked" in update.changes &&
              Object.keys(update.changes).length === 1)
        );
        if (allowedUpdates.length === 0) {
          return;
        }
        const updatesMap = new Map(
          allowedUpdates.map((u) => [u.id, u.changes])
        );

        const updatedElements = draft.elements.map((el) => {
          if (updatesMap.has(el.id)) {
            const changes = updatesMap.get(el.id);
            return {
              ...el,
              ...(changes ? withConsistentGeometry(el, changes) : {}),
            } as CanvasElement;
          }
          return el;
        });

        patch((d) => ({
          ...d,
          elements: updatedElements,
          updatedAt: nowIso(),
        }));
      },

      deleteElement: (id) => {
        const { draft } = get();
        if (!draft || getLockedElementIds(draft.elements).has(id)) {
          return;
        }
        get().recordHistory();
        const elementsToDelete = getElementsWithContainedChildren(
          draft.elements,
          [id]
        );
        const idsToDelete = new Set<string>(
          elementsToDelete.map((el) => el.id)
        );

        patch((d) => ({
          ...d,
          elements: d.elements.filter((el) => !idsToDelete.has(el.id)),
          updatedAt: nowIso(),
        }));
        set((state) => ({
          selectedElementIds: state.selectedElementIds.filter(
            (selId) => !idsToDelete.has(selId)
          ),
        }));
      },

      deleteSelectedElements: () => {
        const { selectedElementIds, draft } = get();
        if (selectedElementIds.length === 0 || !draft) {
          return;
        }

        const locked = getLockedElementIds(draft.elements);
        const deletableIds = selectedElementIds.filter((id) => !locked.has(id));
        if (deletableIds.length === 0) {
          return;
        }

        get().recordHistory();
        const elementsToDelete = getElementsWithContainedChildren(
          draft.elements,
          deletableIds
        );
        const idsToDelete = new Set<string>(
          elementsToDelete.map((el) => el.id)
        );

        patch((d) => ({
          ...d,
          elements: d.elements.filter((el) => !idsToDelete.has(el.id)),
          updatedAt: nowIso(),
        }));
        set({ selectedElementIds: [] });
      },

      duplicateSelectedElements: () => {
        const { selectedElementIds, draft } = get();
        if (selectedElementIds.length === 0 || !draft) {
          return;
        }

        const selected = getElementsWithContainedChildren(
          draft.elements,
          selectedElementIds
        );
        if (selected.length === 0) {
          return;
        }

        get().recordHistory();
        const maxZ = draft.elements.reduce(
          (max, el) => Math.max(max, el.zIndex || 0),
          0
        );
        const { clonedElements: duplicatedElements } = cloneAndOffsetElements(
          selected,
          24,
          maxZ
        );

        patch((d) => ({
          ...d,
          elements: [...d.elements, ...duplicatedElements],
          updatedAt: nowIso(),
        }));
        set({ selectedElementIds: duplicatedElements.map((el) => el.id) });
      },

      reorderElement: (id, direction) => {
        get().reorderElements([id], direction);
      },

      reorderElements: (ids, direction) => {
        if (!ids || ids.length === 0) {
          return;
        }
        const { draft } = get();
        if (!draft) {
          return;
        }
        const locked = getLockedElementIds(draft.elements);
        const movableIds = ids.filter((id) => !locked.has(id));
        if (movableIds.length === 0) {
          return;
        }

        const reordered = reorderWithinGroups(
          draft.elements,
          movableIds,
          direction
        );
        if (!reordered) {
          return;
        }

        get().recordHistory();
        const updatedElements = reordered.map((el, idx) => ({
          ...el,
          zIndex: idx + 1,
        }));

        patch((d) => ({
          ...d,
          elements: updatedElements,
          updatedAt: nowIso(),
        }));
      },

      alignSelectedElements: (alignment) => {
        const { selectedElementIds, draft } = get();
        if (selectedElementIds.length < 2 || !draft) {
          return;
        }

        const locked = getLockedElementIds(draft.elements);
        const selected = draft.elements.filter(
          (el) => selectedElementIds.includes(el.id) && !locked.has(el.id)
        );

        if (selected.length < 2) {
          return;
        }

        get().recordHistory();

        const minX = Math.min(...selected.map((el) => el.x));
        const maxX = Math.max(...selected.map((el) => el.x + el.width));
        const minY = Math.min(...selected.map((el) => el.y));
        const maxY = Math.max(...selected.map((el) => el.y + el.height));

        const deltaFor = (el: CanvasElement): { dx: number; dy: number } => {
          switch (alignment) {
            case "left":
              return { dx: minX - el.x, dy: 0 };
            case "right":
              return { dx: maxX - (el.x + el.width), dy: 0 };
            case "center":
              return { dx: (minX + maxX) / 2 - (el.x + el.width / 2), dy: 0 };
            case "top":
              return { dx: 0, dy: minY - el.y };
            case "bottom":
              return { dx: 0, dy: maxY - (el.y + el.height) };
            case "middle":
              return { dx: 0, dy: (minY + maxY) / 2 - (el.y + el.height / 2) };
            default:
              return { dx: 0, dy: 0 };
          }
        };

        const selectedIds = new Set(selected.map((el) => el.id));
        const updates = selected.map((el) => {
          const { dx, dy } = deltaFor(el);
          return { id: el.id, changes: { x: el.x + dx, y: el.y + dy } };
        });

        // Frames carry their contents: move each frame's children by the same
        // delta so the artboard's contents stay inside it.
        for (const el of selected) {
          if (el.type !== "frame") {
            continue;
          }
          const { dx, dy } = deltaFor(el);
          for (const child of getElementsWithContainedChildren(draft.elements, [
            el.id,
          ])) {
            if (selectedIds.has(child.id)) {
              continue;
            }
            updates.push({
              id: child.id,
              changes: { x: child.x + dx, y: child.y + dy },
            });
          }
        }

        get().updateElements(updates);
      },

      setViewport: (viewport) => patch((d) => ({ ...d, viewport })),
      setCanvasSize: (size) =>
        set((state) =>
          state.canvasSize.width === size.width &&
          state.canvasSize.height === size.height
            ? {}
            : { canvasSize: size }
        ),

      resetViewport: () => {
        get().setViewport({ x: 0, y: 0, zoom: 1 });
      },

      addMoodboardImage: (item) => {
        if (!get().draft) {
          return;
        }
        get().recordHistory();

        patch((d) => ({
          ...d,
          moodboard: [item, ...d.moodboard],
          updatedAt: nowIso(),
        }));
      },

      removeMoodboardImage: (id) => {
        if (!get().draft) {
          return;
        }
        get().recordHistory();

        patch((d) => ({
          ...d,
          moodboard: d.moodboard.filter((m) => m.id !== id),
          updatedAt: nowIso(),
        }));
      },

      setTheme: (theme) => {
        if (!get().draft) {
          return;
        }
        get().recordHistory();
        patch((d) => ({ ...d, theme, updatedAt: nowIso() }));
      },

      updateThemeColors: (colors, shouldRecordHistory = true) => {
        if (!get().draft) {
          return;
        }
        if (shouldRecordHistory && !themeHistoryTimer) {
          get().recordHistory();
          themeHistoryTimer = setTimeout(() => {
            themeHistoryTimer = null;
          }, 1000);
        }

        patch((d) => ({
          ...d,
          theme: { ...d.theme, ...colors },
          updatedAt: nowIso(),
        }));
      },

      setActiveFrameForAi: (frameId) => set({ activeFrameIdForAi: frameId }),

      applyGeneratedDesign: (design, mode, targetId) => {
        // Seed the portfolio's editable code project so the generated site is
        // actually visible in the Code Builder (the two stores are linked here).
        // "new" replaces the project with the generated file map; "append" merges
        // the new route files in without dropping the existing pages. The target
        // is captured when generation starts so a navigation mid-run cannot land
        // the result in another portfolio.
        const { draft } = get();
        const builder = useBuilderStore.getState();
        const projectId = targetId ?? draft?.id;
        if (mode === "append") {
          builder.appendGeneratedFiles(
            design.files,
            `Added ${design.routes.join(", ")}`,
            projectId
          );
        } else if (projectId) {
          builder.seedGeneratedFiles(projectId, design.files);
        }
        set({ activeGeneratedDesign: design, viewMode: "preview" });
      },

      setActiveGeneratedDesign: (design) =>
        set({ activeGeneratedDesign: design }),
    };
  }
);

// Fresh-per-process but frozen: never a live reference a caller could mutate
// into shared state. Read-only fallback for an empty editor.
const FALLBACK_EMPTY_PORTFOLIO: Portfolio = Object.freeze(
  createEmptyPortfolio()
) as Portfolio;

/**
 * Reactive selector hook returning the currently active portfolio object.
 * Avoids repeated array search in component renders and returns a stable object reference.
 */
export const useCurrentPortfolio = (): Portfolio =>
  useSketchBuilderStore((state) => state.draft ?? FALLBACK_EMPTY_PORTFOLIO);
