import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { generateSafeId } from "@/lib/utils";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import { CanvasPageBanner } from "./CanvasPageBanner";
import { CanvasEmptyState } from "./canvas/CanvasEmptyState";
import { DrawingPreview } from "./canvas/DrawingPreview";
import { ElementShape } from "./canvas/ElementShape";
import { InlineTextEditor } from "./canvas/InlineTextEditor";
import { SelectionHandles } from "./canvas/SelectionHandles";
import { SelectionMarquee } from "./canvas/SelectionMarquee";
import { Toolbar } from "./Toolbar";
import type {
  CanvasElement,
  ElementChanges,
  FrameElement,
  LineElement,
  PenElement,
  Point,
  StampElement,
  TextElement,
} from "./types";
import {
  getEffectiveElementStateMap,
  getLockedElementIds,
  isElementContainedInFrame,
} from "./utils/containment";
import { getStampDefaults } from "./utils/stampConstants";
import { getNextZIndex } from "./utils/zIndex";

export const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isHandlingMouseUpRef = useRef(false);
  const dragRafRef = useRef<number | null>(null);
  const pendingUpdatesRef = useRef<
    { id: string; changes: ElementChanges }[] | null
  >(null);

  // Granular store selectors to prevent re-renders when other slices change
  const currentTool = useSketchBuilderStore((s) => s.currentTool);
  const setCurrentTool = useSketchBuilderStore((s) => s.setCurrentTool);
  const selectedStamp = useSketchBuilderStore((s) => s.selectedStamp);
  const strokeColor = useSketchBuilderStore((s) => s.strokeColor);
  const fillColor = useSketchBuilderStore((s) => s.fillColor);
  const strokeWidth = useSketchBuilderStore((s) => s.strokeWidth);
  const opacity = useSketchBuilderStore((s) => s.opacity);
  const fontSize = useSketchBuilderStore((s) => s.fontSize);
  const cornerRadius = useSketchBuilderStore((s) => s.cornerRadius);
  const roughness = useSketchBuilderStore((s) => s.roughness);
  const setCanvasSize = useSketchBuilderStore((s) => s.setCanvasSize);
  const selectedElementIds = useSketchBuilderStore((s) => s.selectedElementIds);
  const selectElements = useSketchBuilderStore((s) => s.selectElements);
  const toggleElementSelection = useSketchBuilderStore(
    (s) => s.toggleElementSelection
  );
  const clearSelection = useSketchBuilderStore((s) => s.clearSelection);
  const addElement = useSketchBuilderStore((s) => s.addElement);
  const deleteElement = useSketchBuilderStore((s) => s.deleteElement);
  const updateElement = useSketchBuilderStore((s) => s.updateElement);
  const updateElements = useSketchBuilderStore((s) => s.updateElements);
  const deleteSelectedElements = useSketchBuilderStore(
    (s) => s.deleteSelectedElements
  );
  const duplicateSelectedElements = useSketchBuilderStore(
    (s) => s.duplicateSelectedElements
  );
  const copySelectedElements = useSketchBuilderStore(
    (s) => s.copySelectedElements
  );
  const pasteElements = useSketchBuilderStore((s) => s.pasteElements);
  const reorderElements = useSketchBuilderStore((s) => s.reorderElements);
  const recordHistory = useSketchBuilderStore((s) => s.recordHistory);
  const undo = useSketchBuilderStore((s) => s.undo);
  const redo = useSketchBuilderStore((s) => s.redo);
  const setViewport = useSketchBuilderStore((s) => s.setViewport);

  const currentPortfolio = useCurrentPortfolio();
  const { elements } = currentPortfolio;

  // Local active viewport state for 60fps panning & zooming without triggering store subscriber churn
  const [activeViewport, setActiveViewport] = useState(
    currentPortfolio.viewport
  );
  const activeViewportRef = useRef(activeViewport);
  activeViewportRef.current = activeViewport;

  const debouncedPersistViewport = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const persistViewport = useCallback(
    (vp: { x: number; y: number; zoom: number }) => {
      if (debouncedPersistViewport.current) {
        clearTimeout(debouncedPersistViewport.current);
      }
      debouncedPersistViewport.current = setTimeout(() => {
        setViewport(vp);
      }, 300);
    },
    [setViewport]
  );

  // Sync external store viewport updates (portfolio switch, zoom buttons)
  useEffect(() => {
    // Cancel any pending debounced write from local gestures (e.g. wheel/pan)
    // to prevent clobbering external updates (navbar buttons or portfolio switch) with stale viewport snapshots
    if (debouncedPersistViewport.current) {
      clearTimeout(debouncedPersistViewport.current);
      debouncedPersistViewport.current = null;
    }
    setActiveViewport(currentPortfolio.viewport);

    return () => {
      if (debouncedPersistViewport.current) {
        clearTimeout(debouncedPersistViewport.current);
        debouncedPersistViewport.current = null;
      }
    };
  }, [
    currentPortfolio.viewport.x,
    currentPortfolio.viewport.y,
    currentPortfolio.viewport.zoom,
    currentPortfolio.viewport,
  ]);

  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDraggingElements, setIsDraggingElements] = useState(false);
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStartPoint, setDragStartPoint] = useState<Point>({ x: 0, y: 0 });
  const dragChildrenMapRef = useRef<Map<string, string[]>>(new Map());
  // Element positions captured at drag start. Computing moves against the live
  // store is unsafe: updates are RAF-throttled, so between a move and its flush
  // the store base is stale while the pointer keeps advancing, and deltas would
  // compound wrongly. A fixed base + fixed origin makes moves absolute.
  const dragBaseRef = useRef<Map<string, CanvasElement>>(new Map());
  const marqueeInitialSelectionRef = useRef<string[]>([]);
  const [currentDrawingElement, setCurrentDrawingElement] =
    useState<CanvasElement | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editTextValue, setEditTextValue] = useState("");

  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point => {
      if (!containerRef.current) {
        return { x: screenX, y: screenY };
      }
      const rect = containerRef.current.getBoundingClientRect();
      const x = (screenX - rect.left - activeViewport.x) / activeViewport.zoom;
      const y = (screenY - rect.top - activeViewport.y) / activeViewport.zoom;
      return { x, y };
    },
    [activeViewport]
  );

  // Keyboard nudge: move selected elements (plus children of selected frames) by a delta.
  const moveSelectionBy = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: keyboard-nudge helper; bounded frame/child scan is intentional
    (dx: number, dy: number) => {
      if (dx === 0 && dy === 0) {
        return;
      }
      const selectedIds = new Set(selectedElementIds);
      const idsToMove = new Set(selectedElementIds);
      const lockedIds = getLockedElementIds(elements);

      for (const frame of elements) {
        if (frame.type !== "frame" || !selectedIds.has(frame.id)) {
          continue;
        }
        for (const child of elements) {
          if (child.id === frame.id || idsToMove.has(child.id)) {
            continue;
          }
          if (isElementContainedInFrame(child, frame as FrameElement)) {
            idsToMove.add(child.id);
          }
        }
      }

      const updates = elements
        .filter((el) => idsToMove.has(el.id) && !lockedIds.has(el.id))
        .map((el) => ({
          id: el.id,
          changes: {
            x: el.x + dx,
            y: el.y + dy,
            ...(el.type === "line" || el.type === "arrow"
              ? {
                  endX: (el.endX ?? el.x) + dx,
                  endY: (el.endY ?? el.y) + dy,
                }
              : {}),
            ...(el.type === "pen" && Array.isArray((el as PenElement).points)
              ? {
                  points: (el as PenElement).points.map((pt) => ({
                    x: pt.x + dx,
                    y: pt.y + dy,
                  })),
                }
              : {}),
          },
        }));

      if (updates.length === 0) {
        return;
      }
      recordHistory();
      updateElements(updates);
    },
    [elements, selectedElementIds, recordHistory, updateElements]
  );

  useHotkeys("v", () => setCurrentTool("select"), { enableOnFormTags: false });
  useHotkeys("h", () => setCurrentTool("hand"), { enableOnFormTags: false });
  // TODO: remove after user review confirmation - pen code not needed
  // useHotkeys('p', () => setCurrentTool('pen'), { enableOnFormTags: false });
  useHotkeys("r", () => setCurrentTool("rectangle"), {
    enableOnFormTags: false,
  });
  useHotkeys("o", () => setCurrentTool("ellipse"), { enableOnFormTags: false });
  useHotkeys("l", () => setCurrentTool("line"), { enableOnFormTags: false });
  useHotkeys("a", () => setCurrentTool("arrow"), { enableOnFormTags: false });
  useHotkeys("t", () => setCurrentTool("text"), { enableOnFormTags: false });
  useHotkeys("s", () => setCurrentTool("stamp"), { enableOnFormTags: false });
  useHotkeys("e", () => setCurrentTool("eraser"), { enableOnFormTags: false });
  useHotkeys(
    "mod+c",
    (e) => {
      e.preventDefault();
      copySelectedElements();
    },
    { enableOnFormTags: false }
  );
  useHotkeys(
    "mod+v",
    (e) => {
      e.preventDefault();
      pasteElements();
    },
    { enableOnFormTags: false }
  );
  useHotkeys(
    "mod+d",
    (e) => {
      e.preventDefault();
      duplicateSelectedElements();
    },
    { enableOnFormTags: false }
  );
  useHotkeys(
    "mod+]",
    (e) => {
      e.preventDefault();
      if (selectedElementIds.length > 0) {
        reorderElements(selectedElementIds, "up");
      }
    },
    { enableOnFormTags: false }
  );
  useHotkeys(
    "mod+[",
    (e) => {
      e.preventDefault();
      if (selectedElementIds.length > 0) {
        reorderElements(selectedElementIds, "down");
      }
    },
    { enableOnFormTags: false }
  );
  useHotkeys(
    "mod+z",
    (e) => {
      e.preventDefault();
      undo();
    },
    { enableOnFormTags: false }
  );
  useHotkeys(
    ["mod+shift+z", "mod+y"],
    (e) => {
      e.preventDefault();
      redo();
    },
    { enableOnFormTags: false }
  );
  useHotkeys(
    "mod+a",
    (e) => {
      e.preventDefault();
      selectElements(elements.map((el) => el.id));
    },
    { enableOnFormTags: false }
  );
  useHotkeys(["backspace", "delete"], () => deleteSelectedElements(), {
    enableOnFormTags: false,
  });
  useHotkeys(
    ["up", "down", "left", "right"],
    (e) => {
      if (selectedElementIds.length === 0) {
        return;
      }
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;
      if (e.key === "ArrowLeft") {
        dx = -step;
      } else if (e.key === "ArrowRight") {
        dx = step;
      } else if (e.key === "ArrowUp") {
        dy = -step;
      } else if (e.key === "ArrowDown") {
        dy = step;
      }
      moveSelectionBy(dx, dy);
    },
    { enableOnFormTags: false, ignoreModifiers: true }
  );
  useHotkeys(
    "escape",
    () => {
      clearSelection();
      setEditingTextId(null);
      setCurrentTool("select");
    },
    { enableOnFormTags: false }
  );

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
  const handleMouseDown = (e: React.MouseEvent) => {
    if (editingTextId) {
      return;
    }

    const worldPoint = screenToWorld(e.clientX, e.clientY);
    setDragStartPoint(worldPoint);

    // Pan canvas with middle mouse or hand tool
    if (e.button === 1 || currentTool === "hand") {
      e.preventDefault();
      setIsPanning(true);
      return;
    }

    if (
      [
        "pen",
        "rectangle",
        "ellipse",
        "line",
        "arrow",
        "text",
        "frame",
        "stamp",
      ].includes(currentTool)
    ) {
      setIsDrawing(true);
      const newId = generateSafeId("el");

      if (currentTool === "pen") {
        const penEl: PenElement = {
          id: newId,
          type: "pen",
          name: "Freehand Stroke",
          points: [{ x: worldPoint.x, y: worldPoint.y }],
          strokeColor,
          strokeWidth,
          opacity,
          x: worldPoint.x,
          y: worldPoint.y,
          width: 1,
          height: 1,
          zIndex: getNextZIndex(elements),
        };
        setCurrentDrawingElement(penEl);
      } else if (currentTool === "text") {
        const textEl: TextElement = {
          id: newId,
          type: "text",
          name: "Text Label",
          text: "",
          fontSize: fontSize || 16,
          fontWeight: "normal",
          x: worldPoint.x,
          y: worldPoint.y,
          width: 180,
          height: 32,
          strokeColor,
          fillColor: "transparent",
          strokeWidth: 1,
          opacity,
          zIndex: getNextZIndex(elements),
        };
        addElement(textEl);
        selectElements([newId]);
        setCurrentTool("select");
        setIsDrawing(false);
      } else if (currentTool === "stamp" && selectedStamp) {
        const defaults = getStampDefaults(selectedStamp);
        const stampEl: StampElement = {
          id: newId,
          type: "stamp",
          stampType: selectedStamp,
          name: defaults.label,
          label: defaults.label,
          sublabel: defaults.sublabel,
          x: worldPoint.x,
          y: worldPoint.y,
          width: defaults.width,
          height: defaults.height,
          strokeColor: strokeColor || defaults.strokeColor,
          fillColor: fillColor || defaults.fillColor,
          strokeWidth,
          opacity,
          cornerRadius,
          zIndex: getNextZIndex(elements),
        };
        addElement(stampEl);
        selectElements([newId]);
        setCurrentTool("select");
        setIsDrawing(false);
      } else if (currentTool === "frame") {
        const frameEl: FrameElement = {
          id: newId,
          type: "frame",
          name: "Page Frame",
          title: "New Page",
          route: "/page",
          preset: "desktop",
          x: worldPoint.x,
          y: worldPoint.y,
          width: 20,
          height: 20,
          strokeColor: "#94a3b8",
          fillColor: "#ffffff",
          strokeWidth: 2,
          opacity: 1,
          zIndex: 1,
          background: "#ffffff",
        };
        setCurrentDrawingElement(frameEl);
      } else if (currentTool === "rectangle" || currentTool === "ellipse") {
        const shapeEl: CanvasElement = {
          id: newId,
          type: currentTool,
          name: `${currentTool} shape`,
          x: worldPoint.x,
          y: worldPoint.y,
          width: 0,
          height: 0,
          strokeColor,
          fillColor,
          strokeWidth,
          opacity,
          cornerRadius: currentTool === "rectangle" ? cornerRadius : 0,
          roughness,
          zIndex: getNextZIndex(elements),
        };
        setCurrentDrawingElement(shapeEl);
      } else if (currentTool === "line" || currentTool === "arrow") {
        const lineEl: LineElement = {
          id: newId,
          type: currentTool,
          name: `${currentTool} shape`,
          x: worldPoint.x,
          y: worldPoint.y,
          width: 0,
          height: 0,
          endX: worldPoint.x,
          endY: worldPoint.y,
          strokeColor,
          fillColor,
          strokeWidth,
          opacity,
          roughness,
          zIndex: getNextZIndex(elements),
        };
        setCurrentDrawingElement(lineEl);
      }
      return;
    }

    if (currentTool === "select") {
      marqueeInitialSelectionRef.current = e.shiftKey ? selectedElementIds : [];
      if (!e.shiftKey) {
        clearSelection();
      }
      setSelectionBox({
        startX: worldPoint.x,
        startY: worldPoint.y,
        endX: worldPoint.x,
        endY: worldPoint.y,
      });
    }
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
  const handleMouseMove = (e: React.MouseEvent) => {
    // Pan viewport at 60fps locally without store serialization bottleneck
    if (isPanning) {
      const nextVp = {
        ...activeViewportRef.current,
        x: activeViewportRef.current.x + e.movementX,
        y: activeViewportRef.current.y + e.movementY,
      };
      setActiveViewport(nextVp);
      return;
    }

    const worldPoint = screenToWorld(e.clientX, e.clientY);

    if (isDrawing && currentDrawingElement) {
      if (currentDrawingElement.type === "pen") {
        const penEl = currentDrawingElement as PenElement;
        const newPt = { x: worldPoint.x, y: worldPoint.y };
        const lastPt = penEl.points.at(-1);

        // Skip jitter if mouse hasn't moved significantly
        if (lastPt && Math.hypot(newPt.x - lastPt.x, newPt.y - lastPt.y) < 2) {
          return;
        }

        const newPoints = [...penEl.points, newPt];
        const minX = Math.min(penEl.x, newPt.x);
        const minY = Math.min(penEl.y, newPt.y);
        const maxX = Math.max(penEl.x + penEl.width, newPt.x);
        const maxY = Math.max(penEl.y + penEl.height, newPt.y);

        setCurrentDrawingElement({
          ...penEl,
          points: newPoints,
          x: minX,
          y: minY,
          width: Math.max(1, maxX - minX),
          height: Math.max(1, maxY - minY),
        });
      } else if (
        currentDrawingElement.type === "line" ||
        currentDrawingElement.type === "arrow"
      ) {
        const lineEl = currentDrawingElement as LineElement;
        setCurrentDrawingElement({
          ...lineEl,
          endX: worldPoint.x,
          endY: worldPoint.y,
          width: Math.abs(worldPoint.x - lineEl.x),
          height: Math.abs(worldPoint.y - lineEl.y),
        });
      } else {
        const x = Math.min(dragStartPoint.x, worldPoint.x);
        const y = Math.min(dragStartPoint.y, worldPoint.y);
        const width = Math.abs(worldPoint.x - dragStartPoint.x);
        const height = Math.abs(worldPoint.y - dragStartPoint.y);

        setCurrentDrawingElement({
          ...currentDrawingElement,
          x,
          y,
          width: Math.max(5, width),
          height: Math.max(5, height),
        });
      }
      return;
    }

    if (isDraggingElements && selectedElementIds.length > 0) {
      const dx = worldPoint.x - dragStartPoint.x;
      const dy = worldPoint.y - dragStartPoint.y;

      if ((dx !== 0 || dy !== 0) && !hasMovedDuringDrag) {
        recordHistory();
        setHasMovedDuringDrag(true);
      }

      // Collect all elements to move: selected elements + any indexed children of selected frames
      const elementsToMove = new Map<
        string,
        { el: CanvasElement; dx: number; dy: number }
      >();
      const baseElements = dragBaseRef.current;

      for (const id of selectedElementIds) {
        const foundEl = baseElements.get(id);
        if (foundEl) {
          elementsToMove.set(id, { el: foundEl, dx, dy });
        }
      }

      // 2. Lookup precomputed child element IDs from index (O(1) lookup during drag movement)
      for (const childIds of dragChildrenMapRef.current.values()) {
        for (const childId of childIds) {
          if (!elementsToMove.has(childId)) {
            const childEl = baseElements.get(childId);
            if (childEl) {
              elementsToMove.set(childId, { el: childEl, dx, dy });
            }
          }
        }
      }

      const updates = Array.from(elementsToMove.entries()).map(
        ([id, { el, dx: deltaX, dy: deltaY }]) => ({
          id,
          changes: {
            x: el.x + deltaX,
            y: el.y + deltaY,
            ...(el.type === "line" || el.type === "arrow"
              ? {
                  endX: (el.endX ?? el.x) + deltaX,
                  endY: (el.endY ?? el.y) + deltaY,
                }
              : {}),
            ...(el.type === "pen" && Array.isArray((el as PenElement).points)
              ? {
                  points: (el as PenElement).points.map((pt) => ({
                    x: pt.x + deltaX,
                    y: pt.y + deltaY,
                  })),
                }
              : {}),
          },
        })
      );

      // Throttle store updates to display refresh rate
      pendingUpdatesRef.current = updates;
      if (!dragRafRef.current) {
        dragRafRef.current = requestAnimationFrame(() => {
          dragRafRef.current = null;
          if (pendingUpdatesRef.current) {
            updateElements(pendingUpdatesRef.current);
            pendingUpdatesRef.current = null;
          }
        });
      }

      return;
    }

    if (isResizing && selectedElementIds.length === 1) {
      const el = elements.find(
        (element) => element.id === selectedElementIds[0]
      );
      if (el) {
        const handle = isResizing;
        const minDim = el.type === "frame" ? 100 : 10;
        let newX = el.x;
        let newY = el.y;
        let newW = el.width;
        let newH = el.height;

        if (handle.includes("e")) {
          newW = Math.max(minDim, worldPoint.x - el.x);
        }
        if (handle.includes("s")) {
          newH = Math.max(minDim, worldPoint.y - el.y);
        }
        if (handle.includes("w")) {
          const diff = el.x - worldPoint.x;
          if (el.width + diff > minDim) {
            newX = worldPoint.x;
            newW = el.width + diff;
          }
        }
        if (handle.includes("n")) {
          const diff = el.y - worldPoint.y;
          if (el.height + diff > minDim) {
            newY = worldPoint.y;
            newH = el.height + diff;
          }
        }

        const resizeUpdates = [
          {
            id: el.id,
            changes: { x: newX, y: newY, width: newW, height: newH },
          },
        ];
        pendingUpdatesRef.current = resizeUpdates;
        if (!dragRafRef.current) {
          dragRafRef.current = requestAnimationFrame(() => {
            dragRafRef.current = null;
            if (pendingUpdatesRef.current) {
              updateElements(pendingUpdatesRef.current);
              pendingUpdatesRef.current = null;
            }
          });
        }
      }
      return;
    }

    // Marquee Selection Box - transient local update without store spamming per move
    if (selectionBox) {
      setSelectionBox({
        ...selectionBox,
        endX: worldPoint.x,
        endY: worldPoint.y,
      });
    }
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
  const handleMouseUp = useCallback(() => {
    // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
    if (isHandlingMouseUpRef.current) {
      return;
    }
    isHandlingMouseUpRef.current = true;

    try {
      // Flush any pending RAF updates immediately on pointer up
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
      if (pendingUpdatesRef.current) {
        updateElements(pendingUpdatesRef.current);
        pendingUpdatesRef.current = null;
      }

      if (isPanning) {
        setIsPanning(false);
        setViewport(activeViewportRef.current);
      }

      if (isDrawing && currentDrawingElement) {
        // TODO: remove after user review confirmation - pen code not needed
        const isPen = currentDrawingElement.type === "pen";
        const penPoints = isPen
          ? (currentDrawingElement as PenElement).points
          : [];
        const isValidPen =
          isPen &&
          penPoints.length >= 2 &&
          penPoints.some(
            (p) => p.x !== penPoints[0].x || p.y !== penPoints[0].y
          );
        const isValidShape =
          !isPen &&
          (currentDrawingElement.width > 5 || currentDrawingElement.height > 5);

        if (isValidPen || isValidShape) {
          let el = currentDrawingElement;
          if (el.type === "frame") {
            el = {
              ...el,
              fillColor: el.fillColor ?? el.background ?? "#ffffff",
              background: el.background ?? el.fillColor ?? "#ffffff",
            } as FrameElement;
          }
          addElement(el);
        }
        setCurrentDrawingElement(null);
        setIsDrawing(false);
        setCurrentTool("select");
      }

      if (isDraggingElements) {
        setIsDraggingElements(false);
        setHasMovedDuringDrag(false);
      }
      if (isResizing) {
        setIsResizing(null);
      }

      // Commit marquee selection once on mouse up
      if (selectionBox) {
        const boxMinX = Math.min(selectionBox.startX, selectionBox.endX);
        const boxMaxX = Math.max(selectionBox.startX, selectionBox.endX);
        const boxMinY = Math.min(selectionBox.startY, selectionBox.endY);
        const boxMaxY = Math.max(selectionBox.startY, selectionBox.endY);

        if (boxMaxX - boxMinX > 3 || boxMaxY - boxMinY > 3) {
          const elementStateById = getEffectiveElementStateMap(elements);
          const enclosedIds = elements
            .filter((el) => {
              const state = elementStateById.get(el.id);
              if (state && (!state.visible || state.locked)) {
                return false;
              }
              return (
                el.x >= boxMinX &&
                el.x + el.width <= boxMaxX &&
                el.y >= boxMinY &&
                el.y + el.height <= boxMaxY
              );
            })
            .map((el) => el.id);

          // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
          const initial = marqueeInitialSelectionRef.current || [];
          const combined = Array.from(new Set([...initial, ...enclosedIds]));
          selectElements(combined);
        }
        setSelectionBox(null);
      }
    } finally {
      setTimeout(() => {
        isHandlingMouseUpRef.current = false;
      }, 50);
    }
  }, [
    isPanning,
    isDrawing,
    currentDrawingElement,
    addElement,
    setCurrentTool,
    isDraggingElements,
    isResizing,
    selectionBox,
    setViewport,
    updateElements,
    selectElements,
    elements,
  ]);

  // Window-level safety listener: release drags/draws if pointer leaves canvas
  useEffect(() => {
    const handleWindowPointerUp = () => {
      if (
        isPanning ||
        isDrawing ||
        isDraggingElements ||
        isResizing ||
        selectionBox
      ) {
        handleMouseUp();
      }
    };
    window.addEventListener("pointerup", handleWindowPointerUp);
    return () => {
      window.removeEventListener("pointerup", handleWindowPointerUp);
    };
  }, [
    isPanning,
    isDrawing,
    isDraggingElements,
    isResizing,
    selectionBox,
    handleMouseUp,
  ]);

  // Non-passive Wheel Listener for Canvas Zoom and Pan (bound once)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentVp = activeViewportRef.current;
      let nextVp = currentVp;

      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY < 0 ? 1.06 : 0.94;
        const newZoom = Math.min(
          2.5,
          Math.max(0.3, currentVp.zoom * zoomFactor)
        );

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX =
          mouseX - (mouseX - currentVp.x) * (newZoom / currentVp.zoom);
        const newY =
          mouseY - (mouseY - currentVp.y) * (newZoom / currentVp.zoom);

        nextVp = { x: newX, y: newY, zoom: newZoom };
      } else {
        // Shift+wheel pans horizontally (mice only report deltaY; trackpads already send deltaX)
        const dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
        const dy = e.shiftKey ? 0 : e.deltaY;
        nextVp = {
          ...currentVp,
          x: currentVp.x - dx,
          y: currentVp.y - dy,
        };
      }

      setActiveViewport(nextVp);
      persistViewport(nextVp);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [persistViewport]);

  // Keep the store's canvas size current so centering/focus math uses the real
  // flex slot (between the sidebars) instead of a hardcoded window offset.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const update = () => {
      setCanvasSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [setCanvasSize]);

  const handleElementDoubleClick = (el: CanvasElement) => {
    if (getLockedElementIds(elements).has(el.id)) {
      return;
    }
    if (el.type === "text") {
      setEditingTextId(el.id);
      setEditTextValue((el as TextElement).text || "");
    } else if (el.type === "stamp") {
      setEditingTextId(el.id);
      setEditTextValue((el as StampElement).label || "");
    }
    // Skip frames - editing is handled inline in CanvasPageBanner
  };

  const handleSaveText = () => {
    if (editingTextId) {
      recordHistory();
      const value = editTextValue.trim();
      const target = elements.find((e) => e.id === editingTextId);
      if (target?.type === "text") {
        updateElement(editingTextId, { text: value });
      } else if (target?.type === "stamp") {
        updateElement(editingTextId, { label: value });
      } else if (target?.type === "frame") {
        updateElement(editingTextId, { title: value });
      }
      setEditingTextId(null);
    }
  };

  const handleCancelTextEdit = useCallback(() => setEditingTextId(null), []);

  // Start resizing a selected element (frame handles also adopt contained children)
  const handleResizeStart = useCallback(
    (el: CanvasElement, pos: string) => {
      if (el.type === "frame") {
        const contained = elements.filter((child) =>
          isElementContainedInFrame(child, el as FrameElement)
        );
        const updates = contained
          .filter((child) => child.frameId !== el.id)
          .map((child) => ({ id: child.id, changes: { frameId: el.id } }));
        if (updates.length > 0) {
          updateElements(updates);
        }
      }
      recordHistory();
      setIsResizing(pos);
    },
    [elements, updateElements, recordHistory]
  );

  const frameElements = useMemo(
    () => elements.filter((el) => el.type === "frame") as FrameElement[],
    [elements]
  );

  const selectedSet = useMemo(
    () => new Set(selectedElementIds),
    [selectedElementIds]
  );

  const elementStateById = useMemo(
    () => getEffectiveElementStateMap(elements),
    [elements]
  );

  // Artboard frames always paint beneath their contents; only the order among
  // non-frame elements (and among frames) follows the stored array order.
  const orderedElements = useMemo(() => {
    const frames = elements.filter((el) => el.type === "frame");
    const others = elements.filter((el) => el.type !== "frame");
    return [...frames, ...others];
  }, [elements]);
  const handlePreventAuxClick = (e: React.MouseEvent) => e.preventDefault();
  const getCursorClass = () => {
    if (currentTool === "hand" || isPanning) {
      return "cursor-grab active:cursor-grabbing";
    }
    if (currentTool === "eraser") {
      return "cursor-crosshair";
    }
    return "cursor-default";
  };

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: raw pointer surface or wrapper containing nested controls; no semantic HTML equivalent
    // biome-ignore lint/a11y/noStaticElementInteractions: raw pointer surface or wrapper containing nested controls; no semantic HTML equivalent
    <div
      className={`relative h-full w-full select-none overflow-hidden bg-muted/30 ${getCursorClass()}`}
      onAuxClick={handlePreventAuxClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={containerRef}
    >
      <Toolbar />

      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        ref={svgRef}
        role="img"
      >
        <title>Design canvas</title>
        <defs>
          <pattern
            height={32 * activeViewport.zoom}
            id="dot-grid"
            patternTransform={`translate(${activeViewport.x}, ${activeViewport.y})`}
            patternUnits="userSpaceOnUse"
            width={32 * activeViewport.zoom}
          >
            <circle
              className="fill-muted-foreground/30"
              cx={2 * activeViewport.zoom}
              cy={2 * activeViewport.zoom}
              r={activeViewport.zoom}
            />
          </pattern>
        </defs>

        <rect fill="url(#dot-grid)" height="100%" width="100%" />

        <g
          transform={`translate(${activeViewport.x}, ${activeViewport.y}) scale(${activeViewport.zoom})`}
        >
          {orderedElements.map((el) => {
            const effectiveState = elementStateById.get(el.id);
            if (effectiveState && !effectiveState.visible) {
              return null;
            }
            const isLocked = Boolean(effectiveState?.locked);
            const isSelected = selectedSet.has(el.id);

            return (
              // biome-ignore lint/a11y/useSemanticElements: SVG <g> cannot be a <button>; role supplies the button semantics
              <g
                aria-label={`${el.type} element`}
                className="pointer-events-auto cursor-pointer"
                key={el.id}
                // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                onDoubleClick={() => handleElementDoubleClick(el)}
                // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                onKeyDown={(e) => {
                  if (
                    (e.key === "Enter" || e.key === " ") &&
                    currentTool === "select" &&
                    !isLocked
                  ) {
                    e.preventDefault();
                    selectElements([el.id]);
                  }
                }}
                // biome-ignore lint/performance/noJsxPropsBind: inline handler closes over the mapped element
                // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
                onMouseDown={(e) => {
                  if (e.button === 1) {
                    e.preventDefault();
                    setIsPanning(true);
                    return;
                  }
                  if (currentTool === "eraser") {
                    e.stopPropagation();
                    if (isLocked) {
                      return;
                    }
                    deleteElement(el.id);
                    return;
                  }
                  if (currentTool === "select") {
                    e.stopPropagation();
                    if (isLocked) {
                      return;
                    }
                    let effectiveSelected = selectedElementIds;
                    if (e.shiftKey) {
                      toggleElementSelection(el.id);
                      effectiveSelected = isSelected
                        ? selectedElementIds.filter((id) => id !== el.id)
                        : [...selectedElementIds, el.id];
                    } else if (!isSelected) {
                      selectElements([el.id]);
                      effectiveSelected = [el.id];
                    }

                    // Precompute frame children index ONCE at drag start (O(frames * elements) once, O(1) during drag)
                    const childrenMap = new Map<string, string[]>();
                    const selectedFrames = elements.filter(
                      (elem) =>
                        effectiveSelected.includes(elem.id) &&
                        elem.type === "frame"
                    );
                    for (const frame of selectedFrames) {
                      const childIds: string[] = [];
                      for (const child of elements) {
                        if (
                          child.id === frame.id ||
                          effectiveSelected.includes(child.id)
                        ) {
                          continue;
                        }
                        if (
                          isElementContainedInFrame(
                            child,
                            frame as FrameElement
                          )
                        ) {
                          childIds.push(child.id);
                        }
                      }
                      childrenMap.set(frame.id, childIds);
                    }
                    dragChildrenMapRef.current = childrenMap;
                    dragBaseRef.current = new Map(
                      elements.map((elem) => [elem.id, elem])
                    );

                    setIsDraggingElements(true);
                    setHasMovedDuringDrag(false);
                    setDragStartPoint(screenToWorld(e.clientX, e.clientY));
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <ElementShape el={el} isSelected={isSelected} />
                {isSelected && (
                  <SelectionHandles
                    el={el}
                    enabled={currentTool === "select" && !isLocked}
                    onResizeStart={handleResizeStart}
                  />
                )}
              </g>
            );
          })}

          {currentDrawingElement ? (
            <DrawingPreview element={currentDrawingElement} />
          ) : null}

          {selectionBox ? <SelectionMarquee box={selectionBox} /> : null}
        </g>
      </svg>

      {/* Frame Headers / Artboard Banners in Canvas World Coordinates */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          transform: `translate(${activeViewport.x}px, ${activeViewport.y}px) scale(${activeViewport.zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {frameElements
          .filter((frame) => elementStateById.get(frame.id)?.visible !== false)
          .map((frame) => (
            <CanvasPageBanner frame={frame} key={frame.id} />
          ))}
      </div>

      {elements.length === 0 && (
        <CanvasEmptyState onAddStarterFrame={addElement} />
      )}

      {/* Inline Text Editor (positioned over the element, no backdrop) */}
      {editingTextId
        ? (() => {
            const editingEl = elements.find((e) => e.id === editingTextId);
            if (!editingEl) {
              return null;
            }
            return (
              <InlineTextEditor
                left={activeViewport.x + editingEl.x * activeViewport.zoom}
                onCancel={handleCancelTextEdit}
                onChange={setEditTextValue}
                onCommit={handleSaveText}
                top={activeViewport.y + editingEl.y * activeViewport.zoom}
                value={editTextValue}
                width={Math.max(140, editingEl.width * activeViewport.zoom)}
              />
            );
          })()
        : null}
    </div>
  );
};
