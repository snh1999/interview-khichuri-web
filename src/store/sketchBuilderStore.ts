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
    mode?: "new" | "append"
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
          el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
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
            return { ...el, ...updatesMap.get(el.id) } as CanvasElement;
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

        let targetVal = 0;
        switch (alignment) {
          case "left":
            targetVal = Math.min(...selected.map((el) => el.x));
            get().updateElements(
              selected.map((el) => ({ id: el.id, changes: { x: targetVal } }))
            );
            break;
          case "right":
            targetVal = Math.max(...selected.map((el) => el.x + el.width));
            get().updateElements(
              selected.map((el) => ({
                id: el.id,
                changes: { x: targetVal - el.width },
              }))
            );
            break;
          case "center": {
            const minX = Math.min(...selected.map((el) => el.x));
            const maxX = Math.max(...selected.map((el) => el.x + el.width));
            const centerX = minX + (maxX - minX) / 2;
            get().updateElements(
              selected.map((el) => ({
                id: el.id,
                changes: { x: centerX - el.width / 2 },
              }))
            );
            break;
          }
          case "top":
            targetVal = Math.min(...selected.map((el) => el.y));
            get().updateElements(
              selected.map((el) => ({ id: el.id, changes: { y: targetVal } }))
            );
            break;
          case "bottom":
            targetVal = Math.max(...selected.map((el) => el.y + el.height));
            get().updateElements(
              selected.map((el) => ({
                id: el.id,
                changes: { y: targetVal - el.height },
              }))
            );
            break;
          case "middle": {
            const minY = Math.min(...selected.map((el) => el.y));
            const maxY = Math.max(...selected.map((el) => el.y + el.height));
            const centerY = minY + (maxY - minY) / 2;
            get().updateElements(
              selected.map((el) => ({
                id: el.id,
                changes: { y: centerY - el.height / 2 },
              }))
            );
            break;
          }
          default:
            break;
        }
      },

      setViewport: (viewport) => patch((d) => ({ ...d, viewport })),

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

      applyGeneratedDesign: (design, mode = "new") => {
        // Seed the portfolio's editable code project so the generated site is
        // actually visible in the Code Builder (the two stores are linked here).
        // "new" replaces the project with the generated file map; "append" merges
        // the new route files in without dropping the existing pages.
        const { draft } = get();
        const builder = useBuilderStore.getState();
        if (mode === "append") {
          builder.appendGeneratedFiles(
            design.files,
            `Added ${design.routes.join(", ")}`
          );
        } else if (draft) {
          builder.seedGeneratedFiles(draft.id, design.files);
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
