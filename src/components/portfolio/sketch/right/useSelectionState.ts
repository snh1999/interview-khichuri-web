import { useMemo } from "react";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import { getEffectiveElementState } from "../utils/containment";

/**
 * Derived selection state for the inspector: the selected elements, the
 * "active" (first) one, type flags, per-property mixed states, and the active
 * theme's swatches. Pure memoized computation over the current portfolio.
 */
export const useSelectionState = () => {
  const selectedElementIds = useSketchBuilderStore((s) => s.selectedElementIds);
  const currentPortfolio = useCurrentPortfolio();
  const { theme } = currentPortfolio;

  const selectedSet = useMemo(
    () => new Set(selectedElementIds),
    [selectedElementIds]
  );
  const selectedElements = useMemo(
    () => currentPortfolio.elements.filter((el) => selectedSet.has(el.id)),
    [currentPortfolio.elements, selectedSet]
  );
  const [activeElement] = selectedElements;

  const isMulti = selectedElements.length > 1;
  const isFrame = !isMulti && activeElement?.type === "frame";
  const isText = activeElement?.type === "text";
  const isStamp = activeElement?.type === "stamp";

  // Any locked element in the selection locks the whole inspector (locking a
  // frame locks its children through inheritance).
  const isLocked = useMemo(() => {
    if (selectedElements.length === 0) {
      return false;
    }
    return selectedElements.some(
      (el) => getEffectiveElementState(el, currentPortfolio.elements).locked
    );
  }, [selectedElements, currentPortfolio.elements]);

  const {
    strokeWidthState,
    opacityState,
    cornerRadiusState,
    strokeColorState,
    fillColorState,
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
  } = useMemo(() => {
    if (selectedElements.length === 0) {
      return {
        strokeWidthState: { isMixed: false, value: undefined },
        opacityState: { isMixed: false, value: undefined },
        cornerRadiusState: { isMixed: false, value: undefined },
        strokeColorState: { isMixed: false, value: undefined },
        fillColorState: { isMixed: false, value: undefined },
      };
    }
    const [first] = selectedElements;
    const initial = {
      sw: first.strokeWidth,
      swMixed: false,
      op: first.opacity === undefined ? 100 : Math.round(first.opacity * 100),
      opMixed: false,
      cr: first.cornerRadius,
      crMixed: false,
      sc: first.strokeColor,
      scMixed: false,
      fc: first.fillColor,
      fcMixed: false,
    };
    for (let i = 1; i < selectedElements.length; i += 1) {
      const el = selectedElements[i];
      if (el.strokeWidth !== initial.sw) {
        initial.swMixed = true;
      }
      const elOp =
        el.opacity === undefined ? 100 : Math.round(el.opacity * 100);
      if (elOp !== initial.op) {
        initial.opMixed = true;
      }
      if (el.cornerRadius !== initial.cr) {
        initial.crMixed = true;
      }
      if (el.strokeColor !== initial.sc) {
        initial.scMixed = true;
      }
      if (el.fillColor !== initial.fc) {
        initial.fcMixed = true;
      }
    }
    return {
      strokeWidthState: {
        isMixed: initial.swMixed,
        // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
        value: initial.swMixed ? undefined : initial.sw,
      },
      opacityState: {
        isMixed: initial.opMixed,
        // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
        value: initial.opMixed ? undefined : initial.op,
      },
      cornerRadiusState: {
        isMixed: initial.crMixed,
        // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
        value: initial.crMixed ? undefined : initial.cr,
      },
      strokeColorState: {
        isMixed: initial.scMixed,
        // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
        value: initial.scMixed ? undefined : initial.sc,
      },
      fillColorState: {
        isMixed: initial.fcMixed,
        // biome-ignore lint/suspicious/noUnnecessaryConditions: guarded by prior checks or casts; biome cannot see the runtime narrowing
        value: initial.fcMixed ? undefined : initial.fc,
      },
    };
  }, [selectedElements]);

  const themeSwatches = useMemo(
    () =>
      Array.from(
        new Set(
          [
            theme.primaryColor,
            theme.secondaryColor,
            theme.accentColor,
            theme.surfaceColor,
            theme.backgroundColor,
            theme.textColor,
            theme.textMutedColor,
          ].filter(Boolean)
        )
      ),
    [theme]
  );

  return {
    selectedElements,
    activeElement,
    isMulti,
    isFrame,
    isText,
    isStamp,
    isLocked,
    strokeWidthState,
    opacityState,
    cornerRadiusState,
    strokeColorState,
    fillColorState,
    themeSwatches,
    theme,
  };
};
